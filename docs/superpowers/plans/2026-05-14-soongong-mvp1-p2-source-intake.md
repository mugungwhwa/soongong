# 순공대장 MVP 1차 — P2 Source Intake Sub-Plan

> **For agentic workers:** `superpowers:subagent-driven-development` (권장) 또는 `superpowers:executing-plans`로 진행. 보안 관련 task는 `security-check` skill과 `oh-my-claudecode:security-reviewer`를 병렬로 사용.
> **환경 트랙 보류 중**: Mike의 결정 1-3(`docs/setup/2026-05-14-environment-decisions.md`) 완료 + P1 sub-plan 완료 후 실행. 본 문서는 즉시 실행 가능한 상태로 잠근다.
> **위치**: P2는 마스터 플랜의 두 번째 sub-project. P1(Foundation) → **P2(Source Intake)** → P3(AI Pipeline) 순.

**Goal:** 학생이 문제사진 / 인강 시청 기록 / 캡처+메모를 업로드하면 단방향 파이프라인(Source Intake → Compliance Gate → Storage)으로 안전하게 받아 P3 AI 분석으로 넘기는 입구를 구축. 폴백: OCR 어려운 경우 학생이 직접 텍스트 입력하는 manual 모드.

**Architecture:**
- Supabase Storage **private bucket** + signed URL + 사용자별 path
- Compliance Gate Edge Function (Claude Haiku 4.5로 저작권/PII 분류)
- 원본 자동 삭제 cron (storage_policy + 30일 경과)
- 업로드 UI: 라이트 시트 모달 (모바일 우선) + 3-옵션 카드
- Raw / Derived 분리 정책 — 원본 임시 저장, 파생만 장기

**Tech Stack:** Next.js 15, Supabase JS SSR (P1에서 잡힘), `@supabase/ssr`, shadcn Sheet, Anthropic Claude API (P3 sub-plan의 `_shared/ai.ts` 재사용).

**Pre-requisites:**
- P1 sub-plan 완료 (Auth + `users` 테이블 + `_shared/ai.ts`)
- Mike 환경 결정 1-3 완료 (`docs/setup/2026-05-14-environment-decisions.md`)
- `.env.local`에 `ANTHROPIC_API_KEY` 박혀있음 (Compliance Gate에서 사용)

---

## File Structure

```
soongong/
├── supabase/
│   ├── migrations/
│   │   ├── 0006_external_sources.sql
│   │   ├── 0007_source_compliance_checks.sql
│   │   └── 0008_storage_uploads_bucket.sql
│   └── functions/
│       ├── compliance-gate/index.ts
│       └── cleanup-raw/index.ts
├── apps/web/src/
│   ├── features/
│   │   ├── upload-source/
│   │   │   ├── ui/
│   │   │   │   ├── upload-sheet.tsx        # 3-옵션 시트 + manual 폴백
│   │   │   │   ├── photo-upload.tsx
│   │   │   │   ├── lecture-log-form.tsx
│   │   │   │   ├── capture-note-form.tsx
│   │   │   │   └── manual-text-form.tsx
│   │   │   └── api.ts
│   │   └── ai-analysis-result/ (P3에서 생성)
│   └── entities/source/
│       ├── model.ts
│       └── api.ts
└── eval/
    └── p2/
        ├── compliance-cases.json
        └── runner.ts
```

---

## Task 1: T1 — `external_sources` 테이블 + RLS

**Files:** Create `supabase/migrations/0006_external_sources.sql`

- [ ] **Step 1: 마이그레이션 작성**

```sql
-- supabase/migrations/0006_external_sources.sql
create table public.external_sources (
  source_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  source_type text not null
    check (source_type in ('problem_photo','lecture_log','capture_note','manual_text')),
  provider_type text not null default 'user'
    check (provider_type in ('user','partner','internal','public_reference')),
  raw_url text,                              -- Storage path (자동 삭제 대상)
  raw_text text,                             -- manual 입력 / OCR 결과
  storage_policy text not null default 'temporary'
    check (storage_policy in ('permanent','temporary','derived_only','local_only')),
  license_status text not null default 'user_private'
    check (license_status in ('user_private','licensed','internal_only','forbidden','needs_review')),
  metadata jsonb not null default '{}'::jsonb,
  source_hash text,                          -- 중복 제거 (sha256 of file or text)
  created_at timestamptz not null default now(),
  deleted_at timestamptz                     -- soft delete
);

create index external_sources_user_idx
  on public.external_sources (user_id, created_at desc)
  where deleted_at is null;
create index external_sources_hash_idx on public.external_sources (source_hash);
create index external_sources_storage_idx
  on public.external_sources (storage_policy, created_at)
  where raw_url is not null and deleted_at is null;

alter table public.external_sources enable row level security;

create policy "external_sources: self read"
  on public.external_sources for select
  using (auth.uid() = user_id and deleted_at is null);

create policy "external_sources: self insert"
  on public.external_sources for insert
  with check (auth.uid() = user_id);

create policy "external_sources: self soft-delete"
  on public.external_sources for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

- [ ] **Step 2: 실행 + 검증**

```bash
pnpm dlx supabase db push
# Supabase Studio에서 external_sources 테이블 + RLS 3개 확인
```

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/0006_external_sources.sql
git commit -m "feat(p2): external_sources 테이블 + RLS + 인덱스 3종"
```

