-- Migration: allowed_email_domains + Before User Created hook
-- Date: 2026-05-27
-- Slice A / Task 1.1
--
-- Creates private.allowed_email_domains and the Supabase Auth hook function
-- that rejects signups from non-allowlisted domains BEFORE auth.users insert.
-- Domain values are seeded out-of-band via scripts/seed-allowed-domain.sql.example
-- and are NEVER committed.

-- ============================================================================
-- Phase 1: Private schema
-- ============================================================================

create schema if not exists private;

-- Revoke all access from public roles — PostgREST cannot reach this schema.
revoke all on schema private from public, anon, authenticated;

-- Grant usage only to supabase_auth_admin so the hook function can read it.
grant usage on schema private to supabase_auth_admin;

-- ============================================================================
-- Phase 2: Allowlist table
-- ============================================================================

create table if not exists private.allowed_email_domains (
  id          bigserial primary key,
  domain      text not null unique,
  created_at  timestamptz not null default now(),
  created_by  uuid references auth.users(id),
  constraint domain_is_lowercase check (domain = lower(domain)),
  constraint domain_no_at_sign   check (position('@' in domain) = 0),
  constraint domain_min_length   check (char_length(domain) >= 3)
);

comment on table private.allowed_email_domains
  is 'Email domains allowed to sign up via OAuth. Seeded manually — never committed. Read-only to supabase_auth_admin.';

-- Only supabase_auth_admin may read. Nothing else can touch this table.
revoke all on table private.allowed_email_domains from public, anon, authenticated;
grant select on table private.allowed_email_domains to supabase_auth_admin;

-- ============================================================================
-- Phase 3: Before User Created hook function
-- ============================================================================
-- Runs synchronously before Supabase inserts a row into auth.users.
-- Return {} → allow. Return { error: { message, http_code } } → reject (no row created).

create or replace function public.hook_restrict_signup_by_email_domain(event jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  user_email  text;
  user_domain text;
  allowed_count int;
begin
  user_email := event->'user'->>'email';

  -- Reject if no email or malformed.
  if user_email is null or position('@' in user_email) = 0 then
    return jsonb_build_object(
      'error', jsonb_build_object(
        'message', 'Access denied. Contact your administrator if you believe this is an error.',
        'http_code', 403
      )
    );
  end if;

  user_domain := lower(split_part(user_email, '@', 2));

  select count(*) into allowed_count
  from private.allowed_email_domains
  where domain = user_domain;

  if allowed_count > 0 then
    -- Allow signup.
    return '{}'::jsonb;
  end if;

  -- Reject — same generic message regardless of reason to prevent enumeration.
  return jsonb_build_object(
    'error', jsonb_build_object(
      'message', 'Access denied. Contact your administrator if you believe this is an error.',
      'http_code', 403
    )
  );
end;
$$;

-- Grant execute only to supabase_auth_admin (the hook runner).
grant execute on function public.hook_restrict_signup_by_email_domain(jsonb)
  to supabase_auth_admin;

revoke execute on function public.hook_restrict_signup_by_email_domain(jsonb)
  from public, anon, authenticated;

-- ============================================================================
-- Post-migration: operator must complete these steps manually
-- (documented in docs/tasks/27-05-2026/microsoft-oauth-login.md)
--
-- 1. Supabase Dashboard → Auth → Providers → Azure → enable + configure
-- 2. Supabase Dashboard → Auth → Hooks → Before User Created →
--    select public.hook_restrict_signup_by_email_domain
-- 3. Supabase SQL Editor → run scripts/seed-allowed-domain.sql.example
--    with the real domain substituted (do NOT commit the real value)
-- ============================================================================
