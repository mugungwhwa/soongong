-- SOO-31: type_pattern_cards
-- SSoT: 외부_데이터_유입_엔진.md §5.D
-- 수능 기출 유형 추상화 카드 (원문 아님) — Type Pattern RAG 핵심

create table public.type_pattern_cards (
  type_id uuid primary key default gen_random_uuid(),
  subject text not null,
  unit text,
  topic text,
  type_name text not null,
  stem_structure jsonb,
  cognitive_skill text,
  common_mistakes jsonb,
  variation_axes jsonb,
  difficulty_factors jsonb,
  validation_rules jsonb,
  copyright_safety_rules jsonb,
  embedding vector(1536),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tpc_subject_unit_idx
  on public.type_pattern_cards (subject, unit)
  where unit is not null;

-- pgvector HNSW 인덱스: embedding 유사도 검색
create index tpc_embedding_idx
  on public.type_pattern_cards
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

alter table public.type_pattern_cards enable row level security;

-- 온톨로지 데이터: 인증된 사용자 읽기 허용 (공유 지식)
create policy "tpc: authenticated read"
  on public.type_pattern_cards for select
  using (auth.uid() is not null);

-- write는 service_role(관리자 배치 작업)만

create or replace function public.tpc_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger tpc_updated_at
  before update on public.type_pattern_cards
  for each row execute function public.tpc_set_updated_at();
