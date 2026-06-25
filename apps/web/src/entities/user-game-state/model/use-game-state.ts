"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/shared/lib/supabase/client";
import type { UserGameState, UserRank } from "@/shared/contracts";

const DEFAULT: UserGameState = {
  streakDays: 0,
  memoryHp: 5,
  totalXp: 0,
  todayXp: 0,
  todayMinutes: 0,
  rank: "순공입문",
};

export function useGameState(): UserGameState {
  const [state, setState] = useState<UserGameState>(DEFAULT);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("user_game_state")
        .select("streak_days, memory_hp, total_xp, today_xp, today_minutes, rank")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!data) return;

      setState({
        streakDays: data.streak_days,
        memoryHp: data.memory_hp,
        totalXp: data.total_xp,
        todayXp: data.today_xp ?? 0,
        todayMinutes: data.today_minutes ?? 0,
        rank: data.rank as UserRank,
      });
    })();
  }, []);

  return state;
}
