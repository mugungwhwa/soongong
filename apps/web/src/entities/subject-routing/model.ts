export type RoutingSourceType =
  | "problem_photo"
  | "lecture_log"
  | "capture_note"
  | "manual_text";

export type SubjectGroup =
  | "math"
  | "korean"
  | "english"
  | "social"
  | "science"
  | "other";

export interface SubjectRoutingResult {
  routing_id: string;
  source_id: string | null;
  user_id: string;
  source_type: RoutingSourceType;
  detected_subject: string | null;
  subject_confidence: number | null;
  subject_group: SubjectGroup | null;
  unit_candidates: unknown | null;
  topic_candidates: unknown | null;
  recommended_agents: unknown | null;
  needs_user_confirmation: boolean;
  user_corrected_subject: string | null;
  final_subject: string | null;
  created_at: string;
}
