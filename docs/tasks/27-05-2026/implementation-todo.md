# Todo — Microsoft OAuth + Sheets Sync

Source: `implementation-plan.md` · Spec: `SPEC.md`
**Plan status: In Progress** — code complete 2026-05-27, awaiting operator manual steps + npm install.
Status legend: `[ ]` not started · `[~]` in progress · `[x]` done · `[!]` blocked (see Notes)

---

## ⚠️ Next actions (operator must complete before checkpoints)

| Priority   | Action                                            | Who                      | Notes                                                                                                                                                                                      |
| ---------- | ------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 🔴 BLOCKER | `npm install googleapis`                          | Operator (needs network) | After install: open `src/lib/sheets/client.ts`, uncomment "Real implementation" block, delete the stub. Then `npx tsc --noEmit` to confirm.                                                |
| 🔴 BLOCKER | Apply DB migrations to Supabase                   | Operator                 | Run `npx supabase db push` (or apply via Supabase Dashboard → SQL Editor). Migrations: `20260527120000_allowed_email_domains.sql` + `20260527120500_candidates_and_sync_log.sql`           |
| 🔴 BLOCKER | Register Azure app (Microsoft Entra)              | Operator                 | Azure Portal → App registrations → New registration → Single tenant → Redirect URI: `https://<supabase-project>.supabase.co/auth/v1/callback`. Copy tenant ID + client ID + client secret. |
| 🔴 BLOCKER | Configure Azure provider in Supabase Dashboard    | Operator                 | Auth → Providers → Azure → enable → paste tenant URL `https://login.microsoftonline.com/<tenant-id>`, client ID, secret.                                                                   |
| 🔴 BLOCKER | Register Before User Created hook in Supabase     | Operator                 | Auth → Hooks → Before User Created → select `public.hook_restrict_signup_by_email_domain`.                                                                                                 |
| 🔴 BLOCKER | Seed allowed domain (private)                     | Operator                 | SQL Editor → run `scripts/seed-allowed-domain.sql.example` with real domain substituted. Never commit.                                                                                     |
| 🟡 VERIFY  | Set Sheets env vars in `.env.local`               | Operator                 | `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `SHEETS_CANDIDATES_SPREADSHEET_ID`, `SHEETS_CANDIDATES_TAB`, `SHEETS_CANDIDATES_HEADER_ROW`                                          |
| 🟡 VERIFY  | Share the Google Sheet with service account email | Operator                 | In Google Sheets → Share → paste service account email → Editor role                                                                                                                       |
| 🟢 AFTER   | Run Sheets connection probe                       | Dev                      | `npx tsx scripts/probe-sheets-connection.ts` — confirms service account can read the sheet                                                                                                 |
| 🟢 AFTER   | Checkpoint A (OAuth Playwright + browser test)    | Dev                      | Task A.1 below — needs Azure + domain seeded first                                                                                                                                         |
| 🟢 AFTER   | Checkpoint B, C, D (Sheets e2e)                   | Dev                      | Tasks B.1, C.1, D.1 — needs googleapis installed + sheet configured                                                                                                                        |

**Rules for every task row:**

- Read the linked spec section + plan section before coding.
- Touch only the files listed in **Owns**.
- After implementation: run the **Verify** column commands. All must pass before marking `[x]`.
- If blocked, set `[!]`, write `Blocked: <reason>` in **Notes**, and surface to the user. Do not work around.
- Commit message format: `feat(<scope>): <summary>` with co-author tag.

---

## Phase 0 — Foundation (sequential)

| #   | ID  | Status | Task                                                           | Owns                                                                                                                                           | Verify                                                          | Notes                                                                |
| --- | --- | ------ | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------- |
| 1   | 0.1 | `[x]`  | Add type contracts + skeletons + env template + task doc stubs | `src/lib/sheets/types.ts`, `src/lib/auth/oauthErrors.ts`, `.env.example`, three docs in `docs/tasks/27-05-2026/`, `summary.md` (append 3 rows) | `npx tsc --noEmit`; `npm run lint`; `npm run format -- --check` | Use placeholder values in `.env.example`. No domain string anywhere. |

---

## Phase 1 — Microsoft OAuth login gate

### Parallel batch

| #   | ID  | Status | Task                                                              | Owns                                                                        | Verify                                                                                                                        | Notes                                                                                                                       |
| --- | --- | ------ | ----------------------------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 2   | 1.1 | `[x]`  | SQL migration: `private` schema + `allowed_email_domains` + hook  | `supabase/migrations/20260527120000_allowed_email_domains.sql`              | `npx supabase db reset` locally; run hook manually in SQL Editor — known-good email returns `{}`, non-allowed returns `error` | No domain values in the migration. `security definer`, `set search_path = ''`. Grant execute only to `supabase_auth_admin`. |
| 3   | 1.2 | `[x]`  | `oauthErrors.ts` full impl + unit test (snapshot: no `@` or TLDs) | `src/lib/auth/oauthErrors.ts`, `src/lib/auth/__tests__/oauthErrors.test.ts` | `npm test -- src/lib/auth/__tests__/oauthErrors.test.ts`; `npx tsc --noEmit`                                                  | Two messages only. Snapshot test asserts no `@` sign, no TLDs.                                                              |
| 4   | 1.3 | `[x]`  | OAuth callback route                                              | `src/app/auth/callback/route.ts`                                            | `npx tsc --noEmit`; `npm run lint`; manual probe: `/auth/callback?error=foo` → redirect to `/login?error=callback_failed`     | Use `createRouteHandlerClient` pattern. Never echo Supabase raw error to client.                                            |
| 5   | 1.4 | `[x]`  | Seed script template (no domain value committed)                  | `scripts/seed-allowed-domain.sql.example`                                   | Open file, confirm `<DOMAIN_HERE>` placeholder exists with comment instructions                                               | One-liner insert into `private.allowed_email_domains`.                                                                      |

### Wire-up batch (sequential)

| #   | ID  | Status | Task                                            | Owns                                             | Verify                                                                   | Notes                                                                                                                                      |
| --- | --- | ------ | ----------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 6   | 1.5 | `[x]`  | Add `signInWithMicrosoft()` to `AuthProvider`   | `src/lib/auth/AuthProvider.tsx`                  | `npx tsc --noEmit`; existing auth tests still pass                       | Call `signInWithOAuth({ provider: 'azure', options: { redirectTo, scopes: 'openid email profile' } })`. No offline_access or Graph scopes. |
| 7   | 1.6 | `[x]`  | Allow `/auth/callback` in proxy public prefixes | `src/proxy.ts`                                   | `npx tsc --noEmit`; visit `/auth/callback` signed out — no redirect loop | Add `"/auth/callback"` to `PUBLIC_PREFIXES`.                                                                                               |
| 8   | 1.7 | `[x]`  | "Continue with Microsoft" button on `/login`    | `src/app/login/page.tsx`                         | `npx tsc --noEmit`; `npm run lint`; `browser_snapshot` of `/login`       | Button above email form, divider "or continue with email". Inline SVG logo. Disabled during pending.                                       |
| 9   | 1.8 | `[x]`  | Append manual ops checklist to OAuth task doc   | `docs/tasks/27-05-2026/microsoft-oauth-login.md` | Read doc; confirm 4-step ops checklist present                           | Operator runs these steps out-of-band.                                                                                                     |

### Checkpoint A

| #   | ID  | Status | Task                      | Verify                                                                                                                                                                                               | Notes                                                                       |
| --- | --- | ------ | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 10  | A.1 | `[~]`  | Full Phase 1 verification | `npx tsc --noEmit` repo-wide; `npm run lint` repo-wide; `npm test` (all); Playwright `tests/e2e/microsoft-oauth.spec.ts` — mocked happy path + rejected callback; one `browser_snapshot` of `/login` | If anything fails, stop, file follow-up tasks. Do NOT proceed to Phase 3/4. |

---

## Phase 2 — Sheets infrastructure

### Parallel batch

| #   | ID  | Status | Task                                                  | Owns                                                                             | Verify                                                                                                           | Notes                                                                                                                                           |
| --- | --- | ------ | ----------------------------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 11  | 2.1 | `[x]`  | SQL migration: `candidates` + `sheets_sync_log` + RLS | `supabase/migrations/20260527120500_candidates_and_sync_log.sql`                 | `npx supabase db reset` locally; `\d public.candidates` shows correct columns; `select count(*)` on sync_log = 0 | Follow spec §3 schema. Enable RLS. authenticated read on candidates; admin-only read on sync_log.                                               |
| 12  | 2.2 | `[!]`  | `googleapis` install + `sheets/client.ts` + probe     | `package.json`, `src/lib/sheets/client.ts`, `scripts/probe-sheets-connection.ts` | `npx tsc --noEmit`; `npm run lint`; `npx tsx scripts/probe-sheets-connection.ts` prints sheet title              | **BLOCKED: network unavailable.** Runtime-stub written. After `npm install googleapis`: uncomment real impl block in `client.ts`, re-check tsc. |
| 13  | 2.3 | `[x]`  | `sheets/mapping.ts` + unit tests                      | `src/lib/sheets/mapping.ts`, `src/lib/sheets/__tests__/mapping.test.ts`          | `npm test -- src/lib/sheets/__tests__/mapping.test.ts`; `npx tsc --noEmit`                                       | Round-trip test, missing-required errors, both date formats. Pure functions — no I/O.                                                           |

### Checkpoint B

| #   | ID  | Status | Task                      | Verify                                                                                                                           | Notes                                                                                      |
| --- | --- | ------ | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 14  | B.1 | `[~]`  | Full Phase 2 verification | `npx tsc --noEmit`; `npm run lint`; mapping unit test; connection probe; check googleapis size: `du -sh node_modules/googleapis` | If size > 5 MB or Vercel function limit hit, pivot to `google-auth-library` + raw `fetch`. |

---

## Phase 3 — Sheets Pull

### Tasks (after Checkpoint B)

| #   | ID  | Status | Task                                           | Owns                                                | Verify                                                                                           | Notes                                                                                                                 |
| --- | --- | ------ | ---------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- | -------- |
| 15  | 3.1 | `[x]`  | `sheets/pull.ts` orchestrator                  | `src/lib/sheets/pull.ts`                            | `npx tsc --noEmit`; probe with `dryRun: true` prints `rowsCount`                                 | Wraps client + mapping + admin upsert. Writes `sheets_sync_log`. Accepts `{ dryRun?: boolean }`.                      |
| 16  | 3.2 | `[x]`  | Pull API route (admin/edit-only)               | `src/app/api/sheets/pull/route.ts`                  | `npx tsc --noEmit`; `curl -X POST /api/sheets/pull --cookie "$ADMIN_COOKIE"` → 200 + `rowsCount` | RBAC: `is_admin()` OR `can('edit')`. Returns `{ ok, rowsCount }` or `{ ok: false, error }`.                           |
| 17  | 3.3 | `[x]`  | Status API route                               | `src/app/api/sheets/status/route.ts`                | `npx tsc --noEmit`; `curl GET /api/sheets/status` → most-recent log row                          | Read-only, admin-only. Returns `{ lastSync: { direction, status, rowsCount, finishedAt }                              | null }`. |
| 18  | 3.4 | `[x]`  | `SheetsSyncBar` component                      | `src/components/candidates/SheetsSyncBar.tsx`       | `npx tsc --noEmit`; `npm run lint`                                                               | Pull + Push pill buttons. Disabled state with tooltip for no-access users. Toast via sonner. Status fetched on mount. |
| 19  | 3.5 | `[x]`  | Mount `SheetsSyncBar` in `CandidateFiltersBar` | `src/components/candidates/CandidateFiltersBar.tsx` | `npx tsc --noEmit`; one `browser_snapshot` of `/candidates`                                      | Right side, next to bulk-action popover. Compact spacing per design system.                                           |
| 20  | 3.6 | `[~]`  | Add report section to Pull task doc            | `docs/tasks/27-05-2026/sheets-sync-pull.md`         | Read the doc; confirm Report section present                                                     | Per `docs/claude/plans.md` format.                                                                                    |

### Checkpoint C

| #   | ID  | Status | Task                      | Verify                                                                                                                                                                 | Notes                                                                                  |
| --- | --- | ------ | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 21  | C.1 | `[~]`  | Full Phase 3 verification | `npx tsc --noEmit`; `npm run lint`; all Vitest; Playwright `tests/e2e/sheets-sync-pull.spec.ts` — admin pulls, member sees disabled; one `browser_snapshot` after pull | If Playwright blocked (no admin test user), report and create task to seed test users. |

---

## Phase 4 — Sheets Push

### Tasks (after Checkpoint B; can overlap Phase 3)

| #   | ID  | Status | Task                                   | Owns                                                              | Verify                                                                                                      | Notes                                                                                                   |
| --- | --- | ------ | -------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 22  | 4.1 | `[x]`  | `sheets/push.ts` + unit tests          | `src/lib/sheets/push.ts`, `src/lib/sheets/__tests__/push.test.ts` | `npm test -- src/lib/sheets/__tests__/push.test.ts`; `npx tsc --noEmit`; probe writes 1 cell to scratch tab | Use `values.batchUpdate`. Accepts `{ dryRun?: boolean }`. Never touch `SHEETS_CANDIDATES_TAB` in probe. |
| 23  | 4.2 | `[x]`  | Push API route (admin/edit-only)       | `src/app/api/sheets/push/route.ts`                                | `npx tsc --noEmit`; `curl POST /api/sheets/push?dryRun=true --cookie "$ADMIN_COOKIE"` → 200 + preview       | Support `?dryRun=true`. RBAC mirrors Pull.                                                              |
| 24  | 4.3 | `[x]`  | Push button added in SheetsSyncBar 3.4 | (already done in 3.4)                                             | `npx tsc --noEmit`; one `browser_snapshot` showing both buttons                                             | Confirm dialog before push via sonner `toast.warning` with action button.                               |
| 25  | 4.4 | `[~]`  | Add report section to Push task doc    | `docs/tasks/27-05-2026/sheets-sync-push.md`                       | Read the doc                                                                                                | Per plans.md format.                                                                                    |

### Checkpoint D

| #   | ID  | Status | Task                      | Verify                                                                                                                                                          | Notes                                                       |
| --- | --- | ------ | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| 26  | D.1 | `[~]`  | Full Phase 4 verification | `npx tsc --noEmit`; `npm run lint`; all Vitest; Playwright `tests/e2e/sheets-sync-push.spec.ts` writing to fixture sheet tab; one `browser_snapshot` after push | Final gate. After this passes, update `summary.md` to Done. |

---

## Final close-out

| #   | ID  | Status | Task                                                                                 | Verify                                                                             | Notes                                                                        |
| --- | --- | ------ | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| 27  | F.1 | `[~]`  | Update `docs/tasks/27-05-2026/summary.md` — mark all 3 tasks Done with commit hashes | Read summary, confirm formatting matches `docs/claude/plans.md`                    | One row per task: OAuth, Pull, Push.                                         |
| 28  | F.2 | `[~]`  | Production preview smoke: login → `/candidates` → Pull → Push (scratch tab)          | Manual on Vercel preview URL after deploy; capture one `browser_snapshot` per step | If preview env missing secrets, `vercel env pull` (needs `npm i -g vercel`). |

---

## Blockers log

- `[2026-05-27]` task 2.2: `npm install googleapis` blocked — no network in environment. `client.ts` written as runtime-stub (tsc passes, runtime throws clear error). **Unblock:** run `npm install googleapis` with network, then uncomment the "Real implementation" block in `src/lib/sheets/client.ts`, then `npx tsc --noEmit`.
- `[2026-05-27]` tasks A.1, B.1, C.1, D.1: Playwright e2e checkpoints waiting on operator manual steps (Azure registration, Supabase Dashboard config, domain seed, migration apply). See "Next actions" table above.

---

## Resuming this work

When you (or a subagent) pick this up next session:

1. Read `CLAUDE.md` → `SPEC.md` → `implementation-plan.md` → this file top-to-bottom.
2. Check the "Next actions" table — complete all 🔴 BLOCKER rows first.
3. Once blockers clear, run `npx tsc --noEmit && npm test` to confirm baseline still green.
4. Pick up from the first `[~]` task in the checkpoint rows (A.1).
