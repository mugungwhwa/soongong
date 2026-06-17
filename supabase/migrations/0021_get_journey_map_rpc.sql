-- SOO-50 Gate A: get_journey_map RPC
-- 읽기 전용 집계. 새 망각/FSRS 공식 없음 — calculate_forgetting_risk() 재사용.
-- RLS: auth.uid() = p_user_id 강제 (SECURITY DEFINER 내부 가드).
--
-- concept → region 매핑 경로:
--   smi.object_id
--     → plo.object_id
--       → plo.region_code (curriculum-lookup이 설정)
--         → units.id (depth=2, 영역 anchor)
--   fallback: plo.unit_id → units.region_code (units 행에 비정규화된 값)
--
-- 스케일 변환 (calculate_forgetting_risk 호환):
--   smi.confidence_avg (0~1) → 1.0 + confidence_avg * 4.0 (1~5 scale)

create or replace function public.get_journey_map(
  p_user_id    uuid,
  p_region_code text default null
) returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  -- ── RLS 가드: self read only ─────────────────────────────────────────────
  if auth.uid() is distinct from p_user_id then
    raise exception 'permission denied' using errcode = '42501';
  end if;

  with

  -- ── 사용자 메모리 아이템 + 영역 정보 ────────────────────────────────────
  user_items as (
    select
      smi.memory_id,
      smi.object_id,
      smi.mastery_score,                              -- 0-100
      smi.forgetting_risk,                            -- 'low'|'medium'|'high' (pre-computed)
      smi.next_review_at,
      smi.last_reviewed_at,
      -- region 결정: plo.region_code → units.region_code(fallback)
      coalesce(plo.region_code, u.region_code)        as eff_region_code,
      coalesce(u_rgn.name, plo.unit)                  as region_name,
      coalesce(u.name, plo.unit)                      as unit_name,
      plo.topic                                       as topic_name
    from public.student_memory_items smi
    left join public.parsed_learning_objects plo
           on plo.object_id = smi.object_id
          and plo.user_id = p_user_id          -- SECURITY DEFINER 환경 테넌트 경계 강제
    left join public.units u
           on u.id = plo.unit_id
    left join public.units u_rgn
           on u_rgn.id = coalesce(plo.region_code, u.region_code)
    where smi.user_id = p_user_id
  ),

  -- ── scope_total: 사용자가 업로드한 전체 학습 객체 수 ────────────────────
  scope_agg as (
    select count(*)::int as scope_total
    from public.parsed_learning_objects
    where user_id = p_user_id
  ),

  -- ── lit 집계 (메모리 아이템 = 학습 완료 개념) ───────────────────────────
  lit_agg as (
    select
      count(*)::int                         as lit_count,
      avg(mastery_score::numeric / 100)     as vividness
    from user_items
  ),

  -- ── 영역별 집계 ──────────────────────────────────────────────────────────
  -- dimming 판정: forgetting_risk='high' OR next_review_at <= today
  region_agg as (
    select
      eff_region_code                                          as region_code,
      max(region_name)                                         as region_name,
      avg(mastery_score::numeric / 100)                        as mastery_avg,
      count(*)::int                                            as node_count,
      count(*)::int                                            as lit_count,
      count(*) filter (
        where forgetting_risk = 'high'
           or (next_review_at is not null
               and next_review_at::date <= current_date)
      )::int                                                   as dimming_count,
      -- risk_score: 영역 내 위험도 평균 — 연체 항목(overdue)은 high와 동등 처리
      avg(case
            when forgetting_risk = 'high'
              or (next_review_at is not null
                  and next_review_at::date <= current_date) then 3.0
            when forgetting_risk = 'medium' then 2.0
            else 1.0
          end)                                                 as risk_score
    from user_items
    where eff_region_code is not null
    group by eff_region_code
  ),

  -- ── hotspots: 상위 8개 위험 개념 ────────────────────────────────────────
  hotspot_ranked as (
    select
      object_id                                                as concept_id,
      eff_region_code                                          as region_code,
      unit_name,
      topic_name,
      mastery_score::numeric / 100                             as mastery,
      forgetting_risk,
      next_review_at::date                                     as next_review_due,
      last_reviewed_at,
      row_number() over (
        order by
          case forgetting_risk
            when 'high'   then 1
            when 'medium' then 2
            else               3
          end asc,
          mastery_score asc,
          next_review_at asc nulls last
      )                                                        as rn
    from user_items
  )

  select jsonb_build_object(
    -- ── summary ────────────────────────────────────────────────────────────
    'summary', (
      select jsonb_build_object(
        'coverage',    case when s.scope_total > 0
                           then round((l.lit_count::numeric / s.scope_total)::numeric, 4)
                           else 0::numeric
                       end,
        'vividness',   round(coalesce(l.vividness, 0)::numeric, 4),
        'scope_total', s.scope_total,
        'lit_count',   l.lit_count
      )
      from lit_agg l, scope_agg s
    ),

    -- ── regions[] ──────────────────────────────────────────────────────────
    'regions', coalesce(
      (select jsonb_agg(
         jsonb_build_object(
           'region_code',   ra.region_code,
           'region_name',   coalesce(ra.region_name, ra.region_code),
           'mastery_avg',   round(coalesce(ra.mastery_avg, 0)::numeric, 4),
           'node_count',    ra.node_count,
           'lit_count',     ra.lit_count,
           'dimming_count', ra.dimming_count,
           'risk_score',    round(coalesce(ra.risk_score, 1)::numeric, 4)
         ) order by ra.risk_score desc nulls last
       )
       from region_agg ra),
      '[]'::jsonb
    ),

    -- ── hotspots[] ─────────────────────────────────────────────────────────
    'hotspots', coalesce(
      (select jsonb_agg(
         jsonb_build_object(
           'concept_id',      h.concept_id,
           'region_code',     h.region_code,
           'unit_name',       h.unit_name,
           'topic_name',      h.topic_name,
           'mastery',         round(h.mastery::numeric, 4),
           'forgetting_risk', h.forgetting_risk,
           'next_review_due', h.next_review_due,
           'last_reviewed_at', h.last_reviewed_at
         ) order by h.rn
       )
       from hotspot_ranked h
       where h.rn <= 8),
      '[]'::jsonb
    ),

    -- ── nodes[] — p_region_code 지정 시에만 채움 (lazy LOD near) ──────────
    'nodes', case
      when p_region_code is null then '[]'::jsonb
      else coalesce(
        (select jsonb_agg(
           jsonb_build_object(
             'concept_id',      ui.object_id,
             'unit_name',       ui.unit_name,
             'topic_name',      ui.topic_name,
             'mastery',         round(ui.mastery_score::numeric / 100, 4),
             'forgetting_risk', ui.forgetting_risk,
             'next_review_due', ui.next_review_at::date,
             'last_reviewed_at', ui.last_reviewed_at
           ) order by ui.mastery_score asc, ui.next_review_at asc nulls last
         )
         from user_items ui
         where ui.eff_region_code = p_region_code),
        '[]'::jsonb
      )
    end

  ) into v_result;

  return coalesce(v_result, '{}'::jsonb);
end;
$$;

-- execute 권한: 인증된 사용자만 (anon 차단)
revoke all on function public.get_journey_map(uuid, text) from public;
grant execute on function public.get_journey_map(uuid, text) to authenticated;
