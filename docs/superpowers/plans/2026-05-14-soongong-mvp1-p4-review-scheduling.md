# 순공대장 MVP 1차 — P4 Review Scheduling Sub-Plan

> **For agentic workers:** `superpowers:subagent-driven-development`로 진행. 룰 기반 로직이라 TDD 적합.
> **Pre-requisites**: P3 sub-plan 완료 (`parsed_learning_objects` + `student_memory_items`) + P3 게이트 통과 (Subject 정확도 ≥ 90%).

**Goal:** 1/3/7/14일 회독 예약 + 망각위험 룰 기반 계산 + 매일 04:00 KST cron으로 "오늘의 회독퀘스트 3개" 자동 선정.

**Architecture:** 망각위험은 **룰 기반 (ML 아님)**. `student_memory_items` 5개 변수(시간경과/최근정답률/풀이시간/힌트사용/자신감)로 점수화. 매일 cron이 학생별 망각위험 높은 3개를 `review_quests`로 발급.

**Tech Stack:** Supabase Edge Functions (Deno), `pg_cron`, PostgreSQL.

---

## File Structure

```
soongong/
├── supabase/
│   ├── migrations/0009_review_quests.sql
│   └── functions/
│       ├── schedule-next-review/index.ts
│       └── daily-quest-builder/index.ts
└── apps/web/src/entities/quest/
    ├── model.ts
    └── api.ts
```

---

## Task 1: T1 — `review_quests` 테이블 + RLS

- [ ] **Step 1: 마이그레이션**

```sql
-- supabase/migrations/0009_review_quests.sql
create table public.review_quests (
  quest_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  object_id uuid not null references public.parsed_learning_objects(object_id) on delete cascade,
  memory_id uuid references public.student_memory_items(memory_id) on delete set null,
  due_date date not null,
  quest_format text not null
    check (quest_format in ('original','number_variation','target_change','representation','condition','combo','concept_card','ox','fill_blank')),
  quest_mode text not null
    check (quest_mode in ('today','wrong_recovery','memory_defense','boss')),
  variation_level text check (variation_level in ('V0','V1','V2','V3','V4','V5')),
  difficulty_level text check (difficulty_level in ('L1','L2','L3','L4','L5')),
  reward_xp smallint not null default 20,
  status text not null default 'pending'
    check (status in ('pending','in_progress','completed','failed','skipped','expired')),
  result text check (result in ('correct','wrong','partial')),
  solve_time_seconds int,
  hint_used boolean default false,
  confidence smallint check (confidence between 1 and 5),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index rq_user_due_idx on public.review_quests (user_id, due_date)
  where status = 'pending';
create index rq_today_idx on public.review_quests (user_id, due_date, status)
  where due_date = current_date;
create index rq_object_idx on public.review_quests (object_id);

alter table public.review_quests enable row level security;
create policy "rq: self read" on public.review_quests for select using (auth.uid() = user_id);
create policy "rq: self update result" on public.review_quests for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- insert/delete는 service_role (Edge Function)만
```

- [ ] **Step 2: 실행 + Commit**

```bash
pnpm dlx supabase db push
git add supabase/migrations/0009_review_quests.sql
git commit -m "feat(p4): review_quests 테이블 + RLS"
```

---

## Task 2: T2 — 망각위험 계산 함수 (DB function)

- [ ] **Step 1: PostgreSQL function 추가**

