-- SOO-139: today_xp / today_minutes 컬럼 추가 (게임화 실데이터 배선)
-- today_xp: Edge Function이 날짜 전환 시 리셋 + XP 누적
-- today_minutes: 플레이 시간 추적 (최소 구현 — 추후 채움)
alter table public.user_game_state
  add column if not exists today_xp int not null default 0,
  add column if not exists today_minutes int not null default 0;
