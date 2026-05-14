# 순공대장 MVP 1차 — P3 AI Pipeline Sub-Plan ⚠️ 가장 위험

> **For agentic workers:** `superpowers:subagent-driven-development` (권장) 또는 `superpowers:executing-plans`로 진행. AI 호출 관련 모든 task는 `vercel:ai-sdk` skill을 먼저 invoke하여 SDK 패턴/캐싱/모델 ID 최신 정보 확인.
> **환경 트랙 보류 중**: Mike의 명시 OK 전에는 Anthropic API 키 / Mathpix 키 / Supabase Edge Function 배포는 실행 보류. 본 문서는 OK 시 즉시 실행 가능한 상태로 잠근다.
> **진입 게이트**: 본 P3 종료 시 수학 수열 점화식 10장 골든셋에서 **subject 정확도 ≥ 90%, unit/topic 정확도 ≥ 70%** 미만이면 P4 진입 금지 + 재계획.

**Goal:** P2에서 업로드된 학습 소스를 (1) 과목 라우팅 → (2) OCR/파싱 → (3) 학습 객체화 → (4) 오답 원인 태깅까지 끌고가는 AI Agent 파이프라인을 구축. 학생에게는 "AI가 이렇게 분석했어요. 맞나요?" 카드로 노출.

**Architecture:**
- Supabase Edge Functions (Deno 런타임) 4개: `route-subject`, `parse-ocr`, `build-learning-object`, `tag-wrong-reason`
- Anthropic Claude API: Haiku 4.5(라우팅/태깅, 빠름/저렴) + Sonnet 4.6(OCR Vision, 품질)
- Mathpix OCR (옵션, ENABLE_MATHPIX flag): 수식 영역만 처리
- 폴백: 학생 직접 텍스트 입력 manual 모드 (P2의 업로드 UI에 옵션으로 노출)
- Vercel AI SDK (`ai`, `@ai-sdk/anthropic`) — `generateObject` + Zod schema로 구조화 출력 강제
- 호출 비용 절감: prompt caching 적용 (system prompt 캐싱)

**Tech Stack:** Deno 1.x (Supabase Edge), Vercel AI SDK v3+, `@ai-sdk/anthropic`, Zod, Supabase JS Admin client.

**Pre-requisites (환경 트랙 OK 후):**
- Anthropic API 키 (SparkClaw 인프라 혜택 또는 직접 결제 — Mike 결정)
- Mathpix 키 (옵션) — P3 종료 시점 A/B 결과 따라 결정
- Supabase Edge Function 배포 권한
- P1 (Auth + users) + P2 (external_sources + compliance) 완료

---

## File Structure

```
soongong/
├── supabase/
│   ├── migrations/
│   │   ├── 0003_subject_routing.sql
│   │   ├── 0004_learning_objects.sql
│   │   └── 0005_student_memory.sql
│   └── functions/
│       ├── _shared/
│       │   ├── ai.ts                 # Anthropic 클라이언트 + 공통 prompt
│       │   ├── schemas.ts            # Zod 출력 스키마 4종
│       │   └── supabase.ts           # Admin client
│       ├── route-subject/index.ts
│       ├── parse-ocr/index.ts
│       ├── build-learning-object/index.ts
│       └── tag-wrong-reason/index.ts
├── apps/web/src/
│   ├── features/ai-analysis-result/  # 분석 결과 카드 UI
│   └── entities/learning-object/
├── eval/
│   └── p3/
│       ├── golden/                   # 10장 점화식 골든셋 (image + ground truth)
│       │   ├── 001.json
│       │   └── ...010.json
│       ├── runner.ts                 # harness (CLAUDE.md §4 7대 원칙)
│       └── results/                  # JSONL append 결과
└── scripts/
    └── eval-p3.ts                    # eval CLI 진입점
```

---

## Task 1: T1 — `subject_routing_results` 테이블 + RLS

**Files:**
- Create: `supabase/migrations/0003_subject_routing.sql`

- [ ] **Step 1: 마이그레이션 SQL 작성**