---

## Task 2: T2 — `source_compliance_checks` 테이블 + RLS

**Files:** Create `supabase/migrations/0007_source_compliance_checks.sql`

- [ ] **Step 1: 마이그레이션 작성**

```sql
-- supabase/migrations/0007_source_compliance_checks.sql
create table public.source_compliance_checks (
  check_id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.external_sources(source_id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  copyright_risk text not null
    check (copyright_risk in ('low','medium','high')),
  contains_paid_lecture boolean not null default false,
  contains_exam_original boolean not null default false,
  contains_personal_info boolean not null default false,
  allow_user_view boolean not null default true,
  allow_ai_generation boolean not null default true,
  allow_rag_indexing boolean not null default true,
  action text not null
    check (action in ('pass','redact','derived_only','reject','admin_review')),
  reason text,
  created_at timestamptz not null default now(),
  unique (source_id)
);

create index scc_source_idx on public.source_compliance_checks (source_id);
create index scc_action_idx on public.source_compliance_checks (action)
  where action in ('reject','admin_review');

alter table public.source_compliance_checks enable row level security;

create policy "scc: self read"
  on public.source_compliance_checks for select
  using (auth.uid() = user_id);
-- write는 service_role(Edge Function)만 허용
```

- [ ] **Step 2: 실행 + Commit**

```bash
pnpm dlx supabase db push
git add supabase/migrations/0007_source_compliance_checks.sql
git commit -m "feat(p2): source_compliance_checks 테이블 + RLS"
```

---

## Task 3: T3 — Supabase Storage `uploads` bucket + RLS

**Files:** Create `supabase/migrations/0008_storage_uploads_bucket.sql`

- [ ] **Step 1: 마이그레이션 작성**

```sql
-- supabase/migrations/0008_storage_uploads_bucket.sql
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'uploads',
  'uploads',
  false,                       -- private bucket
  5 * 1024 * 1024,             -- 5MB
  array['image/jpeg','image/png','image/webp','image/heic']
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types,
  public = excluded.public;

-- RLS: 사용자별 first-segment path만 read/write 가능
create policy "uploads: self read"
  on storage.objects for select
  using (
    bucket_id = 'uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "uploads: self insert"
  on storage.objects for insert
  with check (
    bucket_id = 'uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "uploads: self delete"
  on storage.objects for delete
  using (
    bucket_id = 'uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
```

- [ ] **Step 2: 실행 + 검증**

```bash
pnpm dlx supabase db push
# Supabase Studio → Storage → uploads bucket 확인 (private 표시)
# RLS 3개 확인
```

- [ ] **Step 3: 다른 사용자 path 접근 시도 (보안 테스트)**

```bash
# 다른 user_id를 jwt로 만들고 다른 사용자 path 접근 시도 → 0 row 반환 확인
curl -X GET \
  "$SUPABASE_URL/storage/v1/object/uploads/<other-user-id>/test.png" \
  -H "Authorization: Bearer $MY_TOKEN"
# Expected: 404 또는 400 (RLS 차단)
```

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/0008_storage_uploads_bucket.sql
git commit -m "feat(p2): uploads private bucket + 사용자별 path RLS"
```

---

## Task 4: T4 — Compliance Gate Edge Function

**Files:** Create `supabase/functions/compliance-gate/index.ts`

- [ ] **Step 1: Zod 스키마 추가 (`_shared/schemas.ts`에 append)**

```ts
// supabase/functions/_shared/schemas.ts (append)
export const complianceSchema = z.object({
  copyright_risk: z.enum(["low","medium","high"]),
  contains_paid_lecture: z.boolean(),
  contains_exam_original: z.boolean(),
  contains_personal_info: z.boolean(),
  allow_user_view: z.boolean(),
  allow_ai_generation: z.boolean(),
  allow_rag_indexing: z.boolean(),
  action: z.enum(["pass","redact","derived_only","reject","admin_review"]),
  reason: z.string().max(200),
});
```

- [ ] **Step 2: Edge Function 작성**

```ts
// supabase/functions/compliance-gate/index.ts
import { getModel, generateObject, CACHED_SYSTEM } from "../_shared/ai.ts";
import { complianceSchema } from "../_shared/schemas.ts";
import { getAdminClient } from "../_shared/supabase.ts";

