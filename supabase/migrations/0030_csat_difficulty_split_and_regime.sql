-- SOO-156: Mike 채택 프레임 반영 — 난이도 시험단위/문항단위 분리 + 교육과정체제 축 추가
-- SSoT: SOO-155 에스컬레이션 2건(Mike 승인, 2026-07-02).
-- 정답 진실 = 평가원 공식 정답표(불변) — 본 마이그레이션도 정답 SSoT 재정의 아님.
-- 저작권: 문제 원문 저장 금지 — 본 스키마는 메타데이터만 다룬다(변경 없음, 재확인 주석).

-- ─────────────────────────────────────
-- 1) csat_exam_problems: official_correct_rate(단일 정답률) 제거
--    → 체감난이도_문항단위(perceived_difficulty_*)로 대체.
--    공식난이도_시험단위(표준점수 최고점/1등급컷/만점자비율)는 문항이 아니라
--    과목×연도 단위 값이므로 별도 테이블(csat_exam_difficulty)로 분리.
-- ─────────────────────────────────────

alter table public.csat_exam_problems
  drop column official_correct_rate;

alter table public.csat_exam_problems
  add column perceived_difficulty_rate   numeric(5,2)
    check (perceived_difficulty_rate is null or perceived_difficulty_rate between 0 and 100),
  add column perceived_difficulty_source text;

-- 체감난이도는 비공식 추정치 — 값이 있으면 반드시 비공식 출처 라벨을 함께 기록해야 함
-- (예: 'EBSi(비공식추정)'). 라벨에 '비공식'이 없으면 공식 수치로 오인될 위험 → 저장 거부.
alter table public.csat_exam_problems
  add constraint cep_perceived_difficulty_paired
    check (
      (perceived_difficulty_rate is null) = (perceived_difficulty_source is null)
    ),
  add constraint cep_perceived_difficulty_source_unofficial
    check (
      perceived_difficulty_source is null or perceived_difficulty_source like '%비공식%'
    );

comment on column public.csat_exam_problems.perceived_difficulty_rate is
  '체감난이도_문항단위. 예: EBSi 오답률(%). 평가원 공식 아님 — perceived_difficulty_source와 항상 짝으로 저장.';
comment on column public.csat_exam_problems.perceived_difficulty_source is
  '체감난이도 출처 라벨. 반드시 "비공식" 문구 포함(예: EBSi(비공식추정)) — 공식 수치와 혼동 방지.';

-- 교육과정체제 축: 2022학년도 수능(2021년 실시)부터 통합형 개편 적용.
-- 경계는 코드/트리거로 강제하지 않음(실시연도 표기 규칙이 산출 파이프라인마다 흔들릴 수 있어
-- 값은 적재 시점에 명시적으로 결정 — 이 컬럼은 파생이 아니라 사실 기록).
alter table public.csat_exam_problems
  add column curriculum_regime text;

update public.csat_exam_problems
  set curriculum_regime = case when exam_year <= 2020 then '2021이전' else '2022이후_통합형' end
  where curriculum_regime is null;

alter table public.csat_exam_problems
  add constraint cep_curriculum_regime_check
    check (curriculum_regime in ('2021이전','2022이후_통합형')),
  alter column curriculum_regime set not null;

comment on column public.csat_exam_problems.curriculum_regime is
  '교육과정체제. 2021이전 | 2022이후_통합형(2022학년도, 2021년 실시분부터). 커버리지·유형 온톨로지 분리 축.';

create index cep_curriculum_regime_idx on public.csat_exam_problems (curriculum_regime);

-- 불변 트리거 갱신: curriculum_regime도 official_answer와 동급의 구조적 사실로 취급(제안 아님) — 불변 추가.
-- 체감난이도(perceived_*)는 비공식 제안 성격이라 계속 갱신 가능 — 불변 대상에서 제외.
create or replace function public.csat_exam_problems_enforce_immutable()
returns trigger
language plpgsql
as $$
begin
  if new.subject is distinct from old.subject
     or new.exam_year is distinct from old.exam_year
     or new.problem_number is distinct from old.problem_number
     or new.official_answer is distinct from old.official_answer
     or new.curriculum_regime is distinct from old.curriculum_regime then
    raise exception 'csat_exam_problems: subject/exam_year/problem_number/official_answer/curriculum_regime는 불변. 정정은 csat_exam_problems_quarantine으로 별도 기록할 것';
  end if;
  return new;
