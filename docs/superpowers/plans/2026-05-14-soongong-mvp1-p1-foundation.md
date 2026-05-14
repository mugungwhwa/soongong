# 순공대장 MVP 1차 — P1 Foundation Sub-Plan

> **For agentic workers:** 실제 task-level 실행 문서. `superpowers:subagent-driven-development` (권장) 또는 `superpowers:executing-plans`로 진행. 각 task는 fresh subagent + 두 단계 리뷰.
> **환경 트랙 보류 중**: Mike의 명시 OK 전에는 Task 4 (Supabase 프로젝트 생성), Task 5의 production 실행은 보류. 본 문서는 OK 시 즉시 실행할 수 있도록 잠금.

**Goal:** Next.js 15 + FSD 2.1 + Supabase + 디자인 토큰을 잠그는 프로젝트 골격. 다른 P의 기반.

**Architecture:** monorepo 시작점은 단일 `apps/web/`. Sub-package(`packages/shared`, `packages/domain`)는 P2 진입 전 분리. 디자인 토큰을 `tailwind.config.ts` + `src/shared/styles/tokens.css`에 SSoT로 잠그고, `docs/design-tokens.md`에 보호 정책 명시.

**Tech Stack:** Next.js 15, React 19, TypeScript 5.x (strict), Tailwind v4, shadcn/ui, FSD 2.1, Supabase JS v2 (SSR), Zustand, TanStack Query, pnpm.

**Pre-requisites (환경 트랙 OK 받은 뒤):**
- Node.js 22 LTS 설치
- pnpm 9.x 설치
- Supabase 프로젝트 (mugungwhwa org 또는 회사 — Mike 결정)
- Vercel 프로젝트 (위와 동일 트랙)

---

## File Structure

작업 후 디렉토리 구조:

```
soongong/
├── apps/
│   └── web/
│       ├── src/
│       │   ├── app/                  # Next.js App Router
│       │   ├── pages/                # FSD pages layer
│       │   ├── widgets/              # FSD widgets
│       │   ├── features/             # FSD features
│       │   ├── entities/             # FSD entities (도메인 객체)
│       │   └── shared/
│       │       ├── ui/               # shadcn 커스텀
│       │       ├── lib/supabase/     # Supabase 클라이언트
│       │       ├── styles/tokens.css # 토큰 SSoT
│       │       └── config/
│       ├── tailwind.config.ts        # 토큰 SSoT (Tailwind 매핑)
│       ├── components.json           # shadcn config
│       ├── next.config.ts
│       ├── tsconfig.json
│       └── package.json
├── supabase/
│   ├── config.toml
│   └── migrations/
│       ├── 0001_init.sql
│       └── 0002_users.sql
├── docs/
│   └── design-tokens.md              # 토큰 보호 정책 SSoT
└── scripts/
    └── check-tokens.ts               # 토큰 외 색상/spacing 사용 lint
```

---

## Task 1: T0 — Design Tokens 잠금

**Files:**
- Create: `apps/web/tailwind.config.ts`
- Create: `apps/web/src/shared/styles/tokens.css`
- Create: `docs/design-tokens.md`

- [ ] **Step 1: `tailwind.config.ts` 작성**

```ts
// apps/web/tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: "#F8FBF7", soft: "#F0F5EE" },
        surface: "#FFFFFF",
        border: { soft: "#E8EFE6" },
        primary: { DEFAULT: "#7CC97C", strong: "#5BAE6E" },
        accent: { lime: "#B8E5A4", mintLight: "#DFF5DC" },
        danger: { DEFAULT: "#E85C5C", bg: "#FCE8E8" },
        warning: { DEFAULT: "#F5A85E", bg: "#FFF1DF" },
        info: { DEFAULT: "#6FA9E8", bg: "#E6F0FC" },
        reward: { gold: "#F5C242" },
        text: { primary: "#2E2E2E", secondary: "#6E6E6E", tertiary: "#9B9B9B", disabled: "#BBBBBB" },
      },
      spacing: { xs: "4px", sm: "8px", md: "12px", base: "16px", lg: "20px", xl: "24px", "2xl": "32px", "3xl": "40px" },
      borderRadius: { sm: "8px", md: "12px", lg: "16px", xl: "20px", pill: "999px" },
      boxShadow: {
        soft: "0 2px 8px rgba(0,0,0,0.06)",
        medium: "0 4px 16px rgba(0,0,0,0.08)",
        strong: "0 8px 24px rgba(0,0,0,0.12)",
      },
      fontFamily: { sans: ["Pretendard", "ui-sans-serif", "system-ui"] },
      fontSize: {
        tiny: ["11px", "1.4"], caption: ["12px", "1.4"], body: ["14px", "1.5"],
        bodyLg: ["16px", "1.5"], h3: ["18px", "1.3"], h2: ["20px", "1.3"],
        h1: ["24px", "1.3"], display: ["32px", "1.2"],
      },
    },
  },
};
export default config;
```

