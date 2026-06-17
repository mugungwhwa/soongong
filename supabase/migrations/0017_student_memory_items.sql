-- SOO-31: student_memory_items
-- SSoT: 유저_데이터_관리_보안.md §3.E + 외부_데이터_유입_엔진.md §5.E
-- 학생 개인 RAG — 회독 엔진의 기억 상태
--
-- ⚠️ 배포 순서: supabase db push(이 마이그레이션 적용) 완료 후 Edge Function 배포 필수.
--    daily-quest-builder / schedule-next-review 는 이 테이블 존재를 전제로 동작함.

create table public.student_memory_items (
  memory_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  object_id uuid references public.parsed_learning_objects(object_id) on delete set null,
  concept_key text not null,
  wrong_reason text,
  mastery_score smallint not null default 0
    check (mastery_score >= 0 and mastery_score <= 100),
  recent_accuracy_5 real
    check (recent_accuracy_5 >= 0 and recent_accuracy_5 <= 1),
  hint_rate_5 real
    check (hint_rate_5 >= 0 and hint_rate_5 <= 1),
  confidence_avg real
    check (confidence_avg >= 0 and confidence_avg <= 1),
  next_review_at timestamptz,
  forgetting_risk text not null default 'medium'
    check (forgetting_risk in ('low','medium','high')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, concept_key)
);

create index smi_user_next_review_idx
  on public.student_memory_items (user_id, next_review_at asc)
  where next_review_at is not null;
create index smi_forgetting_risk_idx
  on public.student_memory_items (user_id, forgetting_risk)
  where forgetting_risk = 'high';

alter table public.student_memory_items enable row level security;

create policy "smi: self read"
  on public.student_memory_items for select
  using (auth.uid() = user_id);

-- write는 service_role(회독 엔진 Edge Function)만

create or replace function public.smi_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger smi_updated_at
  before update on public.student_memory_items
  for each row execute function public.smi_set_updated_at();
