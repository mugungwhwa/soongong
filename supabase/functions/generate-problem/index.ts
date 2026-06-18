// deno-lint-ignore-file
// SOO-64: generate-problem — 오답 학습객체 1건 → 약점 정조준 변형 문항 1개 (1:1).
// 난이도는 get_target_difficulty RPC(level+mode) 결과만 적용 — 생성 코드 자체산정 0.
import { generateObject, getModel, GEN_SYSTEM, SELF_CHECK_SYSTEM, DEFAULT_MODEL } from "../_shared/ai.ts";
import { generatedProblemSchema, selfCheckSchema } from "../_shared/schemas.ts";
import { getAdminClient } from "../_shared/supabase.ts";
import { evaluateGenerationEligibility, intersectWrongReasons } from "./eligibility.ts";

const PROMPT_VERSION = "gp-v1";
const MAX_GEN_ATTEMPTS = 2; // self-check 실패 시 1회 재생성

// difficulty_mode → 출제 지침 (난이도 level 은 RPC 가 결정, mode 는 접근 방식만 바꾼다)
const MODE_GUIDE: Record<string, string> = {
  rebuild: "기초를 다시 다지는 스캐폴딩형으로. 풀이 단계를 잘게 쪼개 약점 개념을 한 단계씩 다시 점검하게 만든다.",
  maintain: "동급 난이도로. 같은 약점을 다른 맥락에서 한 번 더 검증한다.",
  stretch: "한 단 도전적으로. 약점 개념을 응용·결합 상황에서 검증하되 핵심 약점은 그대로 겨냥한다.",
};

interface TargetDifficulty {
  level: string; // "L1".."L5"
  mode: string; // "rebuild" | "maintain" | "stretch"
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // 인증: Bearer JWT 검증으로 호출자 신원 확인
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response("Unauthorized", { status: 401 });
  }
  const token = authHeader.slice(7);

  let object_id: string;
  try {
    ({ object_id } = await req.json());
  } catch {
    return new Response("invalid JSON body", { status: 400 });
  }
  if (!object_id) return new Response("object_id required", { status: 400 });

  const supabase = getAdminClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return new Response("Unauthorized", { status: 401 });

  // 1) 원천 오답 학습객체 조회
  const { data: plo, error: ploError } = await supabase
    .from("parsed_learning_objects")
    .select(
      "object_id, source_id, user_id, object_type, subject, unit, topic, question_type, difficulty_level, extracted_text, detected_wrong_reason, confidence_score",
    )
    .eq("object_id", object_id)
    .maybeSingle();

  if (ploError) return new Response(`DB error: ${ploError.message}`, { status: 500 });
  if (!plo) return new Response("learning object not found", { status: 404 });

  // 소유권 검증
  if (plo.user_id !== user.id) return new Response("Forbidden", { status: 403 });

  // 2) 🔒 compliance 조회 (allow_ai_generation). source_id 없으면 행도 없음 → fail-closed.
  let compliance: { allow_ai_generation: boolean } | null = null;
  if (plo.source_id) {
    const { data: scc, error: sccError } = await supabase
      .from("source_compliance_checks")
      .select("allow_ai_generation")
      .eq("source_id", plo.source_id)
      .maybeSingle();
    if (sccError) return new Response(`DB error: ${sccError.message}`, { status: 500 });
    compliance = scc;
  }

  // 3) 입력 선별 + 법적 가드 (순수 함수)
  const verdict = evaluateGenerationEligibility(plo, compliance);
  if (!verdict.eligible) {
    return new Response(verdict.reason, { status: verdict.status });
  }

  // 4) 난이도 타깃 — get_target_difficulty RPC 만이 난이도 출처 (자체산정 금지)
  const { data: td, error: rpcError } = await supabase.rpc("get_target_difficulty", {
    p_user_id: user.id,
    p_topic: plo.topic,
  });
  if (rpcError) return new Response(`difficulty RPC error: ${rpcError.message}`, { status: 502 });
  const target = td as TargetDifficulty | null;
  if (!target?.level || !target?.mode) {
    return new Response("get_target_difficulty returned no level/mode", { status: 502 });
  }

  // 5) 생성 + self-check 루프 (정합 실패 시 1회 재생성)
  const wrongReasons = plo.detected_wrong_reason as string[];
  const modeGuide = MODE_GUIDE[target.mode] ?? MODE_GUIDE.maintain;

  let generated = null;
  let matchedReasons: string[] = [];
  let lastFailure = "generation did not converge";

  for (let attempt = 0; attempt < MAX_GEN_ATTEMPTS; attempt++) {
    const genPrompt = buildGenPrompt(plo, wrongReasons, target, modeGuide);

    let candidate;
    try {
      const { object } = await generateObject({
        model: getModel("smart"),
        schema: generatedProblemSchema,
        system: [GEN_SYSTEM],
        toolDescription: "약점 정조준 변형 문항을 구조화된 형식으로 반환합니다.",
        maxTokens: 2048,
        messages: [{ role: "user", content: [{ type: "text", text: genPrompt }] }],
      });
      candidate = object;
    } catch (err) {
      lastFailure = `generation failed: ${err instanceof Error ? err.message : String(err)}`;
      continue;
    }

    // 5-a) targets_wrong_reason 을 원 detected_wrong_reason 의 부분집합으로 강제
    matchedReasons = intersectWrongReasons(wrongReasons, candidate.targets_wrong_reason);
    if (matchedReasons.length === 0) {
      lastFailure = "targets_wrong_reason did not match any detected_wrong_reason";
      continue;
    }

    // 5-b) 정답↔해설 정합 self-check
    const consistent = await selfCheckConsistency(candidate);
    if (!consistent) {
      lastFailure = "self-check failed: answer/explanation inconsistent";
      continue;
    }

    generated = candidate;
    break;
  }

  if (!generated) {
    // 정합/매칭 실패 → 폐기 (적재하지 않음)
    return new Response(`generation rejected: ${lastFailure}`, { status: 422 });
  }

  // 6) generated_problems 적재 — difficulty 는 오직 RPC 결과
  const insertPayload = {
    source_object_id: plo.object_id,
    user_id: plo.user_id,
    subject: plo.subject,
    unit: plo.unit ?? null,
    topic: plo.topic,
    difficulty_level: target.level,
    difficulty_mode: target.mode,
    stem: generated.stem,
    choices: generated.question_format === "multiple_choice" ? generated.choices : null,
    answer: generated.answer,
    explanation: generated.explanation,
    targets_wrong_reason: matchedReasons,
    generator_model: DEFAULT_MODEL,
    prompt_version: PROMPT_VERSION,
  };

  const { data: row, error: insertError } = await supabase
    .from("generated_problems")
    .insert(insertPayload)
    .select()
    .single();

  if (insertError) return new Response(insertError.message, { status: 500 });

  return Response.json(row);
});