const COMPLIANCE_PROMPT = `
다음 학습 소스를 한국 교육 서비스 운영 관점에서 분류하라.

판단 기준:
- 학생 본인 풀이/메모 → action=pass, copyright_risk=low
- 문제집 한 페이지 통째로 업로드 → action=admin_review
- 유료 인강 캡처 → contains_paid_lecture=true, action=derived_only (원본 장기저장 금지)
- 수능 기출 원문 → contains_exam_original=true, action=reject
- 학생 이름·전화번호 등 PII 노출 → contains_personal_info=true, action=redact
- 그 외 애매한 경우 → action=admin_review

응답은 한국어 reason 포함.
`.trim();

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const { source_id } = await req.json();
  if (!source_id) return new Response("source_id required", { status: 400 });

  const supabase = getAdminClient();

  const { data: source } = await supabase
    .from("external_sources")
    .select("source_id, user_id, source_type, raw_url, raw_text, metadata")
    .eq("source_id", source_id)
    .single();
  if (!source) return new Response("source not found", { status: 404 });

  // 입력 메시지 빌드 (이미지 or 텍스트)
  const userContent: any[] = [{ type: "text", text: COMPLIANCE_PROMPT }];

  if (source.raw_url) {
    const { data: signed } = await supabase.storage
      .from("uploads")
      .createSignedUrl(source.raw_url, 60);
    if (signed?.signedUrl) {
      userContent.push({
        type: "text",
        text: `source_type: ${source.source_type}\n학생 메모: ${source.metadata?.student_note ?? "없음"}`,
      });
      userContent.push({ type: "image", image: new URL(signed.signedUrl) });
    }
  } else if (source.raw_text) {
    userContent.push({
      type: "text",
      text: `source_type: ${source.source_type}\n텍스트: ${source.raw_text.slice(0, 1500)}`,
    });
  }

  const { object } = await generateObject({
    model: getModel("fast"),
    schema: complianceSchema,
    messages: [
      { role: "system", content: [CACHED_SYSTEM] },
      { role: "user", content: userContent },
    ],
  });

  const { data: check, error } = await supabase
    .from("source_compliance_checks")
    .insert({
      source_id: source.source_id,
      user_id: source.user_id,
      ...object,
    })
    .select()
    .single();

  if (error) return new Response(error.message, { status: 500 });

  // action에 따라 external_sources 업데이트
  if (object.action === "reject") {
    await supabase
      .from("external_sources")
      .update({ deleted_at: new Date().toISOString(), raw_url: null })
      .eq("source_id", source.source_id);
    if (source.raw_url) {
      await supabase.storage.from("uploads").remove([source.raw_url]);
    }
  } else if (object.action === "derived_only") {
    await supabase
      .from("external_sources")
      .update({ storage_policy: "derived_only" })
      .eq("source_id", source.source_id);
  }

  return Response.json(check);
});
```

- [ ] **Step 3: 배포 + Commit**

```bash
pnpm dlx supabase functions deploy compliance-gate
git add supabase/functions/compliance-gate/ supabase/functions/_shared/schemas.ts
git commit -m "feat(p2): compliance-gate Edge Function — 저작권/PII 분류 + 자동 처리"
```

---

## Task 5: T5 — 원본 자동 삭제 cron Edge Function

**Files:** Create `supabase/functions/cleanup-raw/index.ts`

- [ ] **Step 1: Edge Function 작성**

```ts
// supabase/functions/cleanup-raw/index.ts
import { getAdminClient } from "../_shared/supabase.ts";

