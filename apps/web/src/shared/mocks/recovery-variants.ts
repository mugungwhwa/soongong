// 계약: @/shared/contracts (RecoveryVariant). 본 파일은 fixture 구현.
import type { RecoveryVariant } from "@/shared/contracts";

export const MOCK_VARIANTS: RecoveryVariant[] = [
  { tier: "V1", description: "동일 유형 숫자만 변경", prompt: "a_1 = 2, a_{n+1} = 3a_n + 1 을 풀어보세요" },
  { tier: "V2", description: "변형: 부호 반전", prompt: "a_1 = 1, a_{n+1} = 2a_n - 3 을 풀어보세요" },
  { tier: "V3", description: "변형: 점화식 형태 확장", prompt: "a_{n+1} = a_n + 2n + 1 을 풀어보세요" },
  { tier: "V4", description: "변형: 두 점화식 결합", prompt: "a_{n+2} = a_{n+1} + 2a_n, a_1 = 1, a_2 = 2" },
  { tier: "V5", description: "응용: 모의고사 기출 변형", prompt: "2024학년도 9월 모평 21번 변형 — 점화식 + 수렴" },
];
