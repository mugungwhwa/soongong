// AI swap point — mock ↔ 실 Anthropic 분기. 계약: @/shared/contracts (AiClient).
// 계약 변경은 Tech Lead 경유만 (CLAUDE.md §3 / SOO-10).
import { env } from "@/shared/config/env";
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
  if (env.NEXT_PUBLIC_MOCK_MODE) return mockAnalyze(input);
  throw new Error("Real AI not implemented yet — P3 단계에서 Anthropic SDK 분기 채움");
}

export async function classifySubject(
  input: ClassifySubjectInput,
): Promise<ClassifySubjectResult> {
  if (env.NEXT_PUBLIC_MOCK_MODE) return mockClassifySubject(input);
  throw new Error("Real AI not implemented yet — P3 단계에서 Anthropic SDK 분기 채움");
}

// 컴파일 타임 계약 잠금: swap point 가 AiClient 를 만족하지 않으면 빌드 실패.
// 실 구현 swap-in 시에도 동일 가드가 정합을 강제한다.
const _contract: AiClient = { analyzeSource, classifySubject };
void _contract;
