-- 웹 푸시 구독 테이블
-- endpoint는 브라우저+사용자+기기 조합으로 유일함 (PushSubscription.endpoint)
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  platform text,      -- 'android' | 'ios' | 'desktop'
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table push_subscriptions enable row level security;

create policy "users_own_subscriptions"
  on push_subscriptions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index push_subscriptions_user_id_idx on push_subscriptions (user_id);
