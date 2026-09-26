-- Applicant profiles, job applications, and an activity trail.
-- Apply with the Supabase SQL editor or: supabase db push

create schema if not exists private;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  phone text,
  location text,
  headline text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  company text,
  job_url text,
  status text not null default 'draft' check (
    status in ('draft', 'ready', 'filled', 'submitted')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  entity_id uuid,
  event_type text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create index applications_user_id_created_at_idx
  on public.applications (user_id, created_at desc);

create index activity_logs_user_id_created_at_idx
  on public.activity_logs (user_id, created_at desc);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function private.set_updated_at();

create trigger applications_set_updated_at
  before update on public.applications
  for each row execute function private.set_updated_at();

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public;
revoke all on function private.set_updated_at() from public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

alter table public.profiles enable row level security;
alter table public.applications enable row level security;
alter table public.activity_logs enable row level security;

create policy "Users read their own profile"
  on public.profiles
  for select
  to authenticated
  using (id = (select auth.uid()));

create policy "Users add their own profile"
  on public.profiles
  for insert
  to authenticated
  with check (id = (select auth.uid()));

create policy "Users update their own profile"
  on public.profiles
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "Users read their own applications"
  on public.applications
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "Users add their own applications"
  on public.applications
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "Users update their own applications"
  on public.applications
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Users delete their own applications"
  on public.applications
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

create policy "Users read their own activity"
  on public.activity_logs
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "Users add their own activity"
  on public.activity_logs
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));
