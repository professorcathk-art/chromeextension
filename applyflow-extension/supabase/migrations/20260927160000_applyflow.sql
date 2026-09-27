create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  resume_data jsonb,
  usage_count integer not null default 0,
  subscription_status text not null default 'free' check (
    subscription_status in ('free', 'pro', 'cancelled')
  ),
  stripe_customer_id text,
  stripe_subscription_id text,
  open_to_recruiters boolean not null default false,
  updated_at timestamptz not null default now()
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  company_name text,
  job_title text,
  job_url text,
  applied_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.applications enable row level security;

create policy "Users read their profile"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

create policy "Users update their own details"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "Users read their applications"
  on public.applications for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Users add their applications"
  on public.applications for insert to authenticated
  with check (user_id = (select auth.uid()));

create schema if not exists private;

revoke update on public.profiles from authenticated;
grant update (
  full_name,
  resume_data,
  open_to_recruiters,
  updated_at
) on public.profiles to authenticated;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, coalesce(new.email, ''), coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();
