-- SOO-63: get_target_difficulty RPC — 적응형 난이도 타깃 신호 (문제생성용)
-- 계약(SSoT): get_target_difficulty(user_id, topic) → { level: "L1".."L5", mode: "rebuild" | "maintain" | "stretch" }
-- 소비처: 문제생성 MOAT edge function (service_role 호출)
-- 산정 근거: mastery_score + forgetting_risk + recent_accuracy_5 (student_memory_items)
-- 콜드스타트 기본값: PLO.difficulty_level 그대로 + mode=maintain

create or replace function public.get_target_difficulty(
  p_user_id uuid,
  p_topic   text
) returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_total_count      int;
  v_avg_mastery      numeric;
  v_avg_accuracy     numeric;   -- null = 미집계 (중립 처리)
  v_high_risk_count  int;
  v_base_level_str   text;
  v_base_level_num   int;
  v_target_level_num int;
  v_mode             text;
begin
  -- ── RLS 가드 ─────────────────────────────────────────────────────────────
  -- service_role(auth.uid() IS NULL)은 통과; 그 외 본인만 허용
  if auth.uid() is not null and auth.uid() is distinct from p_user_id then
    raise exception 'permission denied' using errcode = '42501';
  end if;

  -- ── 1. SMI + PLO 집계 ────────────────────────────────────────────────────
  -- topic 기준으로 연결된 SMI 행들의 mastery/accuracy/forgetting_risk 집계
  -- base_level: 해당 topic PLO의 difficulty_level 최빈값
  select
    count(smi.memory_id)::int,
    avg(smi.mastery_score::numeric),
    avg(smi.recent_accuracy_5::numeric),
    count(smi.memory_id) filter (where smi.forgetting_risk = 'high')::int,
    mode() within group (order by plo.difficulty_level)
  into
    v_total_count,
    v_avg_mastery,
    v_avg_accuracy,
    v_high_risk_count,
    v_base_level_str
  from public.student_memory_items smi
  join public.parsed_learning_objects plo
    on plo.object_id = smi.object_id
   and plo.user_id   = p_user_id
   and plo.topic     = p_topic
  where smi.user_id = p_user_id;

  -- ── 2. 콜드스타트: SMI 없음 → PLO difficulty 그대로 + maintain ───────────
  if coalesce(v_total_count, 0) = 0 then
    select mode() within group (order by difficulty_level)
    into v_base_level_str
    from public.parsed_learning_objects
    where user_id          = p_user_id
      and topic            = p_topic
      and difficulty_level is not null;

    return jsonb_build_object(
      'level', coalesce(v_base_level_str, 'L1'),
      'mode',  'maintain'
    );
  end if;

  -- ── 3. base_level 문자열 → 정수 (null-safe) ──────────────────────────────
  v_base_level_num := case coalesce(v_base_level_str, 'L1')
    when 'L1' then 1
    when 'L2' then 2
    when 'L3' then 3
    when 'L4' then 4
    when 'L5' then 5
    else           1
  end;

  -- ── 4. 적응 모드 결정 ────────────────────────────────────────────────────
  -- rebuild: 저mastery(<40) OR 저정답률(<0.4, 데이터 있을 때만) OR 고위험 >50%
  if v_avg_mastery < 40
     or (v_avg_accuracy is not null and v_avg_accuracy < 0.4)
     or (v_high_risk_count::numeric / v_total_count) > 0.5
  then
    v_mode             := 'rebuild';
    v_target_level_num := greatest(1, v_base_level_num - 1);

  -- stretch: 고mastery(≥70) AND 고정답률(≥0.7 또는 데이터 없음) AND 고위험 <30%
  elsif v_avg_mastery >= 70
        and coalesce(v_avg_accuracy, 1.0) >= 0.7
        and (v_high_risk_count::numeric / v_total_count) < 0.3
  then
    v_mode             := 'stretch';
    v_target_level_num := least(5, v_base_level_num + 1);

  -- maintain: 안정권
  else
    v_mode             := 'maintain';
    v_target_level_num := v_base_level_num;
  end if;

  -- ── 5. 반환 ──────────────────────────────────────────────────────────────
  return jsonb_build_object(
    'level', 'L' || v_target_level_num::text,
    'mode',  v_mode
  );
end;
$$;

-- execute 권한: 인증 사용자 + service_role
revoke all on function public.get_target_difficulty(uuid, text) from public;
grant execute on function public.get_target_difficulty(uuid, text) to authenticated;
grant execute on function public.get_target_difficulty(uuid, text) to service_role;
