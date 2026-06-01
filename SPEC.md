# SPEC — Microsoft OAuth Login + Google Sheets 2-way Sync

Status: Draft v2 (awaiting user confirmation)
Date: 2026-05-27
Owner: leanhlinh.bm@gmail.com

> v2 changes vs v1: removed Google OAuth (Microsoft Outlook only). Allowed domain is **private** — stored in a Postgres table, never exposed to the client, never written into a committed migration. Domain check uses Supabase's **Before User Created Hook**, so rejected signups never reach `auth.users`.

---

## 1. Objective

Add two capabilities to the Sunriser dashboard:

1. **Microsoft (Outlook) OAuth login** on top of the existing Supabase email-password flow. Restricted to a private company domain, enforced server-side at the Supabase Auth layer **before any account is created**.
2. **Google Sheets ⇄ Dashboard 2-way sync** for the candidates dataset, using a single company-owned Google Sheet accessed via a Google Service Account, triggered manually by the user (Pull / Push buttons).

After this work, an internal user can:

- Click **"Continue with Microsoft"** on `/login`. They get authenticated only if their email belongs to the company tenant + an allowlisted domain; otherwise they see a generic "Access denied — contact your administrator" message with no domain hint. The Supabase `auth.users` row is never created for a rejected user.
- Open `/candidates`, click **Pull from Sheet** to fetch the latest rows from the company sheet into Supabase, or **Push to Sheet** to write current dashboard data back.

### Out of scope

- Google OAuth login.
- Reading Outlook mail / Calendar (no extra Microsoft Graph scopes beyond `openid email profile`).
- Per-user OAuth-token Sheets access.
- Realtime sync (Apps Script `onEdit`, polling cron). Manual on-demand only in v1.
- Migrating existing `user_profiles` / `user_access` / `user_settings` schema or signup trigger.
- Replacing mock data globally — sync only touches a new `candidates` table; existing components keep reading `mockData.ts` until a follow-up task wires them up.

---

## 2. Commands

Run from repo root. No new npm scripts.

| Purpose                               | Command                                                                                                                               |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Dev server                            | `npm run dev`                                                                                                                         |
| Type-check (preferred error check)    | `npx tsc --noEmit`                                                                                                                    |
| Lint                                  | `npm run lint`                                                                                                                        |
| Format + tailwind sort                | `npm run format`                                                                                                                      |
| Unit tests                            | `npm test`                                                                                                                            |
| Single unit file                      | `npm test -- src/lib/sheets/__tests__/mapping.test.ts`                                                                                |
| E2E                                   | `npm run test:e2e`                                                                                                                    |
| Single e2e spec                       | `npx playwright test tests/e2e/oauth-login.spec.ts`                                                                                   |
| Apply new Supabase migration          | `npx supabase db push` (remote) or `npx supabase db reset` (local)                                                                    |
| Seed allowed domain (one-off, manual) | `psql "$DB_URL" -c "insert into private.allowed_email_domains (domain) values ('***');"` — domain **typed manually**, never committed |

### Environment variables

```
# Public site URL — used by Supabase OAuth redirect
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Google Sheets — server-only
GOOGLE_SERVICE_ACCOUNT_EMAIL=sheets-sync@<project>.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
SHEETS_CANDIDATES_SPREADSHEET_ID=1AbC...xyz
SHEETS_CANDIDATES_TAB=Candidates
SHEETS_CANDIDATES_HEADER_ROW=1
```

**No `OAUTH_ALLOWED_DOMAIN` env var.** The allowlist lives in a private Postgres table seeded out-of-band. This means:

- The domain is never in the repo.
- The domain is never in client bundles.
- The domain is never in API responses or error messages.
- Adding/removing a domain is an admin SQL operation, not a redeploy.

---

## 3. Project Structure

New files (additive — no rename of existing files):

