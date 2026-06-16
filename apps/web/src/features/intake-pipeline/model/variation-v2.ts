/**
 * V2 변형 엔진 — 요구값 변경 (문항 DNA 기반). SOO-44.
 *
 * SSoT: 02_AI_Agent_학습엔진/문제_생성_Agent.md
 *   §2 Variation Level V2: "요구값 변경 / 일반항 → 특정 항, 값 비교 등 / 풀이 이해 확인".
 *   §3 변형 축: 요구값 변형.
 *   §4 점화식 V2 예시: `a₅의 값을 구하라` (묻는 값 변경).
 *
 * V1 과의 차이(핵심):
 *  - V1(SOO-40): 점화식의 **표면 숫자**(초항·계수)를 바꾼다. 묻는 형태는 "a_k 의 값" 그대로.
 *  - V2(SOO-44): 점화식 구조·숫자는 **원본 그대로 보존**하고, **묻는 값의 형태**를 바꾼다.
 *      단일 항(a_k) → 두 항의 차 / 합 / 비교.
 *    목적: 숫자만 다시 외우는 재훈련(V1)을 넘어, 풀이를 이해해야 답할 수 있게 만든다
 *    (여러 항을 풀어 관계를 따져야 하므로 "풀이 이해 확인").
 *
 * 핵심 불변식(풀이 정합성):
 *  V2 도 원본과 동일한 점화식을 쓰므로, 같은 풀이법 `solveRecurrence` 로 각 항을 풀고
 *  그 결과를 차/합/비교로 결합한다 → 풀이전략이 보존된다(별도 풀이법 도입 없음).
 *
 * 범위(SOO-44 스코프 가드):
 *  - V2만. V3(표현)·V4(조건구조)·V5(개념결합)는 파킹 — 작성 금지.
 *  - 온톨로지·RAG·prior 점수·적응형 출제는 범위 밖(별도 MOAT).
 *  - V1 코드(parse/solve/render)를 재사용하되 V1 동작은 변경하지 않는다.
 *
 * 순수 함수 — 외부 I/O 없음. 결정론적(시드 고정 시 동일 출력).
 */

import {
  parseRecurrenceDNA,
  solveRecurrence,
  renderRecurrenceSetup,
  mulberry32,
  hashString,
  randInt,
  normalize,
  type QuestionDNA,
} from "./variation-v1";

// ─── V2 요구값 형태 ───────────────────────────────────────────────────────────

/**
 * 요구값 변경의 종류. 모두 "두 항(lo<hi)에 대한 질문" 으로, 단일 항(V1)과 구분된다.
 *  - difference : a_hi − a_lo 의 값
 *  - sum        : a_lo + a_hi 의 값
 *  - comparison : a_lo 와 a_hi 중 더 큰 값
 */
export type V2RequirementForm = "difference" | "sum" | "comparison";

export interface V2Requirement {
  form: V2RequirementForm;
  /** 비교/연산 대상 두 항 인덱스 — 반드시 lo < hi. */
  lo: number;
  hi: number;
}

export interface V2Variation {
  /**
   * 변형 문항 DNA. 점화식 구조·초항은 원본 보존, targetIndex 는 더 큰 항(hi)으로
   * 둔다(스키마 호환). 실제 요구값은 `requirement` 가 기술한다.
   */
  dna: QuestionDNA;
  /** 원본 문항 DNA (계보 추적). */
  sourceDna: QuestionDNA;
  /** 바뀐 요구값(묻는 값) 명세. */
  requirement: V2Requirement;
  /** 생성된 변형 문제 지문 (LaTeX). */
  stem: string;
  /** 같은 풀이법(solveRecurrence)으로 각 항을 풀어 결합한 정답. */
  answer: number;
  formulaFormat: "latex";
}

const FORMS: readonly V2RequirementForm[] = ["difference", "sum", "comparison"];

// ─── 요구값 절 렌더링 ─────────────────────────────────────────────────────────

