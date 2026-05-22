# Backend Execution Plan — Tasks 4 & 6
Tag: auth/feature, auth/fix

This document is the detailed BE companion to `supabase-security-hardening.md` (Task 4) and `user-data-schema.md` (Task 6). It specifies the exact SQL, ordered into phases, with each step tied to a Postgres/Supabase best-practice rule. Run each phase as one transaction unless noted otherwise. Generate the final migration with `supabase db pull` after iterating on a branch DB.

## Phase ordering

```
Phase 0: Pre-flight checks                  (no writes)
Phase 1: Security hardening                 (Task 4)
Phase 2: Enums + helper functions           (Task 6 — foundation)
Phase 3: Tables + indexes                   (Task 6 — core)
Phase 4: RLS policies                       (Task 6 — security)
Phase 5: updated_at trigger                 (Task 6 — hygiene)
Phase 6: handle_new_user signup trigger     (Task 6 — automation)
Phase 7: Backfill existing admin            (Task 6 — data)
Phase 8: Verification                       (no writes)
```

Each phase has acceptance + verification SQL.

---

## Phase 0: Pre-flight

Run before touching the database.

```sql
-- Confirm project + current user
select current_user, current_database(), version();

-- Confirm rls_auto_enable still exists and is the event trigger function
select p.proname, t.evtname, t.evtenabled
from pg_proc p
join pg_namespace n on p.pronamespace = n.oid
left join pg_event_trigger t on t.evtfoid = p.oid
where n.nspname = 'public' and p.proname = 'rls_auto_enable';

-- Confirm no leftover artifacts under our target names
select 1 from information_schema.tables
where table_schema = 'public'
  and table_name in ('user_profiles', 'user_access', 'user_settings');
-- Expect: 0 rows
```

**Acceptance:** rls_auto_enable exists; target tables do not.

---

## Phase 1: Security hardening (Task 4)

Single transaction, two changes.

### 1.1 Revoke REST exposure on `rls_auto_enable`

`rls_auto_enable` must remain callable by Postgres internally for the `ensure_rls` event trigger, but must NOT be callable from anon/authenticated REST clients.

```sql
begin;

revoke execute on function public.rls_auto_enable() from public;
revoke execute on function public.rls_auto_enable() from anon;
revoke execute on function public.rls_auto_enable() from authenticated;

-- Verify only postgres/supabase_admin can execute it
select grantee, privilege_type
from information_schema.routine_privileges
where routine_schema = 'public'
  and routine_name = 'rls_auto_enable';

commit;
```

> **Why this is safe:** Event triggers fire under the role that ran the DDL (with the SECURITY DEFINER function escalating as needed). Revoking EXECUTE from the API roles does not affect the event trigger pathway — it only closes the `/rest/v1/rpc/rls_auto_enable` HTTP surface. (Rule: `security-privileges`.)

### 1.2 Enable leaked-password protection

This is a project-level Auth setting, not SQL. Update via Supabase dashboard or via the Management API:

```
Dashboard → Authentication → Policies → Password protection → toggle "Check against HaveIBeenPwned"
```

### Phase 1 verification

```sql
-- Should return 0 rows (no execute grant for public/anon/authenticated)
select grantee, privilege_type
from information_schema.routine_privileges
where routine_schema = 'public'
  and routine_name = 'rls_auto_enable'
  and grantee in ('PUBLIC', 'anon', 'authenticated');
```

Plus: `supabase get_advisors --type security` must no longer return the two SECURITY DEFINER findings or the `auth_leaked_password_protection` finding.

---

## Phase 2: Enums + helper functions

### 2.1 Enums

Use Postgres enums for `role` and `permission`. Enums are stable, indexable, and reject invalid values at the database layer. (Rule: `schema-data-types`.)

```sql
do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('admin', 'manager', 'member', 'viewer');
  end if;

  if not exists (select 1 from pg_type where typname = 'app_permission') then
    create type public.app_permission as enum ('read', 'edit', 'delete');
  end if;
end $$;
```

### 2.2 Helper function: `is_admin()`

Centralizing admin check in one function makes RLS policies short and lets you swap the implementation later (e.g., move from JWT claim to a table). The function uses `(select auth.jwt())` so it is evaluated once per statement, not per row. (Rule: `security-rls-performance`.)

```sql
create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce(
    (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- Allow signed-in users to call it from policies. Anon cannot — it returns false anyway.
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;
```

