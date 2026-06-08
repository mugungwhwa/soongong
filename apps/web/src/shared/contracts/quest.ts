/**
 * 회독퀘스트 모델 계약 — 회독·게임 트랙 공유.
 *
 * Tech Lead 소유. 학습객체(objectId)와 퀘스트의 정합 경계.
 * UI 라벨 "회독퀘스트", 백서 라벨 "회독" (CLAUDE.md §2).
 */
import type { Subject } from "./common";

/** 망각 위험도 3단 — 컬러 토큰 risk-low/mid/high 와 1:1 (UI 설계.md §3). */
export type QuestRiskLevel = "low" | "mid" | "high";

/** 회독 퀘스트 포맷. */
export type QuestFormat = "회독" | "오답회수" | "변형";

export interface Quest {
  questId: string;
  /** 원천 학습객체 참조 — AnalysisResult.objectId 와 정합. */
  objectId: string;
  subject: Subject;
  unit: string;
  topic: string;
  questFormat: QuestFormat;
  riskLevel: QuestRiskLevel;
  /** 0–100 망각 위험 점수 (riskLevel 의 연속 표현). */
  forgettingRisk: number;
  rewardXp: number;
  /** ISO 8601. */
  dueDate: string;
}
