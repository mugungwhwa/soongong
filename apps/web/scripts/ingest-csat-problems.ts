// SOO-156: 수능 MOAT 리서치 산출물(JSONL) → csat_exam_problems / csat_exam_difficulty / 격리 큐 적재 하네스
//
// 정답 SSoT = 평가원 공식. 본 스크립트는 정답을 판정하지 않는다 — 입력 라인을 그대로 받아
// 좌표와 함께 저장하거나, 기존 저장값과 어긋나면 격리(문항)하거나 오류로 남긴다(시험단위).
//
// 사용: NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
//       pnpm --filter web ingest:csat -- <input.jsonl> [more.jsonl ...]
//
// 입력 라인(JSONL, 1레코드 1줄) — SOO-260701-05 산출 스키마. 한글/영문 키 모두 허용.
// 두 종류의 레코드를 같은 파일에 섞어 넣을 수 있음(문항번호 유무로 자동 판별):
//
// (a) 문항단위 레코드 — csat_exam_problems
//   {"과목":"수학","연도":2023,"문항번호":22,"교육과정체제":"2022이후_통합형",
//    "공식정답":"57","출제유형":"...","난이도태그":"...","근거":"...",
//    "체감난이도_문항단위":34.7,"체감난이도_출처":"EBSi(비공식추정)"}
//
// (b) 시험단위 레코드 — csat_exam_difficulty (문항번호 없음, 표준점수/등급컷/만점자비율 중 1개 이상)
//   {"과목":"수학","연도":2023,"교육과정체제":"2022이후_통합형",
//    "표준점수최고점":137,"1등급컷":130,"만점자비율":0.61,"근거":"평가원 보도자료"}
//
// 재개: 각 입력 파일 옆에 <input>.progress.jsonl 을 줄 단위 append(+fsync)로 남긴다.
// 재실행 시 이미 inserted/updated/quarantined로 기록된 (파일, 줄번호)는 스킵하고,
// error로 남은 줄은 다시 시도한다.

import { createClient } from "@supabase/supabase-js";
import {
  appendFileSync,
  closeSync,
  existsSync,
  fsyncSync,
  openSync,
  readFileSync,
} from "node:fs";

const SUBJECTS = [
  "국어",
  "수학",
  "영어",
  "한국사",
  "사회탐구",
  "과학탐구",
  "직업탐구",
  "제2외국어·한문",
] as const;

const CURRICULUM_REGIMES = ["2021이전", "2022이후_통합형"] as const;

type ProblemRow = {
  subject: string;
  exam_year: number;
  problem_number: number;
  curriculum_regime: (typeof CURRICULUM_REGIMES)[number];
  official_answer: string;
  source_basis: string;
  question_type: string | null;
  difficulty_tag: string | null;
  perceived_difficulty_rate: number | null;
  perceived_difficulty_source: string | null;
};

type ExamDifficultyRow = {
  subject: string;
  exam_year: number;
  curriculum_regime: (typeof CURRICULUM_REGIMES)[number];
  standard_score_max: number | null;
  grade1_cutoff_score: number | null;
  perfect_score_ratio: number | null;
  source_basis: string;
};

type ParsedLine =
  | { kind: "problem"; row: ProblemRow }
  | { kind: "exam_difficulty"; row: ExamDifficultyRow }
  | { error: string };

type ProgressEntry = {
  sourceFile: string;
  line: number;
  key: string;
  result: "inserted" | "updated" | "quarantined" | "error";
  error?: string;
};

const PROGRESS_FLUSH_STATUSES = new Set<ProgressEntry["result"]>([
  "inserted",
  "updated",
  "quarantined",
]);

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(`${name} 환경변수가 필요합니다 (service_role 전용 — 앱 클라이언트 키 아님)`);
  }
  return v;
}

function pick(obj: Record<string, unknown>, ...keys: string[]): unknown {
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null && obj[k] !== "") return obj[k];
  }
  return undefined;
}