```
src/
├── app/
│   ├── auth/
│   │   ├── callback/
│   │   │   └── route.ts                       NEW — handles OAuth code exchange + post-auth validation
│   │   └── confirm/                           (unchanged — keeps email-link confirm flow)
│   ├── login/
│   │   └── page.tsx                           EDIT — add "Continue with Microsoft" button (no Google)
│   └── api/
│       └── sheets/
│           ├── pull/route.ts                  NEW — POST, admin-only, sheet → candidates table
│           ├── push/route.ts                  NEW — POST, admin-only, candidates table → sheet
│           └── status/route.ts                NEW — GET, returns last-sync metadata
├── lib/
│   ├── auth/
│   │   ├── AuthProvider.tsx                   EDIT — add signInWithMicrosoft helper
│   │   └── oauthErrors.ts                     NEW — maps Supabase OAuth errors to generic UX messages (never leaks domain)
│   └── sheets/
│       ├── client.ts                          NEW — googleapis sheets client built from service account JWT
│       ├── mapping.ts                         NEW — Applicant <-> sheet row mapping (pure, unit-tested)
│       ├── pull.ts                            NEW — reads sheet, returns Applicant[] + diff vs DB
│       ├── push.ts                            NEW — builds batchUpdate payload from Applicant[]
│       └── __tests__/
│           ├── mapping.test.ts                NEW
│           └── push.test.ts                   NEW
├── components/
│   └── candidates/
│       └── SheetsSyncBar.tsx                  NEW — Pull/Push buttons, mounted in CandidateFiltersBar
└── proxy.ts                                   EDIT — allow /auth/callback in PUBLIC_PREFIXES

supabase/migrations/
├── 20260527120000_allowed_email_domains.sql   NEW — creates table + Before User Created hook function (no domain values)
└── 20260527120500_candidates_and_sync_log.sql NEW — candidates + sync_log tables + RLS

docs/tasks/27-05-2026/
├── microsoft-oauth-login.md                   NEW — plan + report for OAuth slice
├── sheets-sync-pull.md                        NEW — plan + report for Pull slice
└── sheets-sync-push.md                        NEW — plan + report for Push slice
```

### Data model — OAuth gating migration

```sql
-- Private schema — never exposed via PostgREST, never readable by anon/authenticated.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to supabase_auth_admin;

create table private.allowed_email_domains (
  id          bigserial primary key,
  domain      text not null unique,
  created_at  timestamptz not null default now(),
  created_by  uuid references auth.users(id),
  constraint domain_is_lowercase check (domain = lower(domain)),
  constraint domain_no_at_sign  check (position('@' in domain) = 0)
);
revoke all on table private.allowed_email_domains from public, anon, authenticated;
grant select on table private.allowed_email_domains to supabase_auth_admin;

-- Before User Created hook — runs BEFORE auth.users insert.
-- Reject → no row is created in auth.users, OAuth flow returns an error.
create or replace function public.hook_restrict_signup_by_email_domain(event jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  user_email text;
  user_domain text;
  domain_allowed int;
begin
  user_email := event->'user'->>'email';

  if user_email is null or position('@' in user_email) = 0 then
    return jsonb_build_object(
      'error', jsonb_build_object(
        'message', 'Access denied. Contact your administrator if you believe this is an error.',
        'http_code', 403
      )
    );
  end if;

  user_domain := lower(split_part(user_email, '@', 2));

  select count(*) into domain_allowed
  from private.allowed_email_domains
  where domain = user_domain;

  if domain_allowed > 0 then
    return '{}'::jsonb;
  end if;

  return jsonb_build_object(
    'error', jsonb_build_object(
      'message', 'Access denied. Contact your administrator if you believe this is an error.',
      'http_code', 403
    )
  );
end;
$$;

grant execute on function public.hook_restrict_signup_by_email_domain(jsonb) to supabase_auth_admin;
revoke execute on function public.hook_restrict_signup_by_email_domain(jsonb) from public, anon, authenticated;
```

After the migration runs, an admin manually registers the hook in **Supabase Dashboard → Authentication → Hooks → Before User Created** (selecting the `public.hook_restrict_signup_by_email_domain` function). And separately seeds the domain via a one-off SQL command typed in psql/SQL Editor — **never** committed to the repo.

> Why this design: the hook runs synchronously at signup time. If it returns an `error` object, Supabase Auth does not insert into `auth.users` at all, does not issue a session, and propagates the error to the OAuth callback. There is no "create then delete" race window.

### Data model — candidates + sync log

