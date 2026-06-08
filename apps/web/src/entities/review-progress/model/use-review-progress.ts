/**
 * 회독지도 진행 — 홈 뷰 집계 모델.
 *
 * 30일 회독 완주 트랙 진행 상태. 백엔드 스케줄 집계 연동 전 fixture.
 * cross-track 으로 승격 시 Tech Lead 가 @/shared/contracts 로 이관.
 */
export interface ReviewProgress {
  /** 진행 일차(1부터). */
  currentDay: number;
  /** 완주 목표 일수. */
  totalDays: number;
  /** 다음 보상 XP. */
  nextRewardXp: number;
}

const MOCK_REVIEW_PROGRESS: ReviewProgress = {
  currentDay: 8,
  totalDays: 30,
  nextRewardXp: 100,
};

export function useReviewProgress(): ReviewProgress {
  return MOCK_REVIEW_PROGRESS;
}
