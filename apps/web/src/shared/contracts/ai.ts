/**
 * AI swap point 인터페이스 계약 — 게이트(SOO-10) 핵심.
 *
 * 입력 source → 출력 학습객체/분석 결과의 타입 경계를 잠근다.
 * `shared/lib/ai.ts` 가 이 `AiClient` 를 구현하며 mock ↔ 실 Anthropic 분기는
 * 구현 세부일 뿐, 호출자(다른 트랙)는 본 계약만 의존한다.
 *
 * 계약 변경은 Tech Lead 경유만 (CLAUDE.md §3). 데이터 인프라(P3 실파이프라인)는
 * 이 인터페이스를 만족하도록 추후 swap-in 된다 — 격리, 차단 아님.
 */
import type { Subject } from "./common";
import type { AnalysisResult } from "./learning-object";

/** 업로드된 원천(사진/인강기록/메모)의 분석 요청. */
export interface AnalyzeSourceInput {
  /** 업로드 파이프라인이 발급한 원천 ID. */
  sourceId: string;
}

/** 빠른 과목 분류 요청 (전체 분석 전 라우팅용). */
export interface ClassifySubjectInput {
  text: string;
}

export interface ClassifySubjectResult {
  detectedSubject: Subject;
  /** 0–1 분류 신뢰도. */
  subjectConfidence: number;
}

/**
 * AI swap point 가 만족해야 하는 계약.
 * mock 구현과 실 구현 모두 이 형태를 `satisfies` 로 강제한다.
 */
export interface AiClient {
  analyzeSource(input: AnalyzeSourceInput): Promise<AnalysisResult>;
  classifySubject(input: ClassifySubjectInput): Promise<ClassifySubjectResult>;
}