- [ ] **Step 2: `tokens.css` 작성** (CSS variables — runtime override가 필요한 토큰만)

```css
/* apps/web/src/shared/styles/tokens.css */
:root {
  --bg: #F8FBF7;
  --bg-soft: #F0F5EE;
  --surface: #FFFFFF;
  --border-soft: #E8EFE6;
  --primary: #7CC97C;
  --primary-strong: #5BAE6E;
  --text-primary: #2E2E2E;
  --text-secondary: #6E6E6E;
  --shadow-soft: 0 2px 8px rgba(0,0,0,0.06);
}

/* 회독 플레이 화면만 light surface 강제 (UI 설계.md §8 E) */
.surface-play {
  background: var(--surface);
}

/* Pretendard webfont */
@import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css");
```

- [ ] **Step 3: `docs/design-tokens.md` SSoT 문서 작성**

```markdown
# 디자인 토큰 SSoT

본 문서는 순공대장 디자인 토큰의 단일 진실 공급원이다.
`tailwind.config.ts` + `src/shared/styles/tokens.css`가 코드 SSoT,
본 문서가 메타 SSoT.

## 토큰 추가 규칙
- 새 색상/spacing 추가 시 반드시 본 문서에 등재
- 등재되지 않은 hex 색상이 코드에 등장하면 `scripts/check-tokens.ts` lint가 차단
- 토큰 변경은 PR 리뷰 필수 (design-review skill 8대 패턴 검증)

## 컬러 토큰 (이미지 시안 SSoT: app_UI.png / web_ui.png)

[UI 설계.md §3 내용 복붙]

## Spacing / Radius / Shadow

[UI 설계.md §11 내용 복붙]

## Typography Scale

[UI 설계.md §10 내용 복붙]
```

- [ ] **Step 4: `scripts/check-tokens.ts` lint 작성** (토큰 외 색상 차단)

```ts
// scripts/check-tokens.ts
import { readFileSync } from "node:fs";
import { globSync } from "glob";

const ALLOWED_HEX = new Set([
  "#F8FBF7","#FFFFFF","#F0F5EE","#E8EFE6","#7CC97C","#5BAE6E",
  "#B8E5A4","#DFF5DC","#E85C5C","#FCE8E8","#F5A85E","#FFF1DF",
  "#6FA9E8","#E6F0FC","#F5C242","#2E2E2E","#6E6E6E","#9B9B9B","#BBBBBB",
]);

const HEX_RE = /#[0-9A-Fa-f]{6}\b/g;
const files = globSync("apps/web/src/**/*.{ts,tsx,css}", { ignore: "**/tokens.css" });
let violations = 0;
for (const f of files) {
  const txt = readFileSync(f, "utf8");
  const found = txt.match(HEX_RE) ?? [];
  for (const hex of found) {
    if (!ALLOWED_HEX.has(hex.toUpperCase())) {
      console.error(`✗ ${f}: 미등록 hex ${hex}`);
      violations++;
    }
  }
}
if (violations > 0) {
  console.error(`\n${violations}개 위반. docs/design-tokens.md에 등재 후 다시 시도.`);
  process.exit(1);
}
console.log("✓ 모든 hex가 등록된 토큰입니다.");
```

- [ ] **Step 5: package.json 스크립트 추가**

```json
{
  "scripts": {
    "lint:tokens": "tsx scripts/check-tokens.ts"
  }
}
```

- [ ] **Step 6: 검증**

```bash
pnpm lint:tokens
# Expected: ✓ 모든 hex가 등록된 토큰입니다.
```

- [ ] **Step 7: Commit**

