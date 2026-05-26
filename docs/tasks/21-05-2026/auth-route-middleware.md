# Auth Route Middleware

Tag: auth/feature

## Goal

Protect workspace routes at the Next.js edge so unauthenticated users are redirected before any server component renders, replacing the client-only `RequireAuth` boundary as the authorization surface.

## Scope

- Included: a root `middleware.ts` that uses the existing `updateSession` proxy, redirects unauthenticated requests away from protected paths, preserves the original path as `?from=`, and lets `/login`, `/auth/confirm`, public assets, and Next internals pass through; the matcher config; honoring `from` on successful login.
- Excluded: role/permission gating (handled by Task D), profile loading, password reset flow.

## Acceptance criteria

- Visiting any protected route while logged out redirects to `/login?from=<encoded-path>` from the server (no flash of authenticated UI).
- Visiting `/login` or `/auth/confirm` while logged out succeeds with no redirect.
- After successful login, the user lands on the `from` path if it is a safe internal path; otherwise on `/dashboard`.
- `/auth/confirm?next=` only honors `next` when it is an internal path (starts with `/`, no protocol, no `//`).
- Middleware matcher excludes `_next/static`, `_next/image`, image extensions, and the favicon.
- Existing tests still pass; a new test covers the unauthenticated-redirect and the `from` round-trip.
