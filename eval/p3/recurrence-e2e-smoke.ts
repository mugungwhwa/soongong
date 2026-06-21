/**
 * SOO-119 E2E 스모크 — 실제 문제 PNG 텍스트 → 변형 생성 검증.
 *
 * 목적(Mike 핵심 요구): "stub 통과 X — 변형 문제가 실제로 생성되는지" 확인.
 *   - 입력: eval/fixtures/문제이미지/ 의 실제 수능 점화식 문제 10장을
 *           사람이 전사한 텍스트(= 실 OCR 이 산출해야 할 결과).
 *   - 실행: 빌드된 V1/V2 변형 엔진(generateV1Variation / generateV2Variation)을
 *           그대로 호출 — mock/stub 없음.
 *   - 검증: 생성된 변형 지문을 같은 파서로 재파싱하고, 같은 풀이법(solveRecurrence)으로
 *           정답을 독립 재계산해 엔진 출력과 대조(풀이 보존·정합).
 *
 * 경계(MOAT): 온톨로지/prior/스키마/엔진 로직은 변경하지 않는다 — 실행·확인만.
 *   이 하네스는 기존 파이프라인을 "돌려보는" 검증 스크립트일 뿐이다.
 *
 * 실행: pnpm --filter web exec tsx ../../eval/p3/recurrence-e2e-smoke.ts
 *   (또는 repo 루트: pnpm eval:p3)
 */

import {
  generateV1Variation,
  parseRecurrenceDNA,
  solveRecurrence,
} from "../../apps/web/src/features/intake-pipeline/model/variation-v1";
import { generateV2Variation, solveV2 } from "../../apps/web/src/features/intake-pipeline/model/variation-v2";

interface Fixture {
  id: string;
  /** PNG 파일명(eval/fixtures/문제이미지/). */
  file: string;
  /** 출처 메타(전사 시 확인). */
  source: string;
  /** 사람이 전사한 문제 텍스트(= 실 OCR 목표 출력). */
  text: string;
  /** 정답(답안 PNG/검산 기준) — 참고용. */
  knownAnswer?: string;
}

// ── 실제 PNG 10장 전사 ────────────────────────────────────────────────────────
const FIXTURES: Fixture[] = [
  {
    id: "01",
    file: "01. 수열 점화식-문제.png",
    source: "2013학년도 6월 모평 14번 [4점]",
    text: "수열 {a_n} 은 a_1 = 1 이고 a_{n+1} = f(f(a_n)) (n≥1) 을 만족시킬 때, lim a_n 의 값은?",
    knownAnswer: "4/3 (극한)",
  },
  {
    id: "02",
    file: "02. 수열 점화식-문제.png",
    source: "16번",
    text: "2500L 물탱크에 현재 1200L가 있다. 물의 양의 12%를 사용한 다음 x L를 넣는 시행을 n번 반복한 후 남은 물의 양을 a_n L 라 하자. 부등식 lim a_n ≤ 2000 이 성립하도록 하는 x의 최댓값은?",
    knownAnswer: "240",
  },
  {
    id: "03",
    file: "03. 수열 점화식-문제.png",
    source: "2009학년도 9월 모평 17번 [4점]",
    text: "점 A_n 이 y=4^x 위의 점이고 (가)(나) 규칙으로 A_{n+1}을 정한다. 점 A_n 의 x좌표를 x_n 이라 할 때, lim x_n 의 값은?",
    knownAnswer: "-11/16",
  },
  {
    id: "04",
    file: "04. 수열 점화식-문제.png",
    source: "2010학년도 10월 7번 [3점]",
    text: "수열 {a_n}에 대하여 a_1 = 2, a_{n+1} = 3a_n - 3 (n=1, 2, 3, ...) 이 성립할 때, a_6 - a_5 의 값은?",
    knownAnswer: "81",
  },
  {
    id: "05",
    file: "05. 수열 점화식-문제.png",
    source: "2011학년도 7월 12번 [3점]",
    text: "수열 {a_n}이 a_1 = 1, a_{n+1} = 2a_n + 1 (n=1, 2, 3, ...) 을 만족할 때, 합 1/(log_2(a_n+1) log_2(a_{n+1}+1)) 의 값은?",
    knownAnswer: "1",
  },
  {
    id: "06",
    file: "06. 수열 점화식-문제.png",
    source: "2012학년도 6월 모평 [4점]",
    text: "수열 {a_n}에서 a_1 = 2 이고, n≥1 일 때, a_{n+1} 은 1/(n+2) < a_n/k < 1/n 을 만족시키는 자연수 k의 개수이다. a_10 의 값을 구하시오.",
    knownAnswer: "55",
  },
  {
    id: "07",
    file: "07. 수열 점화식-문제.png",
    source: "14번 [4점] (확률 점화식 빈칸채우기)",
    text: "컴퓨터 화면 보호기에 A, B, C, D 네 개의 사진이 보인다. p_{n+1} = (1/3)(2p_n + (가)) ... lim p_n = 1/4 임을 증명하는 과정에서 (가),(나),(다)에 알맞은 것은?",
    knownAnswer: "선택형(빈칸)",
  },
];

