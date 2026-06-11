import { createClient } from "@/shared/lib/supabase/client";
import type { Quest } from "./model";

export interface QuestEnriched {
  quest: Quest;
  subject: string;
  unit: string;
  topic: string;
  forgetting_risk: "low" | "medium" | "high";
  mastery_score: number;
}

/** review_quests + parsed_learning_objects + student_memory_items 배치 조회.
 *  FSD entity 간 import 금지 — 직접 Supabase 쿼리로 3개 테이블 처리. */
export async function getTodayQuestsEnriched(userId: string): Promise<QuestEnriched[]> {
  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: questData, error: questError } = await supabase
    .from("review_quests")
    .select("*")
    .eq("user_id", userId)
    .eq("due_date", today)
    .eq("quest_mode", "today")
    .order("reward_xp", { ascending: false })
    .limit(3);

  if (questError) {
    console.error("[quest/api] getTodayQuestsEnriched:", questError.message);
    throw new Error("퀘스트를 불러오지 못했습니다.");
  }

  const quests = (questData ?? []) as Quest[];
  if (!quests.length) return [];

  const objectIds = [...new Set(quests.map((q) => q.object_id))];
  const memoryIds = quests
    .map((q) => q.memory_id)
    .filter((id): id is string => id !== null);

  const [ploResult, smiResult] = await Promise.all([
    supabase
      .from("parsed_learning_objects")
      .select("object_id,subject,unit,topic")
      .in("object_id", objectIds),
    memoryIds.length
      ? supabase
          .from("student_memory_items")
          .select("memory_id,forgetting_risk,mastery_score")
          .in("memory_id", memoryIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  type PloRow = { object_id: string; subject: string; unit: string | null; topic: string | null };
  type SmiRow = { memory_id: string; forgetting_risk: string; mastery_score: number };

  const ploMap = new Map<string, PloRow>(
    ((ploResult.data ?? []) as PloRow[]).map((p) => [p.object_id, p]),
  );
  const smiMap = new Map<string, SmiRow>(
    ((smiResult.data ?? []) as SmiRow[]).map((m) => [m.memory_id, m]),
  );

  return quests.map((q) => {
    const plo = ploMap.get(q.object_id);
    const smi = q.memory_id ? smiMap.get(q.memory_id) : undefined;
    return {
      quest: q,
      subject: plo?.subject ?? "수학",
      unit: plo?.unit ?? "—",
      topic: plo?.topic ?? "회독 문제",
      forgetting_risk: (smi?.forgetting_risk as "low" | "medium" | "high") ?? "medium",
      mastery_score: smi?.mastery_score ?? 0,
    };
  });
}

export async function getTodayQuestsFromDb(userId: string): Promise<Quest[]> {
  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("review_quests")
    .select("*")
    .eq("user_id", userId)
    .eq("due_date", today)
    .eq("quest_mode", "today")
    .order("reward_xp", { ascending: false })
    .limit(3);

  if (error) {
    console.error("[quest/api] getTodayQuestsFromDb:", error.message);
    throw new Error("퀘스트를 불러오지 못했습니다.");
  }
  return (data ?? []) as Quest[];
}

export async function completeQuest(
  questId: string,
  payload: {
    result: "correct" | "wrong" | "partial";
    solve_time_seconds?: number;
    hint_used?: boolean;
    confidence?: number;
  },
): Promise<{ next_variation: string; next_days: number } | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return null;

  const res = await fetch(
    `${supabaseUrl}/functions/v1/schedule-next-review`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ quest_id: questId, ...payload }),
    },
  );
  if (!res.ok) return null;
  return res.json();
}