```bash
git add apps/web/tailwind.config.ts apps/web/src/shared/styles/tokens.css docs/design-tokens.md scripts/check-tokens.ts apps/web/package.json
git commit -m "feat(tokens): 디자인 토큰 SSoT 잠금 + lint 차단 스크립트"
```

---

## Task 2: T1 — Next.js 15 + FSD 2.1 Scaffolding

**Files:**
- Create: `apps/web/` (Next.js scaffold)
- Create: FSD 폴더 6개

- [ ] **Step 1: Next.js 15 scaffold**

```bash
cd /Users/mike/Downloads/soongong
pnpm dlx create-next-app@latest apps/web \
  --typescript --tailwind --eslint --app --src-dir \
  --import-alias "@/*" --use-pnpm --no-turbopack
```

- [ ] **Step 2: TypeScript strict 설정**

```json
// apps/web/tsconfig.json (덮어쓰기, strict 강화)
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitAny": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "jsx": "preserve",
    "incremental": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: FSD 2.1 폴더 생성**

```bash
cd apps/web/src
mkdir -p {pages,widgets,features,entities,shared/{ui,lib,config,api,types,styles}}
touch pages/.gitkeep widgets/.gitkeep features/.gitkeep entities/.gitkeep
```

- [ ] **Step 4: `next.config.ts` 설정**

```ts
// apps/web/next.config.ts
import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  experimental: { typedRoutes: true },
};
export default config;
```

- [ ] **Step 5: `src/app/globals.css` import token css**

```css
/* apps/web/src/app/globals.css */
@import "tailwindcss";
@import "../shared/styles/tokens.css";

body {
  background: var(--bg);
  color: var(--text-primary);
  font-family: Pretendard, ui-sans-serif, system-ui;
}
```

- [ ] **Step 6: 빌드 검증**

```bash
cd apps/web && pnpm build
# Expected: ✓ Compiled successfully
```

- [ ] **Step 7: Commit**

```bash
git add apps/web/
git commit -m "feat(scaffold): Next.js 15 + FSD 2.1 폴더 골격"
```

---

## Task 3: T2 — shadcn/ui 9개 컴포넌트 커스터마이즈

**Files:**
- Create: `apps/web/components.json`
- Create: `apps/web/src/shared/ui/{button,card,badge,dialog,sheet,toast,tabs,tooltip,skeleton}.tsx`

- [ ] **Step 1: shadcn init**

```bash
cd apps/web
pnpm dlx shadcn@latest init --base-color neutral --css-variables
```

`components.json` 수정 (FSD 경로):

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/shared/ui",
    "utils": "@/shared/lib/utils"
  }
}
```

- [ ] **Step 2: 9개 컴포넌트 추가**

```bash
pnpm dlx shadcn@latest add button card badge dialog sheet sonner tabs tooltip skeleton
```

- [ ] **Step 3: Button 커스터마이즈 (디자인 토큰 적용)**

```tsx
// apps/web/src/shared/ui/button.tsx (variant 재정의 부분만)
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary-strong active:scale-[0.98]",
        secondary: "bg-bg-soft text-text-primary hover:bg-border-soft",
        ghost: "hover:bg-bg-soft",
        danger: "bg-danger text-white hover:opacity-90",
      },
      size: {
        sm: "h-9 px-3 text-body",
        md: "h-12 px-4 text-bodyLg rounded-lg",
        lg: "h-14 px-5 text-bodyLg rounded-xl",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  },
);
```

- [ ] **Step 4: Card 커스터마이즈** (`rounded-xl` + `shadow-soft`)

```tsx
// apps/web/src/shared/ui/card.tsx (Card 컴포넌트 className 부분)
<div
  className={cn(
    "rounded-xl bg-surface p-base shadow-soft border border-border-soft",
    className,
  )}
  {...props}
/>
```

- [ ] **Step 5: Badge — pill + 위험도 variants**

```tsx
// apps/web/src/shared/ui/badge.tsx
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-pill px-md py-xs text-caption font-medium",
  {
    variants: {
      tone: {
        danger: "bg-danger-bg text-danger",
        warning: "bg-warning-bg text-warning",
        info: "bg-info-bg text-info",
        success: "bg-accent-mintLight text-primary-strong",
      },
    },
    defaultVariants: { tone: "info" },
  },
);
```

