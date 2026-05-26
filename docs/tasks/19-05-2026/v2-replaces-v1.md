# V2 Replaces V1 at Root

Tag: routing/migration

## Goal

Move V2 workspace to root-level routes so users experience V2 without the /v2 prefix.

## Scope

- Included: / → /dashboard redirect, workspace routes at /dashboard /candidates /settings, auth routes at root, public routes at root, compatibility redirects from /v2/\*, sidebar/auth/report URL updates
- Excluded: real backend, deleting V1 source files, changing lab route

## Acceptance criteria

- / redirects to /dashboard
- /dashboard, /candidates, /settings render inside WorkspaceShell
- /compare redirects to /candidates
- Auth routes work at root paths, unauthenticated visits redirect to /login?from=<path>
- Old /v2/\* paths redirect to root equivalents
- Report sharing creates /public/report/{shareId} URLs
- Sidebar active states work with root paths

---

## Report

Status: Done | Commit: 75c43ba

Created (workspace) route group with layout wrapping WorkspaceShell. Moved all V2 pages to root routes. Updated Sidebar, RequireAuth, ReportModal, PublicReport with root paths. Added 13 compatibility redirects under /v2/. V1 source files kept — shared widgets still in active use. 269 tests pass.
