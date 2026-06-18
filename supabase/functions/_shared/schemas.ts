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
  detected_wrong_reason: z.union([
    z.array(z.string().max(100)),
    z.string().max(500).transform((s) => (s ? s.split(",").map((r) => r.trim()).filter(Boolean) : [])),
  ]),
  review_priority: z.enum(["low", "medium", "high"]),
  confidence_score: z.number().min(0).max(1),
  contains_math_formula: z.boolean(),
});

export type OcrParsed = z.infer<typeof ocrParsedSchema>;

// SOO-64: generate-problem 출력 스키마.
// 주의: difficulty_level은 의도적으로 제외 — 난이도는 get_target_difficulty RPC 결과만 사용(자체산정 금지).
// targets_wrong_reason은 입력 detected_wrong_reason 목록에서만 고르도록 프롬프트로 강제하고, 코드에서 교집합 재검증.
export const generatedProblemSchema = z
  .object({
    question_format: z.enum(["multiple_choice", "short_answer"]),
    stem: z.string().min(1).max(2000),
    choices: z.array(z.string().max(500)).max(8).nullable(),
    answer: z.string().min(1).max(1000),
    explanation: z.string().min(1).max(3000),
    targets_wrong_reason: z.array(z.string().max(100)).min(1),
  })
  .refine(
    (d) => d.question_format !== "multiple_choice" || (d.choices != null && d.choices.length >= 2),
    { message: "multiple_choice requires at least 2 choices", path: ["choices"] },
  );

export type GeneratedProblem = z.infer<typeof generatedProblemSchema>;

// SOO-64: 정답↔해설 정합성 self-check 출력 스키마.
export const selfCheckSchema = z.object({
  consistent: z.boolean(),
  reason: z.string().max(300),
});

export type SelfCheck = z.infer<typeof selfCheckSchema>;
