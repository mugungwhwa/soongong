export type ObjectType =
  | "question"
  | "concept_note"
  | "lecture_concept"
  | "wrong_answer"
  | "type_pattern";

/** DB 컬럼 포맷 ("L1"~"L5"). shared/contracts의 숫자형 DifficultyLevel(1~5)과 별개. */
export type DifficultyLevelCode = "L1" | "L2" | "L3" | "L4" | "L5";
export type ReviewPriority = "low" | "medium" | "high";
export type ReviewerStatus = "pending" | "approved" | "rejected";

export interface ParsedLearningObject {
  object_id: string;
  source_id: string | null;
  user_id: string;
  object_type: ObjectType;
  subject: string;
  unit: string | null;
  topic: string | null;
  question_type: string | null;
  difficulty_level: DifficultyLevelCode | null;
  extracted_text: string | null;
  student_note: string | null;
  detected_wrong_reason: string[];
  review_priority: ReviewPriority;
  confidence_score: number | null;
  reviewer_status: ReviewerStatus;
  created_at: string;
}
