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

create policy "srr: self update confirmation"
  on public.subject_routing_results for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- write(insert)는 service_role(Subject Routing Agent)만
