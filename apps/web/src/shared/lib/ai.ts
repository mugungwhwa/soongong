// AI swap point — 목업 단계 mock 고정. 계약: @/shared/contracts (AiClient).
// 실 AI 연결 시 Anthropic SDK 분기로 교체 예정 (P3).
import { mockAnalyze, mockClassifySubject } from "@/shared/mocks/analysis";
import type {
  AiClient,
  AnalyzeSourceInput,
  AnalysisResult,
  ClassifySubjectInput,
  ClassifySubjectResult,
} from "@/shared/contracts";

export async function analyzeSource(
  input: AnalyzeSourceInput,
): Promise<AnalysisResult> {
  return mockAnalyze(input);
}

export async function classifySubject(
  input: ClassifySubjectInput,
): Promise<ClassifySubjectResult> {
  return mockClassifySubject(input);
}

// 컴파일 타임 계약 잠금: swap point 가 AiClient 를 만족하지 않으면 빌드 실패.
const _contract: AiClient = { analyzeSource, classifySubject };
void _contract;
