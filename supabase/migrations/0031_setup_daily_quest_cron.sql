-- SOO-163: daily-quest-builder Edge Function 자동 실행 스케줄 등록.
-- pg_cron + pg_net 으로 매일 UTC 00:00 에 Edge Function 을 호출.
-- 근거: supabase/functions/daily-quest-builder/index.ts 가 HTTP POST 로만 트리거됨.

-- pg_net: HTTP 호출 확장 (Supabase 기본 탑재)
create extension if not exists pg_net   with schema extensions;

-- pg_cron: 크론 스케줄러 확장
create extension if not exists pg_cron  with schema pg_catalog;

grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

-- 중복 방지: 이미 등록된 job 제거
do $$
begin
  perform cron.unschedule('daily-quest-builder');
exception when others then null;
end $$;

-- 매일 UTC 00:00 에 daily-quest-builder 실행
-- 로컬 Supabase: Kong 게이트웨이 내부 주소 사용 (supabase start 기준).
-- 프로덕션: Supabase 대시보드 → Edge Functions → Schedule 에서도 동일 등록.
select cron.schedule(
  'daily-quest-builder',
  '0 0 * * *',
  $$
    select net.http_post(
      url     := 'http://supabase_kong_soongong:8000/functions/v1/daily-quest-builder',
      headers := '{"Content-Type":"application/json"}'::jsonb,
      body    := '{}'::jsonb
    ) as request_id;
  $$
);
