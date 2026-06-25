-- ============================================================
-- 데모 시드: 수열 점화식 회독 퀘스트
--   a_{n+1} = 2·a_n + 1, a_1 = 1  (일반항: a_n = 2^n - 1)
--
-- 실행 방법:
--   A) 로컬: supabase db reset  (seed.sql 자동 실행)
--   B) 프로덕션: Supabase SQL Editor(service_role)에 전체 붙여넣기
--
-- 멱등: 고정 UUID 사용 → 중복 실행 안전 (ON CONFLICT DO NOTHING/UPDATE)
-- 주의: 첫 번째 사용자(users 테이블 기준)에게 시드됨.
--       배포 환경에서는 Mike 계정 1개가 유일한 사용자이므로 OK.
-- ============================================================

DO $$
DECLARE
  v_user_id    uuid;
  v_object_id  uuid := '00000001-0000-4000-a000-000000000001';
  v_memory_id  uuid := '00000001-0000-4000-a000-000000000002';
  v_quest_id   uuid := '00000001-0000-4000-a000-000000000003';
  v_problem_id uuid := '00000001-0000-4000-a000-000000000004';
  v_today      date := current_date;
BEGIN

  -- 첫 번째 사용자 (배포 환경 단일 유저 가정)
  SELECT id INTO v_user_id
  FROM public.users
  ORDER BY created_at
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE '[seed] 유저 없음 — 시드 건너뜀';
    RETURN;
  END IF;

  -- ── 1. 학습객체 (parsed_learning_objects) ──────────────────
  INSERT INTO public.parsed_learning_objects (
    object_id, source_id, user_id,
    object_type, subject, unit, topic,
    extracted_text, detected_wrong_reason,
    review_priority, confidence_score, reviewer_status
  ) VALUES (
    v_object_id, NULL, v_user_id,
    'question', '수학', '수열', '점화식',
    'a_{n+1} = 2·a_n + 1, a_1 = 1 일 때, 일반항 a_n 을 구하시오.',
    '점화식 풀이 시 특수해(상수 고정점) 설정을 놓침',
    'high', 0.9, 'approved'
  ) ON CONFLICT (object_id) DO NOTHING;

  -- ── 2. 기억 항목 (student_memory_items) ────────────────────
  -- forgetting_risk는 smi_update_risk 트리거가 자동 계산.
  -- last_reviewed_at을 8일 전으로 → 높은 망각 위험도 유도.
  INSERT INTO public.student_memory_items (
    memory_id, user_id, object_id, concept_key, wrong_reason,
    mastery_score, recent_accuracy_5, hint_rate_5, confidence_avg,
    last_reviewed_at, next_review_at
  ) VALUES (
    v_memory_id, v_user_id, v_object_id,
    '수학·수열·점화식', '특수해(고정점) 누락',
    0, 0.2, 0.6, 0.3,
    now() - interval '8 days', now()
  ) ON CONFLICT (user_id, concept_key) DO UPDATE
    SET next_review_at   = now(),
        last_reviewed_at = now() - interval '8 days',
        recent_accuracy_5 = EXCLUDED.recent_accuracy_5;

  -- ── 3. 오늘의 회독 퀘스트 (review_quests) ──────────────────
  -- due_date = 오늘로 항상 갱신 → 날짜가 바뀌어도 재실행 시 오늘 노출.
  INSERT INTO public.review_quests (
    quest_id, user_id, object_id, memory_id,
    due_date, quest_mode, reward_xp, status
  ) VALUES (
    v_quest_id, v_user_id, v_object_id, v_memory_id,
    v_today, 'today', 30, 'pending'
  ) ON CONFLICT (quest_id) DO UPDATE
    SET due_date = v_today,
        status   = 'pending';

  -- ── 4. 변형 문항 (generated_problems) ──────────────────────
  INSERT INTO public.generated_problems (
    problem_id, source_object_id, user_id,
    subject, unit, topic,
    difficulty_level, difficulty_mode,
    stem, choices, answer, explanation,
    targets_wrong_reason, generator_model, prompt_version
  ) VALUES (
    v_problem_id, v_object_id, v_user_id,
    '수학', '수열', '점화식',
    'L3', 'maintain',
    '$a_{n+1} = 2a_n + 1,\ a_1 = 1$ 일 때, 일반항 $a_n$ 을 구하시오.',
    NULL,
    '$a_n = 2^n - 1$',
    '양변에 1을 더해 $a_{n+1}+1 = 2(a_n+1)$로 변환한다. $b_n = a_n+1$로 놓으면 $b_{n+1} = 2b_n$인 공비 2 등비수열. $b_1 = a_1+1 = 2$이므로 $b_n = 2^n$. 따라서 $a_n = 2^n - 1$.',
    ARRAY['특수해(고정점) 누락'],
    'demo-seed', 'v1'
  ) ON CONFLICT (problem_id) DO NOTHING;

  RAISE NOTICE '[seed] 완료 — user_id=% quest_id=% due=%',
    v_user_id, v_quest_id, v_today;
END $$;