function buildGenPrompt(
  plo: {
    subject: string;
    unit: string | null;
    topic: string | null;
    question_type: string | null;
    extracted_text: string | null;
  },
  wrongReasons: string[],
  target: TargetDifficulty,
  modeGuide: string,
): string {
  return [
    `과목: ${plo.subject}`,
    plo.unit ? `단원: ${plo.unit}` : null,
    `소주제(topic): ${plo.topic}  ← 반드시 이 topic 을 유지하라`,
    plo.question_type ? `문항 유형: ${plo.question_type}` : null,
    "",
    "[학생이 틀린 원 문항 맥락]",
    plo.extracted_text ?? "(원문 없음)",
    "",
    "[정조준할 오답 사유 — 아래 목록 중에서만 겨냥하라]",
    wrongReasons.map((r) => `- ${r}`).join("\n"),
    "",
    `[목표 난이도] ${target.level} (외부 지정값 — 절대 바꾸지 말 것)`,
    `[접근 방식: ${target.mode}] ${modeGuide}`,
    "",
    "위 약점을 다시 검증하는 변형 문항 1개를 출제하라. 요구사항:",
    "1. 같은 topic 을 유지한다.",
    "2. 숫자만 바꾼 복제나 약점과 무관한 새 문제는 금지.",
    "3. targets_wrong_reason 에는 위 오답 사유 목록에 실제로 있는 항목만, 같은 표기로 적는다.",
    "4. 객관식이면 question_format=multiple_choice 와 choices(2개 이상)를, 주관식이면 short_answer 와 choices=null.",
    "5. answer 와 explanation 은 서로 정합해야 하며, explanation 의 풀이가 answer 에 도달해야 한다.",
  ].filter(Boolean).join("\n");
}

async function selfCheckConsistency(
  candidate: { stem: string; choices: string[] | null; answer: string; explanation: string },
): Promise<boolean> {
  const checkPrompt = [
    "[문제]",
    candidate.stem,
    candidate.choices ? `[선지]\n${candidate.choices.map((c, i) => `${i + 1}. ${c}`).join("\n")}` : null,
    `[정답] ${candidate.answer}`,
    `[해설] ${candidate.explanation}`,
    "",
    "이 문항의 정답과 해설이 논리적으로 정합한가? 해설의 풀이가 실제로 이 정답에 도달하는가?",
  ].filter(Boolean).join("\n");

  try {
    const { object } = await generateObject({
      model: getModel("smart"),
      schema: selfCheckSchema,
      system: [SELF_CHECK_SYSTEM],
      toolDescription: "정답↔해설 정합성 판정 결과를 반환합니다.",
      maxTokens: 512,
      messages: [{ role: "user", content: [{ type: "text", text: checkPrompt }] }],
    });
    return object.consistent;
  } catch {
    // self-check 호출 자체 실패 → 안전하게 불합격 처리
    return false;
  }
}
