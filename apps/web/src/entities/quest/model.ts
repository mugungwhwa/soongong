export type QuestMode = "today" | "wrong_recovery" | "memory_defense" | "boss";
export type QuestStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "failed"
  | "skipped"
  | "expired";
export type QuestFormat =
  | "original"
  | "number_variation"
  | "target_change"
  | "representation"
  | "condition"
  | "combo"
  | "concept_card"
  | "ox"
  | "fill_blank";
export type VariationLevel = "V0" | "V1" | "V2" | "V3" | "V4" | "V5";
export type ForgettingRisk = "low" | "medium" | "high";

export interface Quest {
  quest_id: string;
  user_id: string;
  object_id: string;
  memory_id: string | null;
  due_date: string;
  quest_format: QuestFormat;
  quest_mode: QuestMode;
  variation_level: VariationLevel | null;
  difficulty_level: string | null;
  reward_xp: number;
  status: QuestStatus;
  result: "correct" | "wrong" | "partial" | null;
  solve_time_seconds: number | null;
  hint_used: boolean;
  confidence: number | null;
  completed_at: string | null;
  created_at: string;
}
