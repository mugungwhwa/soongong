"use client";
import type { Subject } from "@/shared/contracts";
import type { QuestRiskLevel } from "@/shared/contracts";

/**
 * 오답·복습 화면(views/wrong-notes) view-model — 동반자형 복습 시작 리스트.
 *
 * 읽기 전용. 채점·진행·스케줄 로직과 무관(SOO-104 Tech Lead 경계: 뷰는 read 훅만 소비).
 * 기본 WrongNote 계약(shared/contracts, Tech Lead 소유)에 없는 표시 전용 필드
 * (놓친 개념 한 줄·회독 D-day·예상 시간)을 보강한 화면 모델이다. 계약은 변경하지 않는다.
 *
 * 현재 mock fixture. SOO-100 망각엔진 read API(오답·회독 일정)가 랜딩하면
 * 이 훅 본문만 1곳 교체하면 되고 뷰는 무수정이다.
 */
export interface WrongReviewItem {
  id: string;
  subject: Subject;
  /** 단원/개념 라벨. 예) 확률과 통계 · 확률 */
  unit: string;
  /** 복습할 개념 제목. 예) 확률의 곱셈정리 */
  concept: string;
  /** 기억 HP — 0–5 정수(게임성_기획_구조.md §4-2). */
  memoryHp: 0 | 1 | 2 | 3 | 4 | 5;
  /** 망각 위험도 3단(데사처드 pill). */
  riskLevel: QuestRiskLevel;
  /** 회독 D-day 라벨. 예) D-0 / D-1 */
  dday: string;
  /** 놓친 개념 한 줄 — 동반자 톤(약점 낙인 ❌). */
  missReason: string;
  /** 오답회수로 이동할 대상 식별자. (연동 전 mock 경로) */
  objectId: string;
}

export interface WrongReviewSummary {
  /** 복습할 개념 수. */
  reviewCount: number;
  /** 예상 소요(분). */
  estimatedMinutes: number;
  /** 회독 일정 라벨. 예) D-0·1 */
  scheduleLabel: string;
}

export interface WrongNoteReview {
  items: WrongReviewItem[];
  summary: WrongReviewSummary;
}

const MOCK_ITEMS: WrongReviewItem[] = [
  {
    id: "wr-1",
    subject: "수학",
    unit: "확률과 통계 · 확률",
    concept: "확률의 곱셈정리",
    memoryHp: 1,
    riskLevel: "high",
    dday: "D-0",
    missReason: "P(A∩B)=P(A)·P(B|A) 에서 조건부를 빠뜨렸어요",
    objectId: "wr-1",
  },
  {
    id: "wr-2",
    subject: "수학",
    unit: "수학Ⅰ · 수열",
    concept: "등비수열의 합",
    memoryHp: 2,
    riskLevel: "mid",
    dday: "D-1",
    missReason: "공비 r=1 예외 케이스를 놓쳤어요",
    objectId: "wr-2",
  },
];

/** 위험도 우선순으로 정렬된 오답·복습 리스트 + 요약을 반환. (현재 mock) */
export function useWrongNoteReview(): WrongNoteReview {
  return {
    items: MOCK_ITEMS,
    summary: {
      reviewCount: MOCK_ITEMS.length,
      estimatedMinutes: 4,
      scheduleLabel: "D-0·1",
    },
  };
}
