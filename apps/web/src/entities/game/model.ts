// SSoT: 01_제품_UX_게임화/게임성_기획_구조.md v1.0
// rank 6단(§6-1), memory_hp 0-5 정수(§4-2), rarity 4단(§5-3)
export type Rank =
  | "순공입문"
  | "순공러"
  | "순공대장"
  | "순공도사"
  | "순공마왕"
  | "순공전설";

export type BadgeRarity = "common" | "rare" | "epic" | "legendary";

export type GameState = {
  user_id: string;
  streak_days: number;
  memory_hp: number;
  total_xp: number;
  rank: Rank;
  rank_tier?: string;
  last_active_date: string | null;
};

export type GameBadge = {
  badge_id: string;
  badge_key: string;
  rarity: BadgeRarity;
  awarded_at: string;
};

export type QuestResult = {
  completed: boolean;
  result: "correct" | "wrong";
  mode: "today" | "wrong_recovery" | "memory_defense";
  hint_used: boolean;
  repeat_wrong?: boolean;
};

export type UpdateGameStateResponse = {
  xp_delta: number;
  streak: number;
  hp: number;
  total_xp: number;
  rank: Rank;
};
