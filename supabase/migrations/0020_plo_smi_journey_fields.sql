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

-- ─────────────────────────────────────────────────────────
-- region_code 자동 채우기 + depth=2 검증 트리거
-- curriculum-lookup이 unit_id를 채우면 region_code를 자동 파생.
-- region_code 직접 지정 시 depth=2 unit인지 + unit_id 일관성 검증.
-- ─────────────────────────────────────────────────────────
create or replace function public.plo_sync_region_code()
returns trigger
language plpgsql
as $$
declare
  v_unit_region text;
  v_region_depth int;
begin
  if new.unit_id is not null then
    if new.region_code is null then
      -- unit_id로부터 region_code 자동 파생
      select region_code into new.region_code
        from public.units where id = new.unit_id;
    else
      -- 양쪽 모두 지정된 경우 일관성 검증
      select region_code into v_unit_region
        from public.units where id = new.unit_id;
      if found and v_unit_region is distinct from new.region_code then
        raise exception 'region_code (%) does not match unit_id region (%)',
          new.region_code, v_unit_region;
      end if;
    end if;
  end if;

  -- region_code가 depth=2 unit인지 항상 검증
  if new.region_code is not null then
    select depth into v_region_depth
      from public.units where id = new.region_code;
    if not found or v_region_depth != 2 then
      raise exception 'region_code must reference a depth=2 unit (got depth=%)',
        coalesce(v_region_depth::text, 'not found');
    end if;
  end if;

  return new;
end;
$$;

create trigger plo_region_sync
  before insert or update of unit_id, region_code on public.parsed_learning_objects
  for each row execute function public.plo_sync_region_code();