> **Why SECURITY INVOKER, not DEFINER:** the function reads only `auth.jwt()`, which is already user-scoped. SECURITY DEFINER would run as the postgres user and risk exposing data through future edits. The advisor will not flag SECURITY INVOKER. (Rule: `security-privileges` + the project Security Checklist about SECURITY DEFINER functions in exposed schemas.)

> **Why `set search_path = ''`:** prevents an attacker from creating a malicious table/function in a writable schema and tricking this function into resolving to it. (Rule: `security-privileges`.)

### Phase 2 verification

```sql
select typname from pg_type where typname in ('app_role', 'app_permission');
-- Expect: 2 rows

select public.is_admin();
-- Expect: false (when called as service_role/postgres without app_metadata)
```

---

## Phase 3: Tables + indexes

All three tables share `user_id uuid primary key references auth.users(id) on delete cascade`. This is 1:1 with `auth.users` and lets the cascade clean up everything when a user is deleted.

### 3.1 `public.user_profiles` — user-owned profile

```sql
create table public.user_profiles (
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
```

> Notes:
> - `text` not `varchar(n)` (rule: `schema-data-types`).
> - `timestamptz` not `timestamp`.
> - Do **not** store `age` — derive from `birthday`. If you need application-time age, snapshot it on the application/candidate record, not here.
> - PK already creates an implicit unique index on `user_id`, so no extra FK index is needed (rule: `schema-foreign-key-indexes` — PK covers it).

### 3.2 `public.user_access` — admin-owned authorization

```sql
create table public.user_access (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  active       boolean not null default true,
  role         public.app_role not null default 'member',
  permissions  public.app_permission[] not null default array['read']::public.app_permission[],
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.user_access is 'Admin-owned authorization fields. Users can read their own row but cannot modify it.';

-- Indexes for the admin list view ("show me all inactive users", "show me all admins")
create index user_access_role_idx   on public.user_access (role);
create index user_access_active_idx on public.user_access (active) where active = false;
```

> Notes:
> - `user_access_active_idx` is a **partial index** — most users are active, so the index only stores the rare `false` rows. Tiny index, fast "list inactive users" query. (Rule: `query-partial-indexes`.)
> - `role` index helps admin filtering and is cheap (4-value enum).

### 3.3 `public.user_settings` — user-owned UI prefs

```sql
create table public.user_settings (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  theme      text not null default 'main',
  mode       text not null default 'light',
  settings   jsonb not null default '{}'::jsonb,
  notes      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_settings_theme_known check (theme in ('main', 'cool', 'warm')),
  constraint user_settings_mode_known  check (mode  in ('light', 'dark', 'system'))
);

comment on table public.user_settings is 'User-owned UI preferences. Each user can read/update only their own row.';
```

> Notes:
> - No GIN index on `settings` yet — add only when a query pattern emerges. Premature indexing on jsonb costs writes. (Rule: `advanced-jsonb-indexing` — apply when query exists.)
> - `theme` and `mode` are constrained text rather than enums because the frontend may add themes faster than migrations. Trade-off: a CHECK constraint is easier to evolve than an enum.

### 3.4 Enable + force RLS on all three

```sql
alter table public.user_profiles enable row level security;
alter table public.user_access   enable row level security;
alter table public.user_settings enable row level security;

-- Force RLS so even the table owner (postgres) is checked when masquerading as a role
alter table public.user_profiles force row level security;
alter table public.user_access   force row level security;
alter table public.user_settings force row level security;
```

> **Why FORCE:** prevents accidental bypass when a SECURITY DEFINER function runs as the table owner. (Rule: `security-rls-basics`.)

### Phase 3 verification

```sql
-- All three tables exist with RLS enabled
select tablename, rowsecurity, forcerowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('user_profiles', 'user_access', 'user_settings');
-- Expect: 3 rows, rowsecurity = t, forcerowsecurity = t

-- Indexes exist
select indexname from pg_indexes
where schemaname = 'public'
  and tablename = 'user_access';
-- Expect: user_access_pkey, user_access_role_idx, user_access_active_idx
```

---

## Phase 4: RLS policies

Two patterns are used:

1. `(select auth.uid()) = user_id` — wraps `auth.uid()` in a subquery so Postgres evaluates it **once per statement** instead of once per row. On a 100k-row table this is the difference between 50ms and 5000ms. (Rule: `security-rls-performance`.)
2. `(select public.is_admin())` — same caching pattern, plus encapsulation.

