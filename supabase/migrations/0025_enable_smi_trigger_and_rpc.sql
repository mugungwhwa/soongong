-- 0025_enable_smi_trigger_and_rpc.sql
-- P4 deferred activation (SOO-100): student_memory_items(0017) + last_reviewed_at(0020) 존재 확인 후 적용.
-- 0009_review_quests.sql 주석 처리 블록을 정식 활성화.

-- ─────────────────────────────────────────────────────────────────────────
-- RPC: 회독 결과 반영 → SMI 메모리 항목 갱신
-- schedule-next-review Edge Function이 호출.
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.update_memory_after_review(
  p_memory_id uuid,
  p_accuracy_delta numeric,
  p_hint_used boolean,
  p_confidence smallint
) returns void
language plpgsql security definer as $$
begin
  update public.student_memory_items
  set
    recent_accuracy_5 = greatest(0, least(1,
      coalesce(recent_accuracy_5, 0.5) + p_accuracy_delta
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
    next_review_at   = now() + interval '1 day',
    updated_at       = now()
  where memory_id = p_memory_id;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────
-- Trigger function: INSERT/UPDATE 시 forgetting_risk 자동 재계산
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.update_forgetting_risk_trigger()
returns trigger language plpgsql as $$
begin
  new.forgetting_risk := public.calculate_forgetting_risk(
    coalesce(new.last_reviewed_at, new.updated_at),
    new.recent_accuracy_5,
    null,
    new.hint_rate_5,
    new.confidence_avg
  );
  return new;
end;
$$;

-- 트리거가 이미 있으면 교체 (idempotent)
drop trigger if exists smi_update_risk on public.student_memory_items;

create trigger smi_update_risk
  before insert or update on public.student_memory_items
  for each row execute function public.update_forgetting_risk_trigger();
