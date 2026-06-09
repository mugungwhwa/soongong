/**
 * 학습객체 / 분석 결과 계약 — AI 파이프라인 출력의 SSoT.
 *
 * Tech Lead 소유. 입력 source → 출력 학습객체/분석 결과의 타입 경계.
 * 온톨로지 트리(과목→영역→단원→개념→유형→풀이전략→오답패턴)의 MVP 1차 평면화 투영.
 * SSoT: 전략정리.md §3.3, §3.8 / 게임성_기획_구조.md.
 */
import type { Subject } from "./common";

/** 수식 저장 포맷. 기본 plaintext — latex면 MathRenderer로 렌더. */
export type FormulaFormat = "latex" | "plaintext";

/** 회복 변형 — MVP 1차 V1(숫자)·V2(요구값)만 잠금 (문제-리서치 SSoT). */
export interface AnalysisVariation {
  level: "V1" | "V2";
  strategy: "numeric_swap" | "target_change";
  stem: string;
  /** 수식 포맷. 미지정 시 plaintext 하위호환. */
  formula_format?: FormulaFormat;
  choices?: string[];
  answerIndex?: number;
  expectedCorrectRate: number;
  validationRequired: boolean;
}

/** 난이도 5단. */
export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

/** 단일 학습객체 분석 결과. ai.ts `analyzeSource` 의 출력 계약. */
export interface AnalysisResult {
  objectId: string;
  subject: Subject;
  unit: string;
  topic: string;
  questionType: string;
  difficultyLevel: DifficultyLevel;
  detectedWrongReason?: string;
  wrongReasonCandidates?: string[];
  /** 0–1 분류 신뢰도. < 게이트 시 manual 폴백 (CLAUDE.md §4 P3). */
  confidenceScore: number;
  rawTextSnippet: string;
  /** 수식 포맷. 미지정 시 plaintext 하위호환. */
  formula_format?: FormulaFormat;
  variation?: AnalysisVariation;
}
