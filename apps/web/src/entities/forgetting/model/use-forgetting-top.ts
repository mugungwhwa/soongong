import type { Subject } from "@/shared/contracts";

/**
 * 망각방어 TOP — 홈 뷰 집계 모델.
 *
 * 망각 위험이 높은 개념 상위 N개. 백엔드 망각곡선 집계 연동 전 fixture.
 * cross-track 으로 승격 시 Tech Lead 가 @/shared/contracts 로 이관.
 */
export interface ForgettingItem {
  subject: Subject;
  /** 표시용 개념 라벨(단원·유형 결합). */
  topic: string;
  /** 0–100 망각 위험 점수. */
  risk: number;
}

const MOCK_FORGETTING_TOP: ForgettingItem[] = [
  { subject: "수학", topic: "수열 점화식", risk: 78 },
  { subject: "영어", topic: "혼동 어휘", risk: 72 },
  { subject: "국어", topic: "비문학 추론", risk: 65 },
];

export function useForgettingTop(): ForgettingItem[] {
  return MOCK_FORGETTING_TOP;
}
