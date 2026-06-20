"use client";
import { createContext, useContext } from "react";
import type { NudgeState } from "@/entities/memory";

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
