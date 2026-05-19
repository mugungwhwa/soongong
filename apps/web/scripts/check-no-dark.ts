import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname, resolve } from "node:path";

const SRC_ROOT = resolve("src");
const DARK_RE = /\bdark:[a-z0-9-]+/g;

function walk(dir: string, exts: string[]): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p, exts));
    else if (exts.includes(extname(p))) out.push(p);
  }
  return out;
}

const files = walk(SRC_ROOT, [".ts", ".tsx"]);
let violations = 0;

for (const file of files) {
  const content = readFileSync(file, "utf-8");
  const matches = content.match(DARK_RE) ?? [];
  for (const m of matches) {
    console.error(
      `❌ ${file}: dark mode 사용 "${m}" — 라이트 단일 잠금 위반`,
    );
    violations++;
  }
}

if (violations > 0) {
  console.error(`\n총 ${violations}건 다크모드 위반.`);
  process.exit(1);
}
console.log("✅ 다크모드 0건 (라이트 단일).");
