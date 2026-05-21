# User Data Schema
Tag: auth/feature

## Goal
Land the database foundation for storing per-user profile, access, and settings data with row-level security, so subsequent tasks can read and write user info safely.

## Scope
- Included: a Supabase migration that creates `public.user_profiles`, `public.user_access`, `public.user_settings`, the `app_role` and `app_permission` enums, RLS policies, a `handle_new_user` trigger on `auth.users` insert, and a one-off backfill row for the existing admin user.
- Excluded: any frontend code; admin UI; mirroring role to `app_metadata` (deferred to Task D if needed).

## Acceptance criteria
- Migration creates three tables with the columns described in `supabase-auth-audit.md` (profile fields, access fields with `active`/`role`/`permissions`, settings with `theme`/`mode`/`settings` jsonb/`notes`).
- RLS is enabled on all three tables; `supabase get_advisors --type security` reports no `policy_exists_rls_disabled` or `rls_disabled_in_public` findings.
- A signed-in user can `SELECT` and `UPDATE` only their own `user_profiles` and `user_settings` rows.
- A signed-in user can `SELECT` only their own `user_access` row and cannot `UPDATE`, `INSERT`, or `DELETE` it.
- A user with `app_metadata.role = 'admin'` can `SELECT`/`UPDATE` all rows in `user_access` (verified via JWT claim, not via `user_profiles.role`).
- `handle_new_user` trigger inserts one row into each of the three tables on `auth.users` insert with safe defaults (`role='member'`, `permissions=['read']`, `active=true`, `theme='main'`).
- The existing admin user has a row in each of the three tables, with `role='admin'` and full permissions.
- Migration is captured as a file under `supabase/migrations/` so it is reproducible.

## Dependencies
- Independent of Task A and Task B, but should land after Task A to avoid re-running advisors against an unfixed baseline.
