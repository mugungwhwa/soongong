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
  created_at timestamptz not null default now()
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

-- OLD 행을 RLS 우회로 읽기 — WITH CHECK에서 변경 전 값 비교에 사용
create or replace function public.srr_get_persisted_row(p_routing_id uuid)
returns public.subject_routing_results
language sql stable security definer
as $$
  select * from public.subject_routing_results where routing_id = p_routing_id
$$;

-- user_corrected_subject / final_subject 외 컬럼이 모두 불변인지 검사
create or replace function public.srr_only_confirmation_columns_changed(
  old_row public.subject_routing_results,
  new_row public.subject_routing_results
)
returns boolean
language sql immutable
as $$
  select
    (old_row.routing_id              is not distinct from new_row.routing_id)              and
    (old_row.source_id               is not distinct from new_row.source_id)               and
    (old_row.user_id                 is not distinct from new_row.user_id)                 and
    (old_row.source_type             is not distinct from new_row.source_type)             and
    (old_row.detected_subject        is not distinct from new_row.detected_subject)        and
    (old_row.subject_confidence      is not distinct from new_row.subject_confidence)      and
    (old_row.subject_group           is not distinct from new_row.subject_group)           and
    (old_row.unit_candidates         is not distinct from new_row.unit_candidates)         and
    (old_row.topic_candidates        is not distinct from new_row.topic_candidates)        and
    (old_row.recommended_agents      is not distinct from new_row.recommended_agents)      and
    (old_row.needs_user_confirmation is not distinct from new_row.needs_user_confirmation) and
    (old_row.created_at              is not distinct from new_row.created_at)
$$;

-- 본인만 수정 가능, 단 user_corrected_subject / final_subject 컬럼만 허용
create policy "srr: self update confirmation"
  on public.subject_routing_results for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id and
    public.srr_only_confirmation_columns_changed(
      public.srr_get_persisted_row(routing_id),
      row(routing_id, source_id, user_id, source_type, detected_subject,
          subject_confidence, subject_group, unit_candidates, topic_candidates,
          recommended_agents, needs_user_confirmation, user_corrected_subject,
          final_subject, created_at)::public.subject_routing_results
    )
  );

-- insert는 service_role(Subject Routing Agent)만
