# Supabase Security Hardening
Tag: auth/fix

## Goal
Close the two open security advisor findings on the Supabase project so the database surface is safe before adding app tables.

## Scope
- Included: revoke public execution of `public.rls_auto_enable()`, enable leaked password protection in Supabase Auth.
- Excluded: any schema or code changes; deleting the event trigger itself; password policy beyond the HaveIBeenPwned check.

## Acceptance criteria
- `supabase get_advisors --type security` no longer reports `anon_security_definer_function_executable` or `authenticated_security_definer_function_executable` for `public.rls_auto_enable`.
- `supabase get_advisors --type security` no longer reports `auth_leaked_password_protection`.
- The `ensure_rls` event trigger still fires on new public-table creation (smoke: create a throwaway table, confirm RLS is enabled, drop the table).
- Change captured as a migration file in the repo so the hardening is reproducible.
