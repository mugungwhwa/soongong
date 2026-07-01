-- SOO-156: 수능 MOAT 리서치 산출물 저장·구조화 데이터 하네스
-- SSoT: 이슈 SOO-260701-05(정답 진실 정의) — 본 마이그레이션은 저장·구조화 전용, 정답 SSoT 재정의 아님.
-- 정답 진실 = 평가원 공식. 에이전트/스크립트는 정답을 결정하지 않는다.
-- 모든 산출 행은 proposal_status='lead_proposed'로 적재되며, Mike 채택 전에는 확정 아님(헌장 룰8).

create table public.csat_exam_problems (
  problem_id       uuid primary key default gen_random_uuid(),

  -- 식별 키 (자연키) — 평가원 공식 정답과 결합되는 좌표. 아래 불변 트리거 대상.
  subject          text not null
    check (subject in ('국어','수학','영어','한국사','사회탐구','과학탐구','직업탐구','제2외국어·한문')),
  exam_year        int  not null check (exam_year between 2016 and 2025),
  problem_number   int  not null check (problem_number > 0),
  official_answer  text not null,

  -- 근거 없는 공식정답 주장은 저장 금지 — 근거 없으면 격리 큐로 보낼 것(csat_exam_problems_quarantine)
  source_basis     text not null,

  -- 제안 산출 (보강 가능 — 불변 아님)
  question_type         text,   -- 출제유형
  difficulty_tag         text,   -- 난이도태그 (제안 전용, 자유 태그)
  official_correct_rate  numeric(5,2)
    check (official_correct_rate is null or official_correct_rate between 0 and 100),  -- 공식정답률(선택지 반응률) — 1축

  -- 헌장 룰8: 전부 [Lead 제안] 표기. Mike 채택 전 확정 아님.
  proposal_status  text not null default 'lead_proposed'
    check (proposal_status in ('lead_proposed','mike_adopted')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (subject, exam_year, problem_number)
);

create index cep_subject_year_idx on public.csat_exam_problems (subject, exam_year);
create index cep_proposal_status_idx on public.csat_exam_problems (proposal_status);

comment on table public.csat_exam_problems is
  '수능 기출 문항 메타(정답·유형·난이도·근거). 정답 SSoT=평가원 공식. 저장 전용 — 정답 판정 로직 없음. 적재는 service_role(ingest harness)만.';
comment on column public.csat_exam_problems.official_answer is
  '평가원 공식 정답. subject/exam_year/problem_number와 함께 불변(csat_exam_problems_immutable_guard 트리거) — 정정은 새 행이 아니라 격리 큐를 거쳐야 함.';
comment on column public.csat_exam_problems.proposal_status is
  'lead_proposed(기본) → mike_adopted. 산출 시점엔 전부 제안 전용, 정답 자체는 proposal이 아니라 공식 SSoT를 그대로 기록한 것.';

-- 자연키(subject/exam_year/problem_number) + official_answer는 평가원 공식 SSoT — 불변.
-- 정정이 필요하면 이 행을 고치지 말고 csat_exam_problems_quarantine에 별도 기록 후 사람이 검토.
create or replace function public.csat_exam_problems_enforce_immutable()
returns trigger
language plpgsql
as $$
begin
  if new.subject is distinct from old.subject
     or new.exam_year is distinct from old.exam_year
     or new.problem_number is distinct from old.problem_number
     or new.official_answer is distinct from old.official_answer then
    raise exception 'csat_exam_problems: subject/exam_year/problem_number/official_answer는 평가원 공식 SSoT — 불변. 정정은 csat_exam_problems_quarantine으로 별도 기록할 것';
  end if;
  return new;
end;
$$;

create trigger csat_exam_problems_immutable_guard
  before update on public.csat_exam_problems
  for each row execute function public.csat_exam_problems_enforce_immutable();

create or replace function public.csat_exam_problems_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger csat_exam_problems_updated_at
  before update on public.csat_exam_problems
  for each row execute function public.csat_exam_problems_set_updated_at();

alter table public.csat_exam_problems enable row level security;

-- 미채택 제안 데이터 포함 + 경쟁 MOAT 자산 — admin/reviewer 전용 읽기 (일반 인증 사용자 노출 안 함)
create policy "cep: admin read"
  on public.csat_exam_problems for select
  using (exists (
    select 1 from public.users
    where id = auth.uid() and role in ('admin','reviewer')
  ));

-- insert/update는 service_role(ingest harness)만 — RLS write 정책 없음 → 일반 사용자/인증 유저 차단


-- ─────────────────────────────────────
-- 격리 큐: 공식정답 불일치·불확실 문항 (모트 본류와 분리)
-- ─────────────────────────────────────
create table public.csat_exam_problems_quarantine (
  quarantine_id uuid primary key default gen_random_uuid(),

  subject        text not null
    check (subject in ('국어','수학','영어','한국사','사회탐구','과학탐구','직업탐구','제2외국어·한문')),
  exam_year      int  not null check (exam_year between 2016 and 2025),
  problem_number int  not null check (problem_number > 0),

  reported_answer        text,   -- 리서치 산출 중 발견된 (불일치 가능성 있는) 후보 정답
  conflicting_answer      text,  -- 기존 저장값/타 출처와 충돌하는 값 (있으면)
  discrepancy_reason     text not null,  -- 왜 격리됐는지 (예: 출처 2곳 불일치, 확인 불가)
  source_basis           text,

  status       text not null default 'open'
    check (status in ('open','resolved_adopted','resolved_rejected')),
  resolved_by  text,   -- 사람이 검토한 경우 식별자(예: 'Mike'). auth users FK 아님 — 검토는 앱 밖 워크플로우.
  resolved_at  timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 동일 좌표의 open 격리 건 중복 금지(같은 문항이 여러 번 재보고돼도 하나로 수렴)
create unique index cepq_open_unique_idx
  on public.csat_exam_problems_quarantine (subject, exam_year, problem_number)
  where status = 'open';

create index cepq_status_idx on public.csat_exam_problems_quarantine (status);
create index cepq_subject_year_idx on public.csat_exam_problems_quarantine (subject, exam_year);

comment on table public.csat_exam_problems_quarantine is
  '공식정답 불일치·불확실 문항 격리 큐. csat_exam_problems(모트 본류)와 완전 분리 — 여기서 해소(resolved_adopted) 전까지 본류에 반영 금지.';

create or replace function public.csat_exam_problems_quarantine_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger csat_exam_problems_quarantine_updated_at
  before update on public.csat_exam_problems_quarantine
  for each row execute function public.csat_exam_problems_quarantine_set_updated_at();

alter table public.csat_exam_problems_quarantine enable row level security;

create policy "cepq: admin read"
  on public.csat_exam_problems_quarantine for select
  using (exists (
    select 1 from public.users
    where id = auth.uid() and role in ('admin','reviewer')
  ));

-- insert/update는 service_role(ingest harness / 사람 검토 프로세스)만


-- ─────────────────────────────────────
-- 커버리지 매트릭스: 과목 × 연도 집계 뷰
-- ─────────────────────────────────────
create or replace view public.csat_coverage_matrix
with (security_invoker = true) as
select
  subject,
  exam_year,
  count(*) as problem_count,
  count(*) filter (where proposal_status = 'mike_adopted') as adopted_count,
  min(created_at) as first_ingested_at,
  max(created_at) as last_ingested_at
from public.csat_exam_problems
group by subject, exam_year
order by subject, exam_year;

comment on view public.csat_coverage_matrix is
  '과목×연도 커버리지 집계. security_invoker — csat_exam_problems RLS(admin/reviewer read)를 그대로 상속.';
