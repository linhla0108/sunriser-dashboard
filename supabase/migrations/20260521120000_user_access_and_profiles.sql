-- Migration: user_access_and_profiles
-- Date: 2026-05-21
-- Tasks: 4 (security hardening) + 6 (user data schema)
--
-- Adds three user-scoped tables (user_profiles, user_access, user_settings),
-- enums, helper functions, RLS policies, and triggers.
-- Also revokes REST exposure of public.rls_auto_enable().

-- ============================================================================
-- Phase 1: Security hardening
-- ============================================================================

revoke execute on function public.rls_auto_enable() from public;
revoke execute on function public.rls_auto_enable() from anon;
revoke execute on function public.rls_auto_enable() from authenticated;

-- ============================================================================
-- Phase 2: Enums + helper functions
-- ============================================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('admin', 'manager', 'member', 'viewer');
  end if;

  if not exists (select 1 from pg_type where typname = 'app_permission') then
    create type public.app_permission as enum ('read', 'edit', 'delete');
  end if;
end $$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $func$
  select coalesce(
    (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$func$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- ============================================================================
-- Phase 3: Tables + indexes
-- ============================================================================

create table if not exists public.user_profiles (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null default '',
  birthday    date,
  positions   text[] not null default '{}'::text[],
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint user_profiles_full_name_length check (char_length(full_name) <= 200),
  constraint user_profiles_birthday_sane    check (birthday is null or birthday between date '1900-01-01' and current_date)
);
comment on table public.user_profiles is 'User-owned profile fields. Each user can read/update only their own row.';

create table if not exists public.user_access (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  active       boolean not null default true,
  role         public.app_role not null default 'member',
  permissions  public.app_permission[] not null default array['read']::public.app_permission[],
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
comment on table public.user_access is 'Admin-owned authorization fields. Users can read their own row but cannot modify it.';

create index if not exists user_access_role_idx   on public.user_access (role);
create index if not exists user_access_active_idx on public.user_access (active) where active = false;

create table if not exists public.user_settings (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  theme      text not null default 'main',
  mode       text not null default 'light',
  settings   jsonb not null default '{}'::jsonb,
  notes      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_settings_theme_known check (theme in ('main', 'glass-orange', 'glass-blue')),
  constraint user_settings_mode_known  check (mode  in ('light', 'dark', 'system'))
);
comment on table public.user_settings is 'User-owned UI preferences. Each user can read/update only their own row.';

-- RLS is auto-enabled by the ensure_rls event trigger; we only need FORCE.
alter table public.user_profiles force row level security;
alter table public.user_access   force row level security;
alter table public.user_settings force row level security;

-- ============================================================================
-- Phase 4: RLS policies
-- ============================================================================

-- user_profiles
create policy "user_profiles_select_self_or_admin"
  on public.user_profiles for select to authenticated
  using ((select auth.uid()) = user_id or (select public.is_admin()));

create policy "user_profiles_update_self"
  on public.user_profiles for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "user_profiles_update_admin"
  on public.user_profiles for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- user_access
create policy "user_access_select_self_or_admin"
  on public.user_access for select to authenticated
  using ((select auth.uid()) = user_id or (select public.is_admin()));

create policy "user_access_update_admin"
  on public.user_access for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- user_settings
create policy "user_settings_select_self"
  on public.user_settings for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "user_settings_update_self"
  on public.user_settings for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "user_settings_select_admin"
  on public.user_settings for select to authenticated
  using ((select public.is_admin()));

-- ============================================================================
-- Phase 5: updated_at trigger
-- ============================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $func$
begin
  new.updated_at := now();
  return new;
end;
$func$;

revoke all on function public.set_updated_at() from public;

create trigger user_profiles_set_updated_at
  before update on public.user_profiles
  for each row execute function public.set_updated_at();

create trigger user_access_set_updated_at
  before update on public.user_access
  for each row execute function public.set_updated_at();

create trigger user_settings_set_updated_at
  before update on public.user_settings
  for each row execute function public.set_updated_at();

-- ============================================================================
-- Phase 6: handle_new_user signup trigger
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $func$
declare
  meta_full_name text;
begin
  meta_full_name := coalesce(
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'name',
    split_part(new.email, '@', 1),
    ''
  );

  insert into public.user_profiles (user_id, full_name)
    values (new.id, meta_full_name)
    on conflict (user_id) do nothing;

  insert into public.user_access (user_id, active, role, permissions)
    values (new.id, true, 'member', array['read']::public.app_permission[])
    on conflict (user_id) do nothing;

  insert into public.user_settings (user_id)
    values (new.id)
    on conflict (user_id) do nothing;

  return new;
end;
$func$;

revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon;
revoke all on function public.handle_new_user() from authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- Phase 7: Backfill existing users
-- ============================================================================

do $$
declare
  u record;
  is_admin_user boolean;
begin
  for u in select id, email, raw_user_meta_data, raw_app_meta_data from auth.users loop
    is_admin_user := coalesce(u.raw_app_meta_data ->> 'role', 'member') = 'admin';

    insert into public.user_profiles (user_id, full_name)
      values (
        u.id,
        coalesce(u.raw_user_meta_data ->> 'full_name', split_part(u.email, '@', 1), '')
      )
      on conflict (user_id) do nothing;

    insert into public.user_access (user_id, active, role, permissions)
      values (
        u.id,
        true,
        case when is_admin_user then 'admin'::public.app_role else 'member'::public.app_role end,
        case when is_admin_user
          then array['read','edit','delete']::public.app_permission[]
          else array['read']::public.app_permission[]
        end
      )
      on conflict (user_id) do nothing;

    insert into public.user_settings (user_id)
      values (u.id)
      on conflict (user_id) do nothing;
  end loop;
end $$;