const TEMPORARY_RETENTION_DAYS = 30;
const DERIVED_ONLY_RETENTION_DAYS = 7;

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const supabase = getAdminClient();
  const now = Date.now();
  const tempCutoff = new Date(now - TEMPORARY_RETENTION_DAYS * 86400_000).toISOString();
  const derivedCutoff = new Date(now - DERIVED_ONLY_RETENTION_DAYS * 86400_000).toISOString();

  const { data: tempExpired } = await supabase
    .from("external_sources")
    .select("source_id, raw_url, storage_policy")
    .eq("storage_policy", "temporary")
    .not("raw_url", "is", null)
    .lt("created_at", tempCutoff);

  const { data: derivedExpired } = await supabase
    .from("external_sources")
    .select("source_id, raw_url, storage_policy")
    .eq("storage_policy", "derived_only")
    .not("raw_url", "is", null)
    .lt("created_at", derivedCutoff);

  const expired = [...(tempExpired ?? []), ...(derivedExpired ?? [])];
  if (expired.length === 0) {
    return Response.json({ deleted: 0 });
  }

  let deleted = 0;
  let failed = 0;
  for (const row of expired) {
    try {
      if (row.raw_url) {
        await supabase.storage.from("uploads").remove([row.raw_url]);
      }
      await supabase
        .from("external_sources")
        .update({ raw_url: null })
        .eq("source_id", row.source_id);
      deleted++;
    } catch (e) {
      console.error(`failed source_id=${row.source_id}`, e);
      failed++;
    }
  }

  return Response.json({ deleted, failed, total: expired.length });
});
```

- [ ] **Step 2: 배포**

```bash
pnpm dlx supabase functions deploy cleanup-raw
```

- [ ] **Step 3: Cron 등록** (Supabase Dashboard → Database → Cron Jobs)

```sql
-- pg_cron 사용 (Supabase에 기본 포함)
select cron.schedule(
  'cleanup-raw-daily',
  '0 18 * * *',   -- 매일 03:00 KST (UTC 18:00)
  $$
  select net.http_post(
    url:='https://<project-ref>.supabase.co/functions/v1/cleanup-raw',
    headers:='{"Authorization":"Bearer <service-role-key>","Content-Type":"application/json"}'::jsonb,
    body:='{}'::jsonb
  );
  $$
);
```

- [ ] **Step 4: 수동 테스트**

```bash
curl -X POST "$SUPABASE_URL/functions/v1/cleanup-raw" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY"
# Expected: {"deleted": 0, "failed": 0, "total": 0} (시드 데이터 없으면)
```

- [ ] **Step 5: Commit**

```bash
git add supabase/functions/cleanup-raw/
git commit -m "feat(p2): cleanup-raw 자동 삭제 cron — temporary 30일/derived_only 7일"
```

---

## Task 6: T6 — User Entity (`source`)

**Files:** Create `apps/web/src/entities/source/`

- [ ] **Step 1: `model.ts`**

```ts
// apps/web/src/entities/source/model.ts
export type SourceType = "problem_photo" | "lecture_log" | "capture_note" | "manual_text";
export type StoragePolicy = "permanent" | "temporary" | "derived_only" | "local_only";
export type LicenseStatus = "user_private" | "licensed" | "internal_only" | "forbidden" | "needs_review";
export type ComplianceAction = "pass" | "redact" | "derived_only" | "reject" | "admin_review";

export type Source = {
  source_id: string;
  user_id: string;
  source_type: SourceType;
  raw_url: string | null;
  raw_text: string | null;
  storage_policy: StoragePolicy;
  license_status: LicenseStatus;
  metadata: Record<string, unknown>;
  created_at: string;
  deleted_at: string | null;
};
```

- [ ] **Step 2: `api.ts`**

```ts
// apps/web/src/entities/source/api.ts
import { createClient } from "@/shared/lib/supabase/client";
import type { Source, SourceType } from "./model";

export async function createSource(payload: {
  source_type: SourceType;
  raw_url?: string;
  raw_text?: string;
  storage_policy?: "temporary" | "derived_only";
  metadata?: Record<string, unknown>;
}): Promise<Source | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("external_sources")
    .insert({
      user_id: user.id,
      source_type: payload.source_type,
      raw_url: payload.raw_url ?? null,
      raw_text: payload.raw_text ?? null,
      storage_policy: payload.storage_policy ?? "temporary",
      license_status: "user_private",
      metadata: payload.metadata ?? {},
    })
    .select()
    .single();

  return (data as Source) ?? null;
}

