import { createClient } from "@/shared/lib/supabase/server";
import type { GameState, GameBadge, QuestResult, UpdateGameStateResponse } from "./model";

export async function getGameState(userId: string): Promise<GameState | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_game_state")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

export async function getRecentBadges(userId: string, limit = 5): Promise<GameBadge[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("badges")
    .select("*")
    .eq("user_id", userId)
    .order("awarded_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function updateGameState(
  userId: string,
  questResult: QuestResult,
): Promise<UpdateGameStateResponse> {
  const supabase = await createClient();
  const { data, error } = await supabase.functions.invoke<UpdateGameStateResponse>(
    "update-game-state",
    { body: { user_id: userId, quest_result: questResult } },
  );
  if (error) throw error;
  return data!;
}
