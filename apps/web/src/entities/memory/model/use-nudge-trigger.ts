"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/shared/lib/supabase/client";
import type { NudgeState } from "@/shared/lib/nudge-context";

/**
 * 망각위험/복습 due 신호를 읽어 nudge 발동 여부를 반환한다.
 *
 * 신호 소비 순서:
 * 1. student_memory_items.forgetting_risk = "high" AND next_review_at <= 오늘
 * 2. (위 0건일 때) review_quests 미완료 + due_date < 오늘
 *
 * count와 earliest-date 조회를 분리해 limit 절단 없이 정확한 건수를 반환한다.
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
        // count와 earliest-date를 분리 조회 — limit로 count가 잘리는 문제 방지
        const [memEarliest, memCount] = await Promise.all([
          supabase
            .from("student_memory_items")
            .select("next_review_at")
            .eq("user_id", user.id)
            .eq("forgetting_risk", "high")
            .not("next_review_at", "is", null)
            .lte("next_review_at", todayStr)
            .order("next_review_at", { ascending: true })
            .limit(1),
          supabase
            .from("student_memory_items")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("forgetting_risk", "high")
            .not("next_review_at", "is", null)
            .lte("next_review_at", todayStr),
        ]);

        const exactMemCount = memCount.count ?? 0;
        if (exactMemCount > 0) {
          const earliest = (memEarliest.data?.[0]?.next_review_at as string ?? todayStr).slice(0, 10);
          const days = Math.max(1, Math.ceil(
            (new Date(todayStr).getTime() - new Date(earliest).getTime()) / 86_400_000,
          ));
          setState({ active: true, reason: `${days}일 미회독`, count: exactMemCount });
          return;
        }

        // 2순위: 복습 퀘스트 overdue (due_date < 오늘, 미완료)
        const [questEarliest, questCount] = await Promise.all([
          supabase
            .from("review_quests")
            .select("due_date")
            .eq("user_id", user.id)
            .in("quest_mode", ["today", "memory_defense"])
            .eq("status", "pending")
            .lt("due_date", todayStr)
            .order("due_date", { ascending: true })
            .limit(1),
          supabase
            .from("review_quests")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .in("quest_mode", ["today", "memory_defense"])
            .eq("status", "pending")
            .lt("due_date", todayStr),
        ]);

        const exactQuestCount = questCount.count ?? 0;
        if (exactQuestCount > 0) {
          const earliest = questEarliest.data?.[0]?.due_date as string ?? todayStr;
          const days = Math.max(1, Math.ceil(
            (new Date(todayStr).getTime() - new Date(earliest).getTime()) / 86_400_000,
          ));
          setState({ active: true, reason: `${days}일 미회독`, count: exactQuestCount });
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
