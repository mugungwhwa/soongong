// 계약: @/shared/contracts (AnalysisResult). 본 파일은 fixture 구현.
// formula_format:"latex" 검증용 수학 객체 3개 + plaintext 객체 2개.
import type { AnalysisResult } from "@/shared/contracts";

export const MOCK_ANALYSIS_RESULTS: AnalysisResult[] = [
  {
    objectId: "obj-math-001",
    subject: "수학",
    unit: "수열",
    topic: "점화식",
    questionType: "계산형",
    difficultyLevel: 3,
    confidenceScore: 0.91,
    formula_format: "latex",
    rawTextSnippet:
      "수열 $\\{a_n\\}$이 $a_1 = 1$, $a_{n+1} = 2a_n + 3$을 만족할 때 $a_3$의 값은?",
  },
  {
    objectId: "obj-math-002",
    subject: "수학",
    unit: "수열",
    topic: "등비수열의 합",
    questionType: "계산형",
    difficultyLevel: 3,
    confidenceScore: 0.88,
    formula_format: "latex",
    rawTextSnippet:
      "첫째항이 $2$이고 공비가 $3$인 등비수열의 첫째항부터 제$n$항까지의 합 $S_n$을 구하면 $S_n = \\dfrac{2(3^n - 1)}{3 - 1}$이다. $S_4$의 값은?",
  },
  {
    objectId: "obj-math-003",
    subject: "수학",
    unit: "지수·로그",
    topic: "로그 성질",
    questionType: "계산형",
    difficultyLevel: 2,
    confidenceScore: 0.93,
    formula_format: "latex",
    rawTextSnippet:
      "$\\log_2 8 + \\log_4 16$의 값을 구하시오. 단, $\\log_2 2 = 1$을 이용하시오.",
  },
  {
    objectId: "obj-eng-007",
    subject: "영어",
    unit: "어휘",
    topic: "혼동 어휘",
    questionType: "선택형",
    difficultyLevel: 2,
    confidenceScore: 0.85,
    formula_format: "plaintext",
    rawTextSnippet:
      "다음 빈칸에 알맞은 단어를 고르시오. The new policy will _____ the way we work. (affect / effect)",
  },
  {
    objectId: "obj-kor-012",
    subject: "국어",
    unit: "비문학",
    topic: "지문 구조",
    questionType: "독해형",
    difficultyLevel: 2,
    confidenceScore: 0.82,
    formula_format: "plaintext",
    rawTextSnippet:
      "다음 지문에서 필자가 말하는 '대조'의 서술 방식이 쓰인 부분을 찾아 설명하시오.",
  },
];

export function getAnalysisResultByObjectId(objectId: string): AnalysisResult | undefined {
  return MOCK_ANALYSIS_RESULTS.find((r) => r.objectId === objectId);
}
