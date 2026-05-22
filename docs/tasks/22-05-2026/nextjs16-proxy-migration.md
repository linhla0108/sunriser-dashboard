# Next.js 16 Proxy Migration
Tag: repo/fix

## Goal
Fix the dev server not starting by resolving the middleware → proxy rename required in Next.js 16, and correct the AuthProvider/ThemeProvider nesting order.

## Scope
- Included: rename `src/middleware.ts` → `src/proxy.ts`, rename exported function `middleware` → `proxy`, delete stale root `proxy.ts`, fix provider nesting in `layout.tsx`
- Excluded: any logic changes to the auth redirect behaviour

## Acceptance criteria
- `npm run dev` starts cleanly on port 3000 with no proxy or auth errors
- `GET /dashboard` returns 200

---

## Report
Status: Done

**Root cause 1 — stale dev server:** PID 62038 was already holding port 3000. Next.js 16 blocks two concurrent instances on the same directory, so the second attempt errored immediately. Killed the stale process.

**Root cause 2 — proxy naming:** Next.js 16 renamed the routing interceptor file from `middleware.ts` to `proxy.ts`, and requires the exported function to also be named `proxy`. The project had:
- `src/middleware.ts` — the real, complete auth middleware (wrong filename)
- `proxy.ts` at the project root — a stale stub delegating to `src/lib/supabase/proxy.ts` (wrong location and redundant)

Fix: renamed `src/middleware.ts` → `src/proxy.ts`, renamed the export from `middleware` to `proxy`, deleted root `proxy.ts`.

**Root cause 3 — provider nesting:** `ThemeProvider` calls `useAuth()` to hydrate theme settings from the user's DB profile. It was placed *outside* `AuthProvider` in `layout.tsx`, so `AuthContext` was null and the guard threw. Fixed by swapping the nesting order: `AuthProvider` now wraps `ThemeProvider`.

Files changed: `src/proxy.ts` (new), `src/middleware.ts` (deleted), `proxy.ts` (deleted), `src/app/layout.tsx`.
