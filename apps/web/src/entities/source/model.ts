export type SourceType = "problem_photo" | "lecture_log" | "capture_note" | "manual_text";
export type StoragePolicy = "permanent" | "temporary" | "derived_only" | "local_only";
export type LicenseStatus = "user_private" | "licensed" | "internal_only" | "forbidden" | "needs_review";
export type ComplianceAction = "pass" | "redact" | "derived_only" | "reject" | "admin_review";

/**
 * OCR 과목 판별 결과 — 확정/수정 UI(SOO-150 A안)가 소비하는 UI↔엔진 계약.
 *
 * `subject`는 parse-ocr 원시 문자열(정규화 전) — UI가 `SUBJECTS`로 정규화해 프리셀렉트하고,
 * 미상/범위 밖이면 "과목을 선택해주세요" 폴백을 띄운다.
 * `confidence`는 parse-ocr가 신뢰도를 제공할 때만 채워진다(0~1). 미제공(현재)이면 `null` →
 * 저신뢰 폴백은 엔진(SOO-260701-02)이 confidence를 실어줄 때 활성화된다(Tech Lead 통합 계약).
 */
export type OcrDetection = {
  objectId: string;
  userId: string;
  subject: string;
  confidence: number | null;
};

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
