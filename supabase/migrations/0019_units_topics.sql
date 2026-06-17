-- SOO-50 Gate A: 커리큘럼 온톨로지 — units + topics
-- concept→region 매핑 경로: units.region_code = depth-2 조상 id (비정규화 저장)
-- depth 구분: 1=과목, 2=영역/대단원(region anchor), 3=중단원, 4=소단원/개념

create table public.units (
  id            text        primary key,         -- e.g. "math-1-seq-recurrence"
  code          text        unique not null,      -- e.g. "수학1.수열.점화식"
  name          text        not null,
  parent_id     text        references public.units(id) on delete restrict,
  depth         int         not null check (depth between 1 and 4),
  region_code   text,                            -- id of depth-2 ancestor (null for depth<=1)
  subject_code  text,                            -- id of depth-1 ancestor (null for depth=1)
  exam_topic    boolean     not null default false,
  search_vector tsvector    generated always as (to_tsvector('simple', name)) stored,
  created_at    timestamptz not null default now()
);

comment on column public.units.region_code is
  'depth-2 조상 unit id (영역/대단원). depth=2는 자기 자신. depth=1은 NULL. 삽입 트리거가 자동 설정.';

create index units_parent_idx     on public.units (parent_id);
create index units_region_idx     on public.units (region_code) where region_code is not null;
create index units_depth_idx      on public.units (depth);
create index units_subject_idx    on public.units (subject_code) where subject_code is not null;
create index units_search_idx     on public.units using gin (search_vector);

-- region_code / subject_code 자동 채우기 + 부모 깊이 검증 트리거
-- 삽입 순서: depth=1 → depth=2 → depth=3+ 보장 필요 (seed 스크립트 책임)
create or replace function public.units_set_ancestors()
returns trigger
language plpgsql
as $$
declare
  v_parent record;
begin
  if new.depth = 1 then
    new.region_code  := null;
    new.subject_code := null;

  elsif new.depth = 2 then
    -- 부모는 반드시 depth=1 과목이어야 함
    if new.parent_id is null then
      raise exception 'depth=2 unit requires a parent_id (depth=1 subject)';
    end if;
    select depth into v_parent from public.units where id = new.parent_id;
    if not found or v_parent.depth != 1 then
      raise exception 'depth=2 unit parent must be depth=1, got depth=%',
        coalesce(v_parent.depth::text, 'not found');
    end if;
    new.region_code  := new.id;        -- 자기 자신이 region anchor
    new.subject_code := new.parent_id;

  else
    -- depth>=3: 부모는 반드시 depth = new.depth-1 이어야 함
    if new.parent_id is null then
      raise exception 'units with depth>1 require a parent_id';
    end if;
    select depth, region_code, subject_code
      into v_parent
      from public.units
     where id = new.parent_id;
    if not found then
      raise exception 'parent unit % not found', new.parent_id;
    end if;
    if v_parent.depth != new.depth - 1 then
      raise exception 'unit depth must equal parent.depth + 1 (parent depth=%, this depth=%)',
        v_parent.depth, new.depth;
    end if;
    new.region_code  := v_parent.region_code;
    new.subject_code := v_parent.subject_code;
  end if;
  return new;
end;
$$;

create trigger units_before_insert
  before insert on public.units
  for each row execute function public.units_set_ancestors();

-- units는 커리큘럼 공유 데이터: 인증 사용자 읽기, write는 service_role만
alter table public.units enable row level security;

create policy "units: authenticated read"
  on public.units for select
  using (auth.uid() is not null);

-- ─────────────────────────────────────
-- topics: 단원별 핵심 개념/유형 카탈로그
-- ─────────────────────────────────────
create table public.topics (
  id            text        primary key,         -- e.g. "math-1-seq-recurrence-linear"
  unit_id       text        not null references public.units(id) on delete cascade,
  name          text        not null,
  description   text,
  sample_question text,
  search_vector tsvector    generated always as (
    to_tsvector('simple', name || ' ' || coalesce(description, ''))
  ) stored,
  created_at    timestamptz not null default now()
);

create index topics_unit_idx   on public.topics (unit_id);
create index topics_search_idx on public.topics using gin (search_vector);

alter table public.topics enable row level security;

create policy "topics: authenticated read"
  on public.topics for select
  using (auth.uid() is not null);
