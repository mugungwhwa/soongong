-- SOO-50 Gate A: parsed_learning_objects + student_memory_items 여정 탭 필드 추가
-- get_journey_map RPC가 소비할 컬럼들 (0021_get_journey_map_rpc.sql 선행 의존)

-- ─────────────────────────────────────────────────────────
-- parsed_learning_objects: curriculum FK 추가
-- unit_id  → units.id (curriculum-lookup Edge Function이 채움)
-- region_code → units.id where depth=2 (unit_id 기준 비정규화)
-- ─────────────────────────────────────────────────────────
alter table public.parsed_learning_objects
  add column unit_id     text references public.units(id) on delete set null,
  add column region_code text references public.units(id) on delete set null;

comment on column public.parsed_learning_objects.unit_id is
  'curriculum-lookup Edge Function이 매칭한 units.id (null=미매칭)';
comment on column public.parsed_learning_objects.region_code is
  'unit_id 기준 depth-2 조상 region. curriculum-lookup이 units.region_code 복사. get_journey_map 집계 키.';

create index plo_unit_id_idx
  on public.parsed_learning_objects (unit_id)
  where unit_id is not null;

create index plo_region_code_idx
  on public.parsed_learning_objects (user_id, region_code)
  where region_code is not null;

-- ─────────────────────────────────────────────────────────
-- student_memory_items: last_reviewed_at 추가
-- schedule-next-review Edge Function이 회독 완료 시 갱신
-- ─────────────────────────────────────────────────────────
alter table public.student_memory_items
  add column last_reviewed_at timestamptz;

comment on column public.student_memory_items.last_reviewed_at is
  'schedule-next-review가 마지막 회독 완료 시 기록. get_journey_map hotspots에서 반환.';

create index smi_last_reviewed_idx
  on public.student_memory_items (user_id, last_reviewed_at desc)
  where last_reviewed_at is not null;
