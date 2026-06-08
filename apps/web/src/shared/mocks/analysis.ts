// 계약: @/shared/contracts (AnalysisResult / ClassifySubjectResult). 본 파일은 fixture 구현.
import type {
  AnalysisResult,
  ClassifySubjectResult,
} from "@/shared/contracts";

const MOCK_ANALYSIS = {
  objectId: "obj-math-001",
  subject: "수학",
  unit: "수열",
  topic: "점화식 a_{n+1} = 2a_n + 3",
  questionType: "주관식",
  difficultyLevel: 4,
  detectedWrongReason: "일반항 변형 시 항 누락",
  wrongReasonCandidates: ["일반항 변형 시 항 누락", "초기값 a_1 대입 실수"],
  confidenceScore: 0.87,
  rawTextSnippet: "수열 {a_n}이 a_1 = 1, a_{n+1} = 2a_n + 3 을 만족할 때 ...",
  variation: {
    level: "V1",
    strategy: "numeric_swap",
    stem: "수열 {a_n}이 a_1 = 2, a_{n+1} = 3a_n + 5 을 만족할 때 a_5의 값은?",
    expectedCorrectRate: 0.62,
    validationRequired: false,
  },
} satisfies AnalysisResult;

export async function mockAnalyze(_input: { sourceId: string }): Promise<AnalysisResult> {
  await new Promise((r) => setTimeout(r, 1200));
  return MOCK_ANALYSIS;
}

export async function mockClassifySubject(
  _input: { text: string },
): Promise<ClassifySubjectResult> {
  await new Promise((r) => setTimeout(r, 400));
  return { detectedSubject: "수학", subjectConfidence: 0.92 };
}
