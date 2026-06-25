-- 0028_plo_variant_status.sql
-- SOO-138: 분석 레이턴시 최적화 — generate-problem 블로킹 해제
-- parsed_learning_objects에 variant_status 컬럼 추가.
-- null = 아직 생성 시도 없음 (텍스트 입력 등 generate-problem 미호출 경로)
-- pending = generate-problem 백그라운드 실행 중
-- done    = 변형 문항 생성 완료
-- failed  = 생성 실패 (부적격·오류 포함)
-- 기존 행은 null로 유지 — 마이그레이션 후 레거시 행에 backfill 불필요.

alter table public.parsed_learning_objects
  add column if not exists variant_status text
  check (variant_status in ('pending', 'done', 'failed'));

comment on column public.parsed_learning_objects.variant_status is
  'generate-problem 비동기 상태: null=미시도, pending=생성중, done=완료, failed=실패';

-- 오늘 페이지 카드 렌더링에서 variant_status=pending 행을 빠르게 조회하기 위한 인덱스.
create index if not exists idx_plo_variant_status_pending
  on public.parsed_learning_objects (user_id, variant_status)
  where variant_status = 'pending';
