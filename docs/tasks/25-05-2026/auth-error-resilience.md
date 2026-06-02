# Auth Error Resilience

Tag: auth/fix

## Goal

Harden every auth code path against real-world failure modes: network outages, storage restrictions, rate limits, and unexpected errors. No code path should produce an unhandled exception or a blank 500 page.

## Scope

- Included: proxy.ts, auth/confirm route, AuthProvider (storage writes + signOut), LoginForm, ForgotForm, requireAdmin, refreshUserClaims
- Excluded: OTP flow rework, password change (mock only), admin invite UX, RLS policies

## Research findings

### getClaims() in proxy.ts — can it throw?

`supabase.auth.getClaims()` validates the JWT locally via JWKS (cached). It makes a one-time network request to fetch the JWKS key set. If the JWKS endpoint is unreachable on first fetch (cold start or Supabase down), `getClaims()` **throws** — it does not return `{ data: null, error }`. The proxy has no try/catch, so the unhandled exception surfaces as a Next.js 500 page for every user on every route.

### localStorage / sessionStorage — when do they throw?

| Scenario                 | Behavior                                     |
| ------------------------ | -------------------------------------------- |
| Safari private mode      | `setItem` throws `SecurityError` immediately |
| Storage quota exceeded   | `setItem` throws `QuotaExceededError`        |
| Incognito Chrome/Firefox | Works fine (isolated quota, does not throw)  |
| Server-side (SSR)        | Guarded by `typeof window === "undefined"` ✓ |

`getItem` and `removeItem` never throw. Only `setItem` is unsafe.

### Supabase 429 rate limit error shape

```ts
// signInWithPassword returns:
{ error: { message: "Email rate limit exceeded", status: 429, code: "over_request_rate_limit" } }
// or:
{ error: { message: "For security purposes, you can only request this ...", status: 429 } }
```

The `code` field is only present on some limits. Most reliable check: `error.status === 429`.

### signOut() — does Supabase SDK clear local state on network failure?

Yes. `supabase.auth.signOut()` clears the local session cookie/storage before attempting server revocation. Even if the network call fails, `onAuthStateChange(SIGNED_OUT)` fires locally. So the user IS signed out. The problem is `clearRememberPreference()` never runs if `signOut()` rejects, leaving the "remember me" timestamp in localStorage — next page load treats the stale session as still valid until it naturally expires.

---

## Issues to fix

### Fix 1 — proxy.ts: wrap `getClaims()` in try/catch [Critical]

If JWKS unreachable → treat as unauthenticated. Existing `isAuthed = false` logic handles the rest: public paths pass through, protected paths redirect to `/login`.

```ts
let claims = null
try {
  const { data } = await supabase.auth.getClaims()
  claims = data?.claims ?? null
} catch {
  // JWKS/Supabase unreachable — fail closed: unauthenticated
}
const isAuthed = Boolean(claims?.sub)
```

### Fix 2 — auth/confirm/route.ts: wrap `verifyOtp()` in try/catch [Critical]

If Supabase is down when user clicks confirmation email → fall through to the existing error redirect instead of throwing.

```ts
if (tokenHash && type) {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    if (!error) return NextResponse.redirect(redirectTo)
  } catch {
    // Supabase unreachable — fall through to error redirect below
  }
}
redirectTo.pathname = "/login"
redirectTo.searchParams.set("error", "confirmation_failed")
return NextResponse.redirect(redirectTo)
```

### Fix 3 — AuthProvider: wrap storage writes in try/catch [Important]

`setRememberPreference()` and `clearRememberPreference()` both call `setItem` without try/catch. Safari private mode throws `SecurityError` on `setItem`, crashing `signIn()` before `signInWithPassword()` runs.

Wrap every `setItem` call. `getItem` and `removeItem` are safe and don't need wrapping.

`signOut()` also needs a top-level try/catch so that `clearRememberPreference()` runs even when `supabase.auth.signOut()` rejects:

```ts
const signOut = useCallback(async () => {
  try {
    await supabase.auth.signOut()
  } catch {
    // Network failure — SDK still cleared local session; SIGNED_OUT fires locally.
  }
  clearRememberPreference()
  setUser(null) // optimistic; SIGNED_OUT handler also does this
}, [supabase])
```

### Fix 4 — LoginForm + ForgotForm: handle 429 rate limit [Important]

Map `error.status === 429` to a user-friendly message with retry guidance. Do not show raw SDK strings for this case.

```ts
// In signIn() return value and in ForgotForm submit:
if (result.error includes rate limit) → "Too many attempts. Please wait a few minutes and try again."
```

`signIn()` in AuthProvider returns `{ ok: false, error: error.message }`. The message mapping can happen either in the context (`signIn` maps before returning) or in the form component. Form component is simpler and keeps the context layer thin.

### Fix 5 — requireAdmin: return 401 for unauthenticated [Suggestion]

REST convention: 401 = no credentials, 403 = credentials present but insufficient.

```ts
if (!sub) return { ok: false, reason: "unauthenticated", status: 401 }
if (appMeta.role !== "admin") return { ok: false, reason: "not_admin", status: 403 }
```

Admin route handlers use `guard.ok` check only; adding `status` to the interface lets them pass it through correctly.

### Fix 6 — refreshUserClaims: log 503 instead of silently swallowing [Suggestion]

503 means `service_role` not configured. Role update silently succeeds in UI but JWT never updates.

```ts
if (res.status === 503) {
  console.warn("[refreshUserClaims] service_role not configured — JWT not updated")
  return // non-fatal; DB row still updated
}
```

---

## Acceptance criteria

- Opening any page while Supabase is unreachable → redirect to `/login` (not 500)
- Clicking a confirmation email link while Supabase is unreachable → `/login?error=confirmation_failed` (not 500)
- `signIn()` completes without throwing in Safari private mode (localStorage unavailable)
- `signOut()` clears remember-me preference even when network is unavailable
- LoginForm and ForgotForm show "Too many attempts. Please wait…" on 429 responses
- TypeScript compiles clean (`npx tsc --noEmit` = 0 errors)
- All existing tests pass

---

## Report

Status: Done — commit b512f95

All 6 fixes shipped. TypeScript clean. Test suite: 343/343 passing (+7 new tests).

| Fix                      | What changed                                                                                               |
| ------------------------ | ---------------------------------------------------------------------------------------------------------- |
| 1 — proxy.ts 500         | `getClaims()` wrapped in try/catch → JWKS unreachable = redirect to /login                                 |
| 2 — confirm route 500    | `verifyOtp()` wrapped in try/catch → Supabase unreachable = `/login?error=confirmation_failed`             |
| 3 — Safari storage crash | `setRememberPreference` wraps `setItem` in try/catch; `signOut()` wrapped in try/catch                     |
| 4 — 429 UX               | `signIn()` and `ForgotForm` map `error.status === 429` → "Too many attempts…"                              |
| 5 — 401 vs 403           | `requireAdmin()` returns `status: 401` for unauthenticated, `403` for non-admin; all 3 admin routes use it |
| 6 — 503 silent swallow   | `refreshUserClaims` now logs `console.warn` when 503 instead of silently ignoring                          |