> **Important:** every policy is scoped to `to authenticated`. The `anon` role gets no access at all. This is stricter than the Supabase default and is the recommended setup for an internal HR dashboard.

### 4.1 `user_profiles`

```sql
-- Read: own row OR admin can read all
create policy "user_profiles_select_self_or_admin"
  on public.user_profiles
  for select
  to authenticated
  using (
    (select auth.uid()) = user_id
    or (select public.is_admin())
  );

-- Update: own row only; admin updates go through user_access path (profile is user-owned)
create policy "user_profiles_update_self"
  on public.user_profiles
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Admin can also update any profile (e.g., correcting a typo in name)
create policy "user_profiles_update_admin"
  on public.user_profiles
  for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- INSERT is performed by the signup trigger as postgres; no INSERT policy needed for end-users
-- DELETE is not allowed; rows go away via auth.users cascade
```

### 4.2 `user_access`

The asymmetry here is the point: **users can read their own access row** (so the UI can show their role/permissions) but **only admins can write**.

```sql
-- Read: own row OR admin
create policy "user_access_select_self_or_admin"
  on public.user_access
  for select
  to authenticated
  using (
    (select auth.uid()) = user_id
    or (select public.is_admin())
  );

-- Update: admin only
create policy "user_access_update_admin"
  on public.user_access
  for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Note on UPDATE-needs-SELECT: an admin running UPDATE must also pass a SELECT policy.
-- The select_self_or_admin policy above already grants admins SELECT, so we're fine.
-- (Rule: Supabase Security Checklist — "UPDATE requires a SELECT policy".)

-- INSERT: trigger only (no end-user policy)
-- DELETE: cascade only (no end-user policy)
```

### 4.3 `user_settings`

```sql
create policy "user_settings_select_self"
  on public.user_settings
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "user_settings_update_self"
  on public.user_settings
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Optional: admin read for support ("user reports their theme is broken")
create policy "user_settings_select_admin"
  on public.user_settings
  for select
  to authenticated
  using ((select public.is_admin()));
```

### Phase 4 verification

```sql
-- All policies present
select schemaname, tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public'
  and tablename in ('user_profiles', 'user_access', 'user_settings')
order by tablename, policyname;
-- Expect ~8 policies

-- Smoke: as the admin user, both reads work
set local role authenticated;
set local request.jwt.claims = '{"sub":"3ad43ea2-77e7-4c13-b6cb-050eb5715701","app_metadata":{"role":"admin"}}';
select count(*) from public.user_access;     -- Expect: total user count
select count(*) from public.user_profiles;   -- Expect: total user count
reset role;
```

---

## Phase 5: `updated_at` trigger

Standard hygiene. Don't trust clients to send `updated_at`.

```sql
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

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
```

### Phase 5 verification

```sql
select tgname, tgrelid::regclass
from pg_trigger
where tgname like '%_set_updated_at';
-- Expect: 3 rows
```

---

## Phase 6: `handle_new_user` signup trigger

When `auth.users` gets a new row, automatically populate the three companion rows with safe defaults.

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer  -- needs to insert as table owner; auth.users insert happens as supabase_auth_admin
set search_path = ''
as $$
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
$$;

-- Critical: do NOT expose this via REST.
revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon;
revoke all on function public.handle_new_user() from authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

> **Why SECURITY DEFINER here is OK:** it runs only from the `auth.users AFTER INSERT` trigger context, not from REST. We explicitly revoked EXECUTE from anon/authenticated so it cannot be called via RPC. (Rule: Supabase Security Checklist — "Do not put SECURITY DEFINER functions in an exposed schema" — we satisfy this by revoking the REST grant.)

> **Idempotent inserts:** `on conflict (user_id) do nothing` means rerunning is safe (matters during backfill).

### Phase 6 verification

```sql
-- Trigger exists on auth.users
select tgname from pg_trigger where tgname = 'on_auth_user_created';
-- Expect: 1 row

-- handle_new_user is not REST-callable
select grantee, privilege_type
from information_schema.routine_privileges
where routine_schema = 'public'
  and routine_name = 'handle_new_user'
  and grantee in ('PUBLIC', 'anon', 'authenticated');
-- Expect: 0 rows
```

---

## Phase 7: Backfill existing admin