```sql
create table public.candidates (
  id          text primary key,        -- matches Applicant.id (string, not uuid)
  data        jsonb not null,           -- full Applicant payload
  sheet_row   integer,                  -- 1-based row index in the source sheet
  source      text not null default 'sheet' check (source in ('sheet', 'dashboard')),
  updated_at  timestamptz not null default now(),
  updated_by  uuid references auth.users(id)
);
alter table public.candidates enable row level security;
create policy candidates_read on public.candidates for select to authenticated using (true);
-- writes happen only via service_role from server routes — no write policy needed.

create table public.sheets_sync_log (
  id           bigserial primary key,
  direction    text not null check (direction in ('pull', 'push')),
  status       text not null check (status in ('ok', 'error')),
  rows_count   integer,
  error        text,
  triggered_by uuid references auth.users(id),
  started_at   timestamptz not null default now(),
  finished_at  timestamptz
);
alter table public.sheets_sync_log enable row level security;
create policy sync_log_admin_read on public.sheets_sync_log
  for select to authenticated using (public.is_admin());
```

### OAuth domain restriction — three layers

All three required. Defense in depth.

1. **Microsoft tenant (provider config in Supabase Dashboard).**
   Register the Entra app as single-tenant. Set Supabase Azure URL to `https://login.microsoftonline.com/<tenant-id>`. Non-tenant accounts cannot complete the OAuth flow at all — Microsoft rejects them before the redirect back to Supabase.

2. **Before User Created hook (Postgres function above).**
   Even if Microsoft returns a token for an unexpected email (multi-tenant misconfig, guest accounts, etc.), the hook rejects insert into `auth.users`. The domain lives in `private.allowed_email_domains` — not in code, not in env.

3. **Callback route sanity check (`src/app/auth/callback/route.ts`).**
   After `exchangeCodeForSession`: if no session is returned, redirect to `/login?error=access_denied`. Never display the actual Supabase error message verbatim — map to one of two generic strings via `oauthErrors.ts`. If a session _is_ returned but `user.email` is empty or missing, sign out immediately and redirect to the same generic error.

### Privacy guarantees (must hold)

- The string of the allowed domain appears in **zero** committed files.
- The string never appears in any `NEXT_PUBLIC_*` env var, any client bundle, any API response, any toast/error message shown to the user, any browser network response visible in DevTools.
- The login page never lists allowed domains. The error UI says only "Access denied. Contact your administrator."
- A user attempting to OAuth with a non-allowlisted email sees the same generic message as a user with a malformed email or any other failure — no enumeration.
- Server logs may contain the domain (for ops debugging); they are not exposed to clients.

### Sheets module shape (unchanged from v1)

- `sheets/client.ts` exports `getSheetsClient()` returning a memoized `sheets_v4.Sheets` instance from `google.auth.JWT` with scope `https://www.googleapis.com/auth/spreadsheets`. **Server-only**: throws if `typeof window !== 'undefined'`.
- `mapping.ts` exports `rowToApplicant` and `applicantToRow`, both pure functions driven by the sheet header row.
- `pull.ts` / `push.ts` orchestrate `client` + `mapping` + admin Supabase client (`src/lib/supabase/admin.ts`), writing a `sheets_sync_log` row before and updating it after.
- API routes (`/api/sheets/{pull,push,status}`) are RBAC-gated: require `is_admin()` OR `can('edit')`. Return 403 otherwise.

### UI surface

- `/login` page: a single **"Continue with Microsoft"** button (no Google, no domain text, no hosted domain hint), divider `or continue with email`, then the existing email/password form. Microsoft logo via inline SVG (no extra deps).
- `SheetsSyncBar` mounts inside `CandidateFiltersBar` (right side, next to bulk-action popover). Two pill buttons with `lucide-react` `Download` / `Upload` icons, primary color on hover. Disabled with tooltip "Admin/edit permission required" when `can('edit')` is false. Last-sync timestamp + direction shown next to the buttons in `text-small text-[#767676]`.
- Toast feedback via existing `sonner`.

---

## 4. Code Style

Follows existing project conventions — no new rules.

