# Implementation Plan — Microsoft OAuth + Sheets 2-way Sync

Tag: auth+sheets/feature

Status: **In Progress** — code complete, awaiting operator manual steps + npm install
Source spec: `SPEC.md` (v2)
Date: 2026-05-27

> Goal: ship the spec in **4 phases**, each phase split into **parallel tasks that touch disjoint files** so multiple subagents can run without merge conflicts. Per-task verification is light (`tsc + lint + 1 connection check`). Full verification (Playwright + browser) runs once at each phase boundary.

---

## Goal

Ship Microsoft-only OAuth login with domain restriction (enforced server-side, domain never exposed to client) and Google Sheets ↔ Dashboard two-way sync via service account, exposed as Pull / Push buttons in the candidates view.

## Scope

- Included: Supabase Azure provider, Before User Created hook, `private.allowed_email_domains`, PKCE callback route, login page button, `googleapis` client, `candidates` + `sheets_sync_log` tables, Pull/Push API routes, `SheetsSyncBar` UI, admin RBAC guard, `dryRun` support, seed script template.
- Excluded: Email/password login changes, Google OAuth, multi-sheet support, UI for domain management (SQL-only for v1), automatic scheduled sync, real-time push.

## Acceptance criteria

- Login page shows "Continue with Microsoft" button; email form still works.
- Non-allowlisted Microsoft accounts are rejected before `auth.users` is created.
- Allowed domain string does not appear in any committed file, env template, or client bundle.
- Pull button fetches the configured sheet and upserts into `public.candidates`; shows toast with row count.
- Push button sends DB rows to the sheet; supports dry-run via `?dryRun=true`.
- All four checkpoints (A, B, C, D) pass.

---

## 0. Working agreements

- **Reading order for every subagent:** `CLAUDE.md` → `AGENTS.md` → `SPEC.md` → this file → `implementation-todo.md` → relevant files listed in the task.
- **File ownership:** every task declares the files it owns. No two parallel tasks may touch the same file in the same phase.
- **Per-task verification (mandatory, after every task):**
  1. `npx tsc --noEmit` clean.
  2. `npm run lint` clean on the touched files.
  3. If the task is a pure module, run its own Vitest file.
  4. If the task is a route or external integration, run the connection probe documented in the task.
  5. `npm run format -- --check` for Prettier compliance.
- **Phase-end verification:** type-check + lint repo-wide, phase-scoped Playwright spec, manual `browser_snapshot`.
- **Blocked → report:** stop, write `Blocked: …` in `implementation-todo.md`, surface to user. No guessing.
- **Privacy rule:** allowed domain string never appears in committed files, env templates, or fixtures.

---

## 1. Dependency graph

```
                                      ┌──────────────────────────────┐
                                      │   Phase 0 — Foundation       │
                                      │   (sequential, single agent) │
                                      └──────────────┬───────────────┘
                                                     │
                      ┌──────────────────────────────┼──────────────────────────────┐
                      ▼                              ▼                              ▼
            ┌─────────────────────┐     ┌─────────────────────┐         ┌─────────────────────┐
            │ Phase 1 — OAuth     │     │ Phase 2 — Sheets    │         │ docs/tasks file     │
            │ login gate          │     │ infra               │         │ (drafted upfront)   │
            └─────────┬───────────┘     └─────────┬───────────┘         └─────────────────────┘
                      │                           │
                      ▼                           ▼
            ┌─────────────────────┐     ┌─────────────────────┐
            │ Checkpoint A:       │     │ Checkpoint B:       │
            │ Playwright login    │     │ Sheets connection   │
            │ flow                │     │ probe + mapping     │
            └─────────┬───────────┘     │ round-trip          │
                      │                 └─────────┬───────────┘
                      │                           │
                      │                           ▼
                      │                 ┌─────────────────────┐
                      │                 │ Phase 3 — Pull      │
                      │                 │ (depends on P2)     │
                      │                 └─────────┬───────────┘
                      │                           │
                      │                           ▼
                      │                 ┌─────────────────────┐
                      │                 │ Checkpoint C: Pull  │
                      │                 │ e2e + browser smoke │
                      │                 └─────────┬───────────┘
                      │                           │
                      │                           ▼
                      │                 ┌─────────────────────┐
                      │                 │ Phase 4 — Push      │
                      │                 │ (depends on P2)     │
                      │                 └─────────┬───────────┘
                      │                           │
                      │                           ▼
                      │                 ┌─────────────────────┐
                      │                 │ Checkpoint D: Push  │
                      │                 │ e2e + browser smoke │
                      │                 └─────────┬───────────┘
                      │                           │
                      └───────────────────────────┴────────────► Ship
```

