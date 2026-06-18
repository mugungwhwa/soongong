-- SOO-64: generated_problems — 약점 정조준 변형 문항 적재 테이블 (문제생성 MOAT)
-- SSoT: 이슈 SOO-260618-05 ④ 출력 스키마.
-- 적재 주체: generate-problem Edge Function (service_role insert 전용).
-- 1 오답 학습객체(parsed_learning_objects) → 1 변형 문항 (1:1).
-- 난이도(difficulty_level/mode)는 get_target_difficulty RPC 결과만 기록 — 생성 코드 자체산정 금지.

create table public.generated_problems (
  problem_id       uuid primary key default gen_random_uuid(),
  -- 원천 오답 객체. 삭제 시 파생 문항도 함께 정리(추적 의미 상실).
  source_object_id uuid not null references public.parsed_learning_objects(object_id) on delete cascade,
  user_id          uuid not null references public.users(id) on delete cascade,

  -- 분류 (원 객체에서 복사 — topic 유지가 품질 게이트)
  subject text not null,
  unit    text,
  topic   text not null,

  -- 난이도 신호 (오직 get_target_difficulty RPC 결과)
  difficulty_level text not null
    check (difficulty_level in ('L1','L2','L3','L4','L5')),
  difficulty_mode  text not null
    check (difficulty_mode in ('rebuild','maintain','stretch')),

  -- 생성된 문항 본체
  stem        text not null,
  choices     text[],                      -- 객관식만; 주관식이면 null
  answer      text not null,
  explanation text not null,

  -- 추적·검증: 어떤 약점(오답 사유)을 겨냥했나. 원 detected_wrong_reason의 부분집합.
  targets_wrong_reason text[] not null default '{}',

  -- 출처 메타
  generator_model text not null,
  prompt_version  text not null,
  created_at      timestamptz not null default now(),

  -- 객관식이면 선지 2개 이상 보장
  constraint gp_choices_for_mc check (choices is null or array_length(choices, 1) >= 2),
  -- 겨냥한 약점은 최소 1개 (정조준 보장)
  constraint gp_targets_nonempty check (array_length(targets_wrong_reason, 1) >= 1)
);

create index gp_user_idx
  on public.generated_problems (user_id, created_at desc);
create index gp_source_object_idx
  on public.generated_problems (source_object_id);
create index gp_topic_idx
  on public.generated_problems (user_id, topic);

alter table public.generated_problems enable row level security;

-- 본인 문항만 조회
create policy "gp: self read"
  on public.generated_problems for select
  using (auth.uid() = user_id);

-- admin/reviewer 조회 (품질 감사용)
create policy "gp: admin read"
  on public.generated_problems for select
  using (exists (
    select 1 from public.users
    where id = auth.uid() and role in ('admin','reviewer')
  ));

-- insert는 service_role(Edge Function)만 — RLS insert 정책 없음 → 일반 사용자 차단

comment on table public.generated_problems is
  '약점 정조준 변형 문항. generate-problem Edge Function이 적재. 난이도는 get_target_difficulty RPC 경유만.';
comment on column public.generated_problems.targets_wrong_reason is
  '겨냥한 오답 사유. 원 parsed_learning_objects.detected_wrong_reason의 부분집합(생성 시 강제).';
comment on column public.generated_problems.difficulty_level is
  'get_target_difficulty(user_id, topic).level. 생성 코드 자체산정 금지.';
comment on column public.generated_problems.difficulty_mode is
  'get_target_difficulty(user_id, topic).mode (rebuild/maintain/stretch).';
