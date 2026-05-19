import { join } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import Anthropic from "@anthropic-ai/sdk";
import {
  GOLDEN_IMAGES_DIR,
  CASE_TIMEOUT_MS,
  loadGolden,
  openJsonl,
  writeSummary,
  accuracyScore,
  withTimeout,
  progressLine,
  type RunnerResult,
  type GoldenCase,
} from "./_shared.ts";

const MODEL = process.env.CLAUDE_MODEL ?? "claude-sonnet-4-6";
const API_KEY = process.env.ANTHROPIC_API_KEY;

const SYSTEM_PROMPT = `너는 수능 학생이 올린 수학 문제 사진을 텍스트로 변환하는 OCR 엔진이다.
규칙:
- 한글은 한글 그대로, 수식은 LaTeX로 변환해 $...$로 감싼다 (예: $a_{n+1} = 2a_n + 1$).
- 문제 본문만 출력. 설명/해설/메타 코멘트 금지.
- 손글씨 풀이가 있으면 무시하고 인쇄된 문제 본문에 집중.
- 잘 안 보이면 ?로 대체하지 말고 가장 가능성 높은 글자로 추정.`;

const USER_PROMPT = `이 이미지의 수학 문제 본문을 한글+LaTeX 혼용 텍스트로 추출하라. 풀이/낙서는 무시.`;

function mimeFromName(name: string): "image/jpeg" | "image/png" | "image/webp" {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return "image/jpeg";
}

// Sonnet 4.6 vision 가격 (2026-05 기준 추정 — 실제 결제 후 보정 필요)
// input vision: $3 / Mtok, output: $15 / Mtok
// 이미지 토큰 = (width*height) / 750 근사. 사진 1장 평균 ~1600 tok 가정.
function estimateCostUsd(inputTok: number, outputTok: number): number {
  return (inputTok * 3) / 1_000_000 + (outputTok * 15) / 1_000_000;
}

async function runOne(
  client: Anthropic,
  c: GoldenCase
): Promise<RunnerResult> {
  const imagePath = join(GOLDEN_IMAGES_DIR, c.image_filename);
  if (!existsSync(imagePath)) {
    return base(c, null, 0, 0, null, `image not found: ${c.image_filename}`);
  }
  const t0 = Date.now();
  try {
    const buf = readFileSync(imagePath);
    const base64 = buf.toString("base64");
    const mediaType = mimeFromName(c.image_filename);

    const resp = await withTimeout(
      client.messages.create({
        model: MODEL,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: mediaType, data: base64 },
              },
              { type: "text", text: USER_PROMPT },
            ],
          },
        ],
      }),
      CASE_TIMEOUT_MS,
      `claude ${c.case_id}`
    );

    const predicted = resp.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    const acc = accuracyScore(predicted, c.expected);
    const cost = estimateCostUsd(
      resp.usage.input_tokens,
      resp.usage.output_tokens
    );
    return base(c, predicted, acc, Date.now() - t0, cost, null);
  } catch (e) {
    return base(c, null, 0, Date.now() - t0, null, String(e));
  }
}

function base(
  c: GoldenCase,
  predicted: string | null,
  accuracy: number,
  latency_ms: number,
  cost_usd: number | null,
  error: string | null
): RunnerResult {
  return {
    case_id: c.case_id,
    runner: "claude",
    ts: new Date().toISOString(),
    predicted,
    expected: c.expected,
    accuracy,
    latency_ms,
    cost_usd,
    error,
  };
}

async function main() {
  if (!API_KEY) {
    console.error(
      "ANTHROPIC_API_KEY 미설정. eval/p3-ocr-spike/.env에 키 채우고 재실행."
    );
    process.exit(2);
  }
  const cases = loadGolden();
  if (cases.length === 0) {
    console.error("골든셋 비어있음.");
    process.exit(1);
  }

  const client = new Anthropic({ apiKey: API_KEY });
  const writer = openJsonl("claude");
  console.log(`[claude/${MODEL}] start cases=${cases.length} out=${writer.path}`);

  const startedAt = Date.now();
  const results: RunnerResult[] = [];
  let pass = 0;
  let fail = 0;

  for (let i = 0; i < cases.length; i++) {
    const r = await runOne(client, cases[i]);
    writer.append(r);
    results.push(r);
    r.error === null && r.accuracy >= 0.7 ? pass++ : fail++;
    console.log(progressLine("claude", i + 1, cases.length, startedAt, pass, fail));
  }

  writer.close();
  const { summary, summaryPath } = writeSummary(writer.path, results);
  console.log("[claude] summary:", summary);
  console.log(`[claude] summary file: ${summaryPath}`);
}

main().catch((e) => {
  console.error("[claude] fatal:", e);
  process.exit(1);
});
