// SOO-44 DoD: V2(요구값 변경) 엔진 — 점화식 1건 입력 → 묻는 값을 단일 항에서
// 두 항의 차/합/비교로 바꿔 출제 → "같은 풀이법(solveRecurrence)으로 풀려 정답·풀이 정합" 증명.
// SSoT: 02_AI_Agent_학습엔진/문제_생성_Agent.md §2 V2 + §3 요구값 변형 + §4 점화식 V2 예시.
import { describe, it, expect } from "vitest";
import {
  parseRecurrenceDNA,
  solveRecurrence,
  type QuestionDNA,
} from "../variation-v1";
import {
  generateV2Variation,
  solveV2,
  type V2Variation,
} from "../variation-v2";

const ORIGINAL = "$a_1 = 2$, $a_{n+1} = 3a_n + 1$ 일 때 $a_3$를 구하시오.";
const POLY = "$a_1=1$, $a_{n+1}=a_n+2n$ 일 때 $a_4$의 값은?";

// 엔진 solver 와 독립된 경로로 a_k 를 재계산(교차검증).
function bruteForceTerm(dna: QuestionDNA, k: number): number {
  let a = dna.initial;
  for (let n = 1; n < k; n++) {
    a = dna.recurrence.form === "linear"
      ? dna.recurrence.p * a + dna.recurrence.q
      : a + (dna.recurrence.c * n + dna.recurrence.d);
  }
  return a;
}

function expectedAnswer(v: V2Variation): number {
  const lo = bruteForceTerm(v.sourceDna, v.requirement.lo);
  const hi = bruteForceTerm(v.sourceDna, v.requirement.hi);
  switch (v.requirement.form) {
    case "difference": return hi - lo;
    case "sum": return lo + hi;
    case "comparison": return Math.max(lo, hi);
  }
}

describe("generateV2Variation — 요구값 변경 + 풀이 정합성", () => {
  it("점화식이 아닌 입력은 null(파이프라인이 V0로 폴백)", () => {
    expect(generateV2Variation("다음 글의 주제로 가장 적절한 것은?")).toBeNull();
    expect(generateV2Variation("")).toBeNull();
  });

  it("점화식 구조·초항을 원본 그대로 보존한다(요구값만 변경) [V2 정의 핵심]", () => {
    const src = parseRecurrenceDNA(ORIGINAL)!;
    const v = generateV2Variation(ORIGINAL)!;
    expect(v).not.toBeNull();
    // 점화식 form·계수·초항은 원본과 동일 (V1 처럼 숫자를 바꾸지 않는다)
    expect(v.sourceDna.recurrence).toEqual(src.recurrence);
    expect(v.dna.recurrence).toEqual(src.recurrence);
    expect(v.dna.initial).toBe(src.initial);
  });

  it("묻는 값이 단일 항이 아니라 두 항(lo<hi)에 대한 질문이다 [요구값 변경]", () => {
    const v = generateV2Variation(ORIGINAL)!;
    expect(v.requirement.lo).toBeLessThan(v.requirement.hi);
    expect(["difference", "sum", "comparison"]).toContain(v.requirement.form);
    // 지문에 두 항이 모두 등장한다.
    expect(v.stem).toContain(`a_{${v.requirement.lo}}`);
    expect(v.stem).toContain(`a_{${v.requirement.hi}}`);
  });

  it("정답이 같은 풀이법(solveRecurrence)으로 푼 두 항의 결합과 일치한다 [DoD 핵심]", () => {
    const v = generateV2Variation(ORIGINAL)!;
    const aLo = solveRecurrence(v.sourceDna.recurrence, v.sourceDna.initial, v.requirement.lo);
    const aHi = solveRecurrence(v.sourceDna.recurrence, v.sourceDna.initial, v.requirement.hi);
    const combined =
      v.requirement.form === "difference" ? aHi - aLo
      : v.requirement.form === "sum" ? aLo + aHi
      : Math.max(aLo, aHi);
    expect(v.answer).toBe(combined);
    // 독립 재계산(다른 구현)으로도 일치 → solver 정확성.
    expect(v.answer).toBe(expectedAnswer(v));
  });

  it("solveV2(교차검증 헬퍼)도 생성 정답과 일치한다", () => {
    const v = generateV2Variation(POLY, 7)!;
    expect(solveV2(v.sourceDna, v.requirement)).toBe(v.answer);
  });

  it("결정론적 — 같은 입력/시드는 같은 변형을 만든다", () => {
    const a = generateV2Variation(ORIGINAL, 42);
    const b = generateV2Variation(ORIGINAL, 42);
    expect(a).toEqual(b);
  });

  it("생성 지문은 LaTeX 점화식 + 요구값 절(구하시오)을 갖춘다", () => {
    const v = generateV2Variation(ORIGINAL, 7)!;
    expect(v.formulaFormat).toBe("latex");
    expect(v.stem).toMatch(/a_\{n\+1\}/);   // 점화식 조건부 보존
    expect(v.stem).toMatch(/구하/);
  });

  it("다항 증분 입력도 요구값 변형 + 풀이 정합 유지", () => {
    const v = generateV2Variation(POLY, 3)!;
    expect(v.sourceDna.recurrence.form).toBe("poly_increment");
    expect(v.answer).toBe(expectedAnswer(v));
  });

  it("difference 형태: a_hi - a_lo (구체값 검증)", () => {
    // a_1=2, a_{n+1}=3a_n+1 → a_2=7, a_3=22, a_4=67
    // 직접 difference 명세로 solveV2 검증.
    const src = parseRecurrenceDNA(ORIGINAL)!;
    expect(solveV2(src, { form: "difference", lo: 2, hi: 4 })).toBe(67 - 7); // 60
    expect(solveV2(src, { form: "sum", lo: 2, hi: 3 })).toBe(7 + 22);        // 29
    expect(solveV2(src, { form: "comparison", lo: 2, hi: 4 })).toBe(67);     // max
  });
});
