# Supabase Auth Audit

Tag: auth/audit

## Goal

Audit the current Supabase project and repo auth flow, then define the next RBAC and user profile direction.

## Scope

- Included: Supabase MCP inventory, repo auth flow review, security gap list, and proposed user profile/RBAC data model.
- Excluded: applying database migrations, changing auth code, adding admin screens, and creating real user data.

## Acceptance criteria

- Current Supabase assets are listed with security-relevant notes.
- Current repo auth behavior is classified as ready, partial, or missing.
- Required work for user roles, permissions, settings, and extra profile fields is concrete enough to implement next.

---

## Report

Status: Done

### Supabase inventory

Project:

- Name: Dashboard HR
- Ref: kumhwmpfxoyauquevhbz
- Region: ap-southeast-1
- Status: ACTIVE_HEALTHY
- Database: PostgreSQL 17.6.1.121
- Project URL: https://kumhwmpfxoyauquevhbz.supabase.co

Current assets:

- Auth users: 1 total, 1 email-confirmed, 1 signed in before.
- Auth provider in use: email.
- Sessions: 2 rows.
- App metadata roles: 1 user has `admin`.
- Public/private business tables: none.
- Storage buckets: none.
- Edge Functions: none.
- Supabase migrations: none.
- Public/storage RLS policies: none, because there are no app tables yet.
- Repo `.env.local` points to this project and uses a publishable key, not a service role key.

Security advisor findings:

- `public.rls_auto_enable()` is a `SECURITY DEFINER` function executable by `PUBLIC`, `anon`, and `authenticated`.
- The function is used by event trigger `ensure_rls` to auto-enable RLS after public table creation.
- Leaked password protection is disabled in Supabase Auth.
- Performance advisors returned no findings.

Recommended immediate Supabase hardening:

- Revoke public execution from `public.rls_auto_enable()`.
- Keep the event trigger if desired, but do not expose its function through RPC.
- Enable leaked password protection in Supabase Auth settings.
- Start tracking database changes with migrations before adding app tables.

### Repo auth flow review

What is already good:

- The app uses `@supabase/ssr` with browser, server, and proxy clients.
- `proxy.ts` calls `supabase.auth.getClaims()`, which matches current Supabase SSR guidance for token refresh and JWT validation.
- Frontend auth reads role from `app_metadata`, not user-editable `user_metadata`.
- Signup UI is disabled, matching an admin-created-account model.
- `.env.local` contains only public Supabase values.

Main gaps:

- Protected workspace routes are guarded in the client by `RequireAuth`, not by server/proxy redirect. This is acceptable for mock data, but it is not a production authorization boundary.
- There is no database-backed RBAC. `role` is currently only a display/runtime value from `app_metadata`.
- There is no permission enforcement for read, edit, delete, export, settings, or HR actions.
- There is no `profiles` table or `user_settings` table for name, birthday, positions, notes, theme, or other settings.
- `AccountTab` password change is mock-only and does not call Supabase.
- `RequireAuth` preserves `from`, but login currently redirects to `/dashboard` instead of using it.
- `/auth/confirm` accepts a `next` param without an explicit internal-path allowlist.
- Reset password sends users to `/login`, but there is no real update-password recovery screen yet.
- The remember-me behavior is local app state layered on top of Supabase cookies. It signs out after app load, but server-side route protection should also understand this policy if strict session length matters.

Auth flow status:

- Login/session basics: partial.
- Route protection: partial.
- User profile storage: missing.
- Role-based access control: missing.
- Permission-based actions: missing.
- Account settings persistence: missing.
- Production security posture: not ready until server/proxy guards and RLS-backed tables exist.

### Recommended user data model

Do not store authorization data in `user_metadata`. User-editable metadata is not safe for authorization.

Use three layers:

1. `auth.users`
   - Supabase-managed login identity.
   - Keep email/password/session here.

2. `public.user_profiles`
   - User-owned profile fields.
   - Good for name, birthday, positions, and non-sensitive profile notes.

3. `public.user_access`
   - Admin-owned authorization fields.
   - Good for `active`, `role`, and `permissions`.
   - Users should not be able to update their own access row.

4. `public.user_settings`
   - User-owned UI preferences.
   - Good for theme, mode, table preferences, dashboard settings, and private notes if those notes are only for that user.

Suggested fields:

```sql
create type public.app_role as enum ('admin', 'manager', 'member', 'viewer');
create type public.app_permission as enum ('read', 'edit', 'delete');

create table public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  birthday date,
  positions text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_access (
  user_id uuid primary key references auth.users(id) on delete cascade,
  active boolean not null default true,
  role public.app_role not null default 'member',
  permissions public.app_permission[] not null default array['read']::public.app_permission[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text not null default 'main',
  mode text not null default 'light',
  settings jsonb not null default '{}'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Notes:

- Prefer deriving `age` from `birthday` in the app, because stored age becomes stale.
- If the business needs age at application time, store a snapshot like `application_age` on the application/candidate record, not on the user profile.
- Keep flexible UI settings in `jsonb`, but keep authorization fields typed and explicit.
- Mirror `role` to `app_metadata` only for fast UI display if needed. Treat the database access table as the source of truth.

### Required next implementation tasks

1. Fix current auth hardening:
   - Add server/proxy guard for workspace routes.
   - Validate `/auth/confirm?next=` as an internal path.
   - Honor `from` after login.
   - Replace mock password change with Supabase `updateUser`.

2. Add database schema:
   - Add profile, access, and settings tables.
   - Enable RLS on every public table.
   - Add policies for self-read/profile-update/settings-update.
   - Add admin-only policies for access management.
   - Revoke public execution from exposed security-definer functions.

3. Add app-level RBAC:
   - Extend `V2User` with profile, active, role, and permissions.
   - Add `can('read' | 'edit' | 'delete')` helper.
   - Gate destructive UI actions and server/database writes.
   - Show inactive-account state instead of workspace access.

4. Add admin UX:
   - Admin user management page or panel.
   - Edit role, permissions, active status, and profile fields.
   - Keep audit-friendly changes later if needed.

Verification performed:

- Supabase MCP project inventory.
- Supabase MCP table, function, policy, migration, edge function, and advisor checks.
- Repo auth source review for Supabase clients, auth provider, route guard, login, signup, forgot password, confirm route, settings account tab, and workspace shell.
- Current Supabase docs lookup for SSR clients, proxy session refresh, RLS, `auth.jwt()`, and user metadata versus app metadata.

Remaining:

- No migrations or code fixes were applied in this audit.
- The next step should be a separate implementation task because it changes auth behavior and stores new user data.