function parseNumber(raw: unknown): number | null {
  if (raw === undefined || raw === null || raw === "") return null;
  const s = String(raw).trim().replace("%", "");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function parseSubject(raw: Record<string, unknown>): { value: string } | { error: string } {
  const subject = pick(raw, "과목", "subject");
  if (typeof subject !== "string" || !SUBJECTS.includes(subject as (typeof SUBJECTS)[number])) {
    return { error: `subject 누락/미지원: ${String(subject)}` };
  }
  return { value: subject };
}

function parseExamYear(raw: Record<string, unknown>): { value: number } | { error: string } {
  const examYear = pick(raw, "연도", "exam_year", "year");
  const year = Number(examYear);
  if (!Number.isInteger(year) || year < 2016 || year > 2025) {
    return { error: `exam_year 범위 밖(2016~2025): ${String(examYear)}` };
  }
  return { value: year };
}

function parseRegime(
  raw: Record<string, unknown>,
): { value: (typeof CURRICULUM_REGIMES)[number] } | { error: string } {
  const regime = pick(raw, "교육과정체제", "curriculum_regime");
  if (
    typeof regime !== "string" ||
    !CURRICULUM_REGIMES.includes(regime as (typeof CURRICULUM_REGIMES)[number])
  ) {
    return { error: `curriculum_regime 누락/미지원(2021이전|2022이후_통합형): ${String(regime)}` };
  }
  return { value: regime as (typeof CURRICULUM_REGIMES)[number] };
}

// 입력 라인 검증 + 종류 판별(문항번호 유무). 실패 시 error 반환 — 줄 단위 격리, 전체 중단 금지.
function parseLine(raw: Record<string, unknown>): ParsedLine {
  const subjectResult = parseSubject(raw);
  if ("error" in subjectResult) return { error: subjectResult.error };
  const yearResult = parseExamYear(raw);
  if ("error" in yearResult) return { error: yearResult.error };
  const regimeResult = parseRegime(raw);
  if ("error" in regimeResult) return { error: regimeResult.error };
  const sourceBasis = pick(raw, "근거", "source_basis");

  const problemNumberRaw = pick(raw, "문항번호", "problem_number");

  if (problemNumberRaw !== undefined) {
    const num = Number(problemNumberRaw);
    if (!Number.isInteger(num) || num <= 0) {
      return { error: `problem_number 유효하지 않음: ${String(problemNumberRaw)}` };
    }
    const officialAnswer = pick(raw, "공식정답", "official_answer");
    if (typeof officialAnswer !== "string" || officialAnswer.trim() === "") {
      return { error: "official_answer 누락" };
    }
    if (typeof sourceBasis !== "string" || sourceBasis.trim() === "") {
      return { error: "source_basis(근거) 누락 — 근거 없는 공식정답 주장은 저장 금지" };
    }

    const perceivedRate = parseNumber(pick(raw, "체감난이도_문항단위", "perceived_difficulty_rate"));
    const perceivedSource = pick(raw, "체감난이도_출처", "perceived_difficulty_source");
    if ((perceivedRate !== null) !== (typeof perceivedSource === "string" && perceivedSource !== "")) {
      return { error: "perceived_difficulty_rate/source는 둘 다 있거나 둘 다 없어야 함" };
    }
    if (typeof perceivedSource === "string" && !perceivedSource.includes("비공식")) {
      return { error: `perceived_difficulty_source에 "비공식" 표기 필요: ${perceivedSource}` };
    }

    const questionType = pick(raw, "출제유형", "question_type");
    const difficultyTag = pick(raw, "난이도태그", "difficulty_tag");

    return {
      kind: "problem",
      row: {
        subject: subjectResult.value,
        exam_year: yearResult.value,
        problem_number: num,
        curriculum_regime: regimeResult.value,
        official_answer: officialAnswer.trim(),
        source_basis: sourceBasis.trim(),
        question_type: typeof questionType === "string" ? questionType : null,
        difficulty_tag: typeof difficultyTag === "string" ? difficultyTag : null,
        perceived_difficulty_rate: perceivedRate,
        perceived_difficulty_source: typeof perceivedSource === "string" ? perceivedSource : null,
      },
    };
  }

  // 문항번호 없음 → 시험단위(공식난이도) 레코드 후보
  const standardScoreMax = parseNumber(pick(raw, "표준점수최고점", "standard_score_max"));
  const grade1Cutoff = parseNumber(pick(raw, "1등급컷", "grade1_cutoff_score"));
  const perfectScoreRatio = parseNumber(pick(raw, "만점자비율", "perfect_score_ratio"));

  if (standardScoreMax === null && grade1Cutoff === null && perfectScoreRatio === null) {
    return {
      error:
        "레코드 종류를 판별할 수 없음 — 문항번호(문항단위) 또는 표준점수최고점/1등급컷/만점자비율(시험단위) 중 하나 필요",
    };
  }
  if (typeof sourceBasis !== "string" || sourceBasis.trim() === "") {
    return { error: "source_basis(근거) 누락 — 근거 없는 공식 수치 주장은 저장 금지" };
  }

  return {
    kind: "exam_difficulty",
    row: {
      subject: subjectResult.value,
      exam_year: yearResult.value,
      curriculum_regime: regimeResult.value,
      standard_score_max: standardScoreMax,
      grade1_cutoff_score: grade1Cutoff,
      perfect_score_ratio: perfectScoreRatio,
      source_basis: sourceBasis.trim(),
    },
  };
}

function problemKey(r: Pick<ProblemRow, "subject" | "exam_year" | "problem_number">): string {
  return `problem:${r.subject}|${r.exam_year}|${r.problem_number}`;
}

function difficultyKey(r: Pick<ExamDifficultyRow, "subject" | "exam_year">): string {
  return `exam_difficulty:${r.subject}|${r.exam_year}`;
}

function loadResumeSkipSet(progressPath: string): Set<string> {
  const skip = new Set<string>();
  if (!existsSync(progressPath)) return skip;
  const text = readFileSync(progressPath, "utf-8");
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    try {
      const entry = JSON.parse(line) as ProgressEntry;
      if (PROGRESS_FLUSH_STATUSES.has(entry.result)) {
        skip.add(`${entry.sourceFile}#${entry.line}`);
      }
    } catch {
      // 손상된 진행 로그 줄은 무시 — 재개 시 해당 원본 줄은 재처리됨(안전 방향)
    }
  }
  return skip;
}

