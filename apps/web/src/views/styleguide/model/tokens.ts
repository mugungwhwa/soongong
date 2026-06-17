/**
 * styleguide 토큰 레지스트리 — 편집 가능한 CSS 변수의 "이름표"만 담는다.
 *
 * ⚠️ 값(hex/px)은 여기 하드코딩하지 않는다. seed 는 런타임에 tokens.css 의
 *    `:root` 에서 getComputedStyle 로 읽는다(readSeed). 단일 출처(tokens.css)
 *    유지 + lint:tokens(등록 외 hex 차단) 통과를 위해서다.
 */

export type TokenKind = "color" | "length";

export interface TokenDef {
  /** CSS custom property 이름. 예: "--color-mint-700" */
  varName: string;
  /** 좌측 편집 라벨 (한국어) */
  label: string;
  kind: TokenKind;
}

export interface TokenGroup {
  title: string;
  /** length 그룹의 슬라이더 범위(px). color 그룹은 무시. */
  range?: { min: number; max: number; step: number };
  tokens: TokenDef[];
}

/**
 * 편집 그룹 — 스펙(좌 편집)의 "primary/mint 3종/위험도/info/XP/텍스트 4단/
 * 배경/border" + radius·spacing 슬라이더에 대응.
 * 여기 등재된 varName 만 편집·export 대상이 된다.
 */
export const EDIT_GROUPS: TokenGroup[] = [
  {
    title: "Primary / Brand",
    tokens: [
      { varName: "--color-primary-cta", label: "Primary CTA", kind: "color" },
      { varName: "--color-mint-300", label: "Mint 300 (light)", kind: "color" },
      { varName: "--color-mint-500", label: "Mint 500 (mid)", kind: "color" },
      { varName: "--color-mint-700", label: "Mint 700 (strong)", kind: "color" },
    ],
  },
  {
    title: "위험도 / 상태",
    tokens: [
      { varName: "--color-risk-low", label: "위험도 낮음", kind: "color" },
      { varName: "--color-risk-mid", label: "위험도 중간", kind: "color" },
      { varName: "--color-risk-high", label: "위험도 높음", kind: "color" },
      { varName: "--color-info", label: "Info", kind: "color" },
      { varName: "--color-xp", label: "XP", kind: "color" },
    ],
  },
  {
    title: "텍스트 4단",
    tokens: [
      { varName: "--color-text-strong", label: "Strong (primary)", kind: "color" },
      { varName: "--color-text-default", label: "Default (secondary)", kind: "color" },
      { varName: "--color-text-muted", label: "Muted (tertiary)", kind: "color" },
      { varName: "--color-text-disabled", label: "Disabled", kind: "color" },
    ],
  },
  {
    title: "배경 / Border",
    tokens: [
      { varName: "--color-bg", label: "배경 (캔버스)", kind: "color" },
      { varName: "--color-bg-elevated", label: "배경 (surface)", kind: "color" },
      { varName: "--color-bg-sunken", label: "배경 (sunken)", kind: "color" },
      { varName: "--color-border-default", label: "Border 기본", kind: "color" },
      { varName: "--color-border-strong", label: "Border 강조", kind: "color" },
    ],
  },
  {
    title: "Radius",
    range: { min: 0, max: 32, step: 1 },
    tokens: [
      { varName: "--radius-sm", label: "radius-sm", kind: "length" },
      { varName: "--radius-md", label: "radius-md", kind: "length" },
      { varName: "--radius-lg", label: "radius-lg", kind: "length" },
      { varName: "--radius-xl", label: "radius-xl", kind: "length" },
    ],
  },
  {
    title: "Spacing",
    range: { min: 0, max: 64, step: 1 },
    tokens: [
      { varName: "--space-2", label: "space-2", kind: "length" },
      { varName: "--space-3", label: "space-3", kind: "length" },
      { varName: "--space-4", label: "space-4", kind: "length" },
      { varName: "--space-6", label: "space-6", kind: "length" },
      { varName: "--space-8", label: "space-8", kind: "length" },
    ],
  },
];

/** 편집 그룹에 등재된 전체 varName 목록 (seed 읽기 + diff 대상). */
export const ALL_EDITABLE_VARS: string[] = EDIT_GROUPS.flatMap((g) =>
  g.tokens.map((t) => t.varName),
);

/** varName → kind 빠른 조회 */
export const VAR_KIND: Record<string, TokenKind> = Object.fromEntries(
  EDIT_GROUPS.flatMap((g) => g.tokens.map((t) => [t.varName, t.kind])),
);

export type TokenDraft = Record<string, string>;

/** 3자리 단축 hex → 6자리 풀 hex 로 확장 + 소문자 정규화. color input 호환용. */
function normalizeColor(raw: string): string {
  let v = raw.trim().toLowerCase();
  if (/^#[0-9a-f]{3}$/.test(v)) {
    v = "#" + v[1] + v[1] + v[2] + v[2] + v[3] + v[3];
  }
  return v;
}

/**
 * tokens.css 의 `:root` 에서 현재 토큰 값을 읽어 seed 를 만든다.
 * 반드시 클라이언트(브라우저)에서만 호출 — getComputedStyle 의존.
 */
export function readSeed(): TokenDraft {
  const cs = getComputedStyle(document.documentElement);
  const seed: TokenDraft = {};
  for (const varName of ALL_EDITABLE_VARS) {
    const raw = cs.getPropertyValue(varName);
    if (!raw) continue;
    seed[varName] =
      VAR_KIND[varName] === "color" ? normalizeColor(raw) : raw.trim();
  }
  return seed;
}

/** length 값에서 숫자만 추출 (슬라이더 바인딩용). "12px" → 12 */
export function lengthToNumber(value: string | undefined): number {
  if (!value) return 0;
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

/**
 * seed 대비 draft 의 변경된 토큰만 골라 tokens.css 패치 텍스트를 만든다.
 * 반영 경로는 오직 이 출력 → Mike 가 tokens.css 에 붙여 PR.
 */
export function buildDiff(seed: TokenDraft, draft: TokenDraft): string[] {
  const changed: string[] = [];
  for (const varName of ALL_EDITABLE_VARS) {
    const before = (seed[varName] ?? "").toLowerCase();
    const after = (draft[varName] ?? "").toLowerCase();
    if (after && before !== after) {
      changed.push(`  ${varName}: ${draft[varName]};`);
    }
  }
  return changed;
}

export function buildExportText(seed: TokenDraft, draft: TokenDraft): string {
  const lines = buildDiff(seed, draft);
  if (lines.length === 0) {
    return "/* 기본값(tokens.css)과 동일 — 변경된 토큰 없음 */";
  }
  return [
    "/* styleguide export — tokens.css 패치 (기본값 대비 변경분만) */",
    "/* 아래를 src/shared/styles/tokens.css 의 :root 에 반영 후 PR 로 커밋 */",
    "@layer base {",
    "  :root {",
    ...lines.map((l) => "  " + l),
    "  }",
    "}",
  ].join("\n");
}

export const DRAFT_STORAGE_KEY = "soongong:styleguide:draft:v2";
