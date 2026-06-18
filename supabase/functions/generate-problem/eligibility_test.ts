// SOO-64: generate-problem 적격성 가드 단위 테스트.
// 실행: deno test supabase/functions/generate-problem/eligibility_test.ts
// 핵심 증명: allow_ai_generation=false / compliance 부재 객체에서 생성 적격 0건 (저작권 법적 가드).
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  evaluateGenerationEligibility,
  intersectWrongReasons,
  type ComplianceLike,
  type PloLike,
} from "./eligibility.ts";

const validPlo: PloLike = {
  object_type: "wrong_answer",
  confidence_score: 0.82,
  detected_wrong_reason: ["개념미숙", "계산실수"],
  topic: "등차수열의 합",
  source_id: "src-1",
};
const allow: ComplianceLike = { allow_ai_generation: true };

Deno.test("적격: 모든 조건 충족 → eligible", () => {
  const r = evaluateGenerationEligibility(validPlo, allow);
  assertEquals(r.eligible, true);
  assertEquals(r.status, 200);
});

// ── 🔒 법적 가드: 생성 적격 0건이어야 하는 케이스들 ──────────────────
Deno.test("법적 가드: allow_ai_generation=false → 거부(403)", () => {
  const r = evaluateGenerationEligibility(validPlo, { allow_ai_generation: false });
  assertEquals(r.eligible, false);
  assertEquals(r.status, 403);
});

Deno.test("법적 가드: compliance 행 없음(source_id null) → fail-closed 거부(403)", () => {
  const r = evaluateGenerationEligibility({ ...validPlo, source_id: null }, null);
  assertEquals(r.eligible, false);
  assertEquals(r.status, 403);
});

Deno.test("법적 가드: source_id 있어도 compliance 미조회(null) → 거부(403)", () => {
  const r = evaluateGenerationEligibility(validPlo, null);
  assertEquals(r.eligible, false);
  assertEquals(r.status, 403);
});

// ── 입력 선별 ────────────────────────────────────────────────────
Deno.test("선별: object_type 부적격(concept_note) → 422", () => {
  const r = evaluateGenerationEligibility({ ...validPlo, object_type: "concept_note" }, allow);
  assertEquals(r.eligible, false);
  assertEquals(r.status, 422);
});

Deno.test("선별: confidence_score < 0.6 → 422", () => {
  const r = evaluateGenerationEligibility({ ...validPlo, confidence_score: 0.59 }, allow);
  assertEquals(r.eligible, false);
  assertEquals(r.status, 422);
});

Deno.test("선별: confidence_score null → 422", () => {
  const r = evaluateGenerationEligibility({ ...validPlo, confidence_score: null }, allow);
  assertEquals(r.eligible, false);
  assertEquals(r.status, 422);
});

Deno.test("선별: detected_wrong_reason 빈 배열 → 422", () => {
  const r = evaluateGenerationEligibility({ ...validPlo, detected_wrong_reason: [] }, allow);
  assertEquals(r.eligible, false);
  assertEquals(r.status, 422);
});

Deno.test("선별: topic null → 422", () => {
  const r = evaluateGenerationEligibility({ ...validPlo, topic: null }, allow);
  assertEquals(r.eligible, false);
  assertEquals(r.status, 422);
});

Deno.test("선별: question / type_pattern 도 적격", () => {
  assertEquals(evaluateGenerationEligibility({ ...validPlo, object_type: "question" }, allow).eligible, true);
  assertEquals(evaluateGenerationEligibility({ ...validPlo, object_type: "type_pattern" }, allow).eligible, true);
});

// ── 평가 순서: 법적 가드가 입력 선별보다 우선 ─────────────────────
Deno.test("순서: 부적격 입력이어도 compliance 거부가 먼저(403)", () => {
  const bad: PloLike = { ...validPlo, object_type: "concept_note", confidence_score: 0.1 };
  const r = evaluateGenerationEligibility(bad, { allow_ai_generation: false });
  assertEquals(r.status, 403);
});

// ── targets_wrong_reason 교집합 강제 ─────────────────────────────
Deno.test("매칭: 원 사유 부분집합만 남기고 표기 보존", () => {
  const detected = ["개념미숙", "계산실수"];
  const targeted = [" 계산실수 ", "시간부족"]; // 공백 + 목록 밖 항목
  assertEquals(intersectWrongReasons(detected, targeted), ["계산실수"]);
});

Deno.test("매칭: 교집합 0개 → 빈 배열(정조준 실패 신호)", () => {
  assertEquals(intersectWrongReasons(["개념미숙"], ["엉뚱한사유"]), []);
});

Deno.test("매칭: 중복 제거", () => {
  assertEquals(intersectWrongReasons(["개념미숙"], ["개념미숙", "개념미숙"]), ["개념미숙"]);
});
