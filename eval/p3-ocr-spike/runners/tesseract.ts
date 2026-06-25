import { join } from "node:path";
import { existsSync } from "node:fs";
import { createWorker } from "tesseract.js";
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

async function runOne(
  worker: Awaited<ReturnType<typeof createWorker>>,
  c: GoldenCase
): Promise<RunnerResult> {
  const imagePath = join(GOLDEN_IMAGES_DIR, c.image_filename);
  if (!existsSync(imagePath)) {
    return base(c, null, 0, 0, `image not found: ${c.image_filename}`);
  }
  const t0 = Date.now();
  try {
    const { data } = await withTimeout(
      worker.recognize(imagePath),
      CASE_TIMEOUT_MS,
      `tesseract ${c.case_id}`
    );
    const predicted = data.text ?? "";
    const acc = accuracyScore(predicted, c.expected);
    return base(c, predicted, acc, Date.now() - t0, null);
  } catch (e) {
    return base(c, null, 0, Date.now() - t0, String(e));
  }
}

function base(
  c: GoldenCase,
  predicted: string | null,
  accuracy: number,
  latency_ms: number,
  error: string | null
): RunnerResult {
  return {
    case_id: c.case_id,
    runner: "tesseract",
    ts: new Date().toISOString(),
    predicted,
    expected: c.expected,
    accuracy,
    latency_ms,
    cost_usd: 0, // 로컬 wasm, 무료
    error,
  };
}

async function main() {
  const cases = loadGolden();
  if (cases.length === 0) {
    console.error("골든셋 비어있음. golden/ground-truth.json 확인.");
    process.exit(1);
  }

  // 한·영 + 수식 trained data. equ는 수식 전용.
  const worker = await createWorker(["kor", "eng", "equ"], 1);
  const writer = openJsonl("tesseract");
  console.log(`[tesseract] start cases=${cases.length} out=${writer.path}`);

  const startedAt = Date.now();
  const results: RunnerResult[] = [];
  let pass = 0;
  let fail = 0;

  for (let i = 0; i < cases.length; i++) {
    const r = await runOne(worker, cases[i]);
    writer.append(r);
    results.push(r);
    r.error === null && r.accuracy >= 0.7 ? pass++ : fail++;
    console.log(progressLine("tesseract", i + 1, cases.length, startedAt, pass, fail));
  }

  writer.close();
  await worker.terminate();
  const { summary, summaryPath } = writeSummary(writer.path, results);
  console.log("[tesseract] summary:", summary);
  console.log(`[tesseract] summary file: ${summaryPath}`);
}

main().catch((e) => {
  console.error("[tesseract] fatal:", e);
  process.exit(1);
});
