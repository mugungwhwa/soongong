import { z } from "npm:zod@3";

export const complianceSchema = z.object({
  copyright_risk: z.enum(["low", "medium", "high"]),
  contains_paid_lecture: z.boolean(),
  contains_exam_original: z.boolean(),
  contains_personal_info: z.boolean(),
  allow_user_view: z.boolean(),
  allow_ai_generation: z.boolean(),
  allow_rag_indexing: z.boolean(),
  action: z.enum(["pass", "redact", "derived_only", "reject", "admin_review"]),
  reason: z.string().max(200),
});

export type ComplianceResult = z.infer<typeof complianceSchema>;

export const ocrParsedSchema = z.object({
  object_type: z.enum(["question", "concept_note", "lecture_concept", "wrong_answer", "type_pattern"]),
  subject: z.string().max(50),
  unit: z.string().max(100).nullable(),
  topic: z.string().max(100).nullable(),
  question_type: z.string().max(50).nullable(),
  difficulty_level: z.enum(["L1", "L2", "L3", "L4", "L5"]).nullable(),
  extracted_text: z.string().max(4000),
  student_note: z.string().max(500).nullable(),
  detected_wrong_reason: z.array(z.string().max(100)),
  review_priority: z.enum(["low", "medium", "high"]),
  confidence_score: z.number().min(0).max(1),
  contains_math_formula: z.boolean(),
});

export type OcrParsed = z.infer<typeof ocrParsedSchema>;
