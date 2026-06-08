export type SourceType = "problem_photo" | "lecture_log" | "capture_note" | "manual_text";
export type StoragePolicy = "permanent" | "temporary" | "derived_only" | "local_only";
export type LicenseStatus = "user_private" | "licensed" | "internal_only" | "forbidden" | "needs_review";
export type ComplianceAction = "pass" | "redact" | "derived_only" | "reject" | "admin_review";

export type Source = {
  source_id: string;
  user_id: string;
  source_type: SourceType;
  raw_url: string | null;
  raw_text: string | null;
  storage_policy: StoragePolicy;
  license_status: LicenseStatus;
  metadata: Record<string, unknown>;
  created_at: string;
  deleted_at: string | null;
};

export type ComplianceCheck = {
  check_id: string;
  source_id: string;
  user_id: string;
  copyright_risk: "low" | "medium" | "high";
  contains_paid_lecture: boolean;
  contains_exam_original: boolean;
  contains_personal_info: boolean;
  allow_user_view: boolean;
  allow_ai_generation: boolean;
  allow_rag_indexing: boolean;
  action: ComplianceAction;
  reason: string | null;
  created_at: string;
};