- **Phase 1 and Phase 2 are independent** — parallel after Phase 0.
- **Phase 3 and Phase 4 depend on Phase 2 only** — Phase 4 can start once Phase 2 mapping/client modules are merged.
- **Phase 0 is the only hard sequential bottleneck** — it defines the contracts everyone else pins against.

---

## 2. Phase 0 — Foundation (sequential)

**Owner:** 1 subagent. No parallelism.

**Outputs:**
- `src/lib/sheets/types.ts` — `SheetsSyncResult`, `SheetsClient`, `SheetMapping`, `REQUIRED_SHEET_HEADERS`
- `src/lib/auth/oauthErrors.ts` skeleton — `OAuthErrorCode`, `oauthErrorMessage`, `supabaseErrorToCode`
- `.env.example` — new server-only keys (placeholder values)
- `docs/tasks/27-05-2026/microsoft-oauth-login.md` (plan section)
- `docs/tasks/27-05-2026/sheets-sync-pull.md` (plan section)
- `docs/tasks/27-05-2026/sheets-sync-push.md` (plan section)

**Acceptance:** `npx tsc --noEmit` clean. Three doc files exist. Contracts importable.

---

## 3. Phase 1 — Microsoft OAuth login gate

Runs **in parallel with Phase 2**.

### Tasks (parallel, disjoint files)

| ID  | Task                                                               | Owns                                                                                | Depends on |
| --- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------- | ---------- |
| 1.1 | SQL migration: `private` schema + `allowed_email_domains` + hook   | `supabase/migrations/20260527120000_allowed_email_domains.sql`                      | Phase 0    |
| 1.2 | `oauthErrors.ts` full impl + unit test                             | `src/lib/auth/oauthErrors.ts`, `src/lib/auth/__tests__/oauthErrors.test.ts`         | Phase 0    |
| 1.3 | OAuth callback route                                               | `src/app/auth/callback/route.ts`                                                    | Phase 0    |
| 1.4 | Seed script template                                               | `scripts/seed-allowed-domain.sql.example`                                           | Phase 0    |

### Wire-up (sequential, after 1.1–1.4)

| ID  | Task                                               | Owns                                                    | Depends on |
| --- | -------------------------------------------------- | ------------------------------------------------------- | ---------- |
| 1.5 | Add `signInWithMicrosoft()` to `AuthProvider`      | `src/lib/auth/AuthProvider.tsx`                         | 1.3        |
| 1.6 | Allow `/auth/callback` in proxy public prefixes    | `src/proxy.ts`                                          | 1.3        |
| 1.7 | "Continue with Microsoft" button on `/login`       | `src/app/login/page.tsx`                                | 1.5        |
| 1.8 | Append manual ops checklist to OAuth task doc      | `docs/tasks/27-05-2026/microsoft-oauth-login.md`        | 1.1        |

### Manual ops (operator, not subagent)

1. Azure Portal → register app (single-tenant) → redirect URI: `https://<supabase-project>.supabase.co/auth/v1/callback`.
2. Supabase Dashboard → Auth → Providers → Azure → enable → paste tenant URL, client ID, secret.
3. Supabase Dashboard → Auth → Hooks → Before User Created → select `public.hook_restrict_signup_by_email_domain`.
4. Supabase SQL Editor → run `scripts/seed-allowed-domain.sql.example` with real domain (never commit).

### Checkpoint A

- `npx tsc --noEmit` clean repo-wide.
- `npm run lint` clean repo-wide.
- `npm test -- src/lib/auth/__tests__/oauthErrors.test.ts` passes.
- Manual SQL test: call hook with known-good / known-bad email.
- Playwright `tests/e2e/microsoft-oauth.spec.ts` — mocked happy path + rejected callback.
- One `browser_snapshot` of `/login`.

---

## 4. Phase 2 — Sheets infrastructure

Runs **in parallel with Phase 1**.

### Tasks (parallel, disjoint files)