- **TypeScript strict.** No `any` outside test files. Sheets API payloads typed via `sheets_v4` from `googleapis`.
- **Formatting:** Prettier (`semi: false`, `singleQuote: true`, `printWidth: 100`), tailwind classes sorted. Run `npm run format` before commit.
- **Imports:** absolute via `@/…`. Server-only modules (`src/lib/sheets/client.ts`, `src/lib/supabase/admin.ts`) never imported from `"use client"` files. Runtime `typeof window` guard at module top.
- **Tailwind v4 rules** (per `docs/claude/feedback-turbopack.md` + `feedback-tailwind-v4.md`):
  - Single-line `className` strings only.
  - No new `--spacing-*` tokens in `@theme`.
  - Colors from design tokens in `src/app/globals.css`.
- **Errors:** API routes return `{ ok: false, error: string }` with the right HTTP status. Never leak Supabase/Google raw error messages to the client.
- **Domain privacy:**
  - No string literal of the company domain anywhere in `src/`.
  - No log statement or `console.error` that prints `user.email` in client code.
  - OAuth error toast text is hard-coded to the generic message — no string interpolation that could include a domain.
- **Comments:** explain _why_, not _what_. Required above each `revalidatePath` / `redirect` call in the OAuth callback, and above the Before User Created hook function.
- **Naming:** route files `route.ts`; component files PascalCase; lib files camelCase.
- **No new dependencies** beyond `googleapis` (and `google-auth-library` if needed). Pin imports to the sub-paths actually used (e.g. `import { google } from 'googleapis'` and only call `google.sheets({...})`) to keep server bundle lean.

### Domain-mapping discipline (Sheets)

- Required sheet columns: `id, name, email, position1, batch, submittedAt`.
- Missing optional columns → field is `undefined`, not empty string.
- Extra sheet columns → ignored.
- Numeric fields parsed with `Number()`, rejected if `NaN`.
- Date fields normalized to ISO; sheet may use `yyyy-mm-dd` or `dd/mm/yyyy`.

---

## 5. Testing Strategy

Tiered, cost-aware (`docs/claude/feedback-testing-tools.md`):

| Layer         | Tool                               | Scope                                                         |
| ------------- | ---------------------------------- | ------------------------------------------------------------- |
| Type safety   | `tsc --noEmit`                     | Every change                                                  |
| Unit (pure)   | Vitest                             | `mapping.ts`, `oauthErrors.ts`, payload builders in `push.ts` |
| Unit (mocked) | Vitest                             | Sheets `client.ts` request shape, API route guards            |
| SQL           | Manual SQL test in Supabase Studio | `hook_restrict_signup_by_email_domain` with fixture events    |
| E2E           | Playwright                         | Login redirect flow, Pull/Push happy path                     |
| Manual smoke  | `browser_snapshot`                 | One-time check of `/login` + `SheetsSyncBar`                  |

### Unit tests (must ship with v1)

- `mapping.test.ts`: round-trip, missing-required errors, date normalization.
- `push.test.ts`: correct `values.batchUpdate` shape; empty input → no API call.
- `oauthErrors.test.ts`:
  - Any Supabase error code → returns one of two generic messages.
  - **Snapshot test asserts the generic message contains no `@` and no `.com|.vn|.co` substring** (regression guard against accidentally leaking a domain into the message).

### SQL test (manual, run once after migration)

In Supabase SQL Editor, run with a known and an unknown email; verify the function returns `{}` and an `error` object respectively. Documented in `docs/tasks/27-05-2026/microsoft-oauth-login.md` as a one-time verification step.

### E2E tests

- `tests/e2e/oauth-login.spec.ts` (gated; needs test creds, skipped in CI by default):
  - Click "Continue with Microsoft" → mocked redirect → land on `/dashboard`.
  - Mocked rejected callback → redirected to `/login?error=access_denied` with the generic message.
- `tests/e2e/sheets-sync.spec.ts`:
  - Admin user, Pull button → toast success + sync_log row.
  - Member user → buttons disabled, tooltip visible.

### Not tested in v1

- Live Microsoft OAuth round-trip (Playwright cannot drive real Entra consent reliably).
- Quota-exhaustion behavior for Sheets API (noted in PR description instead).

---

## 6. Boundaries

### Always do

