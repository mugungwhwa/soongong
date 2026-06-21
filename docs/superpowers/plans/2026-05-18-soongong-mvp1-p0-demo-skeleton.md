> ⚠️ **구버전 스냅샷 (2026-05-18 기준).** 본 문서는 작성 시점 기록이며 현행 기준이 아니다. 현행 디자인 SSoT = `/styleguide` + `docs/design-system/2026-06-09-design-system-lock.md`(v2.1, **v2 Teal/Mint** 팔레트 `#A8DCCB`/`#7BC4AE`/`#4CAF88`) + `tokens.css`. 구 시안 `app_UI.png`/`web_ui.png`·Ocean(`#2AB8D0`)/민트 팔레트·구 다크 RPG 톤 방향은 폐기. (정합: SOO-118)

# 순공대장 MVP 1차 — P0 Demo Skeleton (와꾸 우선) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Anthropic 키 / Supabase 가입 없이 **8개 화면이 mock으로 클릭 완주되는 Next.js 15 + FSD 2.1 데모**를 7일 안에 완성. Vercel preview URL 1개 발급으로 종료.

**Architecture:** Next.js 15 App Router + FSD 2.1 레이어 격리 + Tailwind v4 디자인 토큰. 모든 데이터는 `src/shared/mocks/` TypeScript fixtures. `src/shared/lib/ai.ts`에 mock/real 토글 한 곳에 잠금 → 와꾸 끝난 후 실제 AI 연결 시 1파일 교체.

**Tech Stack:** Next.js 15.x · React 19 · TypeScript 5.5 · Tailwind v4 · shadcn/ui · FSD 2.1 · TanStack Query · Zustand · Framer Motion · tldraw v3 · Vitest · Playwright · pnpm 9.x

---

## 0. 산출물 게이트 (Day 7 종료 시 통과 기준)

- [ ] 8개 화면 모두 클릭으로 도달 가능 (홈/업로드/분석결과/플레이/오답회수/결과/Admin/Auth)
- [ ] E2E 1회 완주 (홈 → 업로드 → 분석 → 플레이 → 결과) Playwright 통과
- [ ] `design-review` skill 점수 ≥ 70
- [ ] `pnpm lint:tokens` 통과 (등록 외 hex 0건)
- [ ] 다크모드 차단 lint 통과 (`dark:` prefix 0건)
- [ ] tldraw 라이선스 status 보고 (상용 시 commercial 전환 필요 여부)
- [ ] Vercel preview URL 1개 발급 + Mike에게 전달

## 0.1 위험 시나리오 + 롤백

| 위험 | 트리거 | 롤백 |
|---|---|---|
| tldraw 라이선스 비용 부담 | Day 3 spike에서 상용 라이선스 확정 | Day 3 종료 시 Konva로 1일 전환 (Task 3-6 재실행) |
| design-review < 70점 | Day 7 게이트 미달 | Day 6 슬랙(buffer)에서 토큰/spacing 보강 |
| Framer Motion 성능 이슈 | iPhone 13 simulator 60fps 미달 | 결과 화면 confetti 제거, XP 카운트업만 유지 |
| pnpm install 자체 실패 | Day 1 Task 1 | npm으로 폴백 + Mike 확인 |

## 0.2 체크포인트

| 시점 | 보고 항목 |
|---|---|
| Day 1 종료 | tokens.css diff + shadcn 9종 데모 페이지 스크린샷 |
| Day 3 종료 | tldraw 캔버스 grab 1회 완주 영상 + 라이선스 결정 |
| Day 5 종료 | 결과 화면 XP 카운트업 + 마스코트 mood 변경 영상 |
| Day 7 종료 | Vercel preview URL + Playwright E2E 통과 로그 + design-review 점수 |

---

## 1. FSD 2.1 폴더 구조 (잠금)

```
apps/web/
├── app/                                    # Next.js 15 App Router (FSD `app` 레이어)
│   ├── (auth)/
│   │   └── login/page.tsx                  # Auth 더미
│   ├── (main)/
│   │   ├── layout.tsx                      # 사이드바 (web) + 하단 nav (mobile)
│   │   ├── today/page.tsx                  # 홈 / 오늘의 회독퀘스트
│   │   ├── play/[questId]/page.tsx         # 회독 플레이
│   │   ├── recovery/[objectId]/page.tsx    # 오답회수 V1-V5
│   │   ├── result/page.tsx                 # 결과 화면 (XP/스트릭/순공이)
│   │   └── admin/page.tsx                  # Admin 검수
│   ├── layout.tsx                          # Root layout (font + tokens)
│   ├── page.tsx                            # → redirect to /today
│   └── globals.css                         # tokens import
│
├── src/
│   ├── pages/                              # FSD `pages` 레이어 (route composition)
│   │   ├── today/ui/today-page.tsx
│   │   ├── play/ui/play-page.tsx
│   │   ├── recovery/ui/recovery-page.tsx
│   │   ├── result/ui/result-page.tsx
│   │   ├── admin/ui/admin-page.tsx
│   │   └── login/ui/login-page.tsx
│   │
│   ├── widgets/                            # FSD `widgets` 레이어
│   │   ├── sidebar/                        # 웹 사이드바
│   │   ├── bottom-nav/                     # 모바일 하단 nav
│   │   ├── quest-list/                     # 오늘의 퀘스트 3장
│   │   ├── stats-grid/                     # 통계 4-카드
│   │   ├── pad-canvas/                     # tldraw 캔버스
│   │   ├── upload-sheet/                   # 업로드 3-옵션 시트
│   │   ├── analysis-card/                  # AI 분석 결과
│   │   ├── result-rewards/                 # XP/스트릭/뱃지 모음
│   │   └── admin-review-list/
│   │
│   ├── features/                           # FSD `features` 레이어
│   │   ├── upload-source/                  # 파일 picker + mock 분석 trigger
│   │   ├── wrong-recovery/                 # 오답회수 V1-V5 호출
│   │   ├── quest-play/                     # 정답/오답 분기
│   │   └── auth-mock/                      # 더미 로그인
│   │
│   ├── entities/                           # FSD `entities` 레이어
│   │   ├── quest/                          # Quest 타입 + selector
│   │   ├── learning-object/                # 학습 객체
│   │   ├── user-game-state/                # XP/스트릭/HP
│   │   └── mascot/                         # 순공이 mood
│   │
│   └── shared/                             # FSD `shared` 레이어
│       ├── ui/                             # shadcn 9종 + Mascot + StatsCard 등
│       ├── styles/
│       │   └── tokens.css                  # ★ 디자인 토큰 SSoT
│       ├── mocks/                          # ★ 모든 가짜 데이터
│       │   ├── quests.ts
│       │   ├── analysis.ts
│       │   ├── game-state.ts
│       │   ├── recovery-variants.ts
│       │   └── admin-queue.ts
│       ├── lib/
│       │   ├── ai.ts                       # ★ mock/real 토글 (1파일 교체 지점)
│       │   ├── cn.ts
│       │   └── fixtures.ts
│       └── config/
│           ├── env.ts                      # NEXT_PUBLIC_MOCK_MODE 등
│           └── routes.ts
│
├── tests/
│   ├── unit/                               # Vitest
│   └── e2e/                                # Playwright
│
├── scripts/
│   ├── check-tokens.ts                     # hex lint
│   └── check-no-dark.ts                    # dark: prefix lint
│
├── public/
│   └── mascot/                             # Midjourney PNG 도착 시 여기로
│
├── .env.local.example                      # 키 슬롯만 (빈 값)
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── playwright.config.ts
└── vitest.config.ts
```

**FSD 의존 방향 (위반 금지):** `app → pages → widgets → features → entities → shared` (역방향 import 금지, lint로 자동 차단 Day 7).

---

## 2. Mock 데이터 전략

`src/shared/lib/ai.ts`가 **유일한 swap point**:

```ts
// src/shared/lib/ai.ts
import { env } from "@/shared/config/env";
import { mockAnalyze, mockClassifySubject } from "@/shared/mocks/analysis";

export async function analyzeSource(input: { sourceId: string }) {
  if (env.NEXT_PUBLIC_MOCK_MODE) return mockAnalyze(input);
  // 실제 AI 연결은 P3 단계에서 이 분기 채움 (Anthropic SDK)
  throw new Error("Real AI not implemented yet (P3)");
}

export async function classifySubject(input: { text: string }) {
  if (env.NEXT_PUBLIC_MOCK_MODE) return mockClassifySubject(input);
  throw new Error("Real AI not implemented yet (P3)");
}
```

P3 진입 시점에 mock 분기만 제거 + Anthropic SDK 호출 추가. **UI 컴포넌트 코드 재작성 0.**

---

## Day 1 — Foundation (5시간)

### Task 1: pnpm workspace + Next.js 15 scaffold

**Files:**
- Create: `pnpm-workspace.yaml`
- Create: `package.json` (root)
- Create: `apps/web/` (Next.js scaffold 결과물 전체)
- Modify: `.gitignore` (root)

- [ ] **Step 1: pnpm workspace 정의**

Create `pnpm-workspace.yaml`:
```yaml
packages:
  - "apps/*"
```

