-- P2 Source Intake: 컴플라이언스 검사 결과 테이블 (service_role write)
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
