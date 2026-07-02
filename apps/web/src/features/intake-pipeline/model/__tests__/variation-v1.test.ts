// SOO-40 DoD: V1(숫자/조건 미세변형) 엔진 — 점화식 1건 입력 → 문항 DNA 분해 →
// 숫자/초항/계수만 변형 → "같은 풀이법(solveRecurrence)으로 풀림" 증명.
// SSoT: 02_AI_Agent_학습엔진/문제_생성_Agent.md §"문항 DNA 구조" + §4 점화식 V1 예시.
import { describe, it, expect } from "vitest";
import {
  parseRecurrenceDNA,
  solveRecurrence,
  generateV1Variation,
  preprocessProblemText,
  type QuestionDNA,
} from "../variation-v1";

// 변형 검증용 독립 재계산(엔진 solver 와 다른 경로) — solver 정확성 교차검증.
function bruteForce(dna: QuestionDNA): number {
  let a = dna.initial;
  for (let n = 1; n < dna.targetIndex; n++) {
    if (dna.recurrence.form === "linear") {
      a = dna.recurrence.p * a + dna.recurrence.q;
    } else {
      a = a + (dna.recurrence.c * n + dna.recurrence.d);
    }
  }
  return a;
}

function numbersOf(dna: QuestionDNA): number[] {
  const base = [dna.initial, dna.targetIndex];
  return dna.recurrence.form === "linear"
    ? [...base, dna.recurrence.p, dna.recurrence.q]
    : [...base, dna.recurrence.c, dna.recurrence.d];
}

describe("parseRecurrenceDNA — 문항 DNA 분해", () => {
  it("LaTeX 선형 점화식을 DNA로 분해한다", () => {
    const dna = parseRecurrenceDNA("$a_1 = 2$, $a_{n+1} = 3a_n + 1$ 일 때 $a_3$를 구하시오.");
    expect(dna).not.toBeNull();
    expect(dna!.concept).toBe("수열_점화식");
    expect(dna!.initial).toBe(2);
    expect(dna!.targetIndex).toBe(3);
    expect(dna!.recurrence).toEqual({ form: "linear", p: 3, q: 1 });
  });

  it("유니코드 첨자 선형 점화식(SSoT §4 V1 예시)을 분해한다", () => {
    const dna = parseRecurrenceDNA("a₁=2, aₙ₊₁=aₙ+3일 때 a₄의 값은?");
    expect(dna).not.toBeNull();
    expect(dna!.initial).toBe(2);
    expect(dna!.targetIndex).toBe(4);
    // a_n + 3 → 계수 p=1 생략형
    expect(dna!.recurrence).toEqual({ form: "linear", p: 1, q: 3 });
  });

  it("n 항이 있는 다항 증분 점화식(a_n + 2n)을 분해한다", () => {
    const dna = parseRecurrenceDNA("$a_1=1$, $a_{n+1}=a_n+2n$ 일 때 $a_4$의 값은?");
    expect(dna).not.toBeNull();
    expect(dna!.initial).toBe(1);
    expect(dna!.targetIndex).toBe(4);
    expect(dna!.recurrence).toEqual({ form: "poly_increment", c: 2, d: 0 });
  });

  it("음수 계수(2a_n - 3)도 분해한다", () => {
    const dna = parseRecurrenceDNA("$a_1 = 1$, $a_{n+1} = 2a_n - 3$ 일 때 $a_4$를 구하시오.");
    expect(dna!.recurrence).toEqual({ form: "linear", p: 2, q: -3 });
  });

  it("점화식이 아닌 텍스트는 null을 반환한다(graceful fallback)", () => {
    expect(parseRecurrenceDNA("다음 글의 주제로 가장 적절한 것은?")).toBeNull();
    expect(parseRecurrenceDNA("")).toBeNull();
  });
});