```sql
-- supabase/migrations/0009_review_quests.sql (append)
create or replace function public.calculate_forgetting_risk(
  p_last_reviewed_at timestamptz,
  p_recent_accuracy numeric,
  p_avg_solve_time int,
  p_hint_rate numeric,
  p_confidence_avg numeric
) returns text
language plpgsql immutable as $$
declare
  days_since int := greatest(0, extract(epoch from (now() - p_last_reviewed_at))::int / 86400);
  score numeric := 0;
begin
  -- 시간 경과: 7일 이상이면 위험
  score := score + least(days_since / 7.0, 2.0);
  -- 최근 정답률: 낮을수록 위험 (0~1점)
  score := score + (1.0 - coalesce(p_recent_accuracy, 0.5));
  -- 힌트 사용률: 높을수록 위험
  score := score + coalesce(p_hint_rate, 0);
  -- 자신감: 낮을수록 위험 (1~5점 스케일)
  score := score + (5 - coalesce(p_confidence_avg, 3)) / 5.0;

  if score >= 2.5 then return 'high';
  elsif score >= 1.5 then return 'medium';
  else return 'low';
  end if;
end;
$$;

-- student_memory_items.forgetting_risk 자동 업데이트 trigger
create or replace function public.update_forgetting_risk_trigger()
returns trigger language plpgsql as $$
begin
  new.forgetting_risk := public.calculate_forgetting_risk(
    new.updated_at, new.recent_accuracy_5, null, new.hint_rate_5, new.confidence_avg
  );
  return new;
end;
$$;

create trigger smi_update_risk
  before insert or update on public.student_memory_items
  for each row execute function public.update_forgetting_risk_trigger();
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/0009_review_quests.sql
git commit -m "feat(p4): 망각위험 계산 함수 + 자동 업데이트 trigger"
```

---

## Task 3: T3 — `schedule-next-review` Edge Function

회독 결과(정답/오답) 후 다음 회독 시점 + V레벨 결정.

```ts
// supabase/functions/schedule-next-review/index.ts
import { getAdminClient } from "../_shared/supabase.ts";

const INTERVALS = { correct_fast: [3,7,14,30], correct_normal: [3,7,14], correct_slow: [1,3,7], wrong: [1,3,7], wrong_again: [1,1,3] };

Deno.serve(async (req) => {
  const { quest_id, result, solve_time_seconds, hint_used, confidence } = await req.json();
  const supabase = getAdminClient();

  const { data: quest } = await supabase
    .from("review_quests")
    .select("user_id, object_id, memory_id, variation_level")
    .eq("quest_id", quest_id)
    .single();
  if (!quest) return new Response("not found", { status: 404 });

  // 결과 저장
  await supabase
    .from("review_quests")
    .update({
      status: "completed",
      result,
      solve_time_seconds,
      hint_used,
      confidence,
      completed_at: new Date().toISOString(),
    })
    .eq("quest_id", quest_id);

  // student_memory_items 업데이트
  if (quest.memory_id) {
    const accuracyDelta = result === "correct" ? 0.2 : -0.2;
    await supabase.rpc("update_memory_after_review", {
      p_memory_id: quest.memory_id,
      p_accuracy_delta: accuracyDelta,
      p_hint_used: hint_used,
      p_confidence: confidence,
    });
  }

  // 다음 회독 일정 결정
  const nextV = pickNextVariation(result, solve_time_seconds, hint_used, quest.variation_level);
  const nextDays = pickNextInterval(result, solve_time_seconds, hint_used);

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + nextDays);

  await supabase.from("review_quests").insert({
    user_id: quest.user_id,
    object_id: quest.object_id,
    memory_id: quest.memory_id,
    due_date: dueDate.toISOString().slice(0, 10),
    quest_format: result === "correct" ? "number_variation" : "concept_card",
    quest_mode: result === "correct" ? "memory_defense" : "wrong_recovery",
    variation_level: nextV,
    reward_xp: result === "correct" ? 30 : 20,
  });

  return Response.json({ next_variation: nextV, next_days: nextDays });
});

function pickNextVariation(result: string, solveSec: number, hintUsed: boolean, curr: string | null): string {
  if (result !== "correct") return "V0";
  if (hintUsed) return "V1";
  if (solveSec < 60) return "V3";
  if (solveSec < 180) return "V2";
  return "V1";
}

function pickNextInterval(result: string, solveSec: number, hintUsed: boolean): number {
  if (result !== "correct") return 1;
  if (hintUsed) return 3;
  if (solveSec < 60) return 14;
  return 7;
}
```

- [ ] **배포 + Commit**

```bash
pnpm dlx supabase functions deploy schedule-next-review
git add supabase/functions/schedule-next-review/
git commit -m "feat(p4): schedule-next-review Edge Function — 결과 기반 다음 회독 결정"
```

---

## Task 4: T4 — `daily-quest-builder` Edge Function (매일 cron)

