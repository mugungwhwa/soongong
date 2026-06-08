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