Create `package.json` (root):
```json
{
  "name": "soongong",
  "private": true,
  "packageManager": "pnpm@9.12.0",
  "scripts": {
    "dev": "pnpm --filter web dev",
    "build": "pnpm --filter web build",
    "lint": "pnpm --filter web lint",
    "lint:tokens": "pnpm --filter web lint:tokens",
    "lint:no-dark": "pnpm --filter web lint:no-dark",
    "test": "pnpm --filter web test",
    "test:e2e": "pnpm --filter web test:e2e"
  }
}
```

- [ ] **Step 2: Next.js 15 scaffold**

Run from repo root:
```bash
pnpm dlx create-next-app@15 apps/web \
  --typescript --tailwind --app --src-dir \
  --import-alias "@/*" --no-eslint --use-pnpm \
  --no-turbopack
```

Verify: `ls apps/web` shows `src/`, `app/`은 `src/app/`에 있음.

- [ ] **Step 3: Tailwind v4 확인 + 추가 의존성 설치**

```bash
cd apps/web
pnpm add zustand @tanstack/react-query framer-motion tldraw clsx tailwind-merge zod
pnpm add -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom \
  jsdom @playwright/test eslint eslint-config-next \
  eslint-plugin-boundaries eslint-plugin-tailwindcss
```

Verify: `pnpm list zustand tldraw framer-motion` 출력.

- [ ] **Step 4: .gitignore 보강**

Append to root `.gitignore`:
```
node_modules/
.next/
.vercel/
.env.local
.env*.local
playwright-report/
test-results/
```

- [ ] **Step 5: Commit**

```bash
git add pnpm-workspace.yaml package.json apps/web .gitignore
git -c user.name="Mike" -c user.email="mikeikhoonkim1208@gmail.com" \
  commit -m "feat(p0): Next.js 15 + pnpm workspace scaffold

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: 디자인 토큰 + Tailwind v4 config

**Files:**
- Create: `apps/web/src/shared/styles/tokens.css`
- Modify: `apps/web/src/app/globals.css`
- Modify: `apps/web/tailwind.config.ts`

- [ ] **Step 1: tokens.css 작성 (UI 설계 v2.3 §3, §10, §11 SSoT)**

Create `apps/web/src/shared/styles/tokens.css`:
```css
@layer base {
  :root {
    /* Surface (Light Study Garden) */
    --color-bg: #F8FBF7;
    --color-bg-elevated: #FFFFFF;
    --color-bg-sunken: #F1F5EF;

    /* Brand mint */
    --color-mint-50: #EFF9EF;
    --color-mint-100: #D6F0D6;
    --color-mint-300: #A8DDA8;
    --color-mint-500: #7CC97C;
    --color-mint-700: #4FA84F;
    --color-mint-900: #2E6B2E;

    /* Risk (soft) */
    --color-risk-low: #6FB3FF;
    --color-risk-mid: #FFB36E;
    --color-risk-high: #FF7B7B;

    /* Text */
    --color-text-strong: #1A2A1A;
    --color-text-default: #2D3F2D;
    --color-text-muted: #6B7B6B;
    --color-text-inverse: #FFFFFF;

    /* Border */
    --color-border-default: #E1ECDF;
    --color-border-strong: #C5D9C2;

    /* Radius */
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 16px;
    --radius-xl: 24px;
    --radius-pill: 9999px;

    /* Spacing scale (4px base) */
    --space-1: 4px;
    --space-2: 8px;
    --space-3: 12px;
    --space-4: 16px;
    --space-5: 20px;
    --space-6: 24px;
    --space-8: 32px;
    --space-10: 40px;
    --space-12: 48px;

    /* Shadow */
    --shadow-card: 0 2px 8px rgba(46, 107, 46, 0.06);
    --shadow-elevated: 0 8px 24px rgba(46, 107, 46, 0.10);

    /* Motion */
    --ease-out-soft: cubic-bezier(0.22, 0.61, 0.36, 1);
    --duration-fast: 160ms;
    --duration-mid: 240ms;
    --duration-slow: 380ms;

    /* Typography */
    --font-display: "Pretendard", system-ui, sans-serif;
    --font-body: "Pretendard", system-ui, sans-serif;
  }
}
```

- [ ] **Step 2: globals.css에 tokens import**

Replace `apps/web/src/app/globals.css`:
```css
@import "tailwindcss";
@import "../shared/styles/tokens.css";

@theme {
  --color-bg: var(--color-bg);
  --color-bg-elevated: var(--color-bg-elevated);
  --color-mint-500: var(--color-mint-500);
  --color-mint-700: var(--color-mint-700);
  --color-risk-low: var(--color-risk-low);
  --color-risk-mid: var(--color-risk-mid);
  --color-risk-high: var(--color-risk-high);
  --color-text-strong: var(--color-text-strong);
  --color-text-default: var(--color-text-default);
  --color-text-muted: var(--color-text-muted);
  --color-border-default: var(--color-border-default);
}

html, body {
  background: var(--color-bg);
  color: var(--color-text-default);
  font-family: var(--font-body);
}
```

- [ ] **Step 3: Pretendard 폰트 설치 + 적용**

```bash
cd apps/web
pnpm add pretendard
```

Modify `apps/web/src/app/layout.tsx` (add import):
```tsx
import "pretendard/dist/web/static/pretendard.css";
import "./globals.css";

