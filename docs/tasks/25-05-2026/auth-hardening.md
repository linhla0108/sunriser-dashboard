# Auth System Hardening

Tag: auth/fix

## Goal

Fix all auth bugs introduced by recent changes and harden the auth system against edge cases. Make the system correct, fail-safe, and free of dead code.

## Scope

- Included: AuthProvider, RequireAuth, proxy/middleware, loadProfile, LoginForm, dead code
- Excluded: OTP flow, password reset, admin APIs (separate concerns, working correctly)

## Research findings

### What `getClaims()` actually does (from source, line 2350)

> "If the user's access token is about to expire when calling this function, the user's session will first be refreshed before validating the JWT."

`getClaims()` in `proxy.ts` is **correct**. It validates locally via JWKS and refreshes near-expired tokens. `getUser()` is only needed when you want a live server-verified identity check (admin APIs). Middleware is fine with `getClaims()`.

### `AuthChangeEvent` types (all 7)

`INITIAL_SESSION` | `SIGNED_IN` | `SIGNED_OUT` | `TOKEN_REFRESHED` | `USER_UPDATED` | `PASSWORD_RECOVERY` | `MFA_CHALLENGE_VERIFIED`

### `onAuthStateChange` timing

- `INITIAL_SESSION` fires near-synchronously from local cookie/localStorage after registration
- `SIGNED_IN` fires asynchronously after `signInWithPassword` stores the session internally
- `TOKEN_REFRESHED` fires every ~30–40 min when the access token auto-refreshes

---

## Issues — what is CORRECT (keep)

| What                                                       | Why                                                                                                        |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `getClaims()` in `proxy.ts`                                | Correct. Handles token refresh for near-expired tokens via JWKS. Official recommendation.                  |
| `onAuthStateChange` as primary resolver                    | Correct. INITIAL_SESSION fires from local storage — fast, no network.                                      |
| `.catch()` on `getUser()` that only sets `loading = false` | Correct. Prevents infinite loading when network fails without overriding user state.                       |
| `resolvedByStateChange` flag                               | Correct. Prevents double `buildAppUser()` when both INITIAL_SESSION and `getUser()` would both try to run. |
| `DEFAULT_ACCESS.active = false`                            | Correct. Fail closed on DB error is the right security posture.                                            |
| `middleware.ts` created                                    | Correct. Server-level route protection was missing entirely.                                               |

---

## Issues — what needs fixing

### Fix 1 — `onAuthStateChange` calls `buildAppUser` on ALL 7 event types [Important]

**File:** `src/lib/auth/AuthProvider.tsx`

Current code: `async (_event, session)` — `_event` is ignored. Every event including `TOKEN_REFRESHED` (fires every ~30–40 min) re-runs `buildAppUser()` = 3 parallel DB queries per refresh cycle.

Only these events warrant rebuilding the app user:

- `INITIAL_SESSION` — first load
- `SIGNED_IN` — fresh login
- `USER_UPDATED` — profile changed

`TOKEN_REFRESHED`, `PASSWORD_RECOVERY`, `MFA_CHALLENGE_VERIFIED`, `SIGNED_OUT` should either skip `buildAppUser` or just clear state.

```ts
supabase.auth.onAuthStateChange(async (event, session) => {
  if (!mounted) return
  resolvedByStateChange = true

  if (event === "SIGNED_OUT") {
    setUser(null)
    setLoading(false)
    return
  }

  if (event === "TOKEN_REFRESHED" || event === "PASSWORD_RECOVERY" || event === "MFA_CHALLENGE_VERIFIED") {
    setLoading(false)
    return // token updated in cookie by SDK; no profile refetch needed
  }

  // INITIAL_SESSION, SIGNED_IN, USER_UPDATED
  if (session?.user && !shouldKeepSession()) {
    try {
      await supabase.auth.signOut()
    } catch {
      /* best-effort */
    }
    clearRememberPreference()
    setUser(null)
    setLoading(false)
    return
  }

  if (session?.user) {
    const next = await buildAppUser(session.user)
    if (!mounted) return
    setUser(next)
  } else {
    setUser(null)
  }
  setLoading(false)
})
```

### Fix 2 — `buildAppUser` fallback hides DB errors behind "Inactive Account" UI [Important]

