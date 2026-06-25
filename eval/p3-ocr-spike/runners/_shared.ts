import {
  appendFileSync,
  closeSync,
  existsSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";

export const SPIKE_ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  ".."
);
export const GOLDEN_FILE = join(SPIKE_ROOT, "golden", "ground-truth.json");
export const GOLDEN_IMAGES_DIR = join(SPIKE_ROOT, "golden", "images");
export const RESULTS_DIR = join(SPIKE_ROOT, "results");

export const CASE_TIMEOUT_MS = Number(process.env.CASE_TIMEOUT_MS ?? 30_000);

export type GoldenCase = {
  case_id: string;
  image_filename: string;
  subject: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  expected: string; // 정답 텍스트 (latex는 $...$로 감싸기)
  notes?: string;
};

export type RunnerResult = {
  case_id: string;
  runner: "tesseract" | "claude" | "mathpix";
  ts: string;
  predicted: string | null;
  expected: string;
  accuracy: number; // 0..1 normalized Levenshtein ratio
  latency_ms: number;
  cost_usd: number | null;
  error: string | null;
};

export function loadGolden(): GoldenCase[] {
  if (!existsSync(GOLDEN_FILE)) {
    throw new Error(
      `ground-truth.json 부재. golden/ground-truth.example.json 참고해서 채우기. (path=${GOLDEN_FILE})`
    );
  }
  const raw = JSON.parse(readFileSync(GOLDEN_FILE, "utf8"));
  if (!Array.isArray(raw?.cases)) {
    throw new Error("ground-truth.json은 { cases: [...] } 형태여야 함");
  }
  return raw.cases as GoldenCase[];
}

export function openJsonl(runner: RunnerResult["runner"]) {
  if (!existsSync(RESULTS_DIR)) mkdirSync(RESULTS_DIR, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const path = join(RESULTS_DIR, `${runner}-${ts}.jsonl`);
  const fd = openSync(path, "a");
  return {
    path,
    append: (r: RunnerResult) => {
      appendFileSync(fd, JSON.stringify(r) + "\n");
      fsyncSync(fd);
    },
    close: () => closeSync(fd),
  };
}

export function writeSummary(jsonlPath: string, results: RunnerResult[]) {
  const total = results.length;
  const successful = results.filter((r) => r.error === null);
  const summary = {
    total,
    successful: successful.length,
    errored: total - successful.length,
    accuracy_avg:
      successful.length === 0
        ? 0
        : successful.reduce((s, r) => s + r.accuracy, 0) / successful.length,
    accuracy_at_70: successful.filter((r) => r.accuracy >= 0.7).length / total,
    accuracy_at_90: successful.filter((r) => r.accuracy >= 0.9).length / total,
    latency_avg_ms:
      successful.length === 0
        ? 0
        : successful.reduce((s, r) => s + r.latency_ms, 0) / successful.length,
    cost_total_usd: successful.reduce((s, r) => s + (r.cost_usd ?? 0), 0),
  };
  const summaryPath = jsonlPath.replace(".jsonl", ".summary.json");
  writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  return { summary, summaryPath };
}

// 텍스트 정규화: latex 비교용 (whitespace 압축, 일부 동치 치환)
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\\\\/g, "\\")
    .replace(/[​-‍﻿]/g, "") // zero-width 제거
    .trim();
}

// Levenshtein distance (O(n*m), n,m <= ~2000 충분)
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const m = a.length;
  const n = b.length;
  let prev = new Array(n + 1);
  let curr = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

export function accuracyScore(predicted: string, expected: string): number {
  const p = normalize(predicted);
  const e = normalize(expected);
  if (e.length === 0) return p.length === 0 ? 1 : 0;
  const d = levenshtein(p, e);
  return Math.max(0, 1 - d / Math.max(p.length, e.length));
}

export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string
): Promise<T> {
  return await Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timeout after ${ms}ms`)), ms)
    ),
  ]);
}

export function progressLine(
  runner: string,
  idx: number,
  total: number,
  startedAt: number,
  pass: number,
  fail: number
) {
  const elapsed = Math.floor((Date.now() - startedAt) / 1000);
  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");
  return `[${runner} ${idx}/${total}] elapsed=${mm}:${ss} pass=${pass} fail=${fail}`;
}
