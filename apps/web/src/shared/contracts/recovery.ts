/**
 * 회복(오답 변형) 사다리 계약.
 *
 * Tech Lead 소유. NOTE: tier 타입은 P0 회복 화면 fixture(V1–V5) 와 정합 유지.
 * 변형 생성 게이트(MVP 1차 V1+V2 잠금)는 문제-리서치 트랙 런타임 규칙 — 본 계약은
 * UI 가 표현 가능한 사다리 단계의 타입만 정의한다.
 */

export type VariantTier = "V1" | "V2" | "V3" | "V4" | "V5";

export interface RecoveryVariant {
  tier: VariantTier;
  description: string;
  prompt: string;
  /** 수식 포맷. 미지정 시 plaintext 하위호환. */
  formula_format?: "latex" | "plaintext";
}
