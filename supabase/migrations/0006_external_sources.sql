-- P2 Source Intake: 원천 자료 저장 테이블
create table public.external_sources (
  source_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  source_type text not null
    check (source_type in ('problem_photo','lecture_log','capture_note','manual_text')),
  provider_type text not null default 'user'
    check (provider_type in ('user','partner','internal','public_reference')),
  raw_url text,
  raw_text text,
  storage_policy text not null default 'temporary'
    check (storage_policy in ('permanent','temporary','derived_only','local_only')),
  license_status text not null default 'user_private'
    check (license_status in ('user_private','licensed','internal_only','forbidden','needs_review')),
  metadata jsonb not null default '{}'::jsonb,
  source_hash text,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
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