end;
$$;

-- ─────────────────────────────────────
-- 2) csat_exam_difficulty: 공식난이도_시험단위 (평가원 공식, SSoT)
--    표준점수 최고점 / 1등급컷 / 만점자 비율 — 과목×연도 단위 값(문항 단위 아님).
-- ─────────────────────────────────────

create table public.csat_exam_difficulty (
  difficulty_id      uuid primary key default gen_random_uuid(),

  subject            text not null
    check (subject in ('국어','수학','영어','한국사','사회탐구','과학탐구','직업탐구','제2외국어·한문')),
  exam_year          int  not null check (exam_year between 2016 and 2025),
  curriculum_regime  text not null check (curriculum_regime in ('2021이전','2022이후_통합형')),

  standard_score_max   int,             -- 표준점수 최고점 (한국사 등 절대평가 과목은 NULL 가능)
  grade1_cutoff_score   int,            -- 1등급컷
  perfect_score_ratio   numeric(6,3)    -- 만점자 비율(%)
    check (perfect_score_ratio is null or perfect_score_ratio between 0 and 100),

  source_basis text not null,           -- 근거(평가원 발표 자료 등)

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (subject, exam_year)
);

create index ced_subject_year_idx on public.csat_exam_difficulty (subject, exam_year);
create index ced_curriculum_regime_idx on public.csat_exam_difficulty (curriculum_regime);

comment on table public.csat_exam_difficulty is
  '공식난이도_시험단위(표준점수 최고점/1등급컷/만점자비율) — 평가원 공식 SSoT. 과목×연도 단위(문항 단위 아님). csat_exam_problems.perceived_difficulty_*(비공식 문항단위)와 별개.';

-- 평가원 공식 수치 — 정답과 동일하게 불변 원칙이나, 조사 진행 중 필드가 하나씩 채워질 수 있어
-- null → 값 채움은 허용하고, 이미 기록된 값 → 다른 값으로의 덮어쓰기만 차단한다.
create or replace function public.csat_exam_difficulty_enforce_immutable()
returns trigger
language plpgsql
as $$
begin
  if new.subject is distinct from old.subject
     or new.exam_year is distinct from old.exam_year
     or new.curriculum_regime is distinct from old.curriculum_regime then
    raise exception 'csat_exam_difficulty: subject/exam_year/curriculum_regime는 불변';
  end if;
  if (old.standard_score_max is not null and new.standard_score_max is distinct from old.standard_score_max)
     or (old.grade1_cutoff_score is not null and new.grade1_cutoff_score is distinct from old.grade1_cutoff_score)
     or (old.perfect_score_ratio is not null and new.perfect_score_ratio is distinct from old.perfect_score_ratio) then
    raise exception 'csat_exam_difficulty: 이미 기록된 평가원 공식 수치는 변경 불가(null→값 채움만 허용). 정정이 필요하면 새 검토 프로세스를 거칠 것';
  end if;
  return new;
end;
$$;

create trigger csat_exam_difficulty_immutable_guard
  before update on public.csat_exam_difficulty
  for each row execute function public.csat_exam_difficulty_enforce_immutable();

create or replace function public.csat_exam_difficulty_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger csat_exam_difficulty_updated_at
  before update on public.csat_exam_difficulty
  for each row execute function public.csat_exam_difficulty_set_updated_at();

alter table public.csat_exam_difficulty enable row level security;

create policy "ced: admin read"
  on public.csat_exam_difficulty for select
  using (exists (
    select 1 from public.users
    where id = auth.uid() and role in ('admin','reviewer')
  ));

-- insert/update는 service_role(ingest harness)만


-- ─────────────────────────────────────
-- 3) 커버리지 매트릭스 뷰: 교육과정체제 축 반영
-- ─────────────────────────────────────

create or replace view public.csat_coverage_matrix
with (security_invoker = true) as
select
  subject,
  exam_year,
  curriculum_regime,
  count(*) as problem_count,
  count(*) filter (where proposal_status = 'mike_adopted') as adopted_count,
  min(created_at) as first_ingested_at,
  max(created_at) as last_ingested_at
from public.csat_exam_problems
group by subject, exam_year, curriculum_regime
order by subject, exam_year;

comment on view public.csat_coverage_matrix is
  '과목×연도×교육과정체제 커버리지 집계. security_invoker — csat_exam_problems RLS(admin/reviewer read)를 그대로 상속.';
