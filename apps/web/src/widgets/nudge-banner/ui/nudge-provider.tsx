"use client";
import type { ReactNode } from "react";
import { useNudgeTrigger } from "@/entities/memory";
import { NudgeContext } from "@/shared/lib/nudge-context";

/**
 * useNudgeTrigger를 1회만 실행하고 하위 트리에 nudge 상태를 공급한다.
 * NudgeBanner / NotificationBell / QuestList 모두 이 Provider 안에서 소비 — 중복 쿼리 없음.
 */
export function NudgeProvider({ children }: { children: ReactNode }) {
  const nudge = useNudgeTrigger();
  return <NudgeContext.Provider value={nudge}>{children}</NudgeContext.Provider>;
}
