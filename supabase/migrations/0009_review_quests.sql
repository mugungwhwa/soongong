-- P4 Review Scheduling: 회독 퀘스트 테이블 + 망각위험 함수

-- ──────────────────────────────────────────────
-- T1: review_quests 테이블 + RLS
-- ──────────────────────────────────────────────
create table public.review_quests (
  quest_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  object_id uuid not null,  -- P3 도입 시 references public.parsed_learning_objects(object_id) 재연결
  memory_id uuid,           -- P3 도입 시 references public.student_memory_items(memory_id) 재연결
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
create index rq_object_idx on public.review_quests (object_id);
-- (제거: rq_today_idx — where due_date = current_date 는 immutable 위반. 쿼리에서 due_date 필터로 대체)

alter table public.review_quests enable row level security;
create policy "rq: self read" on public.review_quests for select using (auth.uid() = user_id);
create policy "rq: self update result" on public.review_quests for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- insert/delete는 service_role (Edge Function)만

-- ──────────────────────────────────────────────
-- T2: 망각위험 계산 함수 + student_memory_items 자동 업데이트 trigger
-- ──────────────────────────────────────────────

-- 망각위험 점수화: 5개 변수 → 'low' | 'medium' | 'high'
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
  -- 시간 경과: 7일 이상이면 위험 (최대 2점)
  score := score + least(days_since / 7.0, 2.0);
  -- 최근 정답률: 낮을수록 위험 (0~1점)
  score := score + (1.0 - coalesce(p_recent_accuracy, 0.5));
  -- 힌트 사용률: 높을수록 위험 (0~1점)
  score := score + coalesce(p_hint_rate, 0);
  -- 자신감: 낮을수록 위험 (1~5점 → 0~0.8점)
  score := score + (5 - coalesce(p_confidence_avg, 3)) / 5.0;

  if score >= 2.5 then return 'high';
  elsif score >= 1.5 then return 'medium';
  else return 'low';
  end if;
end;
$$;

-- ──────────────────────────────────────────────
-- T2/T2b: student_memory_items trigger + 회독결과 RPC
-- ⚠️ P3 도입 후 적용 (student_memory_items 테이블이 P3에서 생성된 뒤 아래 블록 주석 해제)
--    현재는 P3 제외 범위라 미적용 — review_quests + calculate_forgetting_risk 만 활성.
-- ──────────────────────────────────────────────
/*
create or replace function public.update_forgetting_risk_trigger()
returns trigger language plpgsql as $$
begin
  new.forgetting_risk := public.calculate_forgetting_risk(
    new.updated_at,
    new.recent_accuracy_5,
    null,
    new.hint_rate_5,
    new.confidence_avg
  );
  return new;
end;
$$;

create trigger smi_update_risk
  before insert or update on public.student_memory_items
  for each row execute function public.update_forgetting_risk_trigger();

create or replace function public.update_memory_after_review(
  p_memory_id uuid,
  p_accuracy_delta numeric,
  p_hint_used boolean,
  p_confidence smallint
) returns void
language plpgsql security definer as $$
begin
  update public.student_memory_items
  set
    recent_accuracy_5 = greatest(0, least(1, coalesce(recent_accuracy_5, 0.5) + p_accuracy_delta)),
    hint_rate_5 = case
      when p_hint_used then least(1, coalesce(hint_rate_5, 0) * 0.8 + 0.2)
      else greatest(0, coalesce(hint_rate_5, 0) * 0.8)
    end,
    confidence_avg = case
      when p_confidence is not null
      then (coalesce(confidence_avg, 3) * 4 + p_confidence) / 5.0
      else confidence_avg
    end,
    next_review_at = now() + interval '1 day',
    updated_at = now()
  where memory_id = p_memory_id;
end;
$$;
*/
