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
set search_path = pg_catalog, public
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
    -- 민감 필드(extracted_text, student_note, detected_wrong_reason)는 감사 로그에서 제외
    jsonb_build_object(
      'old', case when old is null then null
                  else to_jsonb(old) - 'extracted_text' - 'student_note' - 'detected_wrong_reason'
             end,
      'new', case when new is null then null
                  else to_jsonb(new) - 'extracted_text' - 'student_note' - 'detected_wrong_reason'
             end
    )
  );
  return coalesce(new, old);
end;
$$;

create trigger plo_audit
  after insert or update or delete on public.parsed_learning_objects
  for each row execute function public.audit_plo_changes();

-- reviewer(비-admin)는 reviewer_status / review_priority / confidence_score 만 수정 가능
-- admin / service_role(auth.uid() IS NULL)은 제한 없음
create or replace function public.plo_restrict_reviewer_columns()
returns trigger
language plpgsql
as $$
declare
  v_role text;
begin
  select role into v_role from public.users where id = auth.uid();
  if v_role = 'reviewer' then
    if new.object_id              is distinct from old.object_id              or
       new.source_id              is distinct from old.source_id              or
       new.user_id                is distinct from old.user_id                or
       new.object_type            is distinct from old.object_type            or
       new.subject                is distinct from old.subject                or
       new.unit                   is distinct from old.unit                   or
       new.topic                  is distinct from old.topic                  or
       new.question_type          is distinct from old.question_type          or
       new.difficulty_level       is distinct from old.difficulty_level       or
       new.extracted_text         is distinct from old.extracted_text         or
       new.student_note           is distinct from old.student_note           or
       new.detected_wrong_reason  is distinct from old.detected_wrong_reason  or
       new.created_at             is distinct from old.created_at then
      raise exception 'Reviewers may only update reviewer_status, review_priority, and confidence_score';
    end if;
  end if;
  return new;
end;
$$;

create trigger plo_reviewer_column_guard
  before update on public.parsed_learning_objects
  for each row execute function public.plo_restrict_reviewer_columns();
