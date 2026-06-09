-- P6 Play / Recovery / Canvas: 풀이 캔버스 산출물 비공개 버킷
-- stroke JSON + PNG 렌더를 solutions/<user_id>/<quest_id>.{json,png} 로 저장.
-- SSoT: docs/superpowers/plans/2026-05-14-soongong-mvp1-p6-play-recovery-canvas.md (T1)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'solutions',
  'solutions',
  false,
  2 * 1024 * 1024,                       -- 2MB (PNG/JSON)
  array['application/json','image/png']
)
on conflict (id) do nothing;

-- 본인 폴더(<user_id>/...)만 읽기/쓰기
create policy "solutions: self read"
  on storage.objects for select
  using (bucket_id = 'solutions' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "solutions: self insert"
  on storage.objects for insert
  with check (bucket_id = 'solutions' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "solutions: self update"
  on storage.objects for update
  using (bucket_id = 'solutions' and (storage.foldername(name))[1] = auth.uid()::text);
