// SOO-156: 수능 MOAT 리서치 산출물(JSONL) → csat_exam_problems / 격리 큐 적재 하네스
//
// 정답 SSoT = 평가원 공식. 본 스크립트는 정답을 판정하지 않는다 — 입력 라인을 그대로 받아
// 좌표(subject/exam_year/problem_number)와 함께 저장하거나, 기존 저장값과 공식정답이
// 어긋나면 격리 큐로 돌린다.
//
// 사용: NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
//       pnpm --filter web ingest:csat -- <input.jsonl> [more.jsonl ...]
//
// 입력 라인(JSONL, 1문항 1줄) — SOO-260701-05 산출 스키마. 한글/영문 키 모두 허용:
//   {"과목":"수학","연도":2023,"문항번호":22,"공식정답":"57","출제유형":"...",
//    "난이도태그":"...","공식정답률":34.7,"근거":"..."}
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

type ProblemRow = {
  subject: string;
  exam_year: number;
  problem_number: number;
  official_answer: string;
  source_basis: string;
  question_type: string | null;
  difficulty_tag: string | null;
  official_correct_rate: number | null;
};

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

function parseRate(raw: unknown): number | null {
  if (raw === undefined || raw === null || raw === "") return null;
  const s = String(raw).trim().replace("%", "");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

// 입력 라인 검증. 실패 시 null 반환 + 이유는 caller가 error로 기록(줄 단위 격리 — 전체 중단 금지)
function parseLine(raw: Record<string, unknown>): { row: ProblemRow } | { error: string } {
  const subject = pick(raw, "과목", "subject");
  const examYear = pick(raw, "연도", "exam_year", "year");
  const problemNumber = pick(raw, "문항번호", "problem_number");
  const officialAnswer = pick(raw, "공식정답", "official_answer");
  const sourceBasis = pick(raw, "근거", "source_basis");

  if (typeof subject !== "string" || !SUBJECTS.includes(subject as (typeof SUBJECTS)[number])) {
    return { error: `subject 누락/미지원: ${String(subject)}` };
  }
  const year = Number(examYear);
  if (!Number.isInteger(year) || year < 2016 || year > 2025) {
    return { error: `exam_year 범위 밖(2016~2025): ${String(examYear)}` };
  }
  const num = Number(problemNumber);
  if (!Number.isInteger(num) || num <= 0) {
    return { error: `problem_number 유효하지 않음: ${String(problemNumber)}` };
  }
  if (typeof officialAnswer !== "string" || officialAnswer.trim() === "") {
    return { error: "official_answer 누락" };
  }
  if (typeof sourceBasis !== "string" || sourceBasis.trim() === "") {
    return { error: "source_basis(근거) 누락 — 근거 없는 공식정답 주장은 저장 금지" };
  }

  const questionType = pick(raw, "출제유형", "question_type");
  const difficultyTag = pick(raw, "난이도태그", "difficulty_tag");

  return {
    row: {
      subject,
      exam_year: year,
      problem_number: num,
      official_answer: officialAnswer.trim(),
      source_basis: sourceBasis.trim(),
      question_type: typeof questionType === "string" ? questionType : null,
      difficulty_tag: typeof difficultyTag === "string" ? difficultyTag : null,
      official_correct_rate: parseRate(pick(raw, "공식정답률", "official_correct_rate")),
    },
  };
}

function rowKey(r: Pick<ProblemRow, "subject" | "exam_year" | "problem_number">): string {
  return `${r.subject}|${r.exam_year}|${r.problem_number}`;
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
          const { row } = result;
          const key = rowKey(row);

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
            // 정답 동일 — 보강 필드만 갱신 (official_answer/식별키는 불변 트리거로도 보호됨)
            const { error: updateErr } = await supabase
              .from("csat_exam_problems")
              .update({
                question_type: row.question_type,
                difficulty_tag: row.difficulty_tag,
                official_correct_rate: row.official_correct_rate,
                source_basis: row.source_basis,
              })
              .eq("subject", row.subject)
              .eq("exam_year", row.exam_year)
              .eq("problem_number", row.problem_number);
            if (updateErr) throw updateErr;
            updated += 1;
            writeProgress({ sourceFile, line: lineNo, key, result: "updated" });
          }
        } catch (e) {
          errors += 1;
          const msg = e instanceof Error ? e.message : String(e);
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
