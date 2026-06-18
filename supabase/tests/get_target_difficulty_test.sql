-- pgTAP unit tests: get_target_difficulty RPC (SOO-63)
-- 실행: supabase test db
-- 커버: rebuild/maintain/stretch 분기 + L1·L5 경계 클램프 + cold-start 2종

begin;
select plan(9);

-- ─────────────────────────────────────────────────────────────────────────────
-- 픽스처 설정
-- ─────────────────────────────────────────────────────────────────────────────

-- auth.users insert → handle_new_user() 트리거가 public.users 자동 삽입
insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values ('a0000000-0000-0000-0000-000000000099'::uuid,
        'soo63test@test.local', '', now(), now(), now());

-- parsed_learning_objects (topic별로 시나리오 분리)
insert into public.parsed_learning_objects
  (object_id, user_id, object_type, subject, topic, difficulty_level, reviewer_status)
values
  -- cold-start-with-plo: topic='T_COLD', PLO L3
  ('b0000000-0000-0000-0000-000000000001'::uuid,
   'a0000000-0000-0000-0000-000000000099'::uuid,
   'question', '수학', 'T_COLD', 'L3', 'approved'),

  -- rebuild-low-mastery: topic='T_REBUILD_M', PLO L3
  ('b0000000-0000-0000-0000-000000000002'::uuid,
   'a0000000-0000-0000-0000-000000000099'::uuid,
   'question', '수학', 'T_REBUILD_M', 'L3', 'approved'),

  -- rebuild-low-accuracy: topic='T_REBUILD_A', PLO L3
  ('b0000000-0000-0000-0000-000000000003'::uuid,
   'a0000000-0000-0000-0000-000000000099'::uuid,
   'question', '수학', 'T_REBUILD_A', 'L3', 'approved'),

  -- rebuild-high-risk: topic='T_REBUILD_R', PLO L3
  ('b0000000-0000-0000-0000-000000000004'::uuid,
   'a0000000-0000-0000-0000-000000000099'::uuid,
   'question', '수학', 'T_REBUILD_R', 'L3', 'approved'),

  -- stretch: topic='T_STRETCH', PLO L3
  ('b0000000-0000-0000-0000-000000000005'::uuid,
   'a0000000-0000-0000-0000-000000000099'::uuid,
   'question', '수학', 'T_STRETCH', 'L3', 'approved'),

  -- maintain: topic='T_MAINTAIN', PLO L3
  ('b0000000-0000-0000-0000-000000000006'::uuid,
   'a0000000-0000-0000-0000-000000000099'::uuid,
   'question', '수학', 'T_MAINTAIN', 'L3', 'approved'),

  -- clamp-rebuild-L1: topic='T_CLAMP_L1', PLO L1 (내려가면 L1 유지)
  ('b0000000-0000-0000-0000-000000000007'::uuid,
   'a0000000-0000-0000-0000-000000000099'::uuid,
   'question', '수학', 'T_CLAMP_L1', 'L1', 'approved'),

  -- clamp-stretch-L5: topic='T_CLAMP_L5', PLO L5 (올라가면 L5 유지)
  ('b0000000-0000-0000-0000-000000000008'::uuid,
   'a0000000-0000-0000-0000-000000000099'::uuid,
   'question', '수학', 'T_CLAMP_L5', 'L5', 'approved');

-- student_memory_items (topic별 시나리오)
insert into public.student_memory_items
  (user_id, object_id, concept_key, mastery_score, recent_accuracy_5, forgetting_risk)
values
  -- T_REBUILD_M: 저mastery(25), 양호 accuracy, 저위험
  ('a0000000-0000-0000-0000-000000000099'::uuid,
   'b0000000-0000-0000-0000-000000000002'::uuid,
   'T_REBUILD_M', 25, 0.6, 'low'),

  -- T_REBUILD_A: 보통mastery(55), 저accuracy(0.3), 저위험
  ('a0000000-0000-0000-0000-000000000099'::uuid,
   'b0000000-0000-0000-0000-000000000003'::uuid,
   'T_REBUILD_A', 55, 0.3, 'low'),

  -- T_REBUILD_R: 보통mastery(55), 양호 accuracy, 고위험 100%
  ('a0000000-0000-0000-0000-000000000099'::uuid,
   'b0000000-0000-0000-0000-000000000004'::uuid,
   'T_REBUILD_R', 55, 0.8, 'high'),

  -- T_STRETCH: 고mastery(80), 고accuracy(0.85), 저위험
  ('a0000000-0000-0000-0000-000000000099'::uuid,
   'b0000000-0000-0000-0000-000000000005'::uuid,
   'T_STRETCH', 80, 0.85, 'low'),

  -- T_MAINTAIN: 보통mastery(55), 보통accuracy(0.55), 저위험
  ('a0000000-0000-0000-0000-000000000099'::uuid,
   'b0000000-0000-0000-0000-000000000006'::uuid,
   'T_MAINTAIN', 55, 0.55, 'low'),

  -- T_CLAMP_L1: 저mastery(20) — rebuild 분기, base L1 → L1 유지
  ('a0000000-0000-0000-0000-000000000099'::uuid,
   'b0000000-0000-0000-0000-000000000007'::uuid,
   'T_CLAMP_L1', 20, 0.6, 'low'),

  -- T_CLAMP_L5: 고mastery(80) — stretch 분기, base L5 → L5 유지
  ('a0000000-0000-0000-0000-000000000099'::uuid,
   'b0000000-0000-0000-0000-000000000008'::uuid,
   'T_CLAMP_L5', 80, 0.85, 'low');

