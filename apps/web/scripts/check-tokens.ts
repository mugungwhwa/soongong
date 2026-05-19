import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname, resolve } from "node:path";

const TOKENS_CSS = resolve("src/shared/styles/tokens.css");
const SRC_ROOT = resolve("src");
const HEX_RE = /#[0-9a-fA-F]{3,8}\b/g;

function buildWhitelist(): Set<string> {
  const content = readFileSync(TOKENS_CSS, "utf-8");
  const matches = content.match(HEX_RE) ?? [];
  return new Set(matches.map((m) => m.toLowerCase()));
}

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

const allowed = buildWhitelist();
const files = walk(SRC_ROOT, [".ts", ".tsx", ".css"]).filter(
  (f) => f !== TOKENS_CSS,
);
let violations = 0;

for (const file of files) {
  const content = readFileSync(file, "utf-8");
  const matches = content.match(HEX_RE) ?? [];
  for (const m of matches) {
    if (!allowed.has(m.toLowerCase())) {
      console.error(`❌ ${file}: 등록 외 hex "${m}"`);
      violations++;
    }
  }
}

if (violations > 0) {
  console.error(`\n총 ${violations}건 토큰 위반.`);
  process.exit(1);
}
console.log(
  `✅ 모든 hex가 토큰 화이트리스트 안에 있음 (${allowed.size}개 토큰).`,
);
