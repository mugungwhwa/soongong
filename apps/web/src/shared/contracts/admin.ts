/**
 * 관리자 검수 큐 계약 — admin 트랙 공유.
 *
 * Tech Lead 소유. 저신뢰 분류 결과를 사람이 검수하는 큐 아이템.
 */
import type { Subject } from "./common";

export type AdminReviewStatus = "pending" | "approved" | "modified" | "rejected";

export interface AdminReviewItem {
  itemId: string;
  /** 마스킹된 학생 식별자 — 원본 PII 노출 금지. */
  studentMaskedId: string;
  subject: Subject;
  detectedTopic: string;
  confidenceScore: number;
  status: AdminReviewStatus;
  thumbnailPlaceholder: string;
}
