export interface AnalysisResult {
  objectId: string;
  subject: string;
  unit: string;
  topic: string;
  questionType: string;
  difficultyLevel: 1 | 2 | 3 | 4 | 5;
  detectedWrongReason?: string;
  confidenceScore: number;
  rawTextSnippet: string;
}

const MOCK_ANALYSIS: AnalysisResult = {
  objectId: "obj-math-001",
  subject: "수학",
  unit: "수열",
  topic: "점화식 a_{n+1} = 2a_n + 3",
  questionType: "주관식",
  difficultyLevel: 4,
  detectedWrongReason: "일반항 변형 시 항 누락",
  confidenceScore: 0.87,
  rawTextSnippet: "수열 {a_n}이 a_1 = 1, a_{n+1} = 2a_n + 3 을 만족할 때 ...",
};

export async function mockAnalyze(_input: { sourceId: string }): Promise<AnalysisResult> {
  await new Promise((r) => setTimeout(r, 1200));
  return MOCK_ANALYSIS;
}

export async function mockClassifySubject(_input: { text: string }) {
  await new Promise((r) => setTimeout(r, 400));
  return { detectedSubject: "수학" as const, subjectConfidence: 0.92 };
}