매일 04:00 KST 학생별 오늘의 회독퀘스트 3개 선정.

```ts
// supabase/functions/daily-quest-builder/index.ts
import { getAdminClient } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  const supabase = getAdminClient();
  const today = new Date().toISOString().slice(0, 10);

  // 활성 사용자 (최근 14일 접속)
  const { data: users } = await supabase
    .from("users")
    .select("id")
    .is("deleted_at", null);
  if (!users) return Response.json({ built: 0 });

  let built = 0;
  for (const u of users) {
    // 이미 오늘 회독 3개 발급됐으면 skip
    const { count } = await supabase
      .from("review_quests")
      .select("*", { count: "exact", head: true })
      .eq("user_id", u.id)
      .eq("due_date", today)
      .eq("quest_mode", "today");
    if ((count ?? 0) >= 3) continue;

    // 망각위험 높은 객체 우선
    const { data: candidates } = await supabase
      .from("student_memory_items")
      .select("memory_id, object_id, forgetting_risk")
      .eq("user_id", u.id)
      .in("forgetting_risk", ["high","medium"])
      .order("next_review_at", { ascending: true })
      .limit(3);

    if (!candidates || candidates.length === 0) continue;

    const inserts = candidates.map((c) => ({
      user_id: u.id,
      object_id: c.object_id,
      memory_id: c.memory_id,
      due_date: today,
      quest_format: "original",
      quest_mode: "today",
      variation_level: "V0",
      reward_xp: c.forgetting_risk === "high" ? 40 : 25,
    }));

    await supabase.from("review_quests").insert(inserts);
    built += inserts.length;
  }
  return Response.json({ built, users: users.length });
});
```

- [ ] **Cron 등록**

```sql
select cron.schedule(
  'daily-quest-builder',
  '0 19 * * *',   -- 매일 04:00 KST (UTC 19:00 전날)
  $$
  select net.http_post(
    url:='https://<project-ref>.supabase.co/functions/v1/daily-quest-builder',
    headers:='{"Authorization":"Bearer <service-role-key>"}'::jsonb,
    body:='{}'::jsonb
  );
  $$
);
```

- [ ] **Commit**

```bash
pnpm dlx supabase functions deploy daily-quest-builder
git add supabase/functions/daily-quest-builder/
git commit -m "feat(p4): daily-quest-builder cron — 매일 04:00 KST 오늘의 3개 생성"
```

---

## Task 5: T5 — Quest entity

```ts
// apps/web/src/entities/quest/model.ts
export type QuestMode = "today" | "wrong_recovery" | "memory_defense" | "boss";
export type QuestStatus = "pending" | "in_progress" | "completed" | "failed" | "skipped" | "expired";
export type Quest = {
  quest_id: string;
  user_id: string;
  object_id: string;
  due_date: string;
  quest_format: string;
  quest_mode: QuestMode;
  variation_level: string | null;
  reward_xp: number;
  status: QuestStatus;
  // ...
};
```

```ts
// apps/web/src/entities/quest/api.ts
import { createClient } from "@/shared/lib/supabase/server";

export async function getTodayQuests(userId: string) {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("review_quests")
    .select("*, parsed_learning_objects(subject, unit, topic, difficulty_level)")
    .eq("user_id", userId)
    .eq("due_date", today)
    .eq("quest_mode", "today")
    .order("reward_xp", { ascending: false })
    .limit(3);
  return data ?? [];
}
```

- [ ] **Commit**

```bash
git add apps/web/src/entities/quest/
git commit -m "feat(p4): quest entity (model + api)"
```

---

## P4 종료 체크포인트

- [ ] 회독 결과 1건 → schedule-next-review 호출 → 다음 review_quests row 생성 확인
- [ ] cron 수동 실행 → 학생별 오늘의 회독 3개 발급 확인
- [ ] 망각위험 trigger 작동 → student_memory_items 업데이트 시 forgetting_risk 자동 계산

다음 단계: **P5 Home / Quest UI** sub-plan으로 진입.

---

## 변경 이력

| v1.0 | 2026-05-14 | 초안. 5개 task (테이블 + 망각위험 함수 + 2 Edge Function + entity). |
