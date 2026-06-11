/**
 * V1 변형 엔진 — 숫자/조건 미세변형 (문항 DNA 기반).
 *
 * SSoT: 02_AI_Agent_학습엔진/문제_생성_Agent.md
 *   §"문항 DNA 구조" — 변형 단위 분해.
 *   §2 Variation Level V1: "숫자, 초항, 계수만 변경 / 같은 풀이 재훈련".
 *   §3 변형 축: 숫자 변형(계수·초항·범위).
 *   §4 수학 점화식 V1 예시.
 *
 * 범위(SOO-40 스코프 가드):
 *  - V1만. 요구값(V2)·표현(V3)·조건(V4)·개념결합(V5) 변형 금지.
 *  - 온톨로지/RAG/prior/적응형 출제는 범위 밖.
 *  - 여기서 하는 일: "DNA 분해 + 숫자 변형 + 풀이 보존"까지.
 *
 * 핵심 불변식(풀이 보존):
 *  변형은 점화식의 **구조(form)** 를 절대 바꾸지 않고 표면 숫자만 바꾼다.
 *  따라서 원본을 푸는 단일 풀이법 `solveRecurrence` 가 변형도 그대로 푼다.
 *
 * 순수 함수 — 외부 I/O 없음. 결정론적(시드 고정 시 동일 출력).
 */

// ─── 점화식 구조(풀이전략의 골격 — V1에서 보존) ──────────────────────────────

/** a_{n+1} = p·a_n + q (1차 선형) */
export interface LinearRecurrence {
  form: "linear";
  p: number;
  q: number;
}

/** a_{n+1} = a_n + (c·n + d) (다항 증분) */
export interface PolyIncrementRecurrence {
  form: "poly_increment";
  c: number;
  d: number;
}

export type RecurrenceSpec = LinearRecurrence | PolyIncrementRecurrence;

// ─── 문항 DNA (SSoT §"문항 DNA 구조") ────────────────────────────────────────

export interface QuestionDNA {
  /** 핵심 개념 */
  concept: "수열_점화식";
  /** 풀이 전략 */
  strategy: "반복 대입";
  /** 표현 형식 */
  representation: "수식형";
  /** 조건 구조: 초항 a_1 값 */
  initial: number;
  /** 요구값: a_k 의 k */
  targetIndex: number;
  /** 풀이전략의 골격 — V1 변형에서 form 불변 */
  recurrence: RecurrenceSpec;
}

export interface V1Variation {
  /** 변형된 문항 DNA */
  dna: QuestionDNA;
  /** 원본 문항 DNA (계보 추적) */
  sourceDna: QuestionDNA;
  /** 생성된 변형 문제 지문 (LaTeX) */
  stem: string;
  /** 같은 풀이법(solveRecurrence)으로 산출한 정답 */
  answer: number;
  formulaFormat: "latex";
}

// ─── 표기 정규화 (유니코드 첨자 / LaTeX 공존 대응) ────────────────────────────

const SUBSCRIPT_MAP: Record<string, string> = {
  "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4",
  "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9",
  "ₙ": "n", "₊": "+", "₋": "-",
};

/**
 * 유니코드 첨자(a₁, aₙ₊₁, a₄)와 LaTeX(a_1, a_{n+1}, a_3)를
 * 표기 독립적인 ASCII로 정규화한다.
 *   a₁ / a_1        → a1
 *   aₙ₊₁ / a_{n+1}  → an+1
 *   aₙ / a_n        → an
 */
