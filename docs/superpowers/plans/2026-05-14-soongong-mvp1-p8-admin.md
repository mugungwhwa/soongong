# 순공대장 MVP 1차 — P8 Admin Sub-Plan

> **For agentic workers:** `superpowers:subagent-driven-development` + `security-check` skill 필수 (admin 권한 다룸).
> **Pre-requisites**: P3 완료 (parsed_learning_objects의 `reviewer_status`).
> **병렬**: P8은 P3 끝나면 P4-P7과 병렬 가능.

**Goal:** AI 분석 결과 검수 화면 + 오류 신고 처리 + 모든 admin 액션 audit_logs 기록.

**Architecture:** admin 역할 라우트는 middleware에서 차단. audit_logs는 DB trigger로 자동 기록. 검수 UI는 pending 리스트 + 승인/수정/폐기 액션.

**Tech Stack:** Next.js middleware, Supabase RLS (role-based), shadcn Table.

---

## File Structure

```
supabase/migrations/0012_audit_logs.sql
apps/web/src/
  app/admin/page.tsx
  features/admin-review/
  shared/lib/admin/auth.ts
middleware.ts (확장)
```

---

## Task 1: T1 — `audit_logs` 테이블 + RLS

```sql
-- supabase/migrations/0012_audit_logs.sql
create table public.audit_logs (
  log_id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.users(id) on delete set null,
  actor_role text not null
    check (actor_role in ('student','parent','admin','reviewer','agent','system')),
  action text not null
    check (action in ('read','create','update','delete','export','approve','reject','correct','flag')),
  target_table text not null,
  target_id text,
  diff jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create index audit_actor_idx on public.audit_logs (actor_id, created_at desc);
create index audit_target_idx on public.audit_logs (target_table, target_id);
create index audit_role_idx on public.audit_logs (actor_role, created_at desc);

alter table public.audit_logs enable row level security;
create policy "audit: admin read"
  on public.audit_logs for select
  using (exists (
    select 1 from public.users
    where id = auth.uid() and role in ('admin','reviewer')
  ));
-- insert는 service_role / trigger만
```

```sql
-- 자동 audit trigger 예시 (parsed_learning_objects)
create or replace function public.audit_plo_changes()
returns trigger language plpgsql security definer as $$
begin
  insert into public.audit_logs (actor_id, actor_role, action, target_table, target_id, diff)
  values (
    auth.uid(),
    coalesce((select role from public.users where id = auth.uid()), 'system'),
    case tg_op when 'INSERT' then 'create' when 'UPDATE' then 'update' when 'DELETE' then 'delete' end,
    'parsed_learning_objects',
    coalesce(new.object_id::text, old.object_id::text),
    jsonb_build_object('old', to_jsonb(old), 'new', to_jsonb(new))
  );
  return coalesce(new, old);
end;
$$;

create trigger plo_audit
  after insert or update or delete on public.parsed_learning_objects
  for each row execute function public.audit_plo_changes();
```

- [ ] **실행 + Commit**

```bash
pnpm dlx supabase db push
git add supabase/migrations/0012_audit_logs.sql
git commit -m "feat(p8): audit_logs 테이블 + RLS + 자동 trigger (parsed_learning_objects)"
```

---

## Task 2: T2 — admin 라우트 보호 (middleware 확장)

```ts
// apps/web/middleware.ts (P1에서 만든 미들웨어 확장)
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

  const path = request.nextUrl.pathname;
  const isAuthRoute = path.startsWith("/(auth)") || path.startsWith("/login");
  const isAdminRoute = path.startsWith("/admin");

  if (!user && !isAuthRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAdminRoute && user) {
    const { data: userRow } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();
    if (!userRow || !["admin","reviewer"].includes(userRow.role)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg)$).*)"],
};
```

- [ ] **admin auth helper**

```ts
// apps/web/src/shared/lib/admin/auth.ts
import { createClient } from "@/shared/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("unauthorized");
  const { data: row } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (!row || !["admin","reviewer"].includes(row.role)) throw new Error("forbidden");
  return { user, role: row.role as "admin" | "reviewer" };
}
```

- [ ] **Commit**

```bash
git add apps/web/middleware.ts apps/web/src/shared/lib/admin/
git commit -m "feat(p8): admin 라우트 미들웨어 보호 + requireAdmin helper"
```

---

## Task 3: T3 — 검수 리스트 페이지

```tsx
// apps/web/src/app/admin/page.tsx
import { requireAdmin } from "@/shared/lib/admin/auth";
import { createClient } from "@/shared/lib/supabase/server";
import { ReviewQueue } from "@/features/admin-review/ui/review-queue";

export default async function AdminPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: pending } = await supabase
    .from("parsed_learning_objects")
    .select("*")
    .eq("reviewer_status", "pending")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <main className="p-xl space-y-base">
      <h1 className="text-h1">검수 대기 ({pending?.length ?? 0})</h1>
      <ReviewQueue items={pending ?? []} />
    </main>
  );
}
```

