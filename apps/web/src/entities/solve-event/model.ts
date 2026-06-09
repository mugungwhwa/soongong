/** 회복 변형 단계 — solve_events.variation_level CHECK 와 정합 (자기완결). */
export type VariationLevel = "V0" | "V1" | "V2" | "V3" | "V4" | "V5";

/** 풀이 이벤트 — solve_events 테이블과 1:1. DB snake_case. */
export interface SolveEvent {
  event_id: string;
  quest_id: string;
  user_id: string;
  attempt_number: number;
  variation_level: VariationLevel | null;
  submitted_answer: string | null;
  is_correct: boolean | null;
  solve_time_seconds: number | null;
  hint_used: boolean;
  eraser_count: number;
  stroke_url: string | null;
  solution_image_url: string | null;
  confidence: number | null;
  created_at: string;
}

/** recordSolveEvent 입력 — user_id/attempt_number는 api가 채움. */
export interface RecordSolveEventInput {
  quest_id: string;
  variation_level?: VariationLevel | null;
  submitted_answer?: string;
  is_correct: boolean;
  solve_time_seconds: number;
  hint_used?: boolean;
  eraser_count?: number;
  stroke_url?: string;
  solution_image_url?: string;
  confidence?: number;
}
