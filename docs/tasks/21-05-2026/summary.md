# Tasks - 21 May 2026

Base commit: `bacb5e1` (`chore: update gitignore, task docs, and smoke test coverage`)

| # | Task | Tag | Status | Scope | Files | Commit |
|---|------|-----|--------|-------|-------|--------|
| 1 | Loading System | ui/feature | Done | Boot/auth loading, workspace route fallbacks, candidate skeletons | `src/components/common/AppLoadingScreen.tsx`, `src/components/auth/*`, `src/app/loading.tsx`, `src/app/(workspace)/loading.tsx`, `src/app/(workspace)/candidates/loading.tsx`, `src/components/views/*.skeleton.tsx`, `src/components/views/CandidatesViewSkeleton.tsx` | `0ab5b95` |
| 2 | Loading Screen Redesign | ui/refactor | Done | Wordmark loading treatment, theme boot attributes, workspace handoff motion | `src/app/globals.css`, `src/app/layout.tsx`, `src/components/common/AppLoadingScreen.tsx`, `src/components/layout/WorkspaceShell.tsx`, loading tests | `0ab5b95` |
| 3 | Supabase Auth Audit | auth/audit | Done | Supabase inventory, auth gaps, RBAC/profile plan | `docs/tasks/21-05-2026/supabase-auth-audit.md` | `ac244ea` |
| 4 | Supabase Security Hardening | auth/fix | Planned | Revoke exposed `rls_auto_enable`, enable leaked password protection | `docs/tasks/21-05-2026/supabase-security-hardening.md` | `ac244ea` |
| 5 | Auth Route Middleware | auth/feature | Planned | Server-side route guard, safe `from`/`next` handling | `docs/tasks/21-05-2026/auth-route-middleware.md` | `ac244ea` |
| 6 | User Data Schema | auth/feature | Planned | `user_profiles`, `user_access`, `user_settings`, RLS, signup trigger | `docs/tasks/21-05-2026/user-data-schema.md` | `ac244ea` |
| 7 | Profile Auth Integration | auth/feature | Planned | Extend app user, load profile/access/settings, add `can()`, inactive state | `docs/tasks/21-05-2026/profile-auth-integration.md`, `src/lib/auth/*` currently has related rename prep | `ac244ea`, `0ab5b95` |
| 8 | Admin User Management | auth/feature | Planned | Admin list and edit UI for roles, permissions, active flag, profile fields | `docs/tasks/21-05-2026/admin-user-management.md` | `ac244ea` |
| 9 | Candidate Table Scroll and Header Stickiness | candidates/fix | Planned | Internal candidate table scroll, sticky table header, bottom nav clearance | `docs/tasks/21-05-2026/candidate-table-scroll-header.md` | `2a8c2b6` |

## Git diff audit

- Work was split into feature commits on `codex/v2-workspace-plan`.
- Searchable select shipped in `06aed81`.
- Loading/auth handoff shipped in `0ab5b95`.
- Supabase auth roadmap docs shipped in `ac244ea`.
- Candidate table-scroll plan shipped in `2a8c2b6`.

## Implementation order

```
Task 4 ──┐
         ├──> Checkpoint A: hardening + middleware verified
Task 5 ──┘
              │
Task 6 ───────┴──> Task 7 ──> Task 8
                      │           │
                      │           └──> Checkpoint C: admin can manage users end-to-end
                      └──> Checkpoint B: profile data renders, can() gates UI
```

Tasks 4 and 5 are independent and can run in parallel. Tasks 6 → 7 → 8 are strictly sequential because each depends on the prior data shape.