```tsx
// apps/web/src/features/admin-review/ui/review-queue.tsx
"use client";
import { Card } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { createClient } from "@/shared/lib/supabase/client";

type Item = {
  object_id: string;
  subject: string;
  unit: string | null;
  topic: string | null;
  question_type: string | null;
  difficulty_level: string | null;
  extracted_text: string | null;
  confidence_score: number | null;
};

export function ReviewQueue({ items }: { items: Item[] }) {
  const supabase = createClient();

  async function decide(objectId: string, decision: "approved" | "rejected") {
    await supabase
      .from("parsed_learning_objects")
      .update({ reviewer_status: decision })
      .eq("object_id", objectId);
    location.reload();
  }

  return (
    <ul className="space-y-md">
      {items.map((i) => (
        <li key={i.object_id}>
          <Card>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex gap-sm mb-sm">
                  <Badge tone="info">{i.subject}</Badge>
                  {i.unit && <Badge tone="info">{i.unit}</Badge>}
                  {i.difficulty_level && <Badge tone="warning">{i.difficulty_level}</Badge>}
                  {i.confidence_score !== null && (
                    <Badge tone={i.confidence_score < 0.7 ? "danger" : "success"}>
                      신뢰도 {(i.confidence_score * 100).toFixed(0)}%
                    </Badge>
                  )}
                </div>
                <p className="text-body text-text-primary line-clamp-3">{i.extracted_text ?? "(텍스트 없음)"}</p>
              </div>
            </div>
            <div className="mt-md flex gap-sm">
              <Button onClick={() => decide(i.object_id, "approved")}>승인</Button>
              <Button variant="secondary" onClick={() => decide(i.object_id, "rejected")}>폐기</Button>
            </div>
          </Card>
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Commit**

```bash
git add apps/web/src/app/admin/ apps/web/src/features/admin-review/
git commit -m "feat(p8): admin 검수 리스트 + 승인/폐기 액션"
```

---

## Task 4: T4 — 오류 신고 흐름

```sql
-- supabase/migrations/0012_audit_logs.sql (append)
create table public.error_reports (
  report_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id),
  target_table text not null,
  target_id uuid not null,
  reason text not null,
  status text not null default 'open' check (status in ('open','reviewing','resolved','wontfix')),
  resolved_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

alter table public.error_reports enable row level security;
create policy "er: self read own" on public.error_reports for select using (auth.uid() = user_id);
create policy "er: self insert" on public.error_reports for insert with check (auth.uid() = user_id);
create policy "er: admin read all" on public.error_reports for select
  using (exists (select 1 from public.users where id = auth.uid() and role in ('admin','reviewer')));
create policy "er: admin update" on public.error_reports for update
  using (exists (select 1 from public.users where id = auth.uid() and role in ('admin','reviewer')));
```

```tsx
// apps/web/src/features/admin-review/ui/error-report-button.tsx
"use client";
import { useState } from "react";
import { createClient } from "@/shared/lib/supabase/client";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/shared/ui/dialog";

export function ErrorReportButton({ targetTable, targetId }: { targetTable: string; targetId: string }) {
  const [reason, setReason] = useState("");
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  async function submit() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("error_reports").insert({
      user_id: user.id, target_table: targetTable, target_id: targetId, reason,
    });
    setSent(true);
  }

  return (
    <Dialog>
      <DialogTrigger asChild><Button variant="ghost" size="sm">오류 신고</Button></DialogTrigger>
      <DialogContent>
        <DialogTitle>오류 신고</DialogTitle>
        {!sent ? (
          <div className="space-y-md mt-base">
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="어디가 잘못됐는지 알려주세요..."
              className="w-full rounded-lg border border-border-soft p-base min-h-[100px] text-body"
            />
            <Button onClick={submit} disabled={!reason.trim()}>신고 보내기</Button>
          </div>
        ) : (
          <p className="text-body mt-base">신고가 접수됐어요. 확인 후 처리합니다.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Commit**

```bash
git add supabase/migrations/0012_audit_logs.sql apps/web/src/features/admin-review/ui/error-report-button.tsx
git commit -m "feat(p8): error_reports 테이블 + 사용자 신고 UI"
```

---

## Task 5: T5 — 보안 점검

```bash
# security-check skill 실행
/security-check:security-check
# Expected: OWASP + Supabase RLS + Next.js Server Action 점검 통과
```

체크리스트:
- [ ] admin 라우트는 미들웨어 + RLS 이중 보호
- [ ] audit_logs는 admin만 read (학생 차단)
- [ ] error_reports는 자신만 read + admin 전체 read
- [ ] DB trigger가 모든 admin update를 자동 audit
- [ ] middleware가 `/admin/*` 경로를 user role 미확인 시 redirect

---

## P8 종료 체크포인트

- [ ] /admin 접근 시 admin/reviewer 아닌 사용자 redirect 확인
- [ ] parsed_learning_objects 승인/폐기 → reviewer_status 업데이트 + audit_logs 자동 기록
- [ ] 학생이 오류 신고 → error_reports row 생성 → admin이 /admin/reports에서 확인
- [ ] security-check skill 점수 통과

P1-P8 sub-plan 모두 완료. **마스터 플랜 8주 MVP 1차 문서 작업 종료.**

---

| v1.0 | 2026-05-14 | 초안. 5개 task (audit_logs + 미들웨어 + 검수 리스트 + 오류 신고 + 보안 점검). |
