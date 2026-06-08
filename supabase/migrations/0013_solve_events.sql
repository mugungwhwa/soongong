-- P6 Play / Recovery / Canvas: 풀이 이벤트(solve_events) 테이블
-- 회독 플레이 1회 = solve_event 1건. 캔버스 stroke/PNG 경로 + 채점 결과 + 메타.
-- SSoT: docs/superpowers/plans/2026-05-14-soongong-mvp1-p6-play-recovery-canvas.md (T1)

create table public.solve_events (
  event_id uuid primary key default gen_random_uuid(),
  quest_id uuid not null references public.review_quests(quest_id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  attempt_number smallint not null default 1,
  -- 회복(오답회수) 단계 추적. 일반 플레이는 null, 오답회수 시 V1~V5.
  variation_level text check (variation_level in ('V0','V1','V2','V3','V4','V5')),
  submitted_answer text,
  is_correct boolean,
  solve_time_seconds int,
  hint_used boolean not null default false,
  eraser_count smallint not null default 0,
  stroke_url text,                       -- Storage path: solutions/<user_id>/<quest_id>.json
  solution_image_url text,               -- Storage path: solutions/<user_id>/<quest_id>.png
  confidence smallint check (confidence between 1 and 5),
  created_at timestamptz not null default now()
);

create index se_quest_idx on public.solve_events (quest_id, created_at);
create index se_user_idx on public.solve_events (user_id, created_at desc);

alter table public.solve_events enable row level security;

-- 본인 풀이 이벤트만 읽기/쓰기 (클라이언트 직접 insert 허용 — 본인 소유 데이터)
create policy "se: self read" on public.solve_events
  for select using (auth.uid() = user_id);
create policy "se: self insert" on public.solve_events
  for insert with check (auth.uid() = user_id);