```sql
-- supabase/migrations/0003_subject_routing.sql
create table public.subject_routing_results (
  routing_id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.external_sources(source_id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  source_type text not null,
  detected_subject text not null
    check (detected_subject in ('수학','국어','영어','사탐','과탐','미확정')),
  subject_confidence numeric(4,3) not null check (subject_confidence between 0 and 1),
  subject_group text not null
    check (subject_group in ('math','korean','english','social','science','unknown')),
  unit_candidates jsonb not null default '[]',
  topic_candidates jsonb not null default '[]',
  recommended_agents text[] not null default '{}',
  needs_user_confirmation boolean not null default false,
  user_corrected_subject text,
  final_subject text,
  created_at timestamptz not null default now()
);

create index subject_routing_user_idx on public.subject_routing_results (user_id, created_at desc);
create index subject_routing_source_idx on public.subject_routing_results (source_id);

alter table public.subject_routing_results enable row level security;

create policy "subject_routing: self read"
  on public.subject_routing_results for select
  using (auth.uid() = user_id);

create policy "subject_routing: self update (correction only)"
  on public.subject_routing_results for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- service_role (Edge Function)은 RLS bypass 됨
```

- [ ] **Step 2: 마이그레이션 실행 + 검증**

```bash
pnpm dlx supabase db push
pnpm dlx supabase db inspect --schema public
# Expected: subject_routing_results 테이블 + RLS 정책 3개
```

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/0003_subject_routing.sql
git commit -m "feat(p3): subject_routing_results 테이블 + RLS"
```

---

## Task 2: T2 — `parsed_learning_objects` + `student_memory_items` 테이블 + RLS

**Files:**
- Create: `supabase/migrations/0004_learning_objects.sql`
- Create: `supabase/migrations/0005_student_memory.sql`

- [ ] **Step 1: `0004_learning_objects.sql`**

```sql
-- supabase/migrations/0004_learning_objects.sql
create table public.parsed_learning_objects (
  object_id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.external_sources(source_id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  object_type text not null
    check (object_type in ('question','concept_note','lecture_concept','wrong_answer','type_pattern')),
  subject text not null,
  unit text,
  topic text,
  question_type text,
  difficulty_level text check (difficulty_level in ('L1','L2','L3','L4','L5')),
  extracted_text text,
  student_note text,
  detected_wrong_reason text[],
  review_priority text not null default 'medium'
    check (review_priority in ('low','medium','high')),
  confidence_score numeric(4,3),
  reviewer_status text not null default 'pending'
    check (reviewer_status in ('pending','approved','corrected','rejected')),
  created_at timestamptz not null default now()
);

create index plo_user_subject_idx on public.parsed_learning_objects (user_id, subject, created_at desc);
create index plo_unit_topic_idx on public.parsed_learning_objects (unit, topic);
create index plo_review_priority_idx on public.parsed_learning_objects (review_priority) where reviewer_status = 'pending';

alter table public.parsed_learning_objects enable row level security;

create policy "plo: self read"
  on public.parsed_learning_objects for select
  using (auth.uid() = user_id);

create policy "plo: self correct"
  on public.parsed_learning_objects for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

- [ ] **Step 2: `0005_student_memory.sql`**

```sql
-- supabase/migrations/0005_student_memory.sql
create table public.student_memory_items (
  memory_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  object_id uuid references public.parsed_learning_objects(object_id) on delete set null,
  concept_key text not null,
  wrong_reason text,
  mastery_score smallint not null default 0 check (mastery_score between 0 and 100),
  recent_accuracy_5 numeric(4,3),
  hint_rate_5 numeric(4,3),
  confidence_avg numeric(3,2),
  next_review_at timestamptz,
  forgetting_risk text not null default 'low'
    check (forgetting_risk in ('low','medium','high')),
  updated_at timestamptz not null default now(),
  unique (user_id, concept_key)
);

create index smi_due_idx on public.student_memory_items (user_id, next_review_at)
  where forgetting_risk in ('medium','high');

alter table public.student_memory_items enable row level security;

create policy "smi: self read"
  on public.student_memory_items for select
  using (auth.uid() = user_id);
-- write는 service_role(Edge Function)만 허용
```

- [ ] **Step 3: 마이그레이션 실행 + Commit**

```bash
pnpm dlx supabase db push
git add supabase/migrations/0004_learning_objects.sql supabase/migrations/0005_student_memory.sql
git commit -m "feat(p3): parsed_learning_objects + student_memory_items 테이블 + RLS"
```

---

## Task 3: T3 — 공통 Edge Function 유틸 (`_shared/`)

**Files:**
- Create: `supabase/functions/_shared/ai.ts`
- Create: `supabase/functions/_shared/schemas.ts`
- Create: `supabase/functions/_shared/supabase.ts`

- [ ] **Step 1: `_shared/ai.ts`** — Anthropic 클라이언트 + prompt caching

```ts
// supabase/functions/_shared/ai.ts
import { anthropic } from "npm:@ai-sdk/anthropic";
import { generateObject, generateText } from "npm:ai";

export function getModel(tier: "fast" | "quality") {
  return tier === "fast"
    ? anthropic("claude-haiku-4-5-20251001")
    : anthropic("claude-sonnet-4-6");
}

// system prompt에 cache_control 박아 토큰 절감
export const CACHED_SYSTEM = {
  type: "text" as const,
  text: `너는 한국 수능 학습 분석 AI다. 학생이 올린 문제사진/인강기록/캡처를 받아
과목·단원·유형·오답원인·난이도를 분석한다. 다음 원칙을 지킨다:
1. 한국 교육과정 (2015 개정) 기준
2. 과목 5개로만 분류: 수학/국어/영어/사탐/과탐
3. 확신 없으면 needs_user_confirmation=true
4. 한국어로 응답`,
  experimental_providerMetadata: {
    anthropic: { cacheControl: { type: "ephemeral" } },
  },
};

export { generateObject, generateText };
```

- [ ] **Step 2: `_shared/schemas.ts`** — Zod 출력 스키마 4종

```ts
// supabase/functions/_shared/schemas.ts
import { z } from "npm:zod";

export const subjectRoutingSchema = z.object({
  detected_subject: z.enum(["수학","국어","영어","사탐","과탐","미확정"]),
  subject_confidence: z.number().min(0).max(1),
  subject_group: z.enum(["math","korean","english","social","science","unknown"]),
  unit_candidates: z.array(z.object({
    unit: z.string(),
    topic: z.string(),
    confidence: z.number().min(0).max(1),
  })),
  needs_user_confirmation: z.boolean(),
  reason: z.string().max(200),
});

export const ocrParsedSchema = z.object({
  stem: z.string(),
  choices: z.array(z.string()).optional(),
  conditions: z.array(z.string()),
  figures: z.array(z.string()),
  student_marks: z.array(z.string()),
  handwritten_solution: z.string().nullable(),
  contains_math_formula: z.boolean(),
});

export const learningObjectSchema = z.object({
  subject: z.string(),
  unit: z.string(),
  topic: z.string(),
  question_type: z.string(),
  difficulty_level: z.enum(["L1","L2","L3","L4","L5"]),
  wrong_reason_candidate: z.array(z.string()),
  review_priority: z.enum(["low","medium","high"]),
  confidence_score: z.number().min(0).max(1),
});

export const wrongReasonSchema = z.object({
  primary_reason: z.enum([
    "개념미흡","계산실수","조건누락","인덱스혼동","선지착각","시간부족","기타",
  ]),
  secondary_reasons: z.array(z.string()).max(3),
  evidence: z.string().max(200),
  recommended_variation: z.enum(["V0","V1","V2","V3","V4","V5"]),
});
```

- [ ] **Step 3: `_shared/supabase.ts`**

```ts
// supabase/functions/_shared/supabase.ts
import { createClient } from "npm:@supabase/supabase-js@2";

export function getAdminClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add supabase/functions/_shared/
git commit -m "feat(p3): Edge Function 공통 유틸 (AI client + Zod schemas + Supabase admin)"
```

---

## Task 4: T4 — `route-subject` Edge Function (Subject Routing Agent)

**Files:**
- Create: `supabase/functions/route-subject/index.ts`

- [ ] **Step 1: Function 작성**

```ts
// supabase/functions/route-subject/index.ts
import { getModel, generateObject, CACHED_SYSTEM } from "../_shared/ai.ts";
import { subjectRoutingSchema } from "../_shared/schemas.ts";
import { getAdminClient } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const { source_id } = await req.json();
  if (!source_id) return new Response("source_id required", { status: 400 });

  const supabase = getAdminClient();

  // 1) source 로드
  const { data: source, error } = await supabase
    .from("external_sources")
    .select("source_id, user_id, source_type, raw_text, metadata")
    .eq("source_id", source_id)
    .single();
  if (error || !source) return new Response("source not found", { status: 404 });

  // 2) 라우팅 추론
  const { object } = await generateObject({
    model: getModel("fast"),
    schema: subjectRoutingSchema,
    messages: [
      { role: "system", content: [CACHED_SYSTEM] },
      {
        role: "user",
        content: JSON.stringify({
          source_type: source.source_type,
          user_subject_hint: source.metadata?.subject_hint ?? null,
          ocr_text: (source.raw_text ?? "").slice(0, 2000),
          lecture_title: source.metadata?.lecture_title ?? null,
          student_note: source.metadata?.student_note ?? null,
        }),
      },
    ],
  });

  // 3) 결과 저장
  const recommended = recommendAgents(object.subject_group);
  const { data: row, error: insertError } = await supabase
    .from("subject_routing_results")
    .insert({
      source_id: source.source_id,
      user_id: source.user_id,
      source_type: source.source_type,
      detected_subject: object.detected_subject,
      subject_confidence: object.subject_confidence,
      subject_group: object.subject_group,
      unit_candidates: object.unit_candidates,
      recommended_agents: recommended,
      needs_user_confirmation:
        object.needs_user_confirmation || object.subject_confidence < 0.6,
    })
    .select()
    .single();

  if (insertError) return new Response(insertError.message, { status: 500 });
  return Response.json(row);
});

function recommendAgents(group: string): string[] {
  const common = ["parse-ocr", "build-learning-object"];
  if (group === "math") return [...common, "tag-wrong-reason"];
  if (group === "english") return [...common];
  return common;
}
```

- [ ] **Step 2: 로컬 테스트** (Supabase 로컬 dev)

```bash
pnpm dlx supabase functions serve route-subject --no-verify-jwt
# 다른 터미널:
curl -X POST http://localhost:54321/functions/v1/route-subject \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"source_id":"<seed-source-id>"}'
# Expected: {detected_subject: "수학", subject_confidence: 0.94, ...}
```

- [ ] **Step 3: 배포 + Commit**

```bash
pnpm dlx supabase functions deploy route-subject
git add supabase/functions/route-subject/
git commit -m "feat(p3): route-subject Edge Function — Subject Routing Agent"
```

---

## Task 5: T5 — `parse-ocr` Edge Function (Vision + Mathpix 폴백)

**Files:**
- Create: `supabase/functions/parse-ocr/index.ts`

- [ ] **Step 1: Function 작성**

```ts
// supabase/functions/parse-ocr/index.ts
import { getModel, generateObject, CACHED_SYSTEM } from "../_shared/ai.ts";
import { ocrParsedSchema } from "../_shared/schemas.ts";
import { getAdminClient } from "../_shared/supabase.ts";

const ENABLE_MATHPIX = Deno.env.get("ENABLE_MATHPIX") === "true";

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const { source_id } = await req.json();
  const supabase = getAdminClient();

  const { data: source } = await supabase
    .from("external_sources")
    .select("source_id, user_id, raw_url, source_type")
    .eq("source_id", source_id)
    .single();
  if (!source?.raw_url) return new Response("no raw_url", { status: 404 });

  // 1) Storage에서 signed URL 발급
  const { data: signed } = await supabase.storage
    .from("uploads")
    .createSignedUrl(source.raw_url, 60);
  if (!signed?.signedUrl) return new Response("storage error", { status: 500 });

  // 2) Vision LLM 호출 (Sonnet 4.6 — Vision)
  const { object } = await generateObject({
    model: getModel("quality"),
    schema: ocrParsedSchema,
    messages: [
      { role: "system", content: [CACHED_SYSTEM] },
      {
        role: "user",
        content: [
          { type: "text", text: "이 문제 이미지에서 문제 본문, 선지, 조건, 그림, 학생 표시(밑줄/동그라미), 손글씨 풀이를 분리해서 JSON으로 추출해라." },
          { type: "image", image: new URL(signed.signedUrl) },
        ],
      },
    ],
  });

  // 3) Mathpix 폴백 (수식 영역만, 옵션)
  let mathpixLatex: string | null = null;
  if (ENABLE_MATHPIX && object.contains_math_formula) {
    mathpixLatex = await callMathpix(signed.signedUrl);
  }

  // 4) parsed_learning_objects에 임시 저장 (T6에서 보강)
  return Response.json({
    parsed: object,
    mathpix_latex: mathpixLatex,
  });
});

async function callMathpix(imageUrl: string): Promise<string | null> {
  const appId = Deno.env.get("MATHPIX_APP_ID");
  const appKey = Deno.env.get("MATHPIX_APP_KEY");
  if (!appId || !appKey) return null;
  try {
    const res = await fetch("https://api.mathpix.com/v3/text", {
      method: "POST",
      headers: { "app_id": appId, "app_key": appKey, "Content-Type": "application/json" },
      body: JSON.stringify({ src: imageUrl, formats: ["latex_styled"] }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.latex_styled ?? null;
  } catch {
    return null;
  }
}
```

- [ ] **Step 2: 환경 변수 설정**

```bash
pnpm dlx supabase secrets set ANTHROPIC_API_KEY=<key>
pnpm dlx supabase secrets set ENABLE_MATHPIX=false  # MVP 1차 초기에는 false
# (P3 끝 A/B 후 true로 전환 가능)
```

- [ ] **Step 3: 배포 + 테스트 + Commit**

```bash
pnpm dlx supabase functions deploy parse-ocr
# 테스트: 점화식 문제 이미지 1장으로 curl
git add supabase/functions/parse-ocr/
git commit -m "feat(p3): parse-ocr Edge Function — Vision LLM + Mathpix 폴백"
```

---

## Task 6: T6 — `build-learning-object` Edge Function

**Files:**
- Create: `supabase/functions/build-learning-object/index.ts`

- [ ] **Step 1: Function 작성**

```ts
// supabase/functions/build-learning-object/index.ts
import { getModel, generateObject, CACHED_SYSTEM } from "../_shared/ai.ts";
import { learningObjectSchema } from "../_shared/schemas.ts";
import { getAdminClient } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const { source_id, routing_id, parsed_ocr } = await req.json();
  const supabase = getAdminClient();

  const { data: routing } = await supabase
    .from("subject_routing_results")
    .select("detected_subject, unit_candidates, user_id")
    .eq("routing_id", routing_id)
    .single();
  if (!routing) return new Response("routing not found", { status: 404 });

  const { object } = await generateObject({
    model: getModel("fast"),
    schema: learningObjectSchema,
    messages: [
      { role: "system", content: [CACHED_SYSTEM] },
      {
        role: "user",
        content: JSON.stringify({
          subject_hint: routing.detected_subject,
          unit_hints: routing.unit_candidates,
          stem: parsed_ocr.stem,
          choices: parsed_ocr.choices,
          conditions: parsed_ocr.conditions,
        }),
      },
    ],
  });

  const { data: row, error } = await supabase
    .from("parsed_learning_objects")
    .insert({
      source_id,
      user_id: routing.user_id,
      object_type: "question",
      subject: object.subject,
      unit: object.unit,
      topic: object.topic,
      question_type: object.question_type,
      difficulty_level: object.difficulty_level,
      extracted_text: parsed_ocr.stem,
      detected_wrong_reason: object.wrong_reason_candidate,
      review_priority: object.review_priority,
      confidence_score: object.confidence_score,
      reviewer_status: "pending",
    })
    .select()
    .single();
  if (error) return new Response(error.message, { status: 500 });
  return Response.json(row);
});
```

- [ ] **Step 2: 배포 + Commit**

```bash
pnpm dlx supabase functions deploy build-learning-object
git add supabase/functions/build-learning-object/
git commit -m "feat(p3): build-learning-object Edge Function"
```

---

## Task 7: T7 — `tag-wrong-reason` Edge Function

**Files:**
- Create: `supabase/functions/tag-wrong-reason/index.ts`

- [ ] **Step 1: Function 작성**

```ts
// supabase/functions/tag-wrong-reason/index.ts
import { getModel, generateObject, CACHED_SYSTEM } from "../_shared/ai.ts";
import { wrongReasonSchema } from "../_shared/schemas.ts";
import { getAdminClient } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  const { object_id, student_answer, correct_answer, student_solution } = await req.json();
  const supabase = getAdminClient();

  const { data: obj } = await supabase
    .from("parsed_learning_objects")
    .select("subject, topic, extracted_text")
    .eq("object_id", object_id)
    .single();
  if (!obj) return new Response("object not found", { status: 404 });

  const { object: tag } = await generateObject({
    model: getModel("fast"),
    schema: wrongReasonSchema,
    messages: [
      { role: "system", content: [CACHED_SYSTEM] },
      {
        role: "user",
        content: JSON.stringify({
          subject: obj.subject,
          topic: obj.topic,
          question: obj.extracted_text,
          correct_answer,
          student_answer,
          student_solution: student_solution ?? null,
        }),
      },
    ],
  });

  await supabase
    .from("parsed_learning_objects")
    .update({ detected_wrong_reason: [tag.primary_reason, ...tag.secondary_reasons] })
    .eq("object_id", object_id);

  return Response.json(tag);
});
```

- [ ] **Step 2: 배포 + Commit**

```bash
pnpm dlx supabase functions deploy tag-wrong-reason
git add supabase/functions/tag-wrong-reason/
git commit -m "feat(p3): tag-wrong-reason Edge Function"
```

---

## Task 8: T8 — AI 분석 결과 카드 UI

**Files:**
- Create: `apps/web/src/features/ai-analysis-result/`

- [ ] **Step 1: 분석 결과 카드 컴포넌트**

```tsx
// apps/web/src/features/ai-analysis-result/ui/result-card.tsx
"use client";
import { useState } from "react";
import { Card } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { createClient } from "@/shared/lib/supabase/client";

type Props = {
  routingId: string;
  initial: {
    detected_subject: string;
    unit_candidates: { unit: string; topic: string; confidence: number }[];
    needs_user_confirmation: boolean;
  };
};

export function AnalysisResultCard({ routingId, initial }: Props) {
  const [confirmed, setConfirmed] = useState(false);
  const [editing, setEditing] = useState(false);
  const [subject, setSubject] = useState(initial.detected_subject);
  const supabase = createClient();

  async function confirm(finalSubject: string) {
    await supabase
      .from("subject_routing_results")
      .update({ final_subject: finalSubject, user_corrected_subject: finalSubject !== initial.detected_subject ? finalSubject : null })
      .eq("routing_id", routingId);
    setConfirmed(true);
  }

  if (confirmed) {
    return <Card><p className="text-body">고마워! 회독퀘스트 만들고 있어.</p></Card>;
  }

  return (
    <Card>
      <h3 className="text-h3">✨ AI 분석 결과</h3>
      {!editing ? (
        <>
          <dl className="mt-md space-y-sm text-body">
            <div className="flex justify-between"><dt className="text-text-secondary">과목</dt><dd>{subject}</dd></div>
            {initial.unit_candidates[0] && (
              <>
                <div className="flex justify-between"><dt className="text-text-secondary">단원</dt><dd>{initial.unit_candidates[0].unit}</dd></div>
                <div className="flex justify-between"><dt className="text-text-secondary">유형</dt><dd>{initial.unit_candidates[0].topic}</dd></div>
              </>
            )}
          </dl>
          {initial.needs_user_confirmation && (
            <p className="mt-sm"><Badge tone="warning">확인 필요</Badge></p>
          )}
          <div className="mt-base flex gap-sm">
            <Button onClick={() => confirm(subject)}>맞아요</Button>
            <Button variant="secondary" onClick={() => setEditing(true)}>수정하기</Button>
          </div>
        </>
      ) : (
        <div className="space-y-sm">
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full h-12 px-base rounded-lg border border-border-soft"
          >
            <option>수학</option><option>국어</option><option>영어</option>
            <option>사탐</option><option>과탐</option>
          </select>
          <Button onClick={() => confirm(subject)} className="w-full">저장</Button>
        </div>
      )}
    </Card>
  );
}
```

- [ ] **Step 2: 업로드 후 자동 트리거 (P2 업로드 페이지에서 호출)**

```ts
// apps/web/src/features/ai-analysis-result/api.ts
import { createClient } from "@/shared/lib/supabase/client";

export async function triggerSubjectRouting(sourceId: string) {
  const supabase = createClient();
  const { data, error } = await supabase.functions.invoke("route-subject", {
    body: { source_id: sourceId },
  });
  if (error) throw error;
  return data;
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/features/ai-analysis-result/
git commit -m "feat(p3): AI 분석 결과 카드 UI + 라우팅 트리거 hook"
```

---

## Task 9: T9 — 정확도 측정 Harness (게이트 검증) ⚠️ 핵심

**Files:**
- Create: `eval/p3/golden/{001..010}.json` (수학 수열 점화식 골든셋 10장)
- Create: `eval/p3/runner.ts`
- Create: `scripts/eval-p3.ts`

> CLAUDE.md §4 Eval Harness 7대 원칙 엄격 적용: 결정론 시드, 격리, 타임아웃, JSONL append, 진행률, 실패 격리, 리소스 정리.

- [ ] **Step 1: 골든셋 schema 정의 + 샘플 1개 작성**

```json
// eval/p3/golden/001.json
{
  "case_id": "p3-math-seq-001",
  "image_path": "eval/p3/images/001.png",
  "ground_truth": {
    "subject": "수학",
    "unit": "수열",
    "topic": "점화식",
    "question_type": "특정항 계산",
    "difficulty_level": "L3",
    "wrong_reason_candidate": ["인덱스 혼동", "초항 누락"]
  }
}
```

10장 모두 `001.json ~ 010.json`로 시드. 이미지는 `eval/p3/images/{001..010}.png` (실제 점화식 문제 사진 — Mike가 준비 또는 자체 생성).

- [ ] **Step 2: `eval/p3/runner.ts` 작성** (7대 원칙 적용)

```ts
// eval/p3/runner.ts
import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync, fsyncSync, openSync, closeSync } from "node:fs";
import { join } from "node:path";
import { globSync } from "glob";

type GoldenCase = {
  case_id: string;
  image_path: string;
  ground_truth: {
    subject: string;
    unit: string;
    topic: string;
    question_type: string;
    difficulty_level: string;
    wrong_reason_candidate: string[];
  };
};

type Result = {
  case_id: string;
  pass: boolean;
  predicted: any;
  ground_truth: any;
  cost_usd: number | null;
  elapsed_ms: number;
  error?: string;
};

const SEED = 42;
const TIMEOUT_MS = 60_000;
const RESULTS_DIR = "eval/p3/results";
const ts = new Date().toISOString().replace(/[:.]/g, "-");
const out = join(RESULTS_DIR, `run-${ts}.jsonl`);

if (!existsSync(RESULTS_DIR)) mkdirSync(RESULTS_DIR, { recursive: true });

const fd = openSync(out, "a");
function append(line: string) {
  appendFileSync(fd, line + "\n");
  fsyncSync(fd);
}

const goldenFiles = globSync("eval/p3/golden/*.json").sort();
const total = goldenFiles.length;
let pass = 0, fail = 0;
const t0 = Date.now();

console.log(`[start] cases=${total} seed=${SEED} out=${out}`);

for (let i = 0; i < goldenFiles.length; i++) {
  const caseFile = goldenFiles[i];
  const golden: GoldenCase = JSON.parse(readFileSync(caseFile, "utf8"));
  const ts0 = Date.now();
  let result: Result;
  try {
    const predicted = await runCaseWithTimeout(golden);
    const passCase = evaluate(predicted, golden.ground_truth);
    result = {
      case_id: golden.case_id,
      pass: passCase,
      predicted,
      ground_truth: golden.ground_truth,
      cost_usd: null,
      elapsed_ms: Date.now() - ts0,
    };
    if (passCase) pass++; else fail++;
  } catch (e) {
    result = {
      case_id: golden.case_id,
      pass: false,
      predicted: null,
      ground_truth: golden.ground_truth,
      cost_usd: null,
      elapsed_ms: Date.now() - ts0,
      error: e instanceof Error ? e.message : String(e),
    };
    fail++;
  }
  append(JSON.stringify(result));
  const elapsed = Math.floor((Date.now() - t0) / 1000);
  console.log(`[${i+1}/${total}] ${result.case_id} ${result.pass?"PASS":"FAIL"} (${result.elapsed_ms}ms) total=${elapsed}s pass=${pass} fail=${fail}`);
}

closeSync(fd);

const subjectAcc = pass / total;
const summary = { total, pass, fail, subject_accuracy: subjectAcc };
console.log("[summary]", summary);
writeFileSync(out.replace(".jsonl", ".summary.json"), JSON.stringify(summary, null, 2));

const GATE = 0.9;
if (subjectAcc < GATE) {
  console.error(`✗ 게이트 미달: subject_accuracy=${subjectAcc.toFixed(2)} < ${GATE}. P4 진입 금지.`);
  process.exit(1);
}
console.log(`✓ 게이트 통과: subject_accuracy=${subjectAcc.toFixed(2)} ≥ ${GATE}`);

// --- helpers ---

async function runCaseWithTimeout(golden: GoldenCase): Promise<any> {
  return await Promise.race([
    runCase(golden),
    new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), TIMEOUT_MS)),
  ]);
}

async function runCase(golden: GoldenCase): Promise<any> {
  const url = `${process.env.SUPABASE_URL}/functions/v1/route-subject`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ image_path: golden.image_path, dry_run: true }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

function evaluate(predicted: any, gt: GoldenCase["ground_truth"]): boolean {
  // 1차: subject만 일치하면 통과 (게이트 0.9는 subject 정확도)
  return predicted?.detected_subject === gt.subject;
}
```

- [ ] **Step 3: `scripts/eval-p3.ts`** — CLI 진입점

```ts
// scripts/eval-p3.ts
import "../eval/p3/runner.ts";
```

```json
// apps/web/package.json scripts에 추가
{
  "scripts": {
    "eval:p3": "tsx scripts/eval-p3.ts"
  }
}
```

- [ ] **Step 4: 실행**

```bash
pnpm eval:p3
# 진행률 stdout으로 출력 + eval/p3/results/run-YYYY-MM-DDTHH-MM-SS.jsonl 저장
# 마지막에 게이트 통과/미달 판정 + exit code
```

- [ ] **Step 5: Commit**

```bash
git add eval/p3/ scripts/eval-p3.ts apps/web/package.json
git commit -m "feat(p3-eval): 정확도 측정 harness + 게이트 (subject ≥ 90%)"
```

---

## P3 종료 시 체크포인트 (Gate)

| 측정 항목 | 기준 | 미달 시 |
|---|---|---|
| Subject 정확도 (10장) | ≥ 90% | **P4 진입 금지** |
| Unit 정확도 | ≥ 70% | 폴백 모드 활성, P4 부분 진입 |
| Topic 정확도 | ≥ 70% | 폴백 모드 활성, P4 부분 진입 |
| $/문제 비용 | ≤ $0.05 | 비용 알림, prompt caching 강화 |
| p95 응답시간 | ≤ 8s | 응답 최적화 작업 |
| Mathpix A/B | Vision-only vs Vision+Mathpix | 비용/정확도 매트릭스 |

게이트 통과 후 P4 Review Scheduling sub-plan 작성으로 진입.

게이트 미달 시 폴백 옵션:
1. 학생 직접 텍스트 입력 manual 모드 활성 (P2 업로드 페이지에 옵션 추가)
2. Mathpix ENABLE 후 재측정
3. Sonnet 4.6 → Opus 4.7 1M으로 모델 교체 후 비용/정확도 재측정
4. 골든셋 확장 (수열만이 아니라 함수/확률까지) 후 재측정

---

## 위험 + 롤백 정리

| 위험 | 발생 시 행동 |
|---|---|
| OCR 정확도 60% 미만 | Mathpix 활성 + 모델 업그레이드 1주 spike. 그래도 미달이면 학생 직접 입력 manual 모드를 메인 플로우로 전환 |
| Anthropic API rate limit | exponential backoff + queue. Edge Function 동시 호출 제한 |
| Mathpix 비용 폭증 | ENABLE_MATHPIX=false 즉시 토글 (env flag) |
| 이미지가 너무 큼 (>5MB) | Storage 업로드 시 client-side resize (max 1920px long edge) |
| 개인정보 노출 (학생 사진/이름) | Compliance Gate(P2)에서 차단 — P3 도달 전 처리 |

---

## 변경 이력

| 버전 | 일자 | 내용 |
|---|---|---|
| **v1.0** | **2026-05-14** | **초안. 9개 task (테이블 3종 + Edge Function 4종 + UI + Eval harness) + 게이트 정의.** |
