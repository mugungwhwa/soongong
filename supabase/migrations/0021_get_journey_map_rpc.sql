-- SOO-50 Gate A: get_journey_map RPC
-- 읽기 전용 집계. smi.forgetting_risk(저장된 값) 직접 집계 — calculate_forgetting_risk() 호출 없음.
-- (forgetting_risk는 schedule-next-review Edge Function이 갱신 시 사전 계산해 저장)
-- RLS: auth.uid() = p_user_id 강제 (SECURITY DEFINER 내부 가드).
--
-- concept → region 매핑 경로:
--   smi.object_id
--     → plo.object_id
--       → plo.region_code (curriculum-lookup이 설정)
--         → units.id (depth=2, 영역 anchor)
--   fallback: plo.unit_id → units.region_code (units 행에 비정규화된 값)
--
-- coverage(탐험률) 단위: topics (M2 확정 — 게임화 리드)
--   topic_key  = coalesce(unit_id,'') || chr(1) || coalesce(topic,'')
--   scope_total = distinct topic_keys in user PLO
--   lit_count   = distinct topic_keys in user PLO with ≥1 SMI
--   node_count(region) = distinct topic_keys in region (scope PLO 기준)
--   lit_count(region)  = distinct topic_keys in region with ≥1 SMI

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
      coalesce(plo.region_code, u.region_code)                               as eff_region_code,
      coalesce(u_rgn.name, plo.unit)                                         as region_name,
      coalesce(u.name, plo.unit)                                             as unit_name,
      plo.topic                                                              as topic_name,
      -- topic 단위 집계 키 (M2: coverage를 topics 단위로 세기 위한 복합 키)
      -- chr(1) = ASCII SOH, 실제 텍스트에 등장 불가 → unit_id·topic 조합 충돌 방지
      coalesce(plo.unit_id::text, '') || chr(1) || coalesce(plo.topic, '')  as topic_key
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

  -- ── scope_agg: 사용자 PLO의 유니크 topics 수 ────────────────────────────
  -- scope_total = distinct (unit_id, topic) pairs — coverage 분모
  scope_agg as (
    select count(distinct
      coalesce(unit_id::text, '') || chr(1) || coalesce(topic, '')
    )::int as scope_total
    from public.parsed_learning_objects
    where user_id = p_user_id
  ),

  -- ── lit_agg: ≥1 SMI인 유니크 topics 수 + 생생도(vividness) ──────────────
  -- lit_count = distinct topic_keys in user_items — coverage 분자
  -- vividness = mastery 평균 — SMI 행 기준 유지(생생도 로직 변경 없음)
  lit_agg as (
    select
      count(distinct topic_key)::int        as lit_count,
      avg(mastery_score::numeric / 100)     as vividness
    from user_items
  ),

  -- ── region_topic_counts: 영역별 전체 topics 수 (node_count 소스) ──────────
  -- node_count(region) = 영역 내 전체 distinct topics (scope PLO 기준)
  -- lit_count(region)  = 영역 내 ≥1 SMI인 distinct topics (user_items 기준)
  -- → 둘이 달라져 영역 탐험률이 의미를 가짐 (M2 핵심)
  region_topic_counts as (
    select
      coalesce(plo.region_code, u.region_code)                         as eff_region_code,
      count(distinct
        coalesce(plo.unit_id::text, '') || chr(1) || coalesce(plo.topic, '')
      )::int                                                           as topic_count
    from public.parsed_learning_objects plo
    left join public.units u on u.id = plo.unit_id
    where plo.user_id = p_user_id
      and coalesce(plo.region_code, u.region_code) is not null
    group by 1
  ),

  -- ── 영역별 집계 ──────────────────────────────────────────────────────────
  -- dimming 판정: forgetting_risk='high' OR next_review_at <= today
  region_agg as (
    select
      ui.eff_region_code                                               as region_code,
      max(ui.region_name)                                              as region_name,
      avg(ui.mastery_score::numeric / 100)                             as mastery_avg,
      coalesce(rtc.topic_count, 0)                                     as node_count,
      count(distinct ui.topic_key)::int                                as lit_count,
      count(*) filter (
        where ui.forgetting_risk = 'high'
           or (ui.next_review_at is not null
               and ui.next_review_at::date <= current_date)
      )::int                                                           as dimming_count,
      -- risk_score: 영역 내 위험도 평균 — 연체 항목(overdue)은 high와 동등 처리
      avg(case
            when ui.forgetting_risk = 'high'
              or (ui.next_review_at is not null
                  and ui.next_review_at::date <= current_date) then 3.0
            when ui.forgetting_risk = 'medium' then 2.0
            else 1.0
          end)                                                         as risk_score
    from user_items ui
    left join region_topic_counts rtc on rtc.eff_region_code = ui.eff_region_code
    where ui.eff_region_code is not null
    group by ui.eff_region_code, rtc.topic_count
  ),

  -- ── hotspots: 상위 8개 위험 개념 ────────────────────────────────────────
  hotspot_ranked as (
    select
      object_id                                                        as concept_id,
      eff_region_code                                                  as region_code,
      unit_name,
      topic_name,
      mastery_score::numeric / 100                                     as mastery,
      forgetting_risk,
      next_review_at::date                                             as next_review_due,
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
      )                                                                as rn
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