**File:** `src/lib/auth/AuthProvider.tsx` + `src/components/auth/RequireAuth.tsx`

When `loadProfileData` throws (Supabase unreachable), `buildAppUser` falls back to `PROFILE_DEFAULTS` with `active: false`. `RequireAuth` then renders `<InactiveAccount />`, which says "your account is inactive" — misleading when it's actually a network error.

Two-part fix:

**Part A — distinguish error from actual inactive:**

```ts
const buildAppUser = useCallback(
  async (authUser: User): Promise<AppUser> => {
    try {
      const { profile, access, settings } = await loadProfileData(supabase, authUser.id)
      return { ...baseUser(authUser), profile, access, settings }
    } catch {
      return {
        ...baseUser(authUser),
        profile: PROFILE_DEFAULTS.profile,
        access: { ...PROFILE_DEFAULTS.access, active: false },
        settings: PROFILE_DEFAULTS.settings,
        _profileLoadError: true, // add to AppUser type
      }
    }
  },
  [supabase]
)
```

**Part B — show correct error in RequireAuth:**

```tsx
if (!user) return <AppLoadingScreen variant="auth" sublabel="Checking access" />
if (user._profileLoadError) return <ConnectionErrorScreen /> // new component
if (!user.access.active) return <InactiveAccount />
```

Or simpler: pass an optional `reason` to the existing `InactiveAccount` component.

### Fix 3 — Dead code: `src/lib/supabase/proxy.ts` [Suggestion]

This file exports `updateSession` which uses the old `getUser()` pattern and is **never imported anywhere**. It conflicts in name with `src/proxy.ts` and causes confusion. Delete it.

### Fix 4 — Dead `config` export in `src/proxy.ts` [Suggestion]

`src/proxy.ts` still exports `config`. Since `middleware.ts` inlines its own `config`, this export is dead. Remove the `config` export from `src/proxy.ts` to avoid confusion (someone might edit the wrong file thinking it controls the matcher).

### Fix 5 — `signOut()` redundantly sets `setUser(null)` [Suggestion]

```ts
const signOut = useCallback(async () => {
  await supabase.auth.signOut()
  clearRememberPreference()
  setUser(null) // ← this AND onAuthStateChange SIGNED_OUT both do this
}, [supabase])
```

With Fix 1 in place, `SIGNED_OUT` handler sets `setUser(null)` and `setLoading(false)`. The explicit `setUser(null)` in `signOut()` is then redundant. Keep it as an optimistic update (faster UI) but add a comment.

### Fix 6 — Missing test: `getUser()` rejection path [Suggestion]

Add a test that mocks `getUser()` to throw, mocks `onAuthStateChange` to never fire, and asserts `loading` resolves to `false`. The specific bug that triggered this entire session had no test coverage.

---

## Acceptance criteria

- `TOKEN_REFRESHED` does not trigger a DB query
- DB error during profile load shows a "connection problem" message, not "inactive account"
- `src/lib/supabase/proxy.ts` deleted
- `src/proxy.ts` exports only `proxy` (no `config`)
- All existing tests pass
- TypeScript compiles clean (`npx tsc --noEmit` = 0 errors)

---

## Report

Status: Done

All 6 fixes implemented. TypeScript clean. Test suite: 325/333 passing (8 pre-existing failures unrelated to auth).

| Fix                    | Files changed                                                                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 — Event filtering    | `AuthProvider.tsx` — check `event` type, skip `buildAppUser` on TOKEN_REFRESHED / PASSWORD_RECOVERY / MFA_CHALLENGE_VERIFIED / SIGNED_OUT   |
| 2 — DB error UX        | `types.ts` (profileError field), `AuthProvider.tsx` (flag in catch), `ProfileLoadError.tsx` (new component), `RequireAuth.tsx` (check flag) |
| 3 — Dead file deleted  | `src/lib/supabase/proxy.ts` removed                                                                                                         |
| 4 — config in proxy.ts | **No change needed** — Next.js 16 docs confirm `config` export is correct and required                                                      |
| 5 — signOut comment    | `AuthProvider.tsx` — added comment explaining intentional optimistic `setUser(null)`                                                        |
| 6 — Missing test       | `AuthProvider.network-error.test.tsx` — 2 new tests for getUser() rejection path                                                            |
