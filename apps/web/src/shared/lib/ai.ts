import { env } from "@/shared/config/env";
import { mockAnalyze, mockClassifySubject } from "@/shared/mocks/analysis";

export async function analyzeSource(input: { sourceId: string }) {
  if (env.NEXT_PUBLIC_MOCK_MODE) return mockAnalyze(input);
  throw new Error("Real AI not implemented yet — P3 단계에서 Anthropic SDK 분기 채움");
}

export async function classifySubject(input: { text: string }) {
  if (env.NEXT_PUBLIC_MOCK_MODE) return mockClassifySubject(input);
  throw new Error("Real AI not implemented yet — P3 단계에서 Anthropic SDK 분기 채움");
}
