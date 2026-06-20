"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/shared/lib/supabase/client";

export interface NudgeState {
  /** 망각위험 high + 복습 overdue 조건 충족 시 true. */
  active: boolean;
  /** UI·접근성 라벨용. 예: "3일 미회독". */
  reason: string | null;
  /** 위험 대상 학습객체 수. */
  count: number;
}

/**
 * 망각위험/복습 due 신호를 읽어 nudge 발동 여부를 반환한다.
 *
 * 신호 소비 순서:
 * 1. student_memory_items.forgetting_risk = "high" AND next_review_at <= 오늘
 * 2. (위 0건일 때) review_quests 미완료 + due_date < 오늘
 *
 * ⚠️ 망각곡선·복습 스케줄 알고리즘 자체는 건드리지 않는다 — 출력 신호만 소비.
 */
export function useNudgeTrigger(): NudgeState & { loading: boolean } {
  const [state, setState] = useState<NudgeState>({ active: false, reason: null, count: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const todayStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());

        // 1순위: forgetting_risk=high + next_review_at 경과 (망각 엔진 출력 신호)
        const { data: memRows } = await supabase
          .from("student_memory_items")
          .select("next_review_at")
          .eq("user_id", user.id)
          .eq("forgetting_risk", "high")
          .not("next_review_at", "is", null)
          .lte("next_review_at", todayStr)
          .order("next_review_at", { ascending: true })
          .limit(20);

        const highRisk = memRows ?? [];
        if (highRisk.length > 0) {
          const earliest = (highRisk[0].next_review_at as string).slice(0, 10);
          const days = Math.max(1, Math.ceil(
            (new Date(todayStr).getTime() - new Date(earliest).getTime()) / 86_400_000,
          ));
          setState({ active: true, reason: `${days}일 미회독`, count: highRisk.length });
          return;
        }

        // 2순위: 복습 퀘스트 overdue (due_date < 오늘, 미완료)
        const { data: questRows } = await supabase
          .from("review_quests")
          .select("due_date")
          .eq("user_id", user.id)
          .in("quest_mode", ["today", "memory_defense"])
          .eq("status", "pending")
          .lt("due_date", todayStr)
          .order("due_date", { ascending: true })
          .limit(20);

        const overdue = questRows ?? [];
        if (overdue.length > 0) {
          const earliest = overdue[0].due_date as string;
          const days = Math.max(1, Math.ceil(
            (new Date(todayStr).getTime() - new Date(earliest).getTime()) / 86_400_000,
          ));
          setState({ active: true, reason: `${days}일 미회독`, count: overdue.length });
          return;
        }

        setState({ active: false, reason: null, count: 0 });
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  return { ...state, loading };
}