- Read `CLAUDE.md` + `AGENTS.md` before any edit.
- Use `apply_patch` for manual file changes.
- Verify with `npx tsc --noEmit` + `npm run lint` + `npm test` before claiming a slice is done.
- Add/update a task file in `docs/tasks/27-05-2026/` per `docs/claude/plans.md` — plan section before code, report section after.
- Keep service-account env vars **server-only**. Verified by a unit test asserting the module throws when imported from a JSDOM context.
- Use the existing service-role admin client (`src/lib/supabase/admin.ts`) for writes from sync routes.
- Wrap every Sheets API call in try/catch, log to `sheets_sync_log` with `status='error'` on failure.
- Enforce domain restriction at **all three** layers (Azure tenant + Before User Created hook + callback sanity check).
- Use generic OAuth error messages only — route every Supabase auth error through `oauthErrors.ts`.

### Ask first

- Whether to expose `Pull from Sheet` to non-admin members (currently spec says admin/edit only).
- Whether the "source of truth" should be flippable per-environment (`SHEETS_SOURCE_OF_TRUTH=sheet|dashboard`) or hardcoded to `sheet` in v1.
- Before installing `googleapis` — confirm bundle-size impact is acceptable, or pivot to a leaner setup.
- Before any change to existing `user_access` schema or RLS policies.
- Before adding any client-visible string that could narrow down the allowed domain (e.g. "use your work email", "company SSO").

### Never do

- Never commit `.env*`, the service-account JSON, the private key, or the allowed domain string.
- Never write the allowed domain in a migration file, a seed file, a test fixture, a `.md` file, or any source file.
- Never log `user.email` from client code; never include `user.email` in a toast or error UI.
- Never display Supabase's raw OAuth error to the user.
- Never `npm run dev` / `npm run build` just to check errors (use `tsc --noEmit`).
- Never run `npm run test:e2e` to verify a small change — single spec only.
- Never call the Sheets API from a `"use client"` component or from `proxy.ts`.
- Never store the Microsoft `provider_token` returned by Supabase OAuth — we do not need it for v1.
- Never use the user's browser Supabase client for sync writes.
- Never amend an existing commit; create a new one.
- Never use the Azure `common` endpoint — single tenant only.
- Never add a second OAuth provider (Google, GitHub, etc.) without explicit approval.
- Never add `<style jsx>` or multiline `className` (Turbopack).
- Never take screenshots in a loop; one snapshot per UI verification.

---

## 7. Implementation Slices (suggested order)

Each slice is independently shippable, gets its own task file, ends with a green `tsc + lint + test` + commit.

1. **Slice A — Microsoft OAuth login.**
   - Migration: `private.allowed_email_domains` + `hook_restrict_signup_by_email_domain` (no domain values).
   - Register Azure provider in Supabase Dashboard (single tenant), register the Before User Created hook (documented manual step).
   - Seed allowed domain via one-off SQL (documented, **not committed**).
   - Add `/auth/callback/route.ts`, `oauthErrors.ts`, Microsoft button in `/login/page.tsx`, edit `proxy.ts` + `AuthProvider.tsx`.
   - Unit tests for `oauthErrors.ts`; manual SQL test for the hook.
2. **Slice B — Candidates table + Sheets Pull.**
   - Migration for `candidates` + `sheets_sync_log`.
   - `client.ts`, `mapping.ts`, `pull.ts`, `/api/sheets/pull/route.ts`.
   - `SheetsSyncBar` with Pull button only.
   - Unit tests for `mapping.ts`.
3. **Slice C — Sheets Push.**
   - `push.ts`, `/api/sheets/push/route.ts`, Push button + sync-log status indicator in `SheetsSyncBar`.

Stop after Slice A and reconvene before B/C if priorities shift.

---

## 8. Open questions for the user

1. Confirm the Microsoft setup: do you already have an Entra tenant ID, or do we create one? (We'll need it to fill the Azure URL in Supabase Dashboard — handled by you out-of-band, not committed.)
2. Will you seed the allowed domain yourself in Supabase SQL Editor after I ship the migration, or do you want me to leave a `scripts/seed-allowed-domain.sql.example` file (with `<DOMAIN_HERE>` placeholder) for you to copy-paste?
3. For Sheets sync v1: overwrite blindly, or last-write-wins by `updated_at`?
4. Should Push have a "dry-run" mode (preview diff before writing)?
5. Do you want a tiny admin UI in `/admin/users` to add/remove allowed domains, or keep it strictly SQL-only for v1? (SQL-only is safer; UI is more convenient.)

---

**Confirm this v2 spec or tell me what to adjust before I start Slice A.**
