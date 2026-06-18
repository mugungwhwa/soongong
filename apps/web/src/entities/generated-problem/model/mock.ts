import type { GeneratedProblemReviewItem } from "./types";

/**
 * MOCK_MODE(기본 true)이거나 라이브 데이터가 0건일 때 검수 화면이 빈 화면이
 * 되지 않도록 쓰는 fixture. 엔티티 내부에 두어 shared→entities 역참조를 피한다.
 */
export const MOCK_GENERATED_PROBLEMS: GeneratedProblemReviewItem[] = [
  {
    problemId: "mock-gp-001",
    subject: "수학",
    unit: "미적분",
    topic: "치환적분",
    difficultyLevel: "L3",
    difficultyMode: "maintain",
    stem: "$\\int_0^1 2x\\sqrt{x^2+1}\\,dx$ 의 값을 구하시오.",
    choices: null,
    answer: "$\\dfrac{2}{3}(2\\sqrt{2}-1)$",
    explanation:
      "$u=x^2+1$ 로 치환하면 $du=2x\\,dx$. 적분 구간도 $x:0\\to1$ 에서 $u:1\\to2$ 로 함께 바뀐다. $\\int_1^2 \\sqrt{u}\\,du = \\dfrac{2}{3}\\left[u^{3/2}\\right]_1^2 = \\dfrac{2}{3}(2\\sqrt{2}-1)$.",
    targetsWrongReason: ["치환 후 적분 구간 미변경"],
    source: {
      extractedText:
        "$\\int_0^1 2x\\sqrt{x^2+1}\\,dx$ 를 $u=x^2+1$ 로 치환했는데 구간을 0→1 그대로 두고 계산해서 틀림.",
      detectedWrongReason: "치환 후 적분 구간 미변경",
      studentNote: "치환할 때 dx만 바꾸고 구간을 안 바꿈",
    },
    createdAt: "2026-06-18T06:30:00Z",
  },
];
