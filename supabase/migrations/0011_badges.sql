-- P7 game system: badges table
-- SSoT §5-3: 뱃지 희귀도 4단계 — common/rare/epic/legendary (DB 내부 키)
--   UI 레이블: 일반/희귀/영웅/전설
create table public.badges (
  badge_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  badge_key text not null,
  rarity text not null check (rarity in ('common','rare','epic','legendary')),
  awarded_at timestamptz not null default now(),
  unique (user_id, badge_key)
);

create index badges_user_idx on public.badges (user_id, awarded_at desc);
alter table public.badges enable row level security;
create policy "badges: self read" on public.badges for select using (auth.uid() = user_id);

create or replace view public.badge_definitions as
select badge_key, rarity, threshold, name, description from (
  values
    ('first_quest',   'common',    1,   '첫 회독',         '첫 회독퀘스트 완료'),
    ('streak_7',      'rare',      7,   '7일 불꽃',         '7일 연속 회독'),
    ('streak_30',     'epic',      30,  '30일 불꽃',        '30일 연속 회독'),
    ('recover_10',    'common',    10,  '오답회수꾼',       '오답 10개 다시 맞힘'),
    ('recover_50',    'rare',      50,  '오답회수 마스터',  '오답 50개 다시 맞힘'),
    ('defense_7',     'rare',      1,   '기억수비수',       '7일 전 문제 첫 정답'),
    ('defense_14',    'epic',      1,   '14일 방어',        '14일 망각방어 첫 성공'),
    ('concept_20',    'rare',      20,  '수열 사냥꾼',      '특정 단원 20회 완료'),
    ('hp_full',       'common',    1,   '기억 만렙',        '기억 HP 5/5 달성'),
    ('study_60',      'common',    60,  '60분 순공러',      '하루 인정 순공 60분')
) as t(badge_key, rarity, threshold, name, description);