| ID  | Task                                                       | Owns                                                                          | Depends on |
| --- | ---------------------------------------------------------- | ----------------------------------------------------------------------------- | ---------- |
| 2.1 | SQL migration: `candidates` + `sheets_sync_log` + RLS      | `supabase/migrations/20260527120500_candidates_and_sync_log.sql`              | Phase 0    |
| 2.2 | `googleapis` install + `sheets/client.ts` + probe          | `package.json`, `src/lib/sheets/client.ts`, `scripts/probe-sheets-connection.ts` | Phase 0    |
| 2.3 | `sheets/mapping.ts` + unit tests                           | `src/lib/sheets/mapping.ts`, `src/lib/sheets/__tests__/mapping.test.ts`       | Phase 0    |

### Checkpoint B

- `npx tsc --noEmit` + `npm run lint` clean.
- Mapping unit test green.
- Connection probe returns sheet title.
- DB migration applied.
- If `googleapis` size > 5 MB or Vercel function limit hit, pivot to `google-auth-library` + raw `fetch`.

---

## 5. Phase 3 — Sheets Pull

Depends on Phase 2.

### Tasks

| ID  | Task                                     | Owns                                                | Depends on    |
| --- | ---------------------------------------- | --------------------------------------------------- | ------------- |
| 3.1 | `sheets/pull.ts` orchestrator            | `src/lib/sheets/pull.ts`                            | 2.1, 2.2, 2.3 |
| 3.2 | Pull API route                           | `src/app/api/sheets/pull/route.ts`                  | 3.1           |
| 3.3 | Status API route                         | `src/app/api/sheets/status/route.ts`                | 2.1           |
| 3.4 | `SheetsSyncBar` component (Pull + Push)  | `src/components/candidates/SheetsSyncBar.tsx`       | 3.2, 3.3      |
| 3.5 | Mount `SheetsSyncBar` in `CandidateFiltersBar` | `src/components/candidates/CandidateFiltersBar.tsx` | 3.4      |

### Checkpoint C

- `npx tsc --noEmit` + lint + all Vitest.
- Playwright `tests/e2e/sheets-sync-pull.spec.ts` — admin pulls, member sees disabled button.
- One `browser_snapshot` of `/candidates` with bar visible.

---

## 6. Phase 4 — Sheets Push

Depends on Phase 2. Can overlap with Phase 3.

### Tasks

| ID  | Task                                    | Owns                                                                          | Depends on |
| --- | --------------------------------------- | ----------------------------------------------------------------------------- | ---------- |
| 4.1 | `sheets/push.ts` + unit tests           | `src/lib/sheets/push.ts`, `src/lib/sheets/__tests__/push.test.ts`             | 2.2, 2.3   |
| 4.2 | Push API route                          | `src/app/api/sheets/push/route.ts`                                            | 4.1        |

### Checkpoint D

- `npx tsc --noEmit` + lint + all Vitest.
- Playwright `tests/e2e/sheets-sync-push.spec.ts` — writes to fixture sheet tab.
- Final smoke run: login → Pull → Push (scratch tab) → toasts.

---

## 7. Risk register

| Risk                                                          | Phase | Mitigation                                                                                              |
| ------------------------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------- |
| `googleapis` bundle too large for Vercel function             | 2     | Checkpoint B checks size. Pivot to `google-auth-library` + raw `fetch` if over 5 MB.                   |
| Before-User-Created hook unavailable in Supabase project tier | 1     | Verify hook UI exists during manual ops. Fallback: BEFORE INSERT trigger on `auth.users`.               |
| Service account key rotation invalidates env vars             | 2–4   | Connection probe catches this early. Document rotation in pull task report.                             |
| Microsoft guest accounts bypass single-tenant restriction     | 1     | Hook domain check is second line of defense — rejects guests with non-allowlisted emails.               |
| Playwright cannot drive real Microsoft consent                | 1     | Phase 1 e2e uses mocked redirect only. Real login verified via `browser_snapshot`.                     |

---

## 8. Definition of done

- All four checkpoints (A, B, C, D) green.
- `docs/tasks/27-05-2026/` has three completed task files (plan + report sections).
- `docs/tasks/27-05-2026/summary.md` updated with status `Done`.
- Manual ops checklist executed and noted in OAuth task report.
- Production env vars (`GOOGLE_*`, `SHEETS_*`) set in Vercel.
- One end-to-end smoke run in production preview.

---

## Report

Status: In Progress

Code for all phases (0–4) is written and type-checks clean. Blocked on operator manual steps:
- `npm install googleapis` (network required — `client.ts` runs as runtime-stub until then)
- DB migrations not yet applied to Supabase
- Azure app not yet registered
- Domain not yet seeded

Remaining: checkpoints A, B, C, D; e2e specs; report sections in task-specific docs.
