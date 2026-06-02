# UI Follow-up Plan (after BE Phase 1-7)

Tag: auth/feature

This document captures the frontend work needed now that the database backend is in place. It is split into 6 tasks (11-16), ordered by dependency. Tasks 11 and 12 are the foundation everything else builds on.

## Context

Backend now provides:

- 3 tables: `user_profiles`, `user_access`, `user_settings` with RLS.
- `is_admin()` SQL helper.
- `handle_new_user()` signup trigger.
- 1 admin user backfilled.

Backend gaps that affect the UI:

- `is_admin()` reads from `auth.jwt() -> app_metadata.role`. The JWT does **not** auto-refresh when `user_access.role` changes. After an admin updates a user's role, the affected user's UI keeps the old role until token refresh (~1 hour) or sign-out.
- Inviting new users requires the `service_role` key. Not possible from the browser; needs a server route.
- `auth_leaked_password_protection` is still off; toggle in dashboard.

---

## Task 11 — Server-side route protection (`middleware.ts`)

Tag: auth/feature

### Goal

Move route protection from the client (`RequireAuth`) to Next.js middleware, eliminating the flash of unauthenticated UI.

### Scope

- Included: `middleware.ts` that reuses `updateSession`, redirects unauthenticated requests on protected paths to `/login?from=...`, validates `from` is internal, lets `/login` / `/auth/confirm` / static assets pass through.
- Excluded: role-based gating (Task 14), profile loading.

### Acceptance criteria

- Logged-out user hitting `/dashboard` (or any protected route) gets a 307 redirect to `/login?from=%2Fdashboard` from the edge — no HTML body served.
- After login, user lands on the `from` path if it starts with `/` and contains no protocol/`//`; else `/dashboard`.
- `/auth/confirm?next=` only honors `next` when it is an internal path.
- Matcher excludes `_next/static`, `_next/image`, `favicon`, and image extensions.

---

## Task 12 — `AppUser` extension + profile loading in `AuthProvider`

Tag: auth/feature

### Goal

Load `user_profiles` + `user_access` + `user_settings` after `getUser()` resolves and expose them through `useAuth()`.

### Scope

- Included: extend `AppUser` type with `profile`, `access`, `settings` sub-objects; fetch in a single round-trip with `supabase.from('user_profiles').select('*, user_access(*), user_settings(*)')` (or three parallel `.select()` calls — pick whichever the RLS plan allows); expose `can(permission)` and `isAdmin` from `useAuth()`; show an `<InactiveAccount />` screen when `access.active = false`.
- Excluded: editing the data (Tasks 13, 15).

### Acceptance criteria

- `useAuth().user` is `null` while either auth or profile load is pending; becomes the populated shape once both finish.
- `useAuth().can('edit')` returns `true` iff `user.access.permissions.includes('edit')`.
- `useAuth().isAdmin` returns `true` iff `user.access.role === 'admin'` (mirror of JWT for display only — authorization decisions still trust the JWT).
- When `user.access.active === false`, the workspace is replaced with a clear "account inactive" state and the user can still sign out.
- Existing `AuthProvider` tests pass; new tests cover `can()` matrix, inactive screen, and loading state.

### Dependency

None (operates on already-deployed DB).

---

## Task 13 — Settings page wired to `user_settings`

Tag: auth/feature

### Goal

Persist theme/mode changes to the database so they survive across devices.

### Scope

- Included: replace localStorage theme logic in `ThemeProvider` with a Supabase write to `user_settings`; on cold load, hydrate theme from `user_settings` instead of localStorage; keep localStorage as a same-device cache only.
- Excluded: notes field UI; arbitrary jsonb settings UI (defer).

### Acceptance criteria

- Switching theme writes `update user_settings set theme = $1 where user_id = auth.uid()`.
- Refreshing the page in another browser (same user, different device) shows the same theme.
- Failure to write (network down) does not break the UI; theme falls back to localStorage.
- No `service_role` key in client code.

### Dependency

Task 12.

---

## Task 14 — Permission-gated UI actions

Tag: auth/feature

### Goal

Use `can()` to hide or disable destructive actions for users without permission.

### Scope

- Included: audit all destructive actions in candidate views, table views, and chat (delete row, export data, "Create report"); wrap each in `useAuth().can('edit' | 'delete')`; render tooltip "You do not have permission to do this" for disabled buttons.
- Excluded: server-side enforcement of these checks (RLS already covers data; UI is just for UX).

### Acceptance criteria

- A user with `permissions = ['read']` sees disabled state on delete buttons, hidden state on admin-only menu items.
- A user with `permissions = ['read','edit','delete']` sees everything enabled.
- Toggling the permission in the DB (via SQL editor) reflects after a hard refresh.