- [ ] **Step 6: 데모 페이지 작성**

```tsx
// apps/web/src/app/_demo/page.tsx (개발용, production 제외)
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";

export default function DemoPage() {
  return (
    <div className="p-xl space-y-base">
      <Card>
        <h2 className="text-h2">퀘스트 카드 데모</h2>
        <div className="flex gap-sm mt-md">
          <Badge tone="danger">망각위험 높음</Badge>
          <Badge tone="warning">오늘 권장</Badge>
          <Badge tone="info">안정권</Badge>
        </div>
        <Button className="mt-base w-full">회독퀘스트 시작</Button>
      </Card>
    </div>
  );
}
```

- [ ] **Step 7: 시각 검증**

```bash
cd apps/web && pnpm dev
# 브라우저 localhost:3000/_demo 에서 시안과 비교
# design-review skill로 8대 패턴 점수 측정
```

- [ ] **Step 8: Commit**

```bash
git add apps/web/components.json apps/web/src/shared/ui/ apps/web/src/app/_demo/
git commit -m "feat(ui): shadcn 9종 + 디자인 토큰 커스터마이즈"
```

---

## Task 4: T3 — Supabase 프로젝트 + Auth (SSR)

> ⚠️ **환경 트랙 OK 후 실행.** Supabase 프로젝트 생성은 Mike 결정 필요 (mugungwhwa org vs 회사).

**Files:**
- Create: `supabase/config.toml`, `supabase/migrations/0001_init.sql`
- Create: `apps/web/src/shared/lib/supabase/{client,server,middleware}.ts`
- Create: `apps/web/src/app/(auth)/login/page.tsx`
- Create: `apps/web/middleware.ts`

- [ ] **Step 1: Supabase CLI 설치 + init**

```bash
pnpm dlx supabase init
pnpm dlx supabase login
pnpm dlx supabase link --project-ref <PROJECT_REF>
```

- [ ] **Step 2: `supabase/migrations/0001_init.sql`**

```sql
-- supabase/migrations/0001_init.sql
-- 초기 마이그레이션: extensions만
create extension if not exists "pgcrypto";
create extension if not exists "vector";
```

- [ ] **Step 3: `@supabase/ssr` 설치**

```bash
cd apps/web && pnpm add @supabase/supabase-js @supabase/ssr
```

- [ ] **Step 4: 클라이언트 작성**

```ts
// apps/web/src/shared/lib/supabase/client.ts (browser)
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

```ts
// apps/web/src/shared/lib/supabase/server.ts (Server Components)
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options));
          } catch { /* called from RSC */ }
        },
      },
    },
  );
}
```

```ts
// apps/web/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options));
        },
      },
    },
  );
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthRoute = request.nextUrl.pathname.startsWith("/(auth)");
  if (!user && !isAuthRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg)$).*)"],
};
```

- [ ] **Step 5: 로그인 페이지** (`src/app/(auth)/login/page.tsx`)

```tsx
"use client";
import { useState } from "react";
import { createClient } from "@/shared/lib/supabase/client";
import { Button } from "@/shared/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (!error) setSent(true);
  }

  return (
    <main className="min-h-dvh flex items-center justify-center p-xl">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-base">
        <h1 className="text-h1 text-center">순공대장 로그인</h1>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일"
          className="w-full h-12 px-base rounded-lg border border-border-soft"
        />
        <Button type="submit" className="w-full">매직 링크 받기</Button>
        {sent && <p className="text-body text-text-secondary">메일함을 확인하세요.</p>}
      </form>
    </main>
  );
}
```

- [ ] **Step 6: `.env.local` 설정 (Mike가 채움)**

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

- [ ] **Step 7: 마이그레이션 실행 + 빌드**

```bash
pnpm dlx supabase db push
cd apps/web && pnpm build
```

- [ ] **Step 8: Commit**

```bash
git add supabase/ apps/web/src/shared/lib/supabase/ apps/web/src/app/'(auth)'/ apps/web/middleware.ts
git commit -m "feat(auth): Supabase SSR Auth + magic link 로그인"
```

---

## Task 5: T4 — `users` 테이블 + RLS + 보호자 동의 게이트

**Files:**
- Create: `supabase/migrations/0002_users.sql`
- Create: `apps/web/src/entities/user/`
- Create: `apps/web/src/app/onboarding/page.tsx`

- [ ] **Step 1: `0002_users.sql` 작성**

```sql
-- supabase/migrations/0002_users.sql
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'student'
    check (role in ('student','parent','admin','reviewer')),
  birth_year smallint,
  is_under_14 boolean generated always as
    (birth_year is not null and (extract(year from now())::int - birth_year) < 14) stored,
  guardian_verified boolean not null default false,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index users_role_idx on public.users (role);