export const metadata = { title: "순공대장", description: "수능생 듀오링고형 AI 회독 앱" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 4: Dev 서버 실행 확인**

```bash
cd apps/web && pnpm dev
```

Open `http://localhost:3000`. Expected: 흰/크림 배경 + Pretendard 폰트로 기본 페이지 표시.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/shared/styles apps/web/src/app apps/web/package.json apps/web/pnpm-lock.yaml
git -c user.name="Mike" -c user.email="mikeikhoonkim1208@gmail.com" \
  commit -m "feat(p0): design tokens v1 + Pretendard + Tailwind v4 wiring

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: shadcn/ui 9종 + Mascot 컴포넌트

**Files:**
- Create: `apps/web/components.json`
- Create: `apps/web/src/shared/ui/button.tsx` ... 등 9종 (shadcn cli 자동)
- Create: `apps/web/src/shared/ui/mascot.tsx`
- Create: `apps/web/src/shared/lib/cn.ts`

- [ ] **Step 1: shadcn init**

```bash
cd apps/web
pnpm dlx shadcn@latest init --yes \
  --base-color neutral \
  --css-variables \
  --tailwind-config "tailwind.config.ts" \
  --components "src/shared/ui" \
  --utils "src/shared/lib/cn"
```

- [ ] **Step 2: 9종 컴포넌트 추가**

```bash
pnpm dlx shadcn@latest add button card badge dialog sheet sonner tabs tooltip skeleton --yes
```

Verify: `ls src/shared/ui` shows 9 files.

- [ ] **Step 3: Mascot 컴포넌트 (이모지 placeholder)**

Create `apps/web/src/shared/ui/mascot.tsx`:
```tsx
import { cn } from "@/shared/lib/cn";

export type MascotMood = "cheer" | "celebrate" | "think" | "comfort" | "sleep" | "surprise";

const MOOD_EMOJI: Record<MascotMood, string> = {
  cheer: "😊",
  celebrate: "🎉",
  think: "💭",
  comfort: "🥲",
  sleep: "😴",
  surprise: "😲",
};

const SIZE = { sm: 32, md: 48, lg: 72, xl: 120 } as const;

export function Mascot({
  mood = "cheer",
  size = "md",
  className,
}: {
  mood?: MascotMood;
  size?: keyof typeof SIZE;
  className?: string;
}) {
  const px = SIZE[size];
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-[var(--color-mint-100)]",
        className,
      )}
      style={{ width: px, height: px, fontSize: px * 0.55 }}
      role="img"
      aria-label={`순공이 ${mood}`}
    >
      {MOOD_EMOJI[mood]}
    </div>
  );
}
```

> Midjourney PNG가 `public/mascot/<mood>.png`에 도착하면 이 컴포넌트의 emoji → `<Image>`로 교체 (Day 7 후 작업).

- [ ] **Step 4: 데모 페이지로 9종 + Mascot 검증**

Create `apps/web/src/app/_demo/page.tsx` (route group, 출시 전 삭제):
```tsx
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Mascot } from "@/shared/ui/mascot";

export default function DemoPage() {
  return (
    <main className="p-8 space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-[var(--color-text-strong)]">순공대장 컴포넌트 데모</h1>
      <div className="flex gap-3">
        <Button>기본</Button>
        <Button variant="outline">아웃라인</Button>
        <Button variant="ghost">고스트</Button>
      </div>
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Mascot mood="cheer" size="lg" />
          <div>
            <div className="text-lg font-semibold">순공이 응원!</div>
            <Badge className="mt-2">민트 배지</Badge>
          </div>
        </div>
      </Card>
      <div className="flex gap-2">
        {(["cheer", "celebrate", "think", "comfort", "sleep", "surprise"] as const).map((m) => (
          <Mascot key={m} mood={m} size="md" />
        ))}
      </div>
    </main>
  );
}
```

Visit `http://localhost:3000/_demo`. Expected: 9종 컴포넌트 + 마스코트 6 mood 모두 시각 확인.

- [ ] **Step 5: Commit**

```bash
git add apps/web/components.json apps/web/src/shared/ui apps/web/src/shared/lib apps/web/src/app/_demo
git -c user.name="Mike" -c user.email="mikeikhoonkim1208@gmail.com" \
  commit -m "feat(p0): shadcn 9종 + Mascot emoji placeholder + 데모 페이지

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Mock fixtures + env 토글

**Files:**
- Create: `apps/web/src/shared/config/env.ts`
- Create: `apps/web/src/shared/mocks/quests.ts`
- Create: `apps/web/src/shared/mocks/analysis.ts`
- Create: `apps/web/src/shared/mocks/game-state.ts`
- Create: `apps/web/src/shared/mocks/recovery-variants.ts`
- Create: `apps/web/src/shared/mocks/admin-queue.ts`
- Create: `apps/web/src/shared/lib/ai.ts`
- Create: `apps/web/.env.local.example`
- Create: `apps/web/.env.local`

- [ ] **Step 1: env.ts (zod 검증)**

Create `apps/web/src/shared/config/env.ts`:
```ts
import { z } from "zod";

const EnvSchema = z.object({
  NEXT_PUBLIC_MOCK_MODE: z.enum(["true", "false"]).default("true"),
  NEXT_PUBLIC_APP_NAME: z.string().default("순공대장"),
});

const parsed = EnvSchema.parse({
  NEXT_PUBLIC_MOCK_MODE: process.env.NEXT_PUBLIC_MOCK_MODE,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
});

export const env = {
  NEXT_PUBLIC_MOCK_MODE: parsed.NEXT_PUBLIC_MOCK_MODE === "true",
  NEXT_PUBLIC_APP_NAME: parsed.NEXT_PUBLIC_APP_NAME,
};
```

- [ ] **Step 2: .env.local + .env.local.example (키 슬롯만)**

Create `apps/web/.env.local.example`:
```bash
# Mock mode (와꾸 단계 = true, P3 실제 AI 연결 시 false)
NEXT_PUBLIC_MOCK_MODE=true
NEXT_PUBLIC_APP_NAME=순공대장

# === 아래는 P3 진입 시 채움 (와꾸 단계는 빈 채로 유지) ===
ANTHROPIC_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
MATHPIX_APP_ID=
MATHPIX_APP_KEY=
```

Create `apps/web/.env.local` (gitignored, 동일 내용으로 시작):
```bash
NEXT_PUBLIC_MOCK_MODE=true
NEXT_PUBLIC_APP_NAME=순공대장
ANTHROPIC_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
MATHPIX_APP_ID=
MATHPIX_APP_KEY=
```

- [ ] **Step 3: Quest fixture**

Create `apps/web/src/shared/mocks/quests.ts`:
```ts
export type QuestRiskLevel = "low" | "mid" | "high";

export interface Quest {
  questId: string;
  objectId: string;
  subject: "수학" | "영어" | "국어";
  unit: string;
  topic: string;
  questFormat: "회독" | "오답회수" | "변형";
  riskLevel: QuestRiskLevel;
  forgettingRisk: number; // 0-100
  rewardXp: number;
  dueDate: string; // ISO
}

export const MOCK_QUESTS: Quest[] = [
  {
    questId: "q-001",
    objectId: "obj-math-001",
    subject: "수학",
    unit: "수열",
    topic: "점화식",
    questFormat: "회독",
    riskLevel: "high",
    forgettingRisk: 78,
    rewardXp: 20,
    dueDate: new Date().toISOString(),
  },
  {
    questId: "q-002",
    objectId: "obj-eng-007",
    subject: "영어",
    unit: "어휘",
    topic: "혼동 어휘 affect/effect",
    questFormat: "오답회수",
    riskLevel: "mid",
    forgettingRisk: 52,
    rewardXp: 30,
    dueDate: new Date().toISOString(),
  },
  {
    questId: "q-003",
    objectId: "obj-kor-012",
    subject: "국어",
    unit: "비문학",
    topic: "지문 구조 — 대조",
    questFormat: "변형",
    riskLevel: "low",
    forgettingRisk: 24,
    rewardXp: 20,
    dueDate: new Date().toISOString(),
  },
];

export function getTodayQuests(): Quest[] {
  return MOCK_QUESTS;
}

export function getQuestById(id: string): Quest | undefined {
  return MOCK_QUESTS.find((q) => q.questId === id);
}
```

- [ ] **Step 4: Analysis mock**

Create `apps/web/src/shared/mocks/analysis.ts`:
```ts
export interface AnalysisResult {
  objectId: string;
  subject: string;
  unit: string;
  topic: string;
  questionType: string;
  difficultyLevel: 1 | 2 | 3 | 4 | 5;
  detectedWrongReason?: string;
  confidenceScore: number;
  rawTextSnippet: string;
}

const MOCK_ANALYSIS: AnalysisResult = {
  objectId: "obj-math-001",
  subject: "수학",
  unit: "수열",
  topic: "점화식 a_{n+1} = 2a_n + 3",
  questionType: "주관식",
  difficultyLevel: 4,
  detectedWrongReason: "일반항 변형 시 항 누락",
  confidenceScore: 0.87,
  rawTextSnippet: "수열 {a_n}이 a_1 = 1, a_{n+1} = 2a_n + 3 을 만족할 때 ...",
};

export async function mockAnalyze(_input: { sourceId: string }): Promise<AnalysisResult> {
  await new Promise((r) => setTimeout(r, 1200)); // 분석 중 UX 위해 의도적 지연
  return MOCK_ANALYSIS;
}

export async function mockClassifySubject(_input: { text: string }) {
  await new Promise((r) => setTimeout(r, 400));
  return { detectedSubject: "수학" as const, subjectConfidence: 0.92 };
}
```

- [ ] **Step 5: Game state + recovery + admin queue mocks**

Create `apps/web/src/shared/mocks/game-state.ts`:
```ts
export interface UserGameState {
  streakDays: number;
  memoryHp: number; // 0-100
  totalXp: number;
  todayXp: number;
  rank: "씨앗" | "새싹" | "푸른잎" | "꽃봉오리" | "활짝꽃";
}

export const MOCK_GAME_STATE: UserGameState = {
  streakDays: 12,
  memoryHp: 78,
  totalXp: 2340,
  todayXp: 60,
  rank: "푸른잎",
};

export function getGameState(): UserGameState {
  return MOCK_GAME_STATE;
}
```

Create `apps/web/src/shared/mocks/recovery-variants.ts`:
```ts
export type VariantTier = "V1" | "V2" | "V3" | "V4" | "V5";

export interface RecoveryVariant {
  tier: VariantTier;
  description: string;
  prompt: string;
}

export const MOCK_VARIANTS: RecoveryVariant[] = [
  { tier: "V1", description: "동일 유형 숫자만 변경", prompt: "a_1 = 2, a_{n+1} = 3a_n + 1 을 풀어보세요" },
  { tier: "V2", description: "변형: 부호 반전", prompt: "a_1 = 1, a_{n+1} = 2a_n - 3 을 풀어보세요" },
  { tier: "V3", description: "변형: 점화식 형태 확장", prompt: "a_{n+1} = a_n + 2n + 1" },
  { tier: "V4", description: "변형: 두 점화식 결합", prompt: "..." },
  { tier: "V5", description: "응용: 모의고사 기출 변형", prompt: "..." },
];
```

Create `apps/web/src/shared/mocks/admin-queue.ts`:
```ts
export interface AdminReviewItem {
  itemId: string;
  studentMaskedId: string;
  subject: string;
  detectedTopic: string;
  confidenceScore: number;
  status: "pending" | "approved" | "modified" | "rejected";
  thumbnailPlaceholder: string; // emoji
}

export const MOCK_ADMIN_QUEUE: AdminReviewItem[] = [
  { itemId: "a-001", studentMaskedId: "user_***12", subject: "수학", detectedTopic: "수열 점화식", confidenceScore: 0.87, status: "pending", thumbnailPlaceholder: "📐" },
  { itemId: "a-002", studentMaskedId: "user_***34", subject: "영어", detectedTopic: "어휘 affect/effect", confidenceScore: 0.94, status: "pending", thumbnailPlaceholder: "📖" },
  { itemId: "a-003", studentMaskedId: "user_***56", subject: "국어", detectedTopic: "비문학 대조 구조", confidenceScore: 0.71, status: "pending", thumbnailPlaceholder: "📚" },
];
```

- [ ] **Step 6: ai.ts (swap point)**

Create `apps/web/src/shared/lib/ai.ts`:
```ts
import { env } from "@/shared/config/env";
import { mockAnalyze, mockClassifySubject } from "@/shared/mocks/analysis";

export async function analyzeSource(input: { sourceId: string }) {
  if (env.NEXT_PUBLIC_MOCK_MODE) return mockAnalyze(input);
  throw new Error("Real AI not implemented yet — P3 단계에서 Anthropic SDK 분기 채움");
}

export async function classifySubject(input: { text: string }) {
  if (env.NEXT_PUBLIC_MOCK_MODE) return mockClassifySubject(input);
  throw new Error("Real AI not implemented yet — P3 단계에서 Anthropic SDK 분기 채움");
}
```

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/shared/config apps/web/src/shared/mocks apps/web/src/shared/lib apps/web/.env.local.example
git -c user.name="Mike" -c user.email="mikeikhoonkim1208@gmail.com" \
  commit -m "feat(p0): mock fixtures (quests/analysis/game/recovery/admin) + ai.ts swap point

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Layout + 라우팅 (Day 1 마무리)

**Files:**
- Create: `apps/web/src/app/(main)/layout.tsx`
- Create: `apps/web/src/app/page.tsx` (redirect)
- Create: `apps/web/src/widgets/sidebar/ui/sidebar.tsx`
- Create: `apps/web/src/widgets/bottom-nav/ui/bottom-nav.tsx`
- Create: `apps/web/src/shared/config/routes.ts`

- [ ] **Step 1: routes.ts**

Create `apps/web/src/shared/config/routes.ts`:
```ts
export const ROUTES = {
  today: "/today",
  play: (questId: string) => `/play/${questId}`,
  recovery: (objectId: string) => `/recovery/${objectId}`,
  result: "/result",
  admin: "/admin",
  login: "/login",
} as const;
```

- [ ] **Step 2: Sidebar (웹) + BottomNav (모바일)**

Create `apps/web/src/widgets/sidebar/ui/sidebar.tsx`:
```tsx
import Link from "next/link";
import { Mascot } from "@/shared/ui/mascot";
import { ROUTES } from "@/shared/config/routes";

const ITEMS = [
  { href: ROUTES.today, label: "오늘의 회독", icon: "🏠" },
  { href: ROUTES.result, label: "결과", icon: "📊" },
  { href: ROUTES.admin, label: "검수", icon: "🛡️" },
];

export function Sidebar() {
  return (
    <aside className="hidden lg:flex w-60 flex-col gap-2 border-r border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] p-6">
      <div className="flex items-center gap-3 mb-6">
        <Mascot mood="cheer" size="md" />
        <div className="font-bold text-[var(--color-text-strong)]">순공대장</div>
      </div>
      <nav className="flex flex-col gap-1">
        {ITEMS.map((i) => (
          <Link
            key={i.href}
            href={i.href}
            className="flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 hover:bg-[var(--color-mint-50)] transition"
          >
            <span>{i.icon}</span>
            <span>{i.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
```

Create `apps/web/src/widgets/bottom-nav/ui/bottom-nav.tsx`:
```tsx
import Link from "next/link";
import { ROUTES } from "@/shared/config/routes";

const ITEMS = [
  { href: ROUTES.today, label: "오늘", icon: "🏠" },
  { href: ROUTES.result, label: "결과", icon: "📊" },
  { href: ROUTES.admin, label: "검수", icon: "🛡️" },
];

export function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 border-t border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] flex justify-around py-2 z-50">
      {ITEMS.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          className="flex flex-col items-center gap-1 px-4 py-1 text-xs text-[var(--color-text-muted)]"
        >
          <span className="text-lg">{i.icon}</span>
          <span>{i.label}</span>
        </Link>
      ))}
    </nav>
  );
}
```

- [ ] **Step 3: (main) layout**

Create `apps/web/src/app/(main)/layout.tsx`:
```tsx
import { Sidebar } from "@/widgets/sidebar/ui/sidebar";
import { BottomNav } from "@/widgets/bottom-nav/ui/bottom-nav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      <BottomNav />
    </div>
  );
}
```

- [ ] **Step 4: Root page → redirect**

Replace `apps/web/src/app/page.tsx`:
```tsx
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/today");
}
```

- [ ] **Step 5: 빈 페이지 스텁 (Day 2-6에서 채움)**

Create `apps/web/src/app/(main)/today/page.tsx`:
```tsx
export default function TodayPage() {
  return <div className="p-6">오늘의 회독퀘스트 (Day 2 작업 예정)</div>;
}
```

Create `apps/web/src/app/(main)/result/page.tsx`:
```tsx
export default function ResultPage() {
  return <div className="p-6">결과 (Day 5 작업 예정)</div>;
}
```

Create `apps/web/src/app/(main)/admin/page.tsx`:
```tsx
export default function AdminPage() {
  return <div className="p-6">Admin (Day 6 작업 예정)</div>;
}
```

- [ ] **Step 6: Day 1 종료 — dev 서버 확인 + commit**

```bash
cd apps/web && pnpm dev
```

Visit `/`, `/today`, `/result`, `/admin`. Expected: 사이드바(웹) 또는 하단 nav(모바일 < 1024px) + 더미 텍스트.

```bash
git add apps/web/src
git -c user.name="Mike" -c user.email="mikeikhoonkim1208@gmail.com" \
  commit -m "feat(p0): layout + sidebar/bottom-nav + route stubs (Day 1 종료)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Day 2 — 홈 / 오늘의 회독퀘스트 UI (4시간)

