export interface AnalysisVariation {
  level: "V1" | "V2";
  strategy: "numeric_swap" | "target_change";
  stem: string;
  choices?: string[];
  answerIndex?: number;
  expectedCorrectRate: number;
  validationRequired: boolean;
}

export interface AnalysisResult {
  objectId: string;
  subject: string;
  unit: string;
  topic: string;
  questionType: string;
  difficultyLevel: 1 | 2 | 3 | 4 | 5;
  detectedWrongReason?: string;
  wrongReasonCandidates?: string[];
  confidenceScore: number;
  rawTextSnippet: string;
  variation?: AnalysisVariation;
}

const MOCK_ANALYSIS: AnalysisResult = {
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
};

export async function mockAnalyze(_input: { sourceId: string }): Promise<AnalysisResult> {
  await new Promise((r) => setTimeout(r, 1200));
  return MOCK_ANALYSIS;
}

export async function mockClassifySubject(_input: { text: string }) {
  await new Promise((r) => setTimeout(r, 400));
  return { detectedSubject: "수학" as const, subjectConfidence: 0.92 };
}
