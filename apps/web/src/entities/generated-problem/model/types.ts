/**
 * generated_problems.difficulty_level 컬럼 표기('L1'..'L5').
 * shared/contracts의 DifficultyLevel(숫자 1..5)과는 다른 표현이라 별도 정의.
 */
export type DifficultyLevelCode = "L1" | "L2" | "L3" | "L4" | "L5";

/** get_target_difficulty RPC 결과의 mode — 생성 코드 자체산정 금지(0023 마이그레이션). */
export type DifficultyMode = "rebuild" | "maintain" | "stretch";

/** 검토 화면에서 대조할 원 오답 학습객체(parsed_learning_objects) 일부. */
export interface GeneratedProblemSource {
  /** 원 오답 본문 (extracted_text). */
  extractedText: string | null;
  /** AI가 감지한 오답 사유 (detected_wrong_reason) — 겨냥 약점의 원천. */
  detectedWrongReason: string | null;
  /** 학생이 남긴 메모. */
  studentNote: string | null;
}

/**
 * 검수 화면 1장 = 생성 문항 1건 + 원 오답 대조.
 * generated_problems(0023) → parsed_learning_objects(0015) 1:1 추적.
 */
export interface GeneratedProblemReviewItem {
  problemId: string;
  subject: string;
  unit: string | null;
  topic: string;
  difficultyLevel: DifficultyLevelCode;
  difficultyMode: DifficultyMode;
  stem: string;
  /** 객관식이면 선지, 주관식이면 null. */
  choices: string[] | null;
  answer: string;
  explanation: string;
  /** 겨냥한 오답 사유 — 원 detected_wrong_reason의 부분집합. */
  targetsWrongReason: string[];
  /** 원 오답 학습객체 (삭제/누락 시 null). */
  source: GeneratedProblemSource | null;
  createdAt: string;
}

/** 검수 결정 — audit_logs.action 매핑 전 단계. */
export type ReviewDecision = "approved" | "rejected";

/** 반려 사유 옵션 (MVP 1차 고정 집합). */
export const REJECT_REASONS = [
  "정답·해설 오류",
  "약점 미겨냥",
  "난이도 부적절",
  "표현 부자연",
  "기타",
] as const;

export type RejectReason = (typeof REJECT_REASONS)[number];