async function main() {
  const inputFiles = process.argv.slice(2);
  if (inputFiles.length === 0) {
    console.error("사용법: tsx scripts/ingest-csat-problems.ts <input.jsonl> [more.jsonl ...]");
    process.exit(1);
  }

  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const timeoutFetch: typeof fetch = (input, init) =>
    fetch(input, { ...init, signal: AbortSignal.timeout(15_000) });
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
    global: { fetch: timeoutFetch },
  });

  const startedAt = Date.now();
  let processed = 0;
  let inserted = 0;
  let updated = 0;
  let quarantined = 0;
  let skippedResume = 0;
  let errors = 0;
  let lastProgressPrintAt = startedAt;

  async function handleProblem(row: ProblemRow, sourceFile: string, lineNo: number, writeProgress: (e: ProgressEntry) => void) {
    const key = problemKey(row);
    const { data: existing, error: selectErr } = await supabase
      .from("csat_exam_problems")
      .select("official_answer")
      .eq("subject", row.subject)
      .eq("exam_year", row.exam_year)
      .eq("problem_number", row.problem_number)
      .maybeSingle();
    if (selectErr) throw selectErr;

    if (!existing) {
      const { error: insertErr } = await supabase.from("csat_exam_problems").insert(row);
      if (insertErr) throw insertErr;
      inserted += 1;
      writeProgress({ sourceFile, line: lineNo, key, result: "inserted" });
    } else if (existing.official_answer !== row.official_answer) {
      // 공식정답 불일치 — 본류 오염 방지, 격리 큐로만 기록
      const { error: qErr } = await supabase.from("csat_exam_problems_quarantine").insert({
        subject: row.subject,
        exam_year: row.exam_year,
        problem_number: row.problem_number,
        reported_answer: row.official_answer,
        conflicting_answer: existing.official_answer,
        discrepancy_reason: "csat_exam_problems 기존 저장값과 official_answer 불일치",
        source_basis: row.source_basis,
      });
      if (qErr && qErr.code !== "23505") throw qErr; // 23505=이미 open 격리건 존재 — 정상 스킵
      quarantined += 1;
      writeProgress({ sourceFile, line: lineNo, key, result: "quarantined" });
    } else {
      // 정답 동일 — 보강 필드만 갱신 (official_answer/식별키/curriculum_regime은 불변 트리거로도 보호됨)
      const { error: updateErr } = await supabase
        .from("csat_exam_problems")
        .update({
          question_type: row.question_type,
          difficulty_tag: row.difficulty_tag,
          perceived_difficulty_rate: row.perceived_difficulty_rate,
          perceived_difficulty_source: row.perceived_difficulty_source,
          source_basis: row.source_basis,
        })
        .eq("subject", row.subject)
        .eq("exam_year", row.exam_year)
        .eq("problem_number", row.problem_number);
      if (updateErr) throw updateErr;
      updated += 1;
      writeProgress({ sourceFile, line: lineNo, key, result: "updated" });
    }
  }

  async function handleExamDifficulty(
    row: ExamDifficultyRow,
    sourceFile: string,
    lineNo: number,
    writeProgress: (e: ProgressEntry) => void,
  ) {
    const key = difficultyKey(row);
    const { data: existing, error: selectErr } = await supabase
      .from("csat_exam_difficulty")
      .select("curriculum_regime, standard_score_max, grade1_cutoff_score, perfect_score_ratio")
      .eq("subject", row.subject)
      .eq("exam_year", row.exam_year)
      .maybeSingle();
    if (selectErr) throw selectErr;

    if (!existing) {
      const { error: insertErr } = await supabase.from("csat_exam_difficulty").insert(row);
      if (insertErr) throw insertErr;
      inserted += 1;
      writeProgress({ sourceFile, line: lineNo, key, result: "inserted" });
      return;
    }

    const conflicts: string[] = [];
    if (existing.curriculum_regime !== row.curriculum_regime) conflicts.push("curriculum_regime");
    if (
      existing.standard_score_max !== null &&
      row.standard_score_max !== null &&
      existing.standard_score_max !== row.standard_score_max
    )
      conflicts.push("standard_score_max");
    if (
      existing.grade1_cutoff_score !== null &&
      row.grade1_cutoff_score !== null &&
      existing.grade1_cutoff_score !== row.grade1_cutoff_score
    )
      conflicts.push("grade1_cutoff_score");
    if (
      existing.perfect_score_ratio !== null &&
      row.perfect_score_ratio !== null &&
      existing.perfect_score_ratio !== row.perfect_score_ratio
    )
      conflicts.push("perfect_score_ratio");

    if (conflicts.length > 0) {
      // 시험단위 공식 수치 격리 큐는 범위 밖(이슈 명시: 격리 큐는 문항단위 정답 불일치 전용) — 오류로 남겨 수동 검토 유도
      throw new Error(`csat_exam_difficulty 기존 값과 불일치(수동 검토 필요): ${conflicts.join(",")}`);
    }

    // null → 값 채움만 반영 (기존 non-null 값은 트리거가 어차피 보호)
    const { error: updateErr } = await supabase
      .from("csat_exam_difficulty")
      .update({
        standard_score_max: row.standard_score_max ?? undefined,
        grade1_cutoff_score: row.grade1_cutoff_score ?? undefined,
        perfect_score_ratio: row.perfect_score_ratio ?? undefined,
        source_basis: row.source_basis,
      })
      .eq("subject", row.subject)
      .eq("exam_year", row.exam_year);
    if (updateErr) throw updateErr;
    updated += 1;
    writeProgress({ sourceFile, line: lineNo, key, result: "updated" });
  }

  for (const sourceFile of inputFiles) {
    const progressPath = `${sourceFile}.progress.jsonl`;
    const skipSet = loadResumeSkipSet(progressPath);
    const progressFd = openSync(progressPath, "a");

    const writeProgress = (entry: ProgressEntry) => {
      appendFileSync(progressFd, `${JSON.stringify(entry)}\n`);
      fsyncSync(progressFd);
    };

    try {
      const lines = readFileSync(sourceFile, "utf-8").split("\n");
      const total = lines.filter((l) => l.trim()).length;
      let lineNo = 0;

      for (const raw of lines) {
        lineNo += 1;
        if (!raw.trim()) continue;

        if (skipSet.has(`${sourceFile}#${lineNo}`)) {
          skippedResume += 1;
          continue;
        }

        processed += 1;
        try {
          const parsed = JSON.parse(raw) as Record<string, unknown>;
          const result = parseLine(parsed);
          if ("error" in result) {
            errors += 1;
            writeProgress({ sourceFile, line: lineNo, key: "(parse-error)", result: "error", error: result.error });
            continue;
          }
          if (result.kind === "problem") {
            await handleProblem(result.row, sourceFile, lineNo, writeProgress);
          } else {
            await handleExamDifficulty(result.row, sourceFile, lineNo, writeProgress);
          }
        } catch (e) {
          errors += 1;
          const msg = e instanceof Error ? e.message : JSON.stringify(e);
          writeProgress({ sourceFile, line: lineNo, key: "(exception)", result: "error", error: msg });
          console.error(`ERR ${sourceFile}:${lineNo} ${msg}`);
        }

        const now = Date.now();
        if (processed % 20 === 0 || now - lastProgressPrintAt > 60_000) {
          lastProgressPrintAt = now;
          const elapsedSec = Math.round((now - startedAt) / 1000);
          console.log(
            `[${sourceFile}] ${lineNo}/${total} elapsed=${elapsedSec}s inserted=${inserted} updated=${updated} quarantined=${quarantined} errors=${errors} resumeSkipped=${skippedResume}`,
          );
        }
      }
    } finally {
      closeSync(progressFd);
    }
  }

  console.log(
    `DONE processed=${processed} inserted=${inserted} updated=${updated} quarantined=${quarantined} resumeSkipped=${skippedResume} errors=${errors}`,
  );
  if (errors > 0) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e instanceof Error ? e.stack ?? e.message : e);
  process.exit(1);
});
