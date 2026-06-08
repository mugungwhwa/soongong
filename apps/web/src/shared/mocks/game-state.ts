// 계약: @/shared/contracts (UserGameState). 본 파일은 fixture 구현.
// 값 규칙 SSoT: 01_제품_UX_게임화/게임성_기획_구조.md v1.0 — §4-2(HP 0-5), §6-1(rank 6단)
import type { UserGameState } from "@/shared/contracts";

export const MOCK_GAME_STATE: UserGameState = {
  streakDays: 12,
  memoryHp: 4,
  totalXp: 2340,
  todayXp: 60,
  todayMinutes: 32,
  rank: "순공대장",
};

export function getGameState(): UserGameState {
  return MOCK_GAME_STATE;
}