describe("solveRecurrence — 단일 공유 풀이법(반복 대입)", () => {
  it("선형 점화식을 반복 대입으로 푼다", () => {
    // a_1=2, a_{n+1}=3a_n+1 → a_2=7, a_3=22
    expect(solveRecurrence({ form: "linear", p: 3, q: 1 }, 2, 3)).toBe(22);
  });

  it("a_{n+1}=a_n+3 의 a_4 (SSoT §4 V1: 2,5,8,11)", () => {
    expect(solveRecurrence({ form: "linear", p: 1, q: 3 }, 2, 4)).toBe(11);
  });

  it("다항 증분 a_{n+1}=a_n+2n 의 a_4 (1,3,7,13)", () => {
    expect(solveRecurrence({ form: "poly_increment", c: 2, d: 0 }, 1, 4)).toBe(13);
  });

  it("target=초항이면 초항을 그대로 반환한다", () => {
    expect(solveRecurrence({ form: "linear", p: 3, q: 1 }, 9, 1)).toBe(9);
  });

  // 경계값 가드 — 잘못된 입력은 조용히 틀린 답을 내지 않고 명확히 실패한다.
  it("targetIndex < 1 이면 RangeError (a_1 조용히 반환 금지)", () => {
    expect(() => solveRecurrence({ form: "linear", p: 3, q: 1 }, 5, 0)).toThrow(RangeError);
    expect(() => solveRecurrence({ form: "linear", p: 3, q: 1 }, 5, -3)).toThrow(RangeError);
  });

  it("targetIndex 가 비정수면 RangeError", () => {
    expect(() => solveRecurrence({ form: "linear", p: 3, q: 1 }, 5, 2.5)).toThrow(RangeError);
    expect(() => solveRecurrence({ form: "linear", p: 3, q: 1 }, 5, NaN)).toThrow(RangeError);
  });

  it("targetIndex 가 상한을 초과하면 RangeError (런어웨이 루프 차단)", () => {
    expect(() => solveRecurrence({ form: "linear", p: 1, q: 1 }, 1, 1_000_001)).toThrow(RangeError);
  });

  it("initial 이 유한수가 아니면 RangeError", () => {
    expect(() => solveRecurrence({ form: "linear", p: 3, q: 1 }, NaN, 3)).toThrow(RangeError);
    expect(() => solveRecurrence({ form: "linear", p: 3, q: 1 }, Infinity, 3)).toThrow(RangeError);
  });
});

describe("generateV1Variation — 숫자 변형 + 풀이 보존", () => {
  const ORIGINAL = "$a_1 = 2$, $a_{n+1} = 3a_n + 1$ 일 때 $a_3$를 구하시오.";

  it("변형 문제가 원 풀이법(solveRecurrence)으로 정확히 풀린다 [DoD 핵심]", () => {
    const v = generateV1Variation(ORIGINAL);
    expect(v).not.toBeNull();
    // 원본과 동일한 풀이전략(form) 유지 = 같은 풀이 재훈련
    const src = parseRecurrenceDNA(ORIGINAL)!;
    expect(v!.dna.recurrence.form).toBe(src.recurrence.form);
    // 원 풀이법으로 변형이 풀린다
    expect(solveRecurrence(v!.dna.recurrence, v!.dna.initial, v!.dna.targetIndex)).toBe(v!.answer);
    // 독립 재계산(다른 구현)으로도 정답 일치 → solver 정확성
    expect(bruteForce(v!.dna)).toBe(v!.answer);
  });

  it("숫자/초항/계수만 실제로 바뀐다(구조는 보존)", () => {
    const src = parseRecurrenceDNA(ORIGINAL)!;
    const v = generateV1Variation(ORIGINAL)!;
    expect(numbersOf(v.dna)).not.toEqual(numbersOf(src)); // 최소 1개 숫자 변경
    expect(v.dna.recurrence.form).toBe(src.recurrence.form); // 표현/요구값/조건 불변
  });

  it("결정론적 — 같은 입력/시드는 같은 변형을 만든다", () => {
    const a = generateV1Variation(ORIGINAL, 42);
    const b = generateV1Variation(ORIGINAL, 42);
    expect(a).toEqual(b);
  });

  it("생성 지문은 LaTeX 점화식 + 구하시오 형태를 갖춘다", () => {
    const v = generateV1Variation(ORIGINAL, 7)!;
    expect(v.formulaFormat).toBe("latex");
    expect(v.stem).toMatch(/a_\{n\+1\}/);
    expect(v.stem).toMatch(/구하/);
  });

  it("다항 증분 입력도 같은 form 으로 변형되고 풀이 보존된다", () => {
    const v = generateV1Variation("$a_1=1$, $a_{n+1}=a_n+2n$ 일 때 $a_4$의 값은?", 3)!;
    expect(v.dna.recurrence.form).toBe("poly_increment");
    expect(bruteForce(v.dna)).toBe(v.answer);
  });

  it("파싱 불가 입력은 null(파이프라인이 V0로 폴백)", () => {
    expect(generateV1Variation("주제 찾기 비문학 지문")).toBeNull();
  });
});

// ─── SOO-162 S1: 파서 커버리지 확장 ─────────────────────────────────────────────

