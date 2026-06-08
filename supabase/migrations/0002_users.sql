create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'student'
    check (role in ('student', 'parent', 'admin', 'reviewer')),
  birth_year smallint,
  is_under_14 boolean generated always as (
    birth_year is not null and
    (extract(year from now())::int - birth_year) < 14
  ) stored,
  guardian_verified boolean not null default false,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index users_role_idx on public.users (role);

alter table public.users enable row level security;

create policy "users: self read"
  on public.users for select
  using (auth.uid() = id);

create policy "users: self update"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- auth.users → public.users 자동 sync
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, role)
  values (new.id, 'student');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
