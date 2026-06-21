-- 0027_review_grade_3stage.sql
-- SOO-115: 회독 자가평가 2→3단계 확장 (또렷/가물가물/막막)
-- update_memory_after_review RPC에 p_grade 파라미터 추가.
-- 기존 p_accuracy_delta 호출은 호환 유지 (p_grade NULL → 기존 동작).

create or replace function public.update_memory_after_review(
  p_memory_id    uuid,
  p_accuracy_delta numeric,
  p_hint_used    boolean,
  p_confidence   smallint,
  p_grade        text default null  -- 'clear' | 'fuzzy' | 'blank'
) returns void
language plpgsql security definer as $$
declare
  v_delta    numeric;
  v_interval interval;
begin
  -- grade가 주어지면 grade로부터 delta/interval 결정; 없으면 기존 2단계 동작 유지
  if p_grade = 'clear' then
    v_delta    := 0.2;
    v_interval := interval '7 days';
  elsif p_grade = 'fuzzy' then
    v_delta    := 0.05;
    v_interval := interval '3 days';
  elsif p_grade = 'blank' then
    v_delta    := -0.2;
    v_interval := interval '1 day';
  else
    v_delta    := p_accuracy_delta;
    v_interval := interval '1 day';
  end if;

  update public.student_memory_items
  set
    recent_accuracy_5 = greatest(0, least(1,
      coalesce(recent_accuracy_5, 0.5) + v_delta
    )),
    hint_rate_5 = case
      when p_hint_used
        then least(1, coalesce(hint_rate_5, 0) * 0.8 + 0.2)
      else greatest(0, coalesce(hint_rate_5, 0) * 0.8)
    end,
    confidence_avg = case
      when p_confidence is not null
        then (coalesce(confidence_avg, 3) * 4 + p_confidence::numeric) / 5.0
      else confidence_avg
    end,
    last_reviewed_at = now(),
    next_review_at   = now() + v_interval,
    updated_at       = now()
  where memory_id = p_memory_id;
end;
$$;
