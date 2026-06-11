-- SOO-31: parsed_learning_objects
-- SSoT: 유저_데이터_관리_보안.md §3.D + 외부_데이터_유입_엔진.md §5.C

create table public.parsed_learning_objects (
  object_id uuid primary key default gen_random_uuid(),
  source_id uuid references public.external_sources(source_id) on delete set null,
  user_id uuid not null references public.users(id) on delete cascade,
  object_type text not null
    check (object_type in ('question','concept_note','lecture_concept','wrong_answer','type_pattern')),
  subject text not null,
  unit text,
  topic text,
  question_type text,
  difficulty_level text
    check (difficulty_level in ('L1','L2','L3','L4','L5')),
  extracted_text text,
  student_note text,
  detected_wrong_reason text,
  review_priority text not null default 'medium'
    check (review_priority in ('low','medium','high')),
  confidence_score real
    check (confidence_score >= 0 and confidence_score <= 1),
  reviewer_status text not null default 'pending'
    check (reviewer_status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

create index plo_user_idx
  on public.parsed_learning_objects (user_id, created_at desc);
create index plo_source_idx
  on public.parsed_learning_objects (source_id)
  where source_id is not null;
create index plo_subject_unit_idx
  on public.parsed_learning_objects (user_id, subject, unit)
  where unit is not null;

alter table public.parsed_learning_objects enable row level security;

create index plo_reviewer_status_idx
  on public.parsed_learning_objects (reviewer_status)
  where reviewer_status = 'pending';

create policy "plo: self read"
  on public.parsed_learning_objects for select
  using (auth.uid() = user_id);

create policy "plo: admin read"
  on public.parsed_learning_objects for select
  using (exists (
    select 1 from public.users
    where id = auth.uid() and role in ('admin','reviewer')
  ));

create policy "plo: reviewer update"
  on public.parsed_learning_objects for update
  using (
    exists (select 1 from public.users where id = auth.uid() and role in ('reviewer','admin'))
  )
  with check (
    exists (select 1 from public.users where id = auth.uid() and role in ('reviewer','admin'))
  );

-- insert는 service_role(Edge Function)만

-- audit trigger (0012_audit_logs.sql의 DO 블록은 이 테이블이 없을 때 skip됨 → 여기서 생성)
create or replace function public.audit_plo_changes()
returns trigger
language plpgsql
security definer
as $$
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
$$;

create trigger plo_audit
  after insert or update or delete on public.parsed_learning_objects
  for each row execute function public.audit_plo_changes();