### Dependency

Task 12.

---

## Task 15 — Admin user management page (`/admin/users`)

Tag: auth/feature

### Goal

Give admins a UI to list users and edit role/permissions/active/profile fields.

### Scope

- Included: route `/admin/users`, protected by middleware (Task 11) AND by `isAdmin` check; list view (email, name, role, permissions, active) joining `user_profiles` + `user_access` + `auth.users`; edit drawer for one user at a time; optimistic update + toast; self-edit guard (cannot demote yourself); confirm dialog for `role` changes and `active` flips.
- Excluded: inviting new users (Task 16); deleting users; audit log.

### Acceptance criteria

- Non-admin hitting `/admin/users` gets server-side redirect (no flash).
- Admin can change another user's role/permissions/active/profile and see the change reflected after refresh.
- Admin cannot save edits to their own row through this UI (button disabled with tooltip).
- After saving a role change, the UI shows a banner: "User must sign out and back in for their role to take effect." (Until the JWT refresh issue is fixed in Task 16.)
- All writes happen with the authenticated user's session; RLS policies do the enforcement; no `service_role` key in client code.

### Dependency

Tasks 11, 12, 14.

---

## Task 16 — JWT refresh after role change + user invitation

Tag: auth/feature

### Goal

Solve the two backend-gap issues that need a server route: stale JWT after role change, and inviting new users.

### Scope

- Included:
  - Add `app/api/admin/refresh-claims/route.ts` that uses `service_role` to call `supabase.auth.admin.updateUserById(userId, { app_metadata: { role: newRole } })` immediately after Task 15 writes `user_access.role`. This mirrors the DB role into `app_metadata`, so the next token refresh has the new role.
  - Add `app/api/admin/invite-user/route.ts` that uses `service_role` to call `supabase.auth.admin.inviteUserByEmail(email)` — handles the email magic-link signup flow. The `handle_new_user` trigger fills in the three companion tables automatically.
  - Both routes must check `isAdmin()` on the caller's session before running.
  - Wire Task 15's role-edit drawer to call the refresh-claims route after saving.
  - Wire a new "Invite user" button into Task 15's page that calls invite-user.
- Excluded: server-side audit log; bulk invite.

### Acceptance criteria

- Changing a user's role updates `user_access.role` AND `auth.users.app_metadata.role` in one admin action.
- The affected user's UI reflects the new role within ~1 minute (next token refresh tick) without needing manual sign-out.
- Admin can invite a new user via email; the new user receives a signup magic link; on signup, the three companion rows exist with default `member` access.
- `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local` and is NOT prefixed with `NEXT_PUBLIC_`. The route file uses `process.env.SUPABASE_SERVICE_ROLE_KEY` only, never imported into client bundles.
- Both routes return 403 if the caller is not an admin.

### Dependency

Task 15.

---

## Task 17 — Enable leaked-password protection (Supabase dashboard)

Tag: auth/fix

### Goal

Clear the final security advisor warning.

### Scope

- Included: toggle in dashboard Authentication → Policies.
- Excluded: SQL changes (none possible — this is a project setting).

### Acceptance criteria

- `supabase get_advisors --type security` returns 0 findings.
- Existing users with already-leaked passwords can still log in (the check applies on signup/password-change, not on every login).

### Dependency

None.

---

## Implementation order

```
Task 11 ─┐
         ├─ Checkpoint D: middleware protects routes; AppUser shape loaded
Task 12 ─┘
              │
Task 13 ──────┤── Checkpoint E: settings persist across devices
              │
Task 14 ──────┤── Checkpoint F: permissions gate UI
              │
              └── Task 15 ── Task 16 ── Checkpoint G: full admin loop works

Task 17: independent, do anytime.
```

Tasks 11, 12, 17 can run in parallel.

## Risk register (UI side)

| Risk                                                                                      | Mitigation                                                                                                                                                                   |
| ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `service_role` key leaking into client bundle                                             | Set the key without `NEXT_PUBLIC_` prefix; verify with `pnpm build && grep -r SUPABASE_SERVICE_ROLE_KEY .next/static` — must return 0 hits.                                  |
| RLS UPDATE silently affects 0 rows when policy denies                                     | Admin UI must use `.update().select()` and check rows returned; surface "permission denied" on count 0.                                                                      |
| Theme write fails on network blip                                                         | Keep localStorage as cache; theme writes are "fire and forget" with toast on error.                                                                                          |
| Cron drift between `user_access.role` and `app_metadata.role` if admin edits SQL directly | Document: "Only edit roles via the admin UI." Optionally add a trigger that warns when `user_access.role` is updated but `app_metadata.role` is not — defer to a later task. |
