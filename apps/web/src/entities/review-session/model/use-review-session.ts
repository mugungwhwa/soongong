"use client";

/**
 * 회독 세션 결과 요약 — 결과 화면(views/result)이 읽는 세션 스코프 집계.
 *
 * 읽기 전용. 채점·진행·스케줄 로직과 무관(SOO-104 Tech Lead 경계: 뷰는 read 훅만 소비).
 * 현재는 mock fixture를 반환한다. SOO-100 세션 집계 read API가 랜딩하면
 * 이 훅 본문(MOCK 반환 → API 호출)만 1곳 교체하면 되고 뷰는 무수정이다.
 *
 * 값 단위 SSoT: 01_제품_UX_게임화/게임성_기획_구조.md (기억 HP 0–5 정수는 user-game-state).
 */
export interface ReviewSessionSummary {
  /** 이번 세션에서 끝낸 회독 개수. */
  reviewedCount: number;
  /** 또렷해진(인출 성공) 개념 수 — 결과 화면 강조 지표. */
  vividGained: number;
  /** 가물가물했던(곧 다시 만날) 개념 수 — 가벼운 복습 유도 CTA에 사용. */
  fuzzyCount: number;
  /** 이번 세션에서 획득한 XP. */
  earnedXp: number;
}

const MOCK_REVIEW_SESSION: ReviewSessionSummary = {
  reviewedCount: 4,
  vividGained: 3,
  fuzzyCount: 2,
  earnedXp: 120,
};

/** 직전 회독 세션 요약을 반환. (현재 mock — SOO-100 랜딩 시 본문 스왑) */
export function useReviewSession(): ReviewSessionSummary {
  return MOCK_REVIEW_SESSION;
}