### Task 6: 통계 4-카드 (스트릭/HP/순공/XP)

**Files:**
- Create: `apps/web/src/widgets/stats-grid/ui/stats-grid.tsx`
- Create: `apps/web/src/widgets/stats-grid/ui/stat-card.tsx`
- Create: `apps/web/src/entities/user-game-state/model/use-game-state.ts`

- [ ] **Step 1: use-game-state hook**

Create `apps/web/src/entities/user-game-state/model/use-game-state.ts`:
```ts
import { getGameState } from "@/shared/mocks/game-state";

export function useGameState() {
  return getGameState(); // mock은 동기 (TanStack Query는 P3에서 도입)
}
```

- [ ] **Step 2: StatCard 컴포넌트**

Create `apps/web/src/widgets/stats-grid/ui/stat-card.tsx`:
```tsx
import { Card } from "@/shared/ui/card";

export function StatCard({
  icon, label, value, suffix,
}: {
  icon: string; label: string; value: string | number; suffix?: string;
}) {
  return (
    <Card className="p-4 flex flex-col gap-1 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-sm">
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <div className="text-2xl font-bold text-[var(--color-text-strong)]">
        {value}<span className="text-sm text-[var(--color-text-muted)] ml-1">{suffix}</span>
      </div>
    </Card>
  );
}
```

- [ ] **Step 3: StatsGrid**

Create `apps/web/src/widgets/stats-grid/ui/stats-grid.tsx`:
```tsx
import { StatCard } from "./stat-card";
import { useGameState } from "@/entities/user-game-state/model/use-game-state";

export function StatsGrid() {
  const s = useGameState();
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard icon="🔥" label="스트릭" value={s.streakDays} suffix="일" />
      <StatCard icon="❤️" label="기억 HP" value={s.memoryHp} suffix="/100" />
      <StatCard icon="🏆" label="등급" value={s.rank} />
      <StatCard icon="⚡" label="오늘 XP" value={s.todayXp} suffix="XP" />
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/widgets/stats-grid apps/web/src/entities
git -c user.name="Mike" -c user.email="mikeikhoonkim1208@gmail.com" \
  commit -m "feat(p0): stats grid 4-카드 (스트릭/HP/등급/XP)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: Quest List + Quest Card

**Files:**
- Create: `apps/web/src/widgets/quest-list/ui/quest-list.tsx`
- Create: `apps/web/src/widgets/quest-list/ui/quest-card.tsx`
- Create: `apps/web/src/entities/quest/model/use-today-quests.ts`
- Create: `apps/web/src/entities/quest/ui/risk-badge.tsx`

- [ ] **Step 1: use-today-quests**

Create `apps/web/src/entities/quest/model/use-today-quests.ts`:
```ts
import { getTodayQuests } from "@/shared/mocks/quests";
export function useTodayQuests() { return getTodayQuests(); }
```

- [ ] **Step 2: RiskBadge (soft 톤)**

Create `apps/web/src/entities/quest/ui/risk-badge.tsx`:
```tsx
import type { QuestRiskLevel } from "@/shared/mocks/quests";

const STYLE: Record<QuestRiskLevel, { bg: string; fg: string; label: string }> = {
  low:  { bg: "var(--color-risk-low)", fg: "#fff", label: "여유" },
  mid:  { bg: "var(--color-risk-mid)", fg: "#3a2a10", label: "주의" },
  high: { bg: "var(--color-risk-high)", fg: "#fff", label: "위험" },
};

export function RiskBadge({ level }: { level: QuestRiskLevel }) {
  const s = STYLE[level];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-[var(--radius-pill)] text-xs font-semibold"
      style={{ background: s.bg, color: s.fg }}
    >
      {s.label}
    </span>
  );
}
```

- [ ] **Step 3: QuestCard**

Create `apps/web/src/widgets/quest-list/ui/quest-card.tsx`:
```tsx
import Link from "next/link";
import { Card } from "@/shared/ui/card";
import { RiskBadge } from "@/entities/quest/ui/risk-badge";
import { ROUTES } from "@/shared/config/routes";
import type { Quest } from "@/shared/mocks/quests";

export function QuestCard({ quest }: { quest: Quest }) {
  return (
    <Link href={ROUTES.play(quest.questId)} className="block">
      <Card className="p-5 hover:shadow-[var(--shadow-elevated)] transition shadow-[var(--shadow-card)]">
        <div className="flex items-start justify-between mb-2">
          <div className="text-sm text-[var(--color-text-muted)]">
            {quest.subject} · {quest.unit}
          </div>
          <RiskBadge level={quest.riskLevel} />
        </div>
        <div className="text-lg font-semibold text-[var(--color-text-strong)] mb-3">
          {quest.topic}
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--color-text-muted)]">
            형식: <b className="text-[var(--color-text-default)]">{quest.questFormat}</b>
          </span>
          <span className="text-[var(--color-mint-700)] font-semibold">+{quest.rewardXp} XP</span>
        </div>
      </Card>
    </Link>
  );
}
```

- [ ] **Step 4: QuestList**

Create `apps/web/src/widgets/quest-list/ui/quest-list.tsx`:
```tsx
import { useTodayQuests } from "@/entities/quest/model/use-today-quests";
import { QuestCard } from "./quest-card";

