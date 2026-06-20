import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, extname, resolve, sep } from "node:path";

// 순공대장 — sub-boy/girl 브랜드 한정 스코프 게이트 (SOO-88)
// ─────────────────────────────────────────────────────────────
// WHY: sub-boy / sub-girl 은 마스코트가 아닌 "보조 브랜드" 자산이다.
//      용도 = 프로필(브랜드 페르소나) + 서브 브랜드 이미지.
//      사용 범위 = 히어로 / 마케팅 / 랜딩 화면에만.
//      인앱 학습 루프(회독·게임화·대시보드)엔 절대 미사용.
//      (Mike 결정 2026-06-20, master-design §4.13 마스코트 락 경계 → 사용 범위 가드레일)
//
//      이 게이트는 소스에서 sub-(boy|girl) 자산 참조가 허용 surface 밖으로
//      새는 것을 막는다. 텍스트 grep 계열(check-no-dark.ts 미러).
//
// 허용 surface(ALLOWLIST): 아래 경로 prefix 하위만 sub-* 참조 가능.
//   - views/styleguide  : 브랜드 카탈로그(시각 SSoT) — 보조 캐릭터 전시 surface
//   - views/landing     : 랜딩(미생성 — 정책 선승인)
//   - views/marketing   : 마케팅(미생성 — 정책 선승인)
//   새 마케팅/히어로/랜딩 surface를 추가하면 그 경로를 여기에 명시 추가한다.
//   인앱 학습 루프 화면(today/journey/play/result/wrong-notes/dashboard/recovery)은
//   절대 허용하지 않는다 — 추가 요청은 정책 위반이므로 Mike 확인.
//
// 종료 코드: 0 통과 / 1 위반(인앱 등 비허용 surface에서 sub-* 참조)
// ─────────────────────────────────────────────────────────────

const SRC_ROOT = resolve("src");
const SUB_RE = /sub-(?:boy|girl)/g;

// 허용 surface — SRC_ROOT 기준 상대 경로 prefix
const ALLOWLIST = [
  join("views", "styleguide"),
  join("views", "landing"),
  join("views", "marketing"),
];

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

function isAllowed(file: string): boolean {
  const rel = file.slice(SRC_ROOT.length + 1);
  return ALLOWLIST.some((a) => rel === a || rel.startsWith(a + sep));
}

if (!existsSync(SRC_ROOT)) {
  console.error(`❌ src 디렉토리 없음: ${SRC_ROOT}`);
  process.exit(1);
}

const files = walk(SRC_ROOT, [".ts", ".tsx"]);
let violations = 0;

for (const file of files) {
  if (isAllowed(file)) continue;
  const content = readFileSync(file, "utf-8");
  const lines = content.split("\n");
  lines.forEach((line: string, i: number) => {
    if (SUB_RE.test(line)) {
      console.error(
        `❌ ${file}:${i + 1}: sub-boy/girl 참조 "${line.trim()}" — 브랜드 한정(히어로/마케팅/랜딩) 위반. 인앱 학습 루프엔 미사용.`,
      );
      violations++;
    }
    SUB_RE.lastIndex = 0;
  });
}

if (violations > 0) {
  console.error(
    `\n총 ${violations}건 sub-브랜드 스코프 위반. sub-boy/girl 은 보조 브랜드 자산(마스코트 아님) — 허용 surface: ${ALLOWLIST.join(", ")}.`,
  );
  process.exit(1);
}
console.log(
  `✅ sub-브랜드 스코프 위반 0건 (sub-boy/girl 은 히어로/마케팅/랜딩 전용, 인앱 미사용).`,
);
