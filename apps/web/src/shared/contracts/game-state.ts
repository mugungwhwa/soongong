/**
 * 게임 상태 계약 — 게임화 트랙 SSoT.
 *
 * Tech Lead 소유. 값 규칙(HP 0–5 정수, rank 6단)은 게임화 SSoT 가 진실 공급원.
 * SSoT: 01_제품_UX_게임화/게임성_기획_구조.md v1.0 — §4-2(HP 0-5), §6-1(rank 6단).
 */

/** 사용자 등급 6단 (식물 모티프 폐기, CLAUDE.md §8). */
export type UserRank =
  | "순공입문"
  | "순공러"
  | "순공대장"
  | "순공도사"
  | "순공마왕"
  | "순공전설";

export interface UserGameState {
  streakDays: number;
  /** 기억 HP — 0–5 정수만 허용 (백분율 폐기, 게임성_기획_구조.md §4-2). */
  memoryHp: number;
  totalXp: number;
  todayXp: number;
  todayMinutes: number;
  rank: UserRank;
}
