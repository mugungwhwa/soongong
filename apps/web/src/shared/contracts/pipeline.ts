/**
 * 파이프라인 단계 계약 — Submit → Route → Recognize → Card → Generate → Quest
 *
 * 회독·망각 엔진 리드 소유. 5단계 입출력 타입 경계 SSoT.
 * SSoT: 외부_데이터_유입_엔진.md §5 / SOO-39
 *
 * 스텁 2칸 (MOAT 보존):
 * - Recognize: OCR 없음, 입력 텍스트 그대로 통과
 * - Generate: 파싱 객체 → 템플릿 1:1 변환
 */

/** Submit 단계에서 허용하는 소스 타입 (entities/source/model.ts SourceType 와 정합). */
export type PipelineSourceType =
  | "problem_photo"
  | "lecture_log"
  | "capture_note"
  | "manual_text";

// ─── Stage 1: Submit ────────────────────────────────────────────────────────

export interface SubmitInput {
  userId: string;
  rawText: string;
  sourceType: PipelineSourceType;
}

export interface SubmitOutput {
  sourceId: string;
}

// ─── Stage 2: Route ─────────────────────────────────────────────────────────
// (실행 순서: Submit → Route → Recognize — subject 감지 후 학습객체 생성)

export interface RouteInput {
  userId: string;
  sourceId: string;
  rawText: string;
  sourceType: PipelineSourceType;
}

export interface RouteOutput {
  routingId: string;
  detectedSubject: string;
  finalSubject: string;
}

// ─── Stage 3: Recognize (STUB — MOAT slot) ─────────────────────────────────

export interface RecognizeInput {
  userId: string;
  sourceId: string;
  rawText: string;
  /** Route 단계에서 감지된 과목. parsed_learning_objects.subject 에 기록. */
  subject: string;
}

export interface RecognizeOutput {
  objectId: string;
}

// ─── Stage 4: Card ──────────────────────────────────────────────────────────

export interface CardInput {
  subject: string;
  questionType?: string;
}

export interface CardOutput {
  typeId: string | null;
  typeName: string;
}

// ─── Stage 5: Generate (STUB — MOAT slot) ──────────────────────────────────

export interface GenerateInput {
  userId: string;
  objectId: string;
  subject: string;
  typeId: string | null;
  typeName: string;
}

export interface GenerateOutput {
  questId: string;
}

// ─── Full Pipeline ───────────────────────────────────────────────────────────

export interface PipelineInput {
  userId: string;
  rawText: string;
  sourceType: PipelineSourceType;
}

export interface PipelineOutput {
  sourceId: string;
  objectId: string;
  routingId: string;
  finalSubject: string;
  typeId: string | null;
  questId: string;
}
