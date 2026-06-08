/**
 * shared/contracts — 전 트랙 공유 도메인 계약의 공개 API (barrel).
 *
 * 모든 트랙은 타입을 여기서 import 한다: `import type { Quest } from "@/shared/contracts"`.
 * 계약 정의는 Tech Lead 소유, 변경은 Tech Lead 경유만 (CLAUDE.md §3 / SOO-10).
 */
export type { Subject } from "./common";
export { SUBJECTS } from "./common";

export type {
  AnalysisResult,
  AnalysisVariation,
  DifficultyLevel,
} from "./learning-object";

export type { Quest, QuestRiskLevel, QuestFormat } from "./quest";

export type { UserGameState, UserRank } from "./game-state";

export type { RecoveryVariant, VariantTier } from "./recovery";

export type { AdminReviewItem, AdminReviewStatus } from "./admin";

export type {
  AiClient,
  AnalyzeSourceInput,
  ClassifySubjectInput,
  ClassifySubjectResult,
} from "./ai";
