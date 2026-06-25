import { join } from "node:path";
import { existsSync, readFileSync } from "node:fs";
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

const APP_ID = process.env.MATHPIX_APP_ID;
const APP_KEY = process.env.MATHPIX_APP_KEY;
const ENDPOINT = "https://api.mathpix.com/v3/text";

// Mathpix /v3/text 가격 (2026-05 기준 추정 — 실제 정산 후 보정 필요)
// 콜당 ~$0.004 가정 (volume tier).
function estimateCostUsd(): number {
  return 0.004;
}

function mimeFromName(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "heic") return "image/heic";
  return "image/jpeg";
}

async function runOne(c: GoldenCase): Promise<RunnerResult> {
  const imagePath = join(GOLDEN_IMAGES_DIR, c.image_filename);
  if (!existsSync(imagePath)) {
    return base(c, null, 0, 0, null, `image not found: ${c.image_filename}`);
  }
  const t0 = Date.now();
  try {
    const buf = readFileSync(imagePath);
    const src = `data:${mimeFromName(c.image_filename)};base64,${buf.toString(
      "base64"
    )}`;

    const resp = await withTimeout(
      fetch(ENDPOINT, {
        method: "POST",
        headers: {
          app_id: APP_ID!,
          app_key: APP_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          src,
          formats: ["text", "latex_styled"],
          math_inline_delimiters: ["$", "$"],
          rm_spaces: false,
        }),
      }),
      CASE_TIMEOUT_MS,
      `mathpix ${c.case_id}`
    );

    if (!resp.ok) {
      const body = await resp.text();
      return base(c, null, 0, Date.now() - t0, null, `HTTP ${resp.status}: ${body.slice(0, 200)}`);
    }

    const json = (await resp.json()) as {
      text?: string;
      latex_styled?: string;
      error?: string;
    };
    if (json.error) {
      return base(c, null, 0, Date.now() - t0, null, json.error);
    }

    const predicted = json.text ?? json.latex_styled ?? "";
    const acc = accuracyScore(predicted, c.expected);
    return base(c, predicted, acc, Date.now() - t0, estimateCostUsd(), null);
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
    runner: "mathpix",
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
  if (!APP_ID || !APP_KEY) {
    console.error(
      "MATHPIX_APP_ID / MATHPIX_APP_KEY 미설정. trial 키 발급 후 .env 채우거나, Mathpix 빼고 2종 비교만 진행."
    );
    process.exit(2);
  }
  const cases = loadGolden();
  if (cases.length === 0) {
    console.error("골든셋 비어있음.");
    process.exit(1);
  }

  const writer = openJsonl("mathpix");
  console.log(`[mathpix] start cases=${cases.length} out=${writer.path}`);

  const startedAt = Date.now();
  const results: RunnerResult[] = [];
  let pass = 0;
  let fail = 0;

  for (let i = 0; i < cases.length; i++) {
    const r = await runOne(cases[i]);
    writer.append(r);
    results.push(r);
    r.error === null && r.accuracy >= 0.7 ? pass++ : fail++;
    console.log(progressLine("mathpix", i + 1, cases.length, startedAt, pass, fail));
  }

  writer.close();
  const { summary, summaryPath } = writeSummary(writer.path, results);
  console.log("[mathpix] summary:", summary);
  console.log(`[mathpix] summary file: ${summaryPath}`);
}

main().catch((e) => {
  console.error("[mathpix] fatal:", e);
  process.exit(1);
});