describe("전처리 정식화 — 실 OCR 원문(Pass A)이 파이프라인에서 통과한다", () => {
  it("정의역 표기 (n=1,2,3,...) + '성립할 때' 원문을 DNA로 분해한다", () => {
    // 04번 유형(2010학년도 10월 7번): 이전엔 하네스 preprocess 밖(Pass A)에서 파싱 실패.
    const raw =
      "수열 {a_n}에 대하여 a_1 = 2, a_{n+1} = 3a_n - 3 (n=1, 2, 3, ...) 이 성립할 때, a_6 - a_5 의 값은?";
    const dna = parseRecurrenceDNA(raw);
    expect(dna).not.toBeNull();
    expect(dna!.initial).toBe(2);
    expect(dna!.recurrence).toEqual({ form: "linear", p: 3, q: -3 });
    expect(dna!.targetKind).toBe("term");
  });

  it("'(n≥1)' 정의역 표기와 '만족시킬 때' 도 정식화한다", () => {
    const raw = "a_1 = 1, a_{n+1} = 2a_n + 1 (n≥1) 을 만족시킬 때 a_4 의 값은?";
    const dna = parseRecurrenceDNA(raw);
    expect(dna).not.toBeNull();
    expect(dna!.recurrence).toEqual({ form: "linear", p: 2, q: 1 });
  });

  it("preprocessProblemText 는 멱등이다(두 번 적용해도 동일)", () => {
    const raw = "a_{n+1} = 2a_n + 1 (n=1, 2, 3, ...) 을 만족할 때";
    const once = preprocessProblemText(raw);
    expect(preprocessProblemText(once)).toBe(once);
    expect(once).not.toContain("(n=1");
    expect(once).toContain("일 때");
  });
});

describe("목표범위 확장 — 합(Σ)·극한(lim) 목표를 인식한다", () => {
  it("합(Σ) 목표 문제도 점화식 구조를 복원한다(05번 유형)", () => {
    // 05번(2011학년도 7월 12번): 목표가 단일 항 a_k 가 아니라 '합' → 이전엔 파싱 실패.
    const raw =
      "수열 {a_n}이 a_1 = 1, a_{n+1} = 2a_n + 1 (n=1, 2, 3, ...) 을 만족할 때, 합 1/(log_2(a_n+1) log_2(a_{n+1}+1)) 의 값은?";
    const dna = parseRecurrenceDNA(raw);
    expect(dna).not.toBeNull();
    expect(dna!.recurrence).toEqual({ form: "linear", p: 2, q: 1 });
    expect(dna!.targetKind).toBe("sum");
  });

  it("극한(lim) 목표 문제도 점화식 구조를 복원한다", () => {
    const raw = "a_1 = 3, a_{n+1} = a_n + 2n (n≥1) 일 때, lim a_n 의 값은?";
    const dna = parseRecurrenceDNA(raw);
    expect(dna).not.toBeNull();
    expect(dna!.recurrence).toEqual({ form: "poly_increment", c: 2, d: 0 });
    expect(dna!.targetKind).toBe("limit");
  });

  it("합/극한 소스로도 V1 변형이 생성되고 풀이 보존된다", () => {
    const raw = "a_1 = 1, a_{n+1} = 2a_n + 1 (n=1, 2, 3, ...) 을 만족할 때, 합 ... 의 값은?";
    const v = generateV1Variation(raw, 7);
    expect(v).not.toBeNull();
    // 생성된 term 변형은 같은 풀이법으로 정확히 풀린다
    expect(solveRecurrence(v!.dna.recurrence, v!.dna.initial, v!.dna.targetIndex)).toBe(v!.answer);
  });
});

describe("계수 범위 확장 — 유리수 계수(소수·분수)를 인식한다", () => {
  it("소수 계수 0.5a_n 을 분해한다", () => {
    const dna = parseRecurrenceDNA("$a_1 = 8$, $a_{n+1} = 0.5a_n + 1$ 일 때 $a_3$의 값은?");
    expect(dna).not.toBeNull();
    expect(dna!.recurrence).toEqual({ form: "linear", p: 0.5, q: 1 });
  });

  it("분수 계수 (1/2)a_n 을 분해한다", () => {
    const dna = parseRecurrenceDNA("$a_1 = 8$, $a_{n+1} = (1/2)a_n - 1$ 일 때 $a_3$의 값은?");
    expect(dna).not.toBeNull();
    expect(dna!.recurrence).toEqual({ form: "linear", p: 0.5, q: -1 });
  });

  it("유리수 상수항 a_n + 3/2 도 분해한다", () => {
    const dna = parseRecurrenceDNA("$a_1 = 1$, $a_{n+1} = a_n + 3/2$ 일 때 $a_3$의 값은?");
    expect(dna).not.toBeNull();
    expect(dna!.recurrence).toEqual({ form: "linear", p: 1, q: 1.5 });
  });

  it("정수 계수는 기존과 동일하게 정수로 분해한다(회귀 방지)", () => {
    const dna = parseRecurrenceDNA("$a_1 = 2$, $a_{n+1} = 3a_n + 1$ 일 때 $a_3$의 값은?");
    expect(dna!.recurrence).toEqual({ form: "linear", p: 3, q: 1 });
  });
});
