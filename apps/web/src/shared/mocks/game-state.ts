export interface UserGameState {
  streakDays: number;
  memoryHp: number;
  totalXp: number;
  todayXp: number;
  todayMinutes: number;
  rank: "씨앗" | "새싹" | "푸른잎" | "꽃봉오리" | "활짝꽃";
}

export const MOCK_GAME_STATE: UserGameState = {
  streakDays: 12,
  memoryHp: 78,
  totalXp: 2340,
  todayXp: 60,
  todayMinutes: 32,
  rank: "푸른잎",
};

export function getGameState(): UserGameState {
  return MOCK_GAME_STATE;
}
