// 계약: @/shared/contracts (AdminReviewItem). 본 파일은 fixture 구현.
import type { AdminReviewItem } from "@/shared/contracts";

export const MOCK_ADMIN_QUEUE: AdminReviewItem[] = [
  {
    itemId: "a-001",
    studentMaskedId: "user_***12",
    subject: "수학",
    detectedTopic: "수열 점화식",
    confidenceScore: 0.87,
    status: "pending",
    thumbnailPlaceholder: "📐",
  },
  {
    itemId: "a-002",
    studentMaskedId: "user_***34",
    subject: "영어",
    detectedTopic: "어휘 affect/effect",
    confidenceScore: 0.94,
    status: "pending",
    thumbnailPlaceholder: "📖",
  },
  {
    itemId: "a-003",
    studentMaskedId: "user_***56",
    subject: "국어",
    detectedTopic: "비문학 대조 구조",
    confidenceScore: 0.71,
    status: "pending",
    thumbnailPlaceholder: "📚",
  },
];
