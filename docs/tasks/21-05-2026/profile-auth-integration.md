# Profile Auth Integration

Tag: auth/feature

## Goal

Surface profile, access, and settings data inside the app so UI can render real user info and gate actions by role/permission, while keeping authorization decisions tied to the JWT claim rather than user-editable data.

## Scope

- Included: extend `AppUser` with `profile` (name, birthday, positions), `access` (active, role, permissions), and `settings` (theme, mode, jsonb settings, notes); load these in `AuthProvider` after `getUser` resolves; expose a `can(permission)` helper from `useAuth`; show an "Account inactive" screen when `access.active = false`; persist theme/mode changes to `user_settings` instead of (or in addition to) localStorage.
- Excluded: editing other users (Task E); password change wiring; profile-edit forms (these can come as a small follow-up, not part of this slice).

## Acceptance criteria

- `useAuth().user` returns `null` while loading, and a populated `AppUser` (with profile/access/settings sub-objects) once both `auth.users` and the three public tables have responded.
- `useAuth().can('edit')` returns `true` iff the current `user_access.permissions` array contains `'edit'`; same for `'read'` and `'delete'`.
- `roleFromAppMetadata` remains the source of truth for `role` in authorization checks; `user_access.role` is mirrored only for display.
- When `user_access.active = false`, the workspace shell is replaced with a clear "account inactive" state and the user can still sign out.
- Theme switching writes to `public.user_settings` and survives a hard refresh on another browser session for the same user.
- Existing `AuthProvider` tests still pass; new tests cover the `can()` matrix and the inactive-account branch.
- No new client-side fetch of the `service_role` key; all reads go through the existing `@supabase/ssr` clients.

## Dependencies

- Requires Task C (schema must exist).