The trigger covers future users. Existing users (just the one admin) need rows created manually.

```sql
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
```

### Phase 7 verification

```sql
-- Every auth user has all three rows
select
  (select count(*) from auth.users)        as auth_users,
  (select count(*) from public.user_profiles) as profiles,
  (select count(*) from public.user_access)   as access,
  (select count(*) from public.user_settings) as settings;
-- Expect: all four columns equal

-- The admin has the right access
select ua.role, ua.permissions, ua.active
from public.user_access ua
join auth.users u on u.id = ua.user_id
where u.email = 'admin@sunriser.com';
-- Expect: role = admin, permissions = {read,edit,delete}, active = true
```

---

## Phase 8: Final verification

### 8.1 Advisors

```bash
supabase db advisors --type security
supabase db advisors --type performance
```

Expected: no `policy_exists_rls_disabled`, `rls_disabled_in_public`, `anon_security_definer_function_executable`, `authenticated_security_definer_function_executable`, or `auth_leaked_password_protection` findings.

### 8.2 RLS smoke matrix

Run as the admin user (real JWT, not the postgres role):

| Action | Expected |
| --- | --- |
| `select count(*) from user_profiles`            | total user count |
| `update user_access set role='member' where ... ` (target = admin's own row) | rows = 1, but UI should block it via self-edit guard |
| `update user_access set role='admin' where ... ` (target = another user) | rows = 1 |
| `update user_profiles set notes='x' where user_id = <other>` | rows = 1 (admin can edit profiles) |

Run as a non-admin authenticated user:

| Action | Expected |
| --- | --- |
| `select * from user_profiles where user_id != <self>` | 0 rows (RLS hides them) |
| `update user_access set role='admin' where user_id = <self>` | 0 rows affected (silent — by design; UI must not rely on error) |
| `update user_profiles set full_name='hacker' where user_id = <self>` | rows = 1 |
| `update user_settings set theme='cool' where user_id = <self>` | rows = 1 |

### 8.3 Trigger smoke

Create a throwaway user via the Auth admin API and confirm:

```sql
select count(*) from public.user_profiles where user_id = '<new-uuid>';
-- Expect: 1
select count(*) from public.user_access   where user_id = '<new-uuid>';
-- Expect: 1
select count(*) from public.user_settings where user_id = '<new-uuid>';
-- Expect: 1
```

Delete the user; confirm cascade:

```sql
delete from auth.users where id = '<new-uuid>';
select count(*) from public.user_profiles where user_id = '<new-uuid>';
-- Expect: 0
```

---

## Migration commit workflow

1. Iterate against a branch DB (or local) using `execute_sql`. Do NOT use `apply_migration` while iterating — it creates one migration entry per call.
2. Once green, commit:
   ```bash
   supabase db pull user_access_and_profiles --local --yes
   supabase migration list --local
   ```
3. Re-run `supabase get_advisors --type security` against the branch.
4. Open PR with the migration file plus this plan as evidence.

---

## Out of scope (explicitly)

- Mirroring `user_access.role` back into `auth.users.app_metadata`. The JWT remains the source of truth for authorization; the table is the audit-friendly mirror. If the UI needs role on token refresh, do it as a follow-up using `auth.admin.updateUserById()` from a server function.
- Storing `age`. Derive in app from `birthday`.
- Adding GIN index on `user_settings.settings`. Add when a query pattern materializes.
- Audit log for who-changed-what on `user_access`. Defer to a follow-up task.
- Inviting new users via Supabase admin API. Requires `service_role` key and a server-only function.

---

## Risks captured for human review (kept in this doc, not in `summary.md`)

| Risk | Mitigation |
| --- | --- |
| `is_admin()` reads JWT; JWT is not fresh until token refresh after a role change | Force `supabase.auth.refreshSession()` from the admin UI after writing `user_access.role`. Document this in Task 8. |
| `handle_new_user` runs as SECURITY DEFINER | Mitigated by `set search_path = ''`, REVOKE from REST roles, and trigger-only invocation path. |
| RLS UPDATE silently affects 0 rows when policy denies | The admin UI must check `count` of `update().select()` response and surface "permission denied" to the user. |
| Future tables created in `public` will auto-enable RLS but have no policies, so they will be locked down by default — which is correct, but the developer must remember to write policies before exposing the table to the UI. | Add a checklist in the project README's "Adding a new table" section. |
