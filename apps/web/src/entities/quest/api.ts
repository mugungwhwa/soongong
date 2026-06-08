import { supabase } from "@/shared/lib/supabase/client";
import type { Quest } from "./model";

export async function getTodayQuestsFromDb(userId: string): Promise<Quest[]> {
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
    console.error("[quest/api] getTodayQuests error:", error.message);
    return [];
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