/** 요구값 형태에 맞는 질문 절(LaTeX)을 만든다. */
function renderRequirementClause(req: V2Requirement): string {
  const { form, lo, hi } = req;
  switch (form) {
    case "difference":
      return `$a_{${hi}} - a_{${lo}}$의 값을 구하시오.`;
    case "sum":
      return `$a_{${lo}} + a_{${hi}}$의 값을 구하시오.`;
    case "comparison":
      return `$a_{${lo}}$와 $a_{${hi}}$ 중 더 큰 값을 구하시오.`;
  }
}

/** 요구값 형태에 맞춰 두 항 값을 결합한 정답을 계산한다(풀이 정합성). */
function combine(form: V2RequirementForm, aLo: number, aHi: number): number {
  switch (form) {
    case "difference":
      return aHi - aLo;
    case "sum":
      return aLo + aHi;
    case "comparison":
      return Math.max(aLo, aHi);
  }
}

// ─── V2 변형 생성 ─────────────────────────────────────────────────────────────

/**
 * 점화식 문제를 V2(요구값 변경)로 변형한다.
 *  1) 문항 DNA 분해(V1 파서 재사용)
 *  2) 점화식 구조·숫자는 보존, **묻는 값의 형태**만 결정론적으로 변경
 *     (단일 항 → 두 항의 차/합/비교)
 *  3) 같은 풀이법(solveRecurrence)으로 두 항을 풀어 결합 → 풀이 정합성 보존
 *
 * 파싱 불가 입력은 null → 파이프라인이 V0(원문 회독)로 폴백.
 *
 * @param text  원본 문제 텍스트(추출 텍스트)
 * @param seed  결정론 시드 (미지정 시 V1 과 동일 규약으로 입력에서 유도)
 */
export function generateV2Variation(text: string, seed?: number): V2Variation | null {
  const sourceDna = parseRecurrenceDNA(text);
  if (!sourceDna) return null;

  // V1 과 같은 시드 규약(hashString(normalize(text))) — 다른 결과를 위해 상수로 분리.
  const baseSeed = (seed ?? hashString(normalize(text))) ^ 0x56_32_00_00; // "V2" 네임스페이스
  const rng = mulberry32(baseSeed >>> 0);

  const form = FORMS[randInt(rng, 0, FORMS.length - 1)];

  // 두 항 인덱스: lo ∈ [2,4], hi ∈ [lo+1, lo+3] → 항상 lo < hi, 상한 7.
  const lo = randInt(rng, 2, 4);
  const hi = lo + randInt(rng, 1, 3);
  const requirement: V2Requirement = { form, lo, hi };

  // 풀이 정합성: 원본 점화식을 같은 풀이법으로 두 항 모두 푼다.
  const aLo = solveRecurrence(sourceDna.recurrence, sourceDna.initial, lo);
  const aHi = solveRecurrence(sourceDna.recurrence, sourceDna.initial, hi);
  const answer = combine(form, aLo, aHi);

  // DNA: 점화식·초항 보존, targetIndex 는 더 큰 항(hi).
  const dna: QuestionDNA = { ...sourceDna, targetIndex: hi };

  const stem = `${renderRecurrenceSetup(sourceDna)} 일 때, ${renderRequirementClause(requirement)}`;

  return { dna, sourceDna, requirement, stem, answer, formulaFormat: "latex" };
}

/**
 * V2 변형의 정답을 원본 점화식·요구값 명세로부터 독립 재계산한다.
 * 검수/교차검증용 — 생성 경로와 다른 호출이지만 같은 solver 를 쓴다.
 */
export function solveV2(sourceDna: QuestionDNA, req: V2Requirement): number {
  const aLo = solveRecurrence(sourceDna.recurrence, sourceDna.initial, req.lo);
  const aHi = solveRecurrence(sourceDna.recurrence, sourceDna.initial, req.hi);
  return combine(req.form, aLo, aHi);
}
