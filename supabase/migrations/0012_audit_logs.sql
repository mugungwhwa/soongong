-- T1: audit_logs 테이블 + RLS + 자동 trigger

create table public.audit_logs (
  log_id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.users(id) on delete set null,
  actor_role text not null
    check (actor_role in ('student','parent','admin','reviewer','agent','system')),
  action text not null
    check (action in ('read','create','update','delete','export','approve','reject','correct','flag')),
  target_table text not null,
  target_id text,
  diff jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create index audit_actor_idx on public.audit_logs (actor_id, created_at desc);
create index audit_target_idx on public.audit_logs (target_table, target_id);
create index audit_role_idx on public.audit_logs (actor_role, created_at desc);

alter table public.audit_logs enable row level security;

-- admin/reviewer 만 읽기 허용, insert는 service_role / trigger만
create policy "audit: admin read"
  on public.audit_logs for select
  using (exists (
    select 1 from public.users
    where id = auth.uid() and role in ('admin','reviewer')
  ));

-- T4: error_reports 테이블 + RLS

create table public.error_reports (
  report_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id),
  target_table text not null,
  target_id uuid not null,
  reason text not null,
  status text not null default 'open'
    check (status in ('open','reviewing','resolved','wontfix')),
  resolved_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

alter table public.error_reports enable row level security;

create policy "er: self read own"
  on public.error_reports for select using (auth.uid() = user_id);
create policy "er: self insert"
  on public.error_reports for insert with check (auth.uid() = user_id);
create policy "er: admin read all"
  on public.error_reports for select
  using (exists (select 1 from public.users where id = auth.uid() and role in ('admin','reviewer')));
create policy "er: admin update"
  on public.error_reports for update
  using (exists (select 1 from public.users where id = auth.uid() and role in ('admin','reviewer')));

-- parsed_learning_objects 변경 자동 audit trigger (P3 완료 후 활성화)
-- P3 migration이 먼저 실행되어야 하므로 trigger는 조건부 생성
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'parsed_learning_objects'
  ) then
    execute $trigger$
      create or replace function public.audit_plo_changes()
      returns trigger language plpgsql security definer as $fn$
      begin
        insert into public.audit_logs (actor_id, actor_role, action, target_table, target_id, diff)
        values (
          auth.uid(),
          coalesce((select role from public.users where id = auth.uid()), 'system'),
          case tg_op
            when 'INSERT' then 'create'
            when 'UPDATE' then 'update'
            when 'DELETE' then 'delete'
          end,
          'parsed_learning_objects',
          coalesce(new.object_id::text, old.object_id::text),
          jsonb_build_object('old', to_jsonb(old), 'new', to_jsonb(new))
        );
        return coalesce(new, old);
      end;
      $fn$;

      create trigger plo_audit
        after insert or update or delete on public.parsed_learning_objects
        for each row execute function public.audit_plo_changes();
    $trigger$;
  end if;
end;
$$;