-- RLS
alter table public.users enable row level security;

create policy "users: self read"
  on public.users for select
  using (auth.uid() = id);

create policy "users: self update"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- auth.users → public.users 자동 sync trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, role)
  values (new.id, 'student');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

- [ ] **Step 2: 마이그레이션 실행**

```bash
pnpm dlx supabase db push
```

- [ ] **Step 3: User entity 작성**

```ts
// apps/web/src/entities/user/model.ts
export type UserRole = "student" | "parent" | "admin" | "reviewer";

export type User = {
  id: string;
  role: UserRole;
  birth_year: number | null;
  is_under_14: boolean;
  guardian_verified: boolean;
  created_at: string;
  deleted_at: string | null;
};
```

```ts
// apps/web/src/entities/user/api.ts
import { createClient } from "@/shared/lib/supabase/server";
import type { User } from "./model";

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return null;
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .single();
  return (data as User) ?? null;
}
```

- [ ] **Step 4: 온보딩 페이지 (생년 + 14세 미만 게이트)**

```tsx
// apps/web/src/app/onboarding/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/shared/lib/supabase/client";
import { Button } from "@/shared/ui/button";

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [birthYear, setBirthYear] = useState<number | "">("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!birthYear) return;
    const age = new Date().getFullYear() - Number(birthYear);
    if (age < 14) {
      setError("만 14세 미만은 보호자 동의 후 가입할 수 있습니다.");
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("users").update({ birth_year: Number(birthYear) }).eq("id", user.id);
    router.push("/");
  }

  return (
    <main className="min-h-dvh flex items-center justify-center p-xl">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-base">
        <h1 className="text-h1">순공이가 인사할게요</h1>
        <p className="text-body text-text-secondary">생년을 알려주세요. 회독퀘스트를 맞춰드려요.</p>
        <input
          type="number"
          min={1990}
          max={new Date().getFullYear()}
          required
          value={birthYear}
          onChange={(e) => setBirthYear(Number(e.target.value) || "")}
          className="w-full h-12 px-base rounded-lg border border-border-soft"
          placeholder="2007"
        />
        {error && <p className="text-body text-danger">{error}</p>}
        <Button type="submit" className="w-full">시작하기</Button>
      </form>
    </main>
  );
}
```

- [ ] **Step 5: 가입 플로우 통합 테스트**

```bash
cd apps/web && pnpm dev
# 1. /login → 매직 링크 → 클릭 → 콜백
# 2. /onboarding → 생년 입력 → /
# 3. Supabase Studio에서 users 테이블 확인 (RLS 본인만 read 가능)
```

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/0002_users.sql apps/web/src/entities/user/ apps/web/src/app/onboarding/
git commit -m "feat(users): users 테이블 + RLS + 만 14세 미만 게이트"
```

---

## P1 종료 시 체크포인트

- [ ] tailwind config + tokens.css diff 확인 (UI 설계.md §3, §10, §11과 일치)
- [ ] shadcn 9개 컴포넌트 데모 페이지 (`/_demo`)에서 시각 검증
- [ ] design-review skill로 8대 패턴 점수 ≥ 70점
- [ ] `pnpm lint:tokens` 통과
- [ ] `pnpm build` 통과
- [ ] 가입 플로우 1회 완주 (login → onboarding → users 테이블 row)
- [ ] RLS 정책 테스트 (다른 user_id로 SELECT 시도 시 0 row)

**다음 단계: P2 Source Intake sub-plan 작성으로 진입.**

---

## 변경 이력

| 버전 | 일자 | 내용 |
|---|---|---|
| **v1.0** | **2026-05-14** | **초안. 5개 task (Design Tokens / Next.js scaffolding / shadcn 9종 / Supabase Auth / users 테이블) + 체크포인트.** |