-- ─────────────────────────────────────────────────────────────────────────────
-- 테스트 1: cold-start (SMI 없음, PLO 있음) → PLO difficulty 그대로 + maintain
-- ─────────────────────────────────────────────────────────────────────────────
select is(
  public.get_target_difficulty(
    'a0000000-0000-0000-0000-000000000099'::uuid,
    'T_COLD'
  ),
  '{"level": "L3", "mode": "maintain"}'::jsonb,
  'cold-start with PLO: returns PLO difficulty + maintain'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 테스트 2: absolute cold-start (SMI 없음, PLO도 없음) → L1 + maintain
-- ─────────────────────────────────────────────────────────────────────────────
select is(
  public.get_target_difficulty(
    'a0000000-0000-0000-0000-000000000099'::uuid,
    'T_NONEXISTENT'
  ),
  '{"level": "L1", "mode": "maintain"}'::jsonb,
  'absolute cold-start (no PLO): returns L1 + maintain'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 테스트 3: rebuild — 저mastery (mastery=25)
-- base L3 → L2
-- ─────────────────────────────────────────────────────────────────────────────
select is(
  public.get_target_difficulty(
    'a0000000-0000-0000-0000-000000000099'::uuid,
    'T_REBUILD_M'
  ),
  '{"level": "L2", "mode": "rebuild"}'::jsonb,
  'rebuild via low mastery (25): base L3 → L2'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 테스트 4: rebuild — 저accuracy (mastery=55, accuracy=0.3)
-- base L3 → L2
-- ─────────────────────────────────────────────────────────────────────────────
select is(
  public.get_target_difficulty(
    'a0000000-0000-0000-0000-000000000099'::uuid,
    'T_REBUILD_A'
  ),
  '{"level": "L2", "mode": "rebuild"}'::jsonb,
  'rebuild via low accuracy (0.3): base L3 → L2'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 테스트 5: rebuild — 고위험 비율 >50% (mastery=55, forgetting_risk=high 100%)
-- base L3 → L2
-- ─────────────────────────────────────────────────────────────────────────────
select is(
  public.get_target_difficulty(
    'a0000000-0000-0000-0000-000000000099'::uuid,
    'T_REBUILD_R'
  ),
  '{"level": "L2", "mode": "rebuild"}'::jsonb,
  'rebuild via high forgetting_risk (100% high): base L3 → L2'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 테스트 6: stretch (mastery=80, accuracy=0.85, forgetting_risk=low)
-- base L3 → L4
-- ─────────────────────────────────────────────────────────────────────────────
select is(
  public.get_target_difficulty(
    'a0000000-0000-0000-0000-000000000099'::uuid,
    'T_STRETCH'
  ),
  '{"level": "L4", "mode": "stretch"}'::jsonb,
  'stretch (mastery=80, accuracy=0.85): base L3 → L4'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 테스트 7: maintain (mastery=55, accuracy=0.55, forgetting_risk=low)
-- base L3 → L3
-- ─────────────────────────────────────────────────────────────────────────────
select is(
  public.get_target_difficulty(
    'a0000000-0000-0000-0000-000000000099'::uuid,
    'T_MAINTAIN'
  ),
  '{"level": "L3", "mode": "maintain"}'::jsonb,
  'maintain (mastery=55, accuracy=0.55): stays L3'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 테스트 8: 경계 클램프 — rebuild at L1 → L1 유지
-- mastery=20(rebuild), base L1 → L1 (L0 없음)
-- ─────────────────────────────────────────────────────────────────────────────
select is(
  public.get_target_difficulty(
    'a0000000-0000-0000-0000-000000000099'::uuid,
    'T_CLAMP_L1'
  ),
  '{"level": "L1", "mode": "rebuild"}'::jsonb,
  'clamp: rebuild at L1 stays L1'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 테스트 9: 경계 클램프 — stretch at L5 → L5 유지
-- mastery=80(stretch), base L5 → L5 (L6 없음)
-- ─────────────────────────────────────────────────────────────────────────────
select is(
  public.get_target_difficulty(
    'a0000000-0000-0000-0000-000000000099'::uuid,
    'T_CLAMP_L5'
  ),
  '{"level": "L5", "mode": "stretch"}'::jsonb,
  'clamp: stretch at L5 stays L5'
);

select * from finish();
rollback;
