"use client";
import { createContext, useContext } from "react";

export interface NudgeState {
  /** 망각위험 high + 복습 overdue 조건 충족 시 true. */
  active: boolean;
  /** UI·접근성 라벨용. 예: "3일 미회독". */
  reason: string | null;
  /** 위험 대상 학습객체 전체 수 (limit 미적용). */
  count: number;
}

/** nudge 상태의 기본값 (Provider 바깥에서 소비 시 안전한 폴백). */
const defaultNudge: NudgeState & { loading: boolean } = {
  active: false,
  reason: null,
  count: 0,
  loading: true,
};

export const NudgeContext = createContext<NudgeState & { loading: boolean }>(defaultNudge);

/** NudgeProvider 안에서 1회 조회된 nudge 상태를 소비한다. */
export function useNudgeContext() {
  return useContext(NudgeContext);
}
