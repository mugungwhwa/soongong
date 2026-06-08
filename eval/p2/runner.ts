import {
  readFileSync,
  writeFileSync,
  appendFileSync,
  openSync,
  closeSync,
  existsSync,
  mkdirSync,
} from "node:fs";
import { join } from "node:path";

const SEED = 42;
const TIMEOUT_MS = 30_000;
const RESULTS_DIR = "eval/p2/results";
const ts = new Date().toISOString().replace(/[:.]/g, "-");
const out = join(RESULTS_DIR, `run-${ts}.jsonl`);

if (!existsSync(RESULTS_DIR)) mkdirSync(RESULTS_DIR, { recursive: true });

const cases: Array<{
  case_id: string;
  input: { source_type: string; raw_text?: string; image_path?: string };
  expected: Record<string, unknown>;
  description: string;
}> = JSON.parse(readFileSync("eval/p2/compliance-cases.json", "utf8"));

const fd = openSync(out, "a");
const append = (s: string) => appendFileSync(fd, s + "\n");

const total = cases.length;
let pass = 0;
let fail = 0;
const t0 = Date.now();

console.log(`[start] cases=${total} seed=${SEED} out=${out}`);

for (let i = 0; i < cases.length; i++) {
  const c = cases[i]!;
  const t = Date.now();
  let result: Record<string, unknown>;

  try {
    const predicted = await Promise.race([
      runCase(c),
      new Promise<never>((_, rej) =>
        setTimeout(() => rej(new Error("timeout")), TIMEOUT_MS)
      ),
    ]);
    const passCase = evaluate(predicted, c.expected);
    result = {
      case_id: c.case_id,
      pass: passCase,
      predicted,
      expected: c.expected,
      elapsed_ms: Date.now() - t,
    };
    passCase ? pass++ : fail++;
  } catch (e) {
    result = {
      case_id: c.case_id,
      pass: false,
      error: String(e),
      elapsed_ms: Date.now() - t,
    };
    fail++;
  }

  append(JSON.stringify(result));
  if ((i + 1) % 5 === 0 || i + 1 === total) {
    const elapsed = Math.floor((Date.now() - t0) / 1000);
    const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
    const ss = String(elapsed % 60).padStart(2, "0");
    console.log(`[${i + 1}/${total}] elapsed=${mm}:${ss} pass=${pass} fail=${fail}`);
  }
}

closeSync(fd);

const acc = pass / total;
const summary = { total, pass, fail, accuracy: acc };
console.log("[summary]", summary);
writeFileSync(out.replace(".jsonl", ".summary.json"), JSON.stringify(summary, null, 2));

const GATE = 0.8;
if (acc < GATE) {
  console.error(`✗ 게이트 미달: action_accuracy=${acc.toFixed(2)} < ${GATE}`);
  process.exit(1);
}
console.log(`✓ 게이트 통과: ${acc.toFixed(2)} ≥ ${GATE}`);

async function runCase(c: (typeof cases)[number]) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 미설정");

  // dry_run=true: DB insert 생략하고 분류 결과만 반환 (compliance-gate 지원)
  const res = await fetch(`${supabaseUrl}/functions/v1/compliance-gate-eval`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      source_type: c.input.source_type,
      raw_text: c.input.raw_text ?? null,
      dry_run: true,
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return res.json() as Promise<Record<string, unknown>>;
}

function evaluate(
  predicted: Record<string, unknown>,
  expected: Record<string, unknown>
): boolean {
  for (const [k, v] of Object.entries(expected)) {
    if (predicted[k] !== v) return false;
  }
  return true;
}
