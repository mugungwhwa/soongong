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

/**
 * Generate 단계에서 시도할 변형 레벨.
 *  - "V1": 숫자/조건 미세변형 (SOO-40, 기본값)
 *  - "V2": 요구값 변경 — 단일 항 → 두 항의 차/합/비교 (SOO-44)
 * 미지정 시 "V1". 적응형 V레벨 선택(숙련도 기반)은 범위 밖(별도 MOAT).
 * 파싱 불가(점화식 아님) 시 레벨과 무관하게 V0 원문 회독으로 폴백.
 */
export type VariationLevel = "V1" | "V2";

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
  /** 시도할 변형 레벨. 미지정 시 "V1". 파싱 불가 시 V0 폴백. */
  variationLevel?: VariationLevel;
}

export interface GenerateOutput {
  questId: string;
}

// ─── Full Pipeline ───────────────────────────────────────────────────────────

export interface PipelineInput {
  userId: string;
  rawText: string;
  sourceType: PipelineSourceType;
  /** 시도할 변형 레벨. 미지정 시 "V1"(기존 동작 보존). */
  variationLevel?: VariationLevel;
}

export interface PipelineOutput {
  sourceId: string;
  objectId: string;
  routingId: string;
  finalSubject: string;
  typeId: string | null;
  questId: string;
}
