import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { RESULTS_DIR, SPIKE_ROOT } from "./_shared.ts";

type Summary = {
  total: number;
  successful: number;
  errored: number;
  accuracy_avg: number;
  accuracy_at_70: number;
  accuracy_at_90: number;
  latency_avg_ms: number;
  cost_total_usd: number;
};

type RunnerName = "tesseract" | "claude" | "mathpix";

function latestSummaryFor(runner: RunnerName): { file: string; summary: Summary } | null {
  const files = readdirSync(RESULTS_DIR)
    .filter((f) => f.startsWith(`${runner}-`) && f.endsWith(".summary.json"))
    .sort()
    .reverse();
  if (files.length === 0) return null;
  const file = join(RESULTS_DIR, files[0]);
  const summary = JSON.parse(readFileSync(file, "utf8")) as Summary;
  return { file, summary };
}

function fmt(n: number, digits = 3): string {
  return Number.isFinite(n) ? n.toFixed(digits) : "—";
}

function main() {
  const runners: RunnerName[] = ["tesseract", "claude", "mathpix"];
  const rows = runners.map((r) => ({ runner: r, data: latestSummaryFor(r) }));

  console.log("=== P3 OCR Spike 결과 비교 ===\n");
  const header =
    "| Runner    | Total | OK  | Acc avg | ≥0.7  | ≥0.9  | Latency  | Cost     |";
  const sep =
    "|-----------|-------|-----|---------|-------|-------|----------|----------|";
  console.log(header);
  console.log(sep);

  const markdownLines = [header, sep];

  for (const { runner, data } of rows) {
    if (!data) {
      const line = `| ${runner.padEnd(9)} | — measurement not run yet —`;
      console.log(line);
      markdownLines.push(line);
      continue;
    }
    const s = data.summary;
    const line = `| ${runner.padEnd(9)} | ${String(s.total).padEnd(5)} | ${String(
      s.successful
    ).padEnd(3)} | ${fmt(s.accuracy_avg)} | ${fmt(s.accuracy_at_70, 2)} | ${fmt(
      s.accuracy_at_90,
      2
    )} | ${String(Math.round(s.latency_avg_ms)).padEnd(7)}ms | $${fmt(
      s.cost_total_usd,
      4
    )} |`;
    console.log(line);
    markdownLines.push(line);
  }

  // P3 gate 판단
  console.log("\n=== P3 게이트 판정 (≥0.9 비율 ≥ 90%) ===");
  for (const { runner, data } of rows) {
    if (!data) {
      console.log(`  ${runner}: SKIP (no data)`);
      continue;
    }
    const passed = data.summary.accuracy_at_90 >= 0.9;
    console.log(
      `  ${runner}: ${passed ? "PASS" : "FAIL"} (≥0.9 = ${fmt(
        data.summary.accuracy_at_90,
        2
      )})`
    );
  }

  // 보고서 fragment에 자동 주입할 수 있도록 markdown 파일 저장
  const reportFragment = join(
    SPIKE_ROOT,
    "results",
    "comparison-matrix.md"
  );
  writeFileSync(reportFragment, markdownLines.join("\n"));
  console.log(`\n비교 매트릭스 markdown: ${reportFragment}`);
}

main();
