// SOO-64: generate-problem 입력 선별 + 컴플라이언스 가드 (순수 함수, 네트워크 무관).
// 법적 가드(allow_ai_generation)를 여기서 단일화 → 결정론적 단위 테스트로 증명 가능.

export const ELIGIBLE_OBJECT_TYPES = ["wrong_answer", "question", "type_pattern"] as const;
export const MIN_CONFIDENCE = 0.6;

// 실제 오답 사유가 아닌 빈의미 토큰 — 정답 답안/표시 누락 등에서 나온다.
// 이런 토큰만 있는 객체는 "정조준할 약점"이 없으므로 생성 부적격(422)으로 거른다.
const EMPTY_WRONG_REASON_TOKENS = new Set([
  "", "없음", "해당없음", "해당사항없음", "오답없음", "오답아님", "정답", "맞음", "정답임",
  "none", "n/a", "na", "-", "null",
]);

// 비교용 정규화: 앞뒤 공백 제거 → 소문자 → 내부 공백·마침표 제거.
// "없음." / "해당 없음" / "N/A" 같은 표기 흔들림을 한 형태로 모은다.
const normalizeReasonToken = (s: string) => s.trim().toLowerCase().replace(/[\s.]/g, "");

/**
 * detected_wrong_reason 에서 실제 약점만 남긴다.
 * "없음"·"정답"·빈 문자열 같은 빈의미 토큰을 제거 → 정답 답안에서 생성이 시작되지 않게 한다.
 */
export function meaningfulWrongReasons(reasons: string[] | null | undefined): string[] {
  if (!reasons) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const r of reasons) {
    const key = normalizeReasonToken(r);
    if (!key || EMPTY_WRONG_REASON_TOKENS.has(key) || seen.has(key)) continue;
    seen.add(key);
    out.push(r.trim());
  }
  return out;
}

export interface PloLike {
  object_type: string;
  confidence_score: number | null;
  detected_wrong_reason: string[] | null;
  topic: string | null;
  source_id: string | null;
}

export interface ComplianceLike {
  allow_ai_generation: boolean;
}

export interface EligibilityResult {
  eligible: boolean;
  status: number; // 부적격 시 반환할 HTTP status
  reason: string;
}

/**
 * 변형 문항 생성 적격성 판정.
 *
 * 평가 순서(법적 가드 최우선):
 *  1. compliance 행 없음 → fail-closed 거부 (PLO.source_id 가 null 이면 compliance 부재 → 생성 금지)
 *  2. allow_ai_generation=false → 저작권 가드 거부
 *  3. object_type ∈ {wrong_answer, question, type_pattern}
 *  4. confidence_score ≥ 0.6
 *  5. detected_wrong_reason 에 빈의미 토큰("없음"·"정답") 제외 실제 약점 존재
 *  6. topic 존재 (난이도 타깃팅 키)
 */
export function evaluateGenerationEligibility(
  plo: PloLike,
  compliance: ComplianceLike | null,
): EligibilityResult {
  // ── 🔒 법적 가드 (절대) ──────────────────────────────────────────
  if (!compliance) {
    return {
      eligible: false,
      status: 403,
      reason: "compliance record missing — AI generation not permitted (fail-closed)",
    };
  }
  if (compliance.allow_ai_generation !== true) {
    return {
      eligible: false,
      status: 403,
      reason: "allow_ai_generation=false — copyright guard blocks generation",
    };
  }

  // ── 입력 선별 ────────────────────────────────────────────────────
  if (!ELIGIBLE_OBJECT_TYPES.includes(plo.object_type as (typeof ELIGIBLE_OBJECT_TYPES)[number])) {
    return {
      eligible: false,
      status: 422,
      reason: `object_type '${plo.object_type}' not eligible for generation`,
    };
  }
  if (plo.confidence_score == null || plo.confidence_score < MIN_CONFIDENCE) {
    return {
      eligible: false,
      status: 422,
      reason: `confidence_score below ${MIN_CONFIDENCE} threshold`,
    };
  }
  // 빈의미 토큰("없음"·"정답" 등) 제거 후에도 약점이 남아야 적격.
  // 정답 답안(detected_wrong_reason=["없음"])은 여기서 422 로 스킵된다.
  if (meaningfulWrongReasons(plo.detected_wrong_reason).length === 0) {
    return {
      eligible: false,
      status: 422,
      reason: "detected_wrong_reason has no actual weakness (정답/없음) — nothing to target",
    };
  }
  if (!plo.topic) {
    return {
      eligible: false,
      status: 422,
      reason: "topic required for difficulty targeting",
    };
  }

  return { eligible: true, status: 200, reason: "eligible" };
}

/**
 * LLM이 돌려준 targets_wrong_reason 을 원 detected_wrong_reason 의 부분집합으로 강제.
 * 공백 정규화 후 교집합만 남긴다. 매칭이 0개면 정조준 실패(빈 배열 반환).
 */
export function intersectWrongReasons(
  detected: string[],
  targeted: string[],
): string[] {
  const norm = (s: string) => s.trim().toLowerCase();
  const detectedSet = new Set(detected.map(norm));
  const seen = new Set<string>();
  const result: string[] = [];
  for (const t of targeted) {
    const key = norm(t);
    if (detectedSet.has(key) && !seen.has(key)) {
      seen.add(key);
      // 원 detected 표기를 보존해 반환
      const original = detected.find((d) => norm(d) === key);
      result.push(original ?? t);
    }
  }
  return result;
}
