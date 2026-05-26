# Auth Hard-Reload Deadlock Fix

Tag: auth/fix

## Goal

Fix the loading screen staying visible indefinitely after a hard page reload while authenticated.

## Scope

- Included: `AuthProvider.tsx` — restructure auth callback and profile loading to avoid Web Lock deadlock
- Included: `tests/e2e/helpers.ts` — add missing `waitForWorkspace` export
- Included: `tests/e2e/auth.spec.ts` — add regression tests for hard-reload scenario
- Excluded: changes to `RequireAuth.tsx`, `loadProfile.ts`, `client.ts`

## Acceptance criteria

- Hard reload on `/candidates?view=table` while authenticated: loading screen resolves and workspace renders
- `onAuthStateChange` callback contains no `await` of any Supabase API
- Profile loading (buildAppUser / loadProfileData) runs in a separate effect outside the auth lock
- Sign-out during in-flight profile load does not set stale user state (cancellation guard)
- Session-only ("don't remember me") sign-out after reload is scheduled outside the callback via `setTimeout`
- TypeScript: zero errors

---

## Report

Status: Done — committed with auth hardening changes on branch `codex/v2-workspace-plan`

**Root cause:** `@supabase/ssr`'s `createBrowserClient` holds a Web Lock for the full duration of the `onAuthStateChange` callback. The old callback was `async` and awaited `buildAppUser()` → `loadProfileData()` → three Supabase DB queries. Those queries try to attach auth headers by reading the session token, which also requires the same lock. Lock held by callback + lock needed by queries = deadlock. `INITIAL_SESSION` fired but the callback never returned, so `setLoading(false)` was never called.

**Fix:** Split into two effects.

- Effect 1 (`onAuthStateChange`): synchronous only — sets `authUser: User | null | undefined` state, never awaits anything. Loading stays `true` until Effect 2 resolves.
- Effect 2 (profile loader): watches `authUser` identity. Runs after the lock is released. Calls `buildAppUser()` and sets `user` + `setLoading(false)`.
- Cancellation guard (`cancelled = true` in Effect 2 cleanup) prevents a stale profile promise completing after sign-out from overwriting `user = null`.
- `shouldKeepSession() === false` path: sets loading/user immediately, then schedules `supabase.auth.signOut()` via `setTimeout(..., 0)` to avoid re-entering the auth system from within the effect.

**Tests added:**
- `waitForWorkspace()` helper exported from `tests/e2e/helpers.ts` (was imported but missing)
- Hard-reload regression test in `tests/e2e/auth.spec.ts`: login → hard reload `/candidates?view=table` → loading screen must resolve → table visible
- Console error check: no auth/lock/session errors after reload
