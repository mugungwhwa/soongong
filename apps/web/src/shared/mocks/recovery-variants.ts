// 계약: @/shared/contracts (RecoveryVariant). 본 파일은 fixture 구현.
import type { RecoveryVariant } from "@/shared/contracts";

export const MOCK_VARIANTS: RecoveryVariant[] = [
  {
    tier: "V1",
    description: "동일 유형 숫자만 변경",
    formula_format: "latex",
    prompt: "$a_1 = 2$, $a_{n+1} = 3a_n + 1$ 일 때 $a_3$를 구하시오.",
  },
  {
    tier: "V2",
    description: "변형: 부호 반전",
    formula_format: "latex",
    prompt: "$a_1 = 1$, $a_{n+1} = 2a_n - 3$ 일 때 $a_4$를 구하시오.",
  },
  {
    tier: "V3",
    description: "변형: 점화식 형태 확장",
    formula_format: "latex",
    prompt: "$a_{n+1} = a_n + 2n + 1$, $a_1 = 1$ 일 때 $a_5$를 구하시오.",
  },
  {
    tier: "V4",
    description: "변형: 두 점화식 결합",
    formula_format: "latex",
    prompt: "$a_{n+2} = a_{n+1} + 2a_n$, $a_1 = 1$, $a_2 = 2$ 일 때 $a_4$를 구하시오.",
  },
  {
    tier: "V5",
    description: "응용: 모의고사 기출 변형",
    formula_format: "plaintext",
    prompt: "2024학년도 9월 모평 21번 변형 — 점화식 + 수렴",
  },
];