function normalize(text: string): string {
  let out = "";
  for (const ch of text) out += SUBSCRIPT_MAP[ch] ?? ch;
  return out
    .replace(/\$/g, "")
    .replace(/[_{}]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// ─── 파서: 문항 DNA 분해 ──────────────────────────────────────────────────────

/** 정규화된 RHS 문자열에서 점화식 구조를 분해. 실패 시 null. */
function parseRecurrence(rhs: string): RecurrenceSpec | null {
  const body = rhs.replace(/\s+/g, "");

  // 다항 증분 먼저: an + c·n (+ d)  — 'an' 이외의 독립 n 항이 있을 때.
  //   an+2n, an+2n+1, an-3n+2 ...
  const poly = body.match(/^an([+-])(\d*)n(?:([+-])(\d+))?$/);
  if (poly) {
    const cSign = poly[1] === "-" ? -1 : 1;
    const cMag = poly[2] === "" ? 1 : Number(poly[2]);
    const c = cSign * cMag;
    const d = poly[3] ? (poly[3] === "-" ? -1 : 1) * Number(poly[4]) : 0;
    if (!Number.isFinite(c) || c === 0) return null;
    return { form: "poly_increment", c, d };
  }

  // 선형: (p)an (+ q)   — p 생략 시 1, q 생략 시 0.
  //   3an+1, an+3, 2an-3, an
  const lin = body.match(/^(\d*)an(?:([+-])(\d+))?$/);
  if (lin) {
    const p = lin[1] === "" ? 1 : Number(lin[1]);
    const q = lin[2] ? (lin[2] === "-" ? -1 : 1) * Number(lin[3]) : 0;
    if (!Number.isFinite(p)) return null;
    return { form: "linear", p, q };
  }

  return null;
}

/**
 * 점화식 문제 텍스트를 문항 DNA로 분해한다.
 * 대상: a_1 초항 + a_{n+1}=... 점화식 + a_k 요구값.
 * 파싱 불가(점화식 아님/모호) 시 null → 호출부가 V0로 폴백.
 */
export function parseRecurrenceDNA(text: string): QuestionDNA | null {
  if (!text || !text.trim()) return null;
  const s = normalize(text);

  // 초항 a1 = <int>
  const initMatch = s.match(/a1\s*=\s*(-?\d+)/);
  if (!initMatch) return null;
  const initial = Number(initMatch[1]);

  // 점화식 RHS: an+1 = <rhs>  (',' 또는 '일 때'/'일때' 또는 문장부호 전까지)
  const recMatch = s.match(/an\+1\s*=\s*([^,]+?)\s*(?:일\s*때|일때|$|\.|\?)/);
  if (!recMatch) return null;
  const recurrence = parseRecurrence(recMatch[1]);
  if (!recurrence) return null;

  // 요구값 a_k — '=' 이 뒤따르지 않는 a<digit> (초항 정의 제외).
  let targetIndex: number | null = null;
  const tokenRe = /a(\d+)(\s*=)?/g;
  for (let m = tokenRe.exec(s); m; m = tokenRe.exec(s)) {
    if (m[2]) continue; // 'a1 =' 같은 정의는 건너뜀
    const idx = Number(m[1]);
    if (idx >= 1) targetIndex = idx; // 마지막(요구값) 채택
  }
  if (targetIndex === null || targetIndex < 1) return null;

  return {
    concept: "수열_점화식",
    strategy: "반복 대입",
    representation: "수식형",
    initial,
    targetIndex,
    recurrence,
  };
}

// ─── 단일 공유 풀이법: 반복 대입 ─────────────────────────────────────────────

/** 다룰 수 있는 항 인덱스 상한 — 비정상 입력의 런어웨이 루프 방지.
 *  실제 수능 점화식 요구값은 한 자리~두 자리 수준이라 넉넉한 여유. */
const MAX_TERM_INDEX = 1000;

/**
 * 점화식을 반복 대입으로 푼다 (SSoT §1 풀이전략 "반복 대입 후 패턴 추론").
 * 원본·변형 모두 이 함수 하나로 풀린다 → "같은 풀이법" 보장.
 *
 * 경계값 가드: 잘못된 입력은 a_1 을 조용히 반환하거나 틀린 답을 만들지 않고
 * 명확히 RangeError 로 실패한다.
 * - targetIndex 는 1 이상의 정수 (a_{-3}/a_2.5 같은 무의미 인덱스 차단)
 * - targetIndex 는 상한 이하 (가비지 입력의 런어웨이 루프 차단)
 * - initial 은 유한수 (NaN/Infinity 전파 차단)
 */
export function solveRecurrence(
  spec: RecurrenceSpec,
  initial: number,
  targetIndex: number,
): number {
  if (!Number.isInteger(targetIndex) || targetIndex < 1) {
    throw new RangeError(
      `solveRecurrence: targetIndex 는 1 이상의 정수여야 합니다 (받음: ${targetIndex}).`,
    );
  }
  if (targetIndex > MAX_TERM_INDEX) {
    throw new RangeError(
      `solveRecurrence: targetIndex 가 상한(${MAX_TERM_INDEX})을 초과했습니다 (받음: ${targetIndex}).`,
    );
  }
  if (!Number.isFinite(initial)) {
    throw new RangeError(`solveRecurrence: initial 은 유한수여야 합니다 (받음: ${initial}).`);
  }

  let a = initial;
  for (let n = 1; n < targetIndex; n++) {
    a = spec.form === "linear" ? spec.p * a + spec.q : a + (spec.c * n + spec.d);
  }
  return a;
}

// ─── 결정론적 PRNG (시드 고정) ───────────────────────────────────────────────

/** mulberry32 — 작은 결정론적 PRNG. Math.random 미사용(재현성). */
function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/** 문자열 → 32bit 해시 (시드 미지정 시 입력에서 결정론적 시드 유도). */
function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function randInt(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

// ─── V1 변형 생성 ─────────────────────────────────────────────────────────────

/** LaTeX 정수 계수 표기: 1 → "" (생략), 그 외 → 숫자. */
function coef(n: number): string {
  return n === 1 ? "" : String(n);
}

/** LaTeX 상수항 표기: 0 → "", 양수 → " + d", 음수 → " - |d|". */
function constTerm(n: number): string {
  if (n === 0) return "";
  return n > 0 ? ` + ${n}` : ` - ${-n}`;
}

function renderStem(dna: QuestionDNA): string {
  const { initial, targetIndex, recurrence } = dna;
  const rhs =
    recurrence.form === "linear"
      ? `${coef(recurrence.p)}a_n${constTerm(recurrence.q)}`
      : `a_n + ${coef(recurrence.c)}n${constTerm(recurrence.d)}`;
  return `$a_1 = ${initial}$, $a_{n+1} = ${rhs}$ 일 때 $a_{${targetIndex}}$의 값을 구하시오.`;
}

/** DNA 의 변형 가능 숫자 튜플 — 변형 전후 동일 여부 비교용. */
function surfaceNumbers(dna: QuestionDNA): number[] {
  const base = [dna.initial, dna.targetIndex];
  return dna.recurrence.form === "linear"
    ? [...base, dna.recurrence.p, dna.recurrence.q]
    : [...base, dna.recurrence.c, dna.recurrence.d];
}

/** 시드로부터 후보 변형 DNA 1개 생성 (구조 form 보존, 표면 숫자만 변경). */
function variantFromSeed(source: QuestionDNA, seed: number): QuestionDNA {
  const rng = mulberry32(seed);
  const initial = randInt(rng, 1, 5);
  const targetIndex = randInt(rng, 3, 5);

  if (source.recurrence.form === "linear") {
    const p = randInt(rng, 1, 3);
    // p=1 이면서 q=0 이면 상수수열(무의미) → q 0 회피.
    let q = randInt(rng, -3, 3);
    if (p === 1 && q === 0) q = 2;
    return { ...source, initial, targetIndex, recurrence: { form: "linear", p, q } };
  }

  const c = randInt(rng, 1, 3);
  const d = randInt(rng, -2, 3);
  return { ...source, initial, targetIndex, recurrence: { form: "poly_increment", c, d } };
}

/**
 * 점화식 문제를 V1(숫자/초항/계수 변형)으로 변형한다.
 *  1) 문항 DNA 분해
 *  2) 구조(form) 보존, 표면 숫자만 결정론적 변형 (원본과 반드시 1개 이상 다름)
 *  3) 같은 풀이법(solveRecurrence)으로 정답 산출 → 풀이 보존
 *
 * 파싱 불가 입력은 null → 파이프라인이 V0(원문 회독)로 폴백.
 *
 * @param text  원본 문제 텍스트(추출 텍스트)
 * @param seed  결정론 시드 (미지정 시 입력에서 유도)
 */
export function generateV1Variation(text: string, seed?: number): V1Variation | null {
  const sourceDna = parseRecurrenceDNA(text);
  if (!sourceDna) return null;

  const baseSeed = seed ?? hashString(normalize(text));
  const srcNums = surfaceNumbers(sourceDna);

  // 변형이 원본과 최소 1개 숫자라도 다를 때까지 시드를 흔든다(결정론적 재시도).
  let dna = variantFromSeed(sourceDna, baseSeed);
  for (let i = 1; i <= 8 && arraysEqual(surfaceNumbers(dna), srcNums); i++) {
    dna = variantFromSeed(sourceDna, baseSeed + i * 0x9e3779b1);
  }
  // 그래도 동일하면(극히 드묾) 요구값을 강제로 한 칸 이동.
  if (arraysEqual(surfaceNumbers(dna), srcNums)) {
    dna = { ...dna, targetIndex: dna.targetIndex === 5 ? 3 : dna.targetIndex + 1 };
  }

  const answer = solveRecurrence(dna.recurrence, dna.initial, dna.targetIndex);
  return { dna, sourceDna, stem: renderStem(dna), answer, formulaFormat: "latex" };
}

function arraysEqual(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}
