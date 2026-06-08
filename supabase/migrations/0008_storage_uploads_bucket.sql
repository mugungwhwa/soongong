-- P2 Source Intake: uploads private bucket + 사용자별 path RLS
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'uploads',
  'uploads',
  false,
  5 * 1024 * 1024,
  array['image/jpeg','image/png','image/webp','image/heic']
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types,
  public = excluded.public;

create policy "uploads: self read"
  on storage.objects for select
  using (
    bucket_id = 'uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "uploads: self insert"
  on storage.objects for insert
  with check (
    bucket_id = 'uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "uploads: self delete"
  on storage.objects for delete
  using (
    bucket_id = 'uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