export async function runIntakePipeline(sourceId: string) {
  const supabase = createClient();
  // 1) Compliance Gate
  await supabase.functions.invoke("compliance-gate", { body: { source_id: sourceId } });
  // 2) Subject Routing (P3)
  await supabase.functions.invoke("route-subject", { body: { source_id: sourceId } });
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/entities/source/
git commit -m "feat(p2): source entity (model + api)"
```

---

## Task 7: T7 — 업로드 시트 UI (3-옵션 + manual 폴백)

**Files:** Create `apps/web/src/features/upload-source/ui/`

- [ ] **Step 1: `upload-sheet.tsx`**

```tsx
// apps/web/src/features/upload-source/ui/upload-sheet.tsx
"use client";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/shared/ui/sheet";
import { Camera, Video, StickyNote, Type } from "lucide-react";
import { Card } from "@/shared/ui/card";
import { PhotoUpload } from "./photo-upload";
import { LectureLogForm } from "./lecture-log-form";
import { CaptureNoteForm } from "./capture-note-form";
import { ManualTextForm } from "./manual-text-form";

type Mode = "menu" | "photo" | "lecture" | "capture" | "manual";

export function UploadSheet({ trigger }: { trigger: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>("menu");
  const reset = () => setMode("menu");

  return (
    <Sheet onOpenChange={(open) => !open && reset()}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-xl pb-xl">
        <SheetHeader>
          <SheetTitle>공부한 흔적 추가</SheetTitle>
        </SheetHeader>
        {mode === "menu" && (
          <div className="space-y-md mt-base">
            <OptionCard icon={<Camera />} title="문제사진 업로드" desc="풀었던 문제 사진" onClick={() => setMode("photo")} />
            <OptionCard icon={<Video />} title="인강 시청 기록" desc="강의명 + 단원 입력" onClick={() => setMode("lecture")} />
            <OptionCard icon={<StickyNote />} title="캡처 + 메모" desc="헷갈린 장면 1장" onClick={() => setMode("capture")} />
            <OptionCard icon={<Type />} title="직접 입력 (사진 어려울 때)" desc="텍스트로 문제 입력" onClick={() => setMode("manual")} muted />
          </div>
        )}
        {mode === "photo" && <PhotoUpload onBack={reset} />}
        {mode === "lecture" && <LectureLogForm onBack={reset} />}
        {mode === "capture" && <CaptureNoteForm onBack={reset} />}
        {mode === "manual" && <ManualTextForm onBack={reset} />}
      </SheetContent>
    </Sheet>
  );
}

function OptionCard({ icon, title, desc, onClick, muted = false }: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
  muted?: boolean;
}) {
  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer hover:bg-bg-soft transition-colors ${muted ? "opacity-70" : ""}`}
    >
      <div className="flex items-center gap-md">
        <div className="w-12 h-12 rounded-pill bg-accent-mintLight flex items-center justify-center text-primary">
          {icon}
        </div>
        <div>
          <h3 className="text-h3">{title}</h3>
          <p className="text-body text-text-secondary">{desc}</p>
        </div>
      </div>
    </Card>
  );
}
```

- [ ] **Step 2: `photo-upload.tsx`**

```tsx
// apps/web/src/features/upload-source/ui/photo-upload.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/shared/lib/supabase/client";
import { createSource, runIntakePipeline } from "@/entities/source/api";
import { Button } from "@/shared/ui/button";

export function PhotoUpload({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("로그인이 필요합니다."); setUploading(false); return; }

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/${Date.now()}.${ext}`;

    const { error: storageError } = await supabase.storage
      .from("uploads")
      .upload(path, file, { contentType: file.type });
    if (storageError) {
      setError("업로드 실패. 다시 시도해주세요.");
      setUploading(false);
      return;
    }

    const source = await createSource({
      source_type: "problem_photo",
      raw_url: path,
      storage_policy: "temporary",
      metadata: { student_note: note },
    });
    if (!source) {
      setError("저장 실패.");
      setUploading(false);
      return;
    }

    // 비동기 파이프라인 트리거 (사용자는 결과 페이지에서 polling)
    runIntakePipeline(source.source_id);

    router.push(`/sources/${source.source_id}/analysis`);
  }

  return (
    <div className="space-y-md mt-base">
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        capture="environment"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="w-full text-body"
      />
      {file && (
        <img
          src={URL.createObjectURL(file)}
          alt="미리보기"
          className="rounded-xl max-h-64 mx-auto"
        />
      )}
      <textarea
        placeholder="헷갈린 점이 있으면 적어주세요 (선택)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="w-full rounded-lg border border-border-soft p-base min-h-[60px] text-body"
      />
      {error && <p className="text-body text-danger">{error}</p>}
      <div className="flex gap-sm">
        <Button variant="secondary" onClick={onBack}>뒤로</Button>
        <Button onClick={handleUpload} disabled={!file || uploading} className="flex-1">
          {uploading ? "업로드 중..." : "분석 시작"}
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: `lecture-log-form.tsx`**

```tsx
// apps/web/src/features/upload-source/ui/lecture-log-form.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSource, runIntakePipeline } from "@/entities/source/api";
import { Button } from "@/shared/ui/button";

export function LectureLogForm({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const [form, setForm] = useState({
    lecture_title: "",
    subject_hint: "수학",
    unit: "",
    study_time_minutes: 30,
    student_note: "",
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    setSaving(true);
    const source = await createSource({
      source_type: "lecture_log",
      raw_text: form.student_note,
      storage_policy: "derived_only",
      metadata: {
        lecture_title: form.lecture_title,
        subject_hint: form.subject_hint,
        unit: form.unit,
        study_time_minutes: form.study_time_minutes,
      },
    });
    if (source) {
      runIntakePipeline(source.source_id);
      router.push(`/sources/${source.source_id}/analysis`);
    } else {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-md mt-base">
      <input
        placeholder="강의명 (예: 현우진 수열 3강)"
        value={form.lecture_title}
        onChange={(e) => setForm({ ...form, lecture_title: e.target.value })}
        className="w-full h-12 px-base rounded-lg border border-border-soft text-body"
      />
      <select
        value={form.subject_hint}
        onChange={(e) => setForm({ ...form, subject_hint: e.target.value })}
        className="w-full h-12 px-base rounded-lg border border-border-soft text-body"
      >
        <option>수학</option><option>국어</option><option>영어</option>
        <option>사탐</option><option>과탐</option>
      </select>
      <input
        placeholder="단원 (예: 수열)"
        value={form.unit}
        onChange={(e) => setForm({ ...form, unit: e.target.value })}
        className="w-full h-12 px-base rounded-lg border border-border-soft text-body"
      />
      <input
        type="number"
        placeholder="공부 시간(분)"
        value={form.study_time_minutes}
        onChange={(e) => setForm({ ...form, study_time_minutes: Number(e.target.value) || 0 })}
        className="w-full h-12 px-base rounded-lg border border-border-soft text-body"
      />
      <textarea
        placeholder="헷갈린 점 (선택)"
        value={form.student_note}
        onChange={(e) => setForm({ ...form, student_note: e.target.value })}
        className="w-full rounded-lg border border-border-soft p-base min-h-[80px] text-body"
      />
      <div className="flex gap-sm">
        <Button variant="secondary" onClick={onBack}>뒤로</Button>
        <Button onClick={handleSubmit} disabled={!form.lecture_title || saving} className="flex-1">
          {saving ? "저장 중..." : "기록 저장"}
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: `capture-note-form.tsx`** (사진 + 메모 결합)

```tsx
// apps/web/src/features/upload-source/ui/capture-note-form.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/shared/lib/supabase/client";
import { createSource, runIntakePipeline } from "@/entities/source/api";
import { Button } from "@/shared/ui/button";

export function CaptureNoteForm({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  async function handleSubmit() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    let path: string | undefined;
    if (file) {
      const ext = file.name.split(".").pop() ?? "jpg";
      path = `${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("uploads").upload(path, file, { contentType: file.type });
      if (error) { setSaving(false); return; }
    }

    const source = await createSource({
      source_type: "capture_note",
      raw_url: path,
      raw_text: note,
      storage_policy: "derived_only",
      metadata: { student_note: note },
    });
    if (source) {
      runIntakePipeline(source.source_id);
      router.push(`/sources/${source.source_id}/analysis`);
    } else {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-md mt-base">
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="w-full text-body"
      />
      {file && (
        <img src={URL.createObjectURL(file)} alt="미리보기" className="rounded-xl max-h-48 mx-auto" />
      )}
      <textarea
        required
        placeholder="이 캡처에서 헷갈린 점을 적어주세요"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="w-full rounded-lg border border-border-soft p-base min-h-[100px] text-body"
      />
      <div className="flex gap-sm">
        <Button variant="secondary" onClick={onBack}>뒤로</Button>
        <Button onClick={handleSubmit} disabled={!note.trim() || saving} className="flex-1">
          {saving ? "저장 중..." : "저장"}
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: `manual-text-form.tsx`** (OCR 폴백)

```tsx
// apps/web/src/features/upload-source/ui/manual-text-form.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSource, runIntakePipeline } from "@/entities/source/api";
import { Button } from "@/shared/ui/button";

export function ManualTextForm({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [subject, setSubject] = useState("수학");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    setSaving(true);
    const source = await createSource({
      source_type: "manual_text",
      raw_text: text,
      storage_policy: "derived_only",
      metadata: { subject_hint: subject },
    });
    if (source) {
      runIntakePipeline(source.source_id);
      router.push(`/sources/${source.source_id}/analysis`);
    } else {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-md mt-base">
      <p className="text-body text-text-secondary">
        사진 OCR이 잘 안 될 때 직접 텍스트로 입력하세요. P3 정확도 게이트 미달 시 메인 플로우로 활용 가능.
      </p>
      <textarea
        placeholder="문제 본문을 그대로 입력..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full rounded-lg border border-border-soft p-base min-h-[200px] text-body"
      />
      <select
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="w-full h-12 px-base rounded-lg border border-border-soft text-body"
      >
        <option>수학</option><option>국어</option><option>영어</option>
        <option>사탐</option><option>과탐</option>
      </select>
      <div className="flex gap-sm">
        <Button variant="secondary" onClick={onBack}>뒤로</Button>
        <Button onClick={handleSubmit} disabled={!text.trim() || saving} className="flex-1">
          {saving ? "저장 중..." : "분석 시작"}
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: 데모 페이지에 트리거 추가**

```tsx
// apps/web/src/app/_demo/page.tsx (P1에서 만든 데모 페이지 수정)
import { UploadSheet } from "@/features/upload-source/ui/upload-sheet";
import { Button } from "@/shared/ui/button";

export default function DemoPage() {
  return (
    <div className="p-xl space-y-base">
      <UploadSheet trigger={<Button>📷 공부한 흔적 추가</Button>} />
    </div>
  );
}
```

- [ ] **Step 7: 시각 검증 + Commit**

```bash
cd apps/web && pnpm dev
# 브라우저 localhost:3000/_demo → 시트 열림 → 4개 옵션 → 각 폼 → 업로드 → /sources/<id>/analysis 리다이렉트
git add apps/web/src/features/upload-source/ apps/web/src/app/_demo/
git commit -m "feat(p2): 업로드 시트 UI (4-옵션) + 4종 폼 + manual 폴백"
```

---

## Task 8: T8 — Compliance Gate 시나리오 테스트 (5종)

**Files:** Create `eval/p2/compliance-cases.json`, `eval/p2/runner.ts`, `scripts/eval-p2.ts`

> CLAUDE.md §4 Eval Harness 7대 원칙 적용 (P3 sub-plan T9와 동일 패턴).

- [ ] **Step 1: 골든셋 작성** (5종 시나리오 + 실제 시드 이미지)

```json
// eval/p2/compliance-cases.json
[
  {
    "case_id": "p2-c-001-student-photo",
    "input": { "source_type": "problem_photo", "image_path": "eval/p2/images/001-student-photo.png" },
    "expected": { "action": "pass", "copyright_risk": "low", "contains_personal_info": false },
    "description": "학생 본인이 풀이까지 작성한 문제 사진 (개인 학습용)"
  },
  {
    "case_id": "p2-c-002-textbook-mass",
    "input": { "source_type": "problem_photo", "image_path": "eval/p2/images/002-textbook-page.png" },
    "expected": { "action": "admin_review", "copyright_risk": "medium" },
    "description": "문제집 한 페이지 통째로 업로드"
  },
  {
    "case_id": "p2-c-003-paid-lecture",
    "input": { "source_type": "capture_note", "image_path": "eval/p2/images/003-paid-lecture.png" },
    "expected": { "action": "derived_only", "contains_paid_lecture": true },
    "description": "유료 인강 판서 캡처"
  },
  {
    "case_id": "p2-c-004-pii-name",
    "input": { "source_type": "problem_photo", "image_path": "eval/p2/images/004-with-name.png" },
    "expected": { "action": "redact", "contains_personal_info": true },
    "description": "학생 이름/학교가 사진에 노출됨"
  },
  {
    "case_id": "p2-c-005-exam-original",
    "input": { "source_type": "problem_photo", "image_path": "eval/p2/images/005-exam-original.png" },
    "expected": { "action": "reject", "contains_exam_original": true },
    "description": "수능 기출 원문 그대로"
  }
]
```

이미지 시드(`eval/p2/images/`)는 Mike가 준비 또는 Midjourney/직접 촬영. P2 실행 전까지 Mike가 준비.

- [ ] **Step 2: `eval/p2/runner.ts`**

```ts
// eval/p2/runner.ts
import { readFileSync, writeFileSync, appendFileSync, fsyncSync, openSync, closeSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const SEED = 42;
const TIMEOUT_MS = 30_000;
const RESULTS_DIR = "eval/p2/results";
const ts = new Date().toISOString().replace(/[:.]/g, "-");
const out = join(RESULTS_DIR, `run-${ts}.jsonl`);

if (!existsSync(RESULTS_DIR)) mkdirSync(RESULTS_DIR, { recursive: true });
const cases = JSON.parse(readFileSync("eval/p2/compliance-cases.json", "utf8"));
const fd = openSync(out, "a");
const append = (s: string) => { appendFileSync(fd, s + "\n"); fsyncSync(fd); };

const total = cases.length;
let pass = 0, fail = 0;
const t0 = Date.now();
console.log(`[start] cases=${total} seed=${SEED} out=${out}`);

for (let i = 0; i < cases.length; i++) {
  const c = cases[i];
  const t = Date.now();
  let result: any;
  try {
    const predicted = await Promise.race([
      runCase(c),
      new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), TIMEOUT_MS)),
    ]);
    const passCase = evaluate(predicted, c.expected);
    result = { case_id: c.case_id, pass: passCase, predicted, expected: c.expected, elapsed_ms: Date.now() - t };
    passCase ? pass++ : fail++;
  } catch (e) {
    result = { case_id: c.case_id, pass: false, error: String(e), elapsed_ms: Date.now() - t };
    fail++;
  }
  append(JSON.stringify(result));
  console.log(`[${i+1}/${total}] ${c.case_id} ${result.pass?"PASS":"FAIL"} (${result.elapsed_ms}ms)`);
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

async function runCase(c: any) {
  const res = await fetch(`${process.env.SUPABASE_URL}/functions/v1/compliance-gate`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ image_path: c.input.image_path, dry_run: true }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

function evaluate(predicted: any, expected: any): boolean {
  if (predicted?.action !== expected.action) return false;
  for (const k of Object.keys(expected)) {
    if (k !== "action" && predicted[k] !== expected[k]) return false;
  }
  return true;
}
```

- [ ] **Step 3: `scripts/eval-p2.ts` + package.json 스크립트**

```ts
// scripts/eval-p2.ts
import "../eval/p2/runner.ts";
```

```json
// apps/web/package.json scripts에 추가
{ "scripts": { "eval:p2": "tsx scripts/eval-p2.ts" } }
```

- [ ] **Step 4: 실행 + 게이트 확인**

```bash
pnpm eval:p2
# Expected: action_accuracy ≥ 0.8 (5종 중 4개 이상)
```

- [ ] **Step 5: Commit**

```bash
git add eval/p2/ scripts/eval-p2.ts apps/web/package.json
git commit -m "feat(p2-eval): Compliance Gate 5종 시나리오 + 게이트 (≥80%)"
```

---

## P2 종료 시 체크포인트

| 항목 | 기준 | 미달 시 |
|---|---|---|
| 4개 폼 (사진/인강/캡처+메모/manual) 통과 | 각 폼 1회 업로드 → external_sources row 생성 → /analysis 리다이렉트 | 폼 디버그 |
| Compliance Gate 5종 시나리오 정확도 | ≥ 80% (4/5) | prompt 튜닝 |
| Storage RLS 보안 | 다른 user_id path 접근 시 차단 | 정책 수정 |
| 자동 삭제 cron 동작 | 시드 데이터로 수동 실행 후 raw_url null 처리 | cron 디버그 |
| security-check skill 통과 | OWASP + RLS 점검 통과 | 보안 보강 |

게이트 통과 후 P3 AI Pipeline 진입.

---

## 위험 + 롤백

| 위험 | 발생 시 행동 |
|---|---|
| Storage 5MB 제한 초과 | 클라이언트 측 resize (max 1920px long edge) — P5에서 추가 |
| 사용자가 다른 사용자 path 접근 시도 | RLS가 자동 차단 — 위반 시도 audit 로깅 (P8 audit_logs) |
| Compliance Gate API 지연 / 실패 | 폼 응답 비동기 처리 (이미 적용) — 분석 페이지에서 polling |
| HEIC 이미지 처리 실패 (iOS) | next.config images에 heic 변환 또는 클라이언트 측 sharp 사용 |
| 악의적 대량 업로드 (DoS) | Supabase Free tier rate limit + 향후 미들웨어로 사용자별 분당 N개 제한 |

---

## 변경 이력

| 버전 | 일자 | 내용 |
|---|---|---|
| **v1.0** | **2026-05-14** | **초안. 8개 task (테이블 2종 + Storage bucket + Edge Function 2종 + entity + 시트 UI 4-옵션 + Eval 5종). Compliance Gate 게이트 80%. Manual 폴백으로 P3 OCR 게이트 미달 대비.** |