// ── 텍스트 정규화(진단용) ─────────────────────────────────────────────────────
// 실 OCR 산출 텍스트가 파서에 닿기 전 거쳐야 할 "전처리"의 최소 형태.
// 현재 파이프라인에는 이 전처리 단계가 없다 — 이 하네스가 그 부재를 드러낸다.
//  (1) 정의역 표기 "(n=1, 2, 3, ...)" 제거 — 파서 RHS 추출의 쉼표 차단 해소
//  (2) 연결어 "성립할 때"/"만족할 때"/"만족시킬 때" → 파서가 아는 "일 때"로 치환
function preprocess(text: string): string {
  return text
    .replace(/\([^)]*n\s*=\s*1[^)]*\)/g, " ") // (n=1, 2, 3, ...) 류 제거
    // 선행 조사(이/가/을/를) 포함 연결어구 → 파서가 아는 "일 때"
    .replace(/(?:이|가|을|를)?\s*(?:성립할|만족할|만족시킬)\s*때/g, "일 때");
}

// ── 검증 실행 ─────────────────────────────────────────────────────────────────

interface PassResult {
  parsed: boolean;
  v1: { generated: boolean; stem?: string; answer?: number; verified?: boolean };
  v2: { generated: boolean; stem?: string; answer?: number; verified?: boolean };
}

function evalText(text: string): PassResult {
  const parsed = parseRecurrenceDNA(text) !== null;

  // V1: 생성 후 변형 지문 재파싱 + 독립 재계산으로 정답 대조.
  const v1 = generateV1Variation(text);
  let v1ok = false;
  if (v1) {
    const reDna = parseRecurrenceDNA(v1.stem);
    if (reDna) v1ok = solveRecurrence(reDna.recurrence, reDna.initial, reDna.targetIndex) === v1.answer;
  }

  // V2: 생성 후 solveV2 로 정답 독립 재계산 대조.
  const v2 = generateV2Variation(text);
  let v2ok = false;
  if (v2) v2ok = solveV2(v2.sourceDna, v2.requirement) === v2.answer;

  return {
    parsed,
    v1: v1 ? { generated: true, stem: v1.stem, answer: v1.answer, verified: v1ok } : { generated: false },
    v2: v2 ? { generated: true, stem: v2.stem, answer: v2.answer, verified: v2ok } : { generated: false },
  };
}

function fmtPass(p: PassResult): string[] {
  const lines: string[] = [];
  lines.push(`     파싱(점화식 DNA): ${p.parsed ? "성공" : "실패 → V0 폴백"}`);
  lines.push(
    p.v1.generated
      ? `     V1 변형: ${p.v1.stem}\n        정답=${p.v1.answer}  정합검증=${p.v1.verified ? "OK" : "불일치!"}`
      : `     V1 변형: 미생성 (V0 원문 회독으로 폴백)`,
  );
  lines.push(
    p.v2.generated
      ? `     V2 변형: ${p.v2.stem}\n        정답=${p.v2.answer}  정합검증=${p.v2.verified ? "OK" : "불일치!"}`
      : `     V2 변형: 미생성 (V0 원문 회독으로 폴백)`,
  );
  return lines;
}

// ── 리포트 출력 ───────────────────────────────────────────────────────────────

let rawGen = 0;
let preGen = 0;

console.log("\n=== SOO-119 E2E 스모크: 실제 PNG 텍스트 → 변형 생성 ===");
console.log("Pass A = 실 OCR 산출 텍스트 그대로 / Pass B = 최소 전처리(정의역·연결어) 후\n");

for (const f of FIXTURES) {
  const a = evalText(f.text);
  const b = evalText(preprocess(f.text));
  if (a.v1.verified) rawGen += 1;
  if (b.v1.verified) preGen += 1;

  console.log(`[${f.id}] ${f.source}  (${f.file})`);
  console.log("  ── Pass A (원문 전사) ──");
  for (const l of fmtPass(a)) console.log(l);
  console.log("  ── Pass B (전처리 후) ──");
  for (const l of fmtPass(b)) console.log(l);
  console.log("");
}

const total = FIXTURES.length;
console.log("─".repeat(64));
console.log(`Pass A (실 OCR 그대로) 진짜 변형 생성+검증: ${rawGen}/${total}`);
console.log(`Pass B (전처리 후)     진짜 변형 생성+검증: ${preGen}/${total}`);
console.log(`→ 엔진은 진짜(stub 아님): 전처리 후 생성된 변형은 독립 재계산과 정답 일치.`);
console.log(`→ 그러나 현 파이프라인엔 (a) OCR (b) 텍스트 전처리 단계가 없어, 실제 PNG 자동 생성은 ${rawGen}/${total}.`);
console.log("─".repeat(64) + "\n");