export function QuestList() {
  const quests = useTodayQuests();
  return (
    <div className="flex flex-col gap-3">
      {quests.map((q) => <QuestCard key={q.questId} quest={q} />)}
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/widgets/quest-list apps/web/src/entities/quest
git -c user.name="Mike" -c user.email="mikeikhoonkim1208@gmail.com" \
  commit -m "feat(p0): quest list + card + risk badge

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 8: 홈 페이지 통합 + 순공이 인사 + 업로드 트리거

**Files:**
- Modify: `apps/web/src/app/(main)/today/page.tsx`
- Create: `apps/web/src/pages/today/ui/today-page.tsx`
- Create: `apps/web/src/features/upload-source/ui/upload-trigger.tsx`

- [ ] **Step 1: today-page**

Create `apps/web/src/pages/today/ui/today-page.tsx`:
```tsx
import { StatsGrid } from "@/widgets/stats-grid/ui/stats-grid";
import { QuestList } from "@/widgets/quest-list/ui/quest-list";
import { Mascot } from "@/shared/ui/mascot";
import { UploadTrigger } from "@/features/upload-source/ui/upload-trigger";

export function TodayPage() {
  return (
    <div className="mx-auto max-w-2xl p-4 lg:p-8 space-y-6">
      <header className="flex items-center gap-3">
        <Mascot mood="cheer" size="lg" />
        <div>
          <h1 className="text-xl font-bold text-[var(--color-text-strong)]">오늘의 회독퀘스트</h1>
          <p className="text-sm text-[var(--color-text-muted)]">3개 끝내면 순공이가 응원해줄게요</p>
        </div>
      </header>
      <StatsGrid />
      <UploadTrigger />
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
          오늘 도전할 3개
        </h2>
        <QuestList />
      </section>
    </div>
  );
}
```

- [ ] **Step 2: UploadTrigger (시트는 Day 4에서)**

Create `apps/web/src/features/upload-source/ui/upload-trigger.tsx`:
```tsx
"use client";
import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { UploadSheet } from "@/widgets/upload-sheet/ui/upload-sheet"; // Day 4에 채움

export function UploadTrigger() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button className="w-full bg-[var(--color-mint-500)] text-white hover:bg-[var(--color-mint-700)]" onClick={() => setOpen(true)}>
        + 문제사진 / 인강기록 / 메모 올리기
      </Button>
      <UploadSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
```

- [ ] **Step 3: UploadSheet placeholder (Day 4에 본격 구현)**

Create `apps/web/src/widgets/upload-sheet/ui/upload-sheet.tsx`:
```tsx
"use client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/shared/ui/sheet";

export function UploadSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom">
        <SheetHeader><SheetTitle>업로드 (Day 4에서 본격 구현)</SheetTitle></SheetHeader>
        <p className="mt-4 text-sm text-[var(--color-text-muted)]">3-옵션 시트가 여기에 옵니다.</p>
      </SheetContent>
    </Sheet>
  );
}
```

- [ ] **Step 4: Page route 연결**

Replace `apps/web/src/app/(main)/today/page.tsx`:
```tsx
import { TodayPage } from "@/pages/today/ui/today-page";
export default function Page() { return <TodayPage />; }
```

- [ ] **Step 5: 브라우저 확인 + Day 2 commit**

Visit `/today`. Expected: 마스코트 인사 + 통계 4-카드 + 업로드 버튼 + 퀘스트 3장.

```bash
git add apps/web/src
git -c user.name="Mike" -c user.email="mikeikhoonkim1208@gmail.com" \
  commit -m "feat(p0): 홈 페이지 통합 (마스코트 + stats + quests + upload trigger) — Day 2 종료

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Day 3 — 회독 플레이 + tldraw 캔버스 spike (5시간)

### Task 9: tldraw 라이선스 확인 + 캔버스 위젯

**Files:**
- Create: `apps/web/src/widgets/pad-canvas/ui/pad-canvas.tsx`
- Modify: `apps/web/next.config.mjs` (tldraw transpile)
- Create: `docs/decisions/2026-05-18-tldraw-vs-konva.md` (라이선스 결정)

- [ ] **Step 1: tldraw 라이선스 status 확인**

Visit https://tldraw.dev/community/license. Document 결과:

Create `docs/decisions/2026-05-18-tldraw-vs-konva.md`:
```markdown
# tldraw vs Konva 결정

## tldraw v3 라이선스 status
- 무료: 워터마크 표시 조건
- 상용 (워터마크 제거): $...

## 결정
- [ ] tldraw 유지 (워터마크 허용 OR 상용 라이선스 구매)
- [ ] Konva로 1일 전환 (Task 9-13 재실행)

## Mike 결정 (체크):
```

- [ ] **Step 2: PadCanvas (tldraw 임베드)**

Create `apps/web/src/widgets/pad-canvas/ui/pad-canvas.tsx`:
```tsx
"use client";
import dynamic from "next/dynamic";
import "tldraw/tldraw.css";

const Tldraw = dynamic(() => import("tldraw").then((m) => m.Tldraw), { ssr: false });

export function PadCanvas({ onStrokeChange }: { onStrokeChange?: (json: string) => void }) {
  return (
    <div className="w-full h-[400px] rounded-[var(--radius-lg)] overflow-hidden border border-[var(--color-border-default)]">
      <Tldraw
        onMount={(editor) => {
          editor.store.listen(() => {
            if (onStrokeChange) onStrokeChange(JSON.stringify(editor.store.getSnapshot()));
          });
        }}
      />
    </div>
  );
}
```

- [ ] **Step 3: next.config.mjs 보강 (tldraw esm)**

Replace `apps/web/next.config.mjs`:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["tldraw"],
};
export default nextConfig;
```

- [ ] **Step 4: 라이선스 결정 commit**

```bash
git add docs/decisions apps/web/src/widgets/pad-canvas apps/web/next.config.mjs
git -c user.name="Mike" -c user.email="mikeikhoonkim1208@gmail.com" \
  commit -m "feat(p0): tldraw 캔버스 spike + 라이선스 결정 문서

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 10: 회독 플레이 페이지 + 정답/오답 분기

**Files:**
- Create: `apps/web/src/pages/play/ui/play-page.tsx`
- Create: `apps/web/src/features/quest-play/model/use-quest-play.ts`
- Create: `apps/web/src/features/quest-play/ui/answer-form.tsx`
- Modify: `apps/web/src/app/(main)/play/[questId]/page.tsx`

- [ ] **Step 1: use-quest-play state machine**

Create `apps/web/src/features/quest-play/model/use-quest-play.ts`:
```ts
"use client";
import { useState } from "react";

export type PlayState = "playing" | "submitted-correct" | "submitted-wrong";

export function useQuestPlay() {
  const [state, setState] = useState<PlayState>("playing");
  const [strokeJson, setStrokeJson] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");

  function submit() {
    // mock: "5"가 정답
    setState(answer.trim() === "5" ? "submitted-correct" : "submitted-wrong");
  }
  function reset() { setState("playing"); setAnswer(""); }

  return { state, strokeJson, setStrokeJson, answer, setAnswer, submit, reset };
}
```

- [ ] **Step 2: AnswerForm**

Create `apps/web/src/features/quest-play/ui/answer-form.tsx`:
```tsx
"use client";
import { Button } from "@/shared/ui/button";

export function AnswerForm({
  answer, setAnswer, onSubmit, disabled,
}: { answer: string; setAnswer: (v: string) => void; onSubmit: () => void; disabled?: boolean }) {
  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="정답 입력 (mock 정답은 '5')"
        className="flex-1 px-4 py-2 rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-white"
        disabled={disabled}
      />
      <Button onClick={onSubmit} disabled={disabled || !answer}>제출</Button>
    </div>
  );
}
```

- [ ] **Step 3: PlayPage**

Create `apps/web/src/pages/play/ui/play-page.tsx`:
```tsx
"use client";
import { useRouter } from "next/navigation";
import { Card } from "@/shared/ui/card";
import { Mascot } from "@/shared/ui/mascot";
import { Button } from "@/shared/ui/button";
import { PadCanvas } from "@/widgets/pad-canvas/ui/pad-canvas";
import { useQuestPlay } from "@/features/quest-play/model/use-quest-play";
import { AnswerForm } from "@/features/quest-play/ui/answer-form";
import { getQuestById } from "@/shared/mocks/quests";
import { ROUTES } from "@/shared/config/routes";

export function PlayPage({ questId }: { questId: string }) {
  const router = useRouter();
  const quest = getQuestById(questId);
  const play = useQuestPlay();

  if (!quest) return <div className="p-6">퀘스트를 찾을 수 없습니다.</div>;

  return (
    <div className="mx-auto max-w-2xl p-4 lg:p-8 space-y-4">
      <header>
        <div className="text-sm text-[var(--color-text-muted)]">{quest.subject} · {quest.unit}</div>
        <h1 className="text-xl font-bold text-[var(--color-text-strong)]">{quest.topic}</h1>
      </header>

      {play.state === "playing" && (
        <>
          <Card className="p-4 bg-[var(--color-bg-sunken)]">
            <p className="text-sm text-[var(--color-text-default)]">
              수열 {`{a_n}`}이 a₁ = 1, a_{`{n+1}`} = 2a_n + 3 을 만족할 때 a₃ 의 값은?
            </p>
          </Card>
          <PadCanvas onStrokeChange={play.setStrokeJson} />
          <AnswerForm
            answer={play.answer}
            setAnswer={play.setAnswer}
            onSubmit={play.submit}
          />
        </>
      )}

      {play.state === "submitted-correct" && (
        <Card className="p-6 text-center space-y-4">
          <Mascot mood="celebrate" size="xl" className="mx-auto" />
          <div className="text-xl font-bold text-[var(--color-mint-700)]">정답! +{quest.rewardXp} XP</div>
          <Button onClick={() => router.push(ROUTES.result)}>결과 보기</Button>
        </Card>
      )}

      {play.state === "submitted-wrong" && (
        <Card className="p-6 text-center space-y-4">
          <Mascot mood="comfort" size="xl" className="mx-auto" />
          <div className="text-lg font-semibold text-[var(--color-text-strong)]">아쉬워요. 오답회수로 회복할까요?</div>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={play.reset}>다시 풀기</Button>
            <Button onClick={() => router.push(ROUTES.recovery(quest.objectId))}>오답회수 가기</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Route wiring**

Create `apps/web/src/app/(main)/play/[questId]/page.tsx`:
```tsx
import { PlayPage } from "@/pages/play/ui/play-page";

export default async function Page({ params }: { params: Promise<{ questId: string }> }) {
  const { questId } = await params;
  return <PlayPage questId={questId} />;
}
```

- [ ] **Step 5: 시연 + Day 3 commit**

홈에서 첫 퀘스트 클릭 → 캔버스 그리기 → "5" 입력 → 정답 시연 → 결과 페이지 이동.
"5" 외 입력 → 오답 → 오답회수 페이지로 이동.

```bash
git add apps/web/src
git -c user.name="Mike" -c user.email="mikeikhoonkim1208@gmail.com" \
  commit -m "feat(p0): 회독 플레이 페이지 + 캔버스 + 정답/오답 분기 — Day 3 종료

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Day 4 — 업로드 시트 + AI 분석 결과 카드 (4시간)

### Task 11: 업로드 시트 (3-옵션) + mock 분석 trigger

**Files:**
- Modify: `apps/web/src/widgets/upload-sheet/ui/upload-sheet.tsx`
- Create: `apps/web/src/widgets/analysis-card/ui/analysis-card.tsx`
- Create: `apps/web/src/features/upload-source/model/use-upload-flow.ts`

- [ ] **Step 1: use-upload-flow state machine**

Create `apps/web/src/features/upload-source/model/use-upload-flow.ts`:
```ts
"use client";
import { useState } from "react";
import { analyzeSource } from "@/shared/lib/ai";
import type { AnalysisResult } from "@/shared/mocks/analysis";

export type UploadStep = "select-type" | "pick-file" | "analyzing" | "result";
export type SourceType = "photo" | "lecture-log" | "memo";

export function useUploadFlow() {
  const [step, setStep] = useState<UploadStep>("select-type");
  const [sourceType, setSourceType] = useState<SourceType | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  function pickType(t: SourceType) { setSourceType(t); setStep("pick-file"); }

  async function uploadFile(_file: File | null) {
    setStep("analyzing");
    const r = await analyzeSource({ sourceId: "mock-" + Date.now() });
    setResult(r);
    setStep("result");
  }
  function reset() { setStep("select-type"); setSourceType(null); setResult(null); }

  return { step, sourceType, result, pickType, uploadFile, reset };
}
```

- [ ] **Step 2: AnalysisCard**

Create `apps/web/src/widgets/analysis-card/ui/analysis-card.tsx`:
```tsx
import { Card } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import type { AnalysisResult } from "@/shared/mocks/analysis";

export function AnalysisCard({ result }: { result: AnalysisResult }) {
  return (
    <Card className="p-5 space-y-3 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
        <Badge>{result.subject}</Badge>
        <span>{result.unit} · {result.topic}</span>
      </div>
      <p className="text-sm text-[var(--color-text-default)] bg-[var(--color-bg-sunken)] p-3 rounded-[var(--radius-md)]">
        {result.rawTextSnippet}
      </p>
      <div className="flex flex-wrap gap-4 text-sm">
        <span>난이도: <b>{result.difficultyLevel}/5</b></span>
        <span>유형: <b>{result.questionType}</b></span>
        <span>신뢰도: <b className="text-[var(--color-mint-700)]">{(result.confidenceScore * 100).toFixed(0)}%</b></span>
      </div>
      {result.detectedWrongReason && (
        <div className="text-sm">
          <span className="text-[var(--color-text-muted)]">예상 오답 원인:</span>{" "}
          <span className="text-[var(--color-risk-mid)] font-semibold">{result.detectedWrongReason}</span>
        </div>
      )}
    </Card>
  );
}
```

- [ ] **Step 3: UploadSheet 본격 구현**

Replace `apps/web/src/widgets/upload-sheet/ui/upload-sheet.tsx`:
```tsx
"use client";
import { useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/shared/ui/sheet";
import { Button } from "@/shared/ui/button";
import { Mascot } from "@/shared/ui/mascot";
import { AnalysisCard } from "@/widgets/analysis-card/ui/analysis-card";
import { useUploadFlow, type SourceType } from "@/features/upload-source/model/use-upload-flow";

const OPTIONS: { type: SourceType; label: string; icon: string; hint: string }[] = [
  { type: "photo", label: "문제사진", icon: "📸", hint: "교재/시험지 촬영본" },
  { type: "lecture-log", label: "인강기록", icon: "🎬", hint: "수강 후 메모/캡처" },
  { type: "memo", label: "캡처+메모", icon: "📝", hint: "스크린샷+자유 텍스트" },
];

export function UploadSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const flow = useUploadFlow();
  const fileRef = useRef<HTMLInputElement>(null);

  function handleClose(v: boolean) {
    if (!v) flow.reset();
    onOpenChange(v);
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
        <SheetHeader><SheetTitle>오늘 뭘 올릴까요?</SheetTitle></SheetHeader>

        {flow.step === "select-type" && (
          <div className="mt-4 space-y-2">
            {OPTIONS.map((o) => (
              <button
                key={o.type}
                onClick={() => flow.pickType(o.type)}
                className="w-full flex items-center gap-3 p-4 rounded-[var(--radius-lg)] border border-[var(--color-border-default)] hover:bg-[var(--color-mint-50)] text-left"
              >
                <span className="text-2xl">{o.icon}</span>
                <div>
                  <div className="font-semibold">{o.label}</div>
                  <div className="text-sm text-[var(--color-text-muted)]">{o.hint}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {flow.step === "pick-file" && (
          <div className="mt-4 space-y-3 text-center">
            <p className="text-sm text-[var(--color-text-muted)]">파일을 선택하세요 (mock — 어떤 파일이든 같은 결과)</p>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => flow.uploadFile(e.target.files?.[0] ?? null)} />
            <Button onClick={() => fileRef.current?.click()} className="bg-[var(--color-mint-500)] text-white">
              파일 선택
            </Button>
          </div>
        )}

        {flow.step === "analyzing" && (
          <div className="mt-8 flex flex-col items-center gap-3">
            <Mascot mood="think" size="xl" />
            <p className="text-[var(--color-text-default)]">순공이가 분석 중...</p>
            <div className="w-32 h-1 bg-[var(--color-mint-100)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--color-mint-500)] animate-pulse" style={{ width: "60%" }} />
            </div>
          </div>
        )}

        {flow.step === "result" && flow.result && (
          <div className="mt-4 space-y-3">
            <AnalysisCard result={flow.result} />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => flow.reset()}>수정하기</Button>
              <Button className="flex-1 bg-[var(--color-mint-500)] text-white" onClick={() => handleClose(false)}>맞아요</Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
```

- [ ] **Step 4: 시연 + Day 4 commit**

홈에서 업로드 버튼 → 시트 → 옵션 선택 → 파일 picker → "분석 중..." → AnalysisCard → "맞아요" 또는 "수정하기".

```bash
git add apps/web/src
git -c user.name="Mike" -c user.email="mikeikhoonkim1208@gmail.com" \
  commit -m "feat(p0): 업로드 시트 (3-옵션 → mock 분석 → 결과 카드) — Day 4 종료

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Day 5 — 결과 화면 + XP/마스코트 애니메이션 (3시간)

### Task 12: 결과 화면 + Framer Motion

**Files:**
- Create: `apps/web/src/pages/result/ui/result-page.tsx`
- Create: `apps/web/src/widgets/result-rewards/ui/result-rewards.tsx`
- Create: `apps/web/src/widgets/result-rewards/ui/xp-counter.tsx`
- Modify: `apps/web/src/app/(main)/result/page.tsx`

- [ ] **Step 1: XpCounter (카운트업)**

Create `apps/web/src/widgets/result-rewards/ui/xp-counter.tsx`:
```tsx
"use client";
import { useEffect, useState } from "react";

export function XpCounter({ from = 0, to, duration = 1200 }: { from?: number; to: number; duration?: number }) {
  const [v, setV] = useState(from);
  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Math.round(from + (to - from) * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [from, to, duration]);
  return <span>{v}</span>;
}
```

- [ ] **Step 2: ResultRewards**

Create `apps/web/src/widgets/result-rewards/ui/result-rewards.tsx`:
```tsx
"use client";
import { motion } from "framer-motion";
import { Card } from "@/shared/ui/card";
import { Mascot } from "@/shared/ui/mascot";
import { XpCounter } from "./xp-counter";
import { useGameState } from "@/entities/user-game-state/model/use-game-state";

export function ResultRewards({ earnedXp = 60 }: { earnedXp?: number }) {
  const s = useGameState();
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className="p-8 text-center space-y-6 shadow-[var(--shadow-elevated)]">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}>
          <Mascot mood="celebrate" size="xl" className="mx-auto" />
        </motion.div>
        <div>
          <div className="text-3xl font-bold text-[var(--color-mint-700)]">
            +<XpCounter to={earnedXp} /> XP
          </div>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">오늘 회독 완료!</p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <div className="text-2xl">🔥</div>
            <div className="font-semibold">{s.streakDays}일</div>
            <div className="text-[var(--color-text-muted)]">스트릭</div>
          </div>
          <div>
            <div className="text-2xl">❤️</div>
            <div className="font-semibold">{s.memoryHp}/100</div>
            <div className="text-[var(--color-text-muted)]">기억 HP</div>
          </div>
          <div>
            <div className="text-2xl">🏆</div>
            <div className="font-semibold">{s.rank}</div>
            <div className="text-[var(--color-text-muted)]">등급</div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
```

- [ ] **Step 3: ResultPage**

Create `apps/web/src/pages/result/ui/result-page.tsx`:
```tsx
"use client";
import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { ResultRewards } from "@/widgets/result-rewards/ui/result-rewards";
import { ROUTES } from "@/shared/config/routes";

export function ResultPage() {
  return (
    <div className="mx-auto max-w-xl p-4 lg:p-8 space-y-6">
      <ResultRewards earnedXp={60} />
      <Link href={ROUTES.today}>
        <Button variant="outline" className="w-full">홈으로</Button>
      </Link>
    </div>
  );
}
```

Replace `apps/web/src/app/(main)/result/page.tsx`:
```tsx
import { ResultPage } from "@/pages/result/ui/result-page";
export default function Page() { return <ResultPage />; }
```

- [ ] **Step 4: 시연 + Day 5 commit**

`/result` 직접 또는 정답 후 자동 도달. 마스코트 등장 + XP 카운트업 확인.

```bash
git add apps/web/src
git -c user.name="Mike" -c user.email="mikeikhoonkim1208@gmail.com" \
  commit -m "feat(p0): 결과 화면 + XP 카운트업 + 마스코트 spring 애니메이션 — Day 5 종료

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Day 6 — Admin + 오답회수 V1-V5 + Auth 더미 + Lint (5시간)

### Task 13: 오답회수 페이지 (V1-V5 변형)

**Files:**
- Create: `apps/web/src/pages/recovery/ui/recovery-page.tsx`
- Modify: `apps/web/src/app/(main)/recovery/[objectId]/page.tsx`

- [ ] **Step 1: RecoveryPage**

Create `apps/web/src/pages/recovery/ui/recovery-page.tsx`:
```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Mascot } from "@/shared/ui/mascot";
import { MOCK_VARIANTS, type VariantTier } from "@/shared/mocks/recovery-variants";
import { ROUTES } from "@/shared/config/routes";

export function RecoveryPage({ objectId }: { objectId: string }) {
  const router = useRouter();
  const [activeTier, setActiveTier] = useState<VariantTier>("V1");
  const active = MOCK_VARIANTS.find((v) => v.tier === activeTier)!;

  return (
    <div className="mx-auto max-w-2xl p-4 lg:p-8 space-y-4">
      <header className="flex items-center gap-3">
        <Mascot mood="comfort" size="md" />
        <div>
          <h1 className="text-xl font-bold text-[var(--color-text-strong)]">오답회수 모드</h1>
          <p className="text-sm text-[var(--color-text-muted)]">{objectId} · 변형으로 다시 도전</p>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {MOCK_VARIANTS.map((v) => (
          <button key={v.tier} onClick={() => setActiveTier(v.tier)}>
            <Badge className={activeTier === v.tier ? "bg-[var(--color-mint-500)] text-white" : ""}>
              {v.tier}
            </Badge>
          </button>
        ))}
      </div>

      <Card className="p-5 space-y-3">
        <div className="text-sm text-[var(--color-text-muted)]">{active.description}</div>
        <p className="text-base text-[var(--color-text-default)]">{active.prompt}</p>
        <div className="flex gap-2">
          <Button className="flex-1 bg-[var(--color-mint-500)] text-white" onClick={() => router.push(ROUTES.result)}>
            풀기 완료 (+30 XP)
          </Button>
          <Button variant="outline" onClick={() => router.push(ROUTES.today)}>나가기</Button>
        </div>
      </Card>
    </div>
  );
}
```

Create `apps/web/src/app/(main)/recovery/[objectId]/page.tsx`:
```tsx
import { RecoveryPage } from "@/pages/recovery/ui/recovery-page";

export default async function Page({ params }: { params: Promise<{ objectId: string }> }) {
  const { objectId } = await params;
  return <RecoveryPage objectId={objectId} />;
}
```

---

### Task 14: Admin 검수 페이지

**Files:**
- Create: `apps/web/src/pages/admin/ui/admin-page.tsx`
- Create: `apps/web/src/widgets/admin-review-list/ui/admin-review-list.tsx`
- Modify: `apps/web/src/app/(main)/admin/page.tsx`

- [ ] **Step 1: AdminReviewList**

Create `apps/web/src/widgets/admin-review-list/ui/admin-review-list.tsx`:
```tsx
"use client";
import { useState } from "react";
import { Card } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { MOCK_ADMIN_QUEUE, type AdminReviewItem } from "@/shared/mocks/admin-queue";

export function AdminReviewList() {
  const [items, setItems] = useState<AdminReviewItem[]>(MOCK_ADMIN_QUEUE);
  function act(itemId: string, status: AdminReviewItem["status"]) {
    setItems((prev) => prev.map((i) => (i.itemId === itemId ? { ...i, status } : i)));
  }
  return (
    <div className="space-y-3">
      {items.map((i) => (
        <Card key={i.itemId} className="p-4 flex items-center gap-4">
          <div className="text-3xl">{i.thumbnailPlaceholder}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
              <span>{i.studentMaskedId}</span> · <Badge>{i.subject}</Badge>
            </div>
            <div className="font-semibold">{i.detectedTopic}</div>
            <div className="text-xs">신뢰도 {(i.confidenceScore * 100).toFixed(0)}%</div>
          </div>
          {i.status === "pending" ? (
            <div className="flex gap-1">
              <Button size="sm" variant="outline" onClick={() => act(i.itemId, "modified")}>수정</Button>
              <Button size="sm" onClick={() => act(i.itemId, "approved")}>승인</Button>
              <Button size="sm" variant="ghost" onClick={() => act(i.itemId, "rejected")}>폐기</Button>
            </div>
          ) : (
            <Badge>{i.status}</Badge>
          )}
        </Card>
      ))}
    </div>
  );
}
```

Create `apps/web/src/pages/admin/ui/admin-page.tsx`:
```tsx
import { AdminReviewList } from "@/widgets/admin-review-list/ui/admin-review-list";

export function AdminPage() {
  return (
    <div className="mx-auto max-w-3xl p-4 lg:p-8 space-y-4">
      <header>
        <h1 className="text-xl font-bold text-[var(--color-text-strong)]">AI 분석 검수</h1>
        <p className="text-sm text-[var(--color-text-muted)]">신뢰도 낮은 분석 결과를 사람이 보정</p>
      </header>
      <AdminReviewList />
    </div>
  );
}
```

Replace `apps/web/src/app/(main)/admin/page.tsx`:
```tsx
import { AdminPage } from "@/pages/admin/ui/admin-page";
export default function Page() { return <AdminPage />; }
```

---

### Task 15: Auth 더미 + 다크모드 차단 lint + tokens lint

**Files:**
- Create: `apps/web/src/pages/login/ui/login-page.tsx`
- Create: `apps/web/src/app/(auth)/login/page.tsx`
- Create: `apps/web/scripts/check-tokens.ts`
- Create: `apps/web/scripts/check-no-dark.ts`
- Modify: `apps/web/package.json` (lint scripts)

- [ ] **Step 1: Login 더미**

Create `apps/web/src/pages/login/ui/login-page.tsx`:
```tsx
"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { Mascot } from "@/shared/ui/mascot";

export function LoginPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
      <Mascot mood="cheer" size="xl" />
      <h1 className="text-2xl font-bold text-[var(--color-text-strong)]">순공대장에 오신 걸 환영해요</h1>
      <p className="text-sm text-[var(--color-text-muted)]">와꾸 데모 — 로그인 없이 진입</p>
      <Button className="bg-[var(--color-mint-500)] text-white" onClick={() => router.push("/today")}>
        시작하기 (더미)
      </Button>
    </div>
  );
}
```

Create `apps/web/src/app/(auth)/login/page.tsx`:
```tsx
import { LoginPage } from "@/pages/login/ui/login-page";
export default function Page() { return <LoginPage />; }
```

- [ ] **Step 2: check-tokens.ts (등록 외 hex 차단)**

Create `apps/web/scripts/check-tokens.ts`:
```ts
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ALLOWED = new Set([
  "#F8FBF7", "#FFFFFF", "#F1F5EF", "#fff",
  "#EFF9EF", "#D6F0D6", "#A8DDA8", "#7CC97C", "#4FA84F", "#2E6B2E",
  "#6FB3FF", "#FFB36E", "#FF7B7B",
  "#1A2A1A", "#2D3F2D", "#6B7B6B", "#3a2a10",
  "#E1ECDF", "#C5D9C2",
].map((s) => s.toLowerCase()));

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

const files = walk("src", [".ts", ".tsx", ".css"]);
const hexRe = /#[0-9a-fA-F]{3,8}\b/g;
let violations = 0;

for (const file of files) {
  const content = readFileSync(file, "utf-8");
  const matches = content.match(hexRe) ?? [];
  for (const m of matches) {
    if (!ALLOWED.has(m.toLowerCase())) {
      console.error(`❌ ${file}: 등록 외 hex "${m}"`);
      violations++;
    }
  }
}

if (violations > 0) {
  console.error(`\n총 ${violations}건 토큰 위반.`);
  process.exit(1);
}
console.log("✅ 모든 hex가 토큰 화이트리스트 안에 있음.");
```

- [ ] **Step 3: check-no-dark.ts**

Create `apps/web/scripts/check-no-dark.ts`:
```ts
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

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

const files = walk("src", [".ts", ".tsx"]);
const re = /\bdark:[a-z0-9-]+/g;
let violations = 0;

for (const file of files) {
  const content = readFileSync(file, "utf-8");
  const matches = content.match(re) ?? [];
  for (const m of matches) {
    console.error(`❌ ${file}: dark mode 사용 "${m}" — 라이트 단일 잠금 위반`);
    violations++;
  }
}

if (violations > 0) {
  console.error(`\n총 ${violations}건 다크모드 위반.`);
  process.exit(1);
}
console.log("✅ 다크모드 0건 (라이트 단일).");
```

- [ ] **Step 4: package.json scripts**

Modify `apps/web/package.json` (add scripts):
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "next lint",
    "lint:tokens": "tsx scripts/check-tokens.ts",
    "lint:no-dark": "tsx scripts/check-no-dark.ts",
    "test": "vitest",
    "test:e2e": "playwright test"
  }
}
```

Run:
```bash
cd apps/web
pnpm add -D tsx
pnpm lint:tokens
pnpm lint:no-dark
```

Expected: 둘 다 "✅" 출력.

- [ ] **Step 5: Day 6 commit**

```bash
git add apps/web/src apps/web/scripts apps/web/package.json apps/web/pnpm-lock.yaml
git -c user.name="Mike" -c user.email="mikeikhoonkim1208@gmail.com" \
  commit -m "feat(p0): admin/recovery/login + tokens & no-dark lint — Day 6 종료

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Day 7 — E2E Playwright + Vercel preview + 게이트 보고 (4시간)

### Task 16: Playwright E2E (홈 → 업로드 → 분석 → 플레이 → 결과)

**Files:**
- Create: `apps/web/playwright.config.ts`
- Create: `apps/web/tests/e2e/full-flow.spec.ts`

- [ ] **Step 1: Playwright init**

```bash
cd apps/web
pnpm dlx playwright install --with-deps chromium
```

Create `apps/web/playwright.config.ts`:
```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  reporter: "list",
  use: { baseURL: "http://localhost:3000" },
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
```

- [ ] **Step 2: full-flow spec**

Create `apps/web/tests/e2e/full-flow.spec.ts`:
```ts
import { test, expect } from "@playwright/test";

test("홈 → 업로드 → 분석 → 결과 카드까지 완주", async ({ page }) => {
  await page.goto("/today");
  await expect(page.getByRole("heading", { name: "오늘의 회독퀘스트" })).toBeVisible();
  await page.getByRole("button", { name: /문제사진.*올리기/ }).click();
  await page.getByRole("button", { name: "문제사진" }).click();
  // mock 파일 픽 우회 — useUploadFlow.uploadFile 직접 호출 대신 click 후 input change 시뮬레이션
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles({ name: "dummy.png", mimeType: "image/png", buffer: Buffer.from([0]) });
  await expect(page.getByText(/순공이가 분석 중/)).toBeVisible();
  await expect(page.getByText(/신뢰도/)).toBeVisible({ timeout: 5000 });
});

test("퀘스트 클릭 → 캔버스 → 정답 5 → 결과 도달", async ({ page }) => {
  await page.goto("/today");
  await page.getByText("점화식").click();
  await expect(page.locator(".tldraw")).toBeVisible({ timeout: 10000 });
  await page.locator('input[placeholder*="정답"]').fill("5");
  await page.getByRole("button", { name: "제출" }).click();
  await expect(page.getByText(/정답!/)).toBeVisible();
});
```

Run:
```bash
pnpm test:e2e
```

Expected: 2개 spec 통과.

---

### Task 17: Vercel preview 배포

**Files:** (별도 파일 생성 없음 — Vercel 대시보드 작업)

- [ ] **Step 1: Mike — Vercel 계정 + 프로젝트 import**

(Mike 직접)
1. https://vercel.com mugungwhwa 로그인
2. Add New → Project → mugungwhwa/soongong import
3. Framework Preset: Next.js
4. Root Directory: `apps/web`
5. Build Command: `pnpm build`
6. Install Command: `pnpm install`
7. Environment Variables (Preview/Production 둘 다):
   - `NEXT_PUBLIC_MOCK_MODE=true`
   - `NEXT_PUBLIC_APP_NAME=순공대장`
8. Deploy 클릭

- [ ] **Step 2: 첫 deploy log 확인**

Vercel 대시보드 → Deployments → 최신 build log. 성공 시 preview URL 메모.

- [ ] **Step 3: Preview URL에서 E2E 시연**

브라우저에서 preview URL 열고 홈 → 업로드 → 플레이 → 결과 1회 완주.

- [ ] **Step 4: README 업데이트**

Append to `README.md`:
```markdown
## P0 Demo Skeleton (와꾸)

Vercel preview: <URL>

로컬:
\`\`\`bash
pnpm install
pnpm dev
\`\`\`

Mock mode: `NEXT_PUBLIC_MOCK_MODE=true` (기본). 실제 AI 연결은 P3 단계.
```

```bash
git add README.md
git -c user.name="Mike" -c user.email="mikeikhoonkim1208@gmail.com" \
  commit -m "docs(readme): P0 와꾸 데모 Vercel preview URL 추가

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 18: Design Review + 최종 게이트 통과 보고

**Files:**
- Create: `docs/handoff/2026-05-25-p0-completion-report.md`

- [ ] **Step 1: design-review skill 실행**

Invoke `design-system:design-review` skill on `apps/web/src`.

- [ ] **Step 2: 게이트 결과 정리**

Create `docs/handoff/2026-05-25-p0-completion-report.md`:
```markdown
# P0 Demo Skeleton 완료 보고

## 게이트 결과
- [x] 8개 화면 클릭 완주: ✅
- [x] E2E Playwright 2/2 통과: ✅
- [x] design-review 점수: __/100
- [x] lint:tokens: ✅ 위반 0
- [x] lint:no-dark: ✅ 위반 0
- [x] tldraw 라이선스 결정: __
- [x] Vercel preview URL: __

## Mike에게 넘기는 것
- Preview URL (위)
- 마스코트 placeholder 자리 6곳 — Midjourney PNG 도착 시 `apps/web/public/mascot/*.png` 넣고 `mascot.tsx` swap
- AI 연결 swap point: `src/shared/lib/ai.ts`

## 다음 단계
- 환경 결정 25분 → P1 정식 진입 (Supabase 연결 + Auth 실제 구현)
- 또는 와꾸 피드백 반영 후 시각 톤 보강
```

- [ ] **Step 3: 최종 commit + push**

```bash
git add docs/handoff
git -c user.name="Mike" -c user.email="mikeikhoonkim1208@gmail.com" \
  commit -m "docs(p0): Day 7 완료 보고 + 게이트 결과

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
git push
```

---

## 변경 이력

| 버전 | 일자 | 내용 |
|---|---|---|
| **v1.0** | **2026-05-18** | **초안. 7일 18 Task. 와꾸 우선, 키 슬롯만, mock-first.** |

---

> **이 plan은 Anthropic 키 없이도 100% 진행 가능하다.** Day 7 종료 시 Mike는 Vercel preview URL로 8개 화면을 클릭으로 다 도는 데모를 가진다. 그 다음 환경 결정 25분 후 P1 정식 진입.
