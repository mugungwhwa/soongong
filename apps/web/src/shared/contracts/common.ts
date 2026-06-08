/**
 * 공유 원시 타입 — 전 트랙 정합 앵커.
 *
 * Tech Lead 소유 계약. 변경은 Tech Lead 경유만 (CLAUDE.md §3 / SOO-10).
 * SSoT: 전략정리.md §4.3 — MVP 1차 한국 수능 3과목 집중.
 */

/** MVP 1차 지원 과목. 회독·AI·게임 트랙 간 `subject` 필드 단일 정의. */
export type Subject = "수학" | "영어" | "국어";

export const SUBJECTS: readonly Subject[] = ["수학", "영어", "국어"] as const;
