export type ForgettingRisk = "low" | "medium" | "high";

export interface StudentMemoryItem {
  memory_id: string;
  user_id: string;
  object_id: string | null;
  concept_key: string;
  wrong_reason: string | null;
  mastery_score: number;
  recent_accuracy_5: number | null;
  hint_rate_5: number | null;
  confidence_avg: number | null;
  next_review_at: string | null;
  forgetting_risk: ForgettingRisk;
  created_at: string;
  updated_at: string;
}
