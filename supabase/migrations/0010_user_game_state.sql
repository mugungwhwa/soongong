-- P7 game system: user_game_state table
-- SSoT: 01_제품_UX_게임화/게임성_기획_구조.md v1.0
--   - memory_hp: 0-5 정수 (§4-2)
--   - rank: 6단 누적 XP (§6-1)
create table public.user_game_state (
  user_id uuid primary key references public.users(id) on delete cascade,
  streak_days int not null default 0,
  last_active_date date,
  memory_hp smallint not null default 5 check (memory_hp between 0 and 5),
  total_xp int not null default 0,
  rank text not null default '순공입문'
    check (rank in ('순공입문','순공러','순공대장','순공도사','순공마왕','순공전설')),
  rank_tier text,
  updated_at timestamptz not null default now()
);

alter table public.user_game_state enable row level security;
create policy "ugs: self read" on public.user_game_state for select using (auth.uid() = user_id);

create or replace function public.update_rank(p_xp int) returns text language sql immutable as $$
  select case
    when p_xp >= 12000 then '순공전설'
    when p_xp >= 7000  then '순공마왕'
    when p_xp >= 3500  then '순공도사'
    when p_xp >= 1500  then '순공대장'
    when p_xp >= 500   then '순공러'
    else '순공입문'
  end;
$$;
