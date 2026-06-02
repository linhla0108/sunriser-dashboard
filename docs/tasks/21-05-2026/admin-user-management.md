# Admin User Management

Tag: auth/feature

## Goal

Give admins a UI to list users, edit their role, permissions, active flag, and profile fields, so the new RBAC model is operable without writing SQL.

## Scope

- Included: a `/admin/users` route gated to `role='admin'` at the middleware level; a user list view (email, name, role, permissions, active); a per-user edit drawer/page that updates `user_profiles` and `user_access` rows; optimistic UI with toast feedback; a confirm dialog for destructive actions (deactivation, role change to/from admin).
- Excluded: inviting new users (Supabase admin API needs server key, deferred); deleting users; audit log; bulk edit; admin search beyond simple name/email filter.

## Acceptance criteria

- Non-admin users visiting `/admin/users` are redirected by middleware (server-side) — no flash of admin UI.
- Admin sees a paginated list of all users from `user_profiles` joined with `user_access` and `auth.users` (email).
- Admin can toggle `active`, change `role`, and add/remove `permissions` for any user except themselves (self-edit guard prevents accidental admin lockout).
- Admin can edit `full_name`, `birthday`, `positions` on a user's profile.
- All writes go through Supabase with the existing user session (RLS admin policies cover them); no `service_role` key exposure in client code.
- A user with `active=false` is reflected in the list and, on next sign-in, sees the inactive screen from Task D.
- New tests cover: admin policy allows update, member policy denies update, self-edit guard, and the list query returns expected shape.

## Dependencies

- Requires Task D (the `can()` helper and access shape).
