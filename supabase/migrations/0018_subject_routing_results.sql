-- SOO-31: subject_routing_results
-- SSoT: 과목_라우팅_시스템.md §7

create table public.subject_routing_results (
  routing_id uuid primary key default gen_random_uuid(),
  source_id uuid references public.external_sources(source_id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  source_type text not null
    check (source_type in ('problem_photo','lecture_log','capture_note','manual_text')),
  detected_subject text,
  subject_confidence real
    check (subject_confidence >= 0 and subject_confidence <= 1),
  subject_group text
    check (subject_group in ('math','korean','english','social','science')),
  unit_candidates jsonb,
  topic_candidates jsonb,
  recommended_agents jsonb,
  needs_user_confirmation boolean not null default false,
  user_corrected_subject text,
  final_subject text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index srr_user_idx
  on public.subject_routing_results (user_id, created_at desc);
create index srr_source_idx
  on public.subject_routing_results (source_id)
  where source_id is not null;
create index srr_pending_confirm_idx
  on public.subject_routing_results (user_id)
  where needs_user_confirmation = true and final_subject is null;

alter table public.subject_routing_results enable row level security;

create policy "srr: self read"
  on public.subject_routing_results for select
  using (auth.uid() = user_id);

-- 본인만 수정 가능 (컬럼 제한은 아래 트리거가 담당)
create policy "srr: self update confirmation"
  on public.subject_routing_results for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- user_corrected_subject / final_subject 외 컬럼 변경을 차단하는 BEFORE UPDATE 트리거
-- service_role(auth.uid() IS NULL)은 제약 없이 업데이트 가능
create or replace function public.srr_enforce_confirmation_columns()
returns trigger language plpgsql as $$
begin
  if auth.uid() is not null then
    if new.routing_id              is distinct from old.routing_id              or
       new.source_id               is distinct from old.source_id               or
       new.user_id                 is distinct from old.user_id                 or
       new.source_type             is distinct from old.source_type             or
       new.detected_subject        is distinct from old.detected_subject        or
       new.subject_confidence      is distinct from old.subject_confidence      or
       new.subject_group           is distinct from old.subject_group           or
       new.unit_candidates         is distinct from old.unit_candidates         or
       new.topic_candidates        is distinct from old.topic_candidates        or
       new.recommended_agents      is distinct from old.recommended_agents      or
       new.needs_user_confirmation is distinct from old.needs_user_confirmation or
       new.created_at              is distinct from old.created_at then
      raise exception 'Only user_corrected_subject and final_subject may be updated by authenticated users';
    end if;
  end if;
  return new;
end;
$$;

create trigger srr_confirmation_guard
  before update on public.subject_routing_results
  for each row execute function public.srr_enforce_confirmation_columns();

-- insert는 service_role(Subject Routing Agent)만

create or replace function public.srr_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger srr_updated_at
  before update on public.subject_routing_results
  for each row execute function public.srr_set_updated_at();
