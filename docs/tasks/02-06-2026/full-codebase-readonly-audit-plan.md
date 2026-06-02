# Full Codebase Read-Only Audit Plan

Tag: repo/audit

## Goal

Audit the current codebase without changing source behavior, then classify cleanup and risk follow-ups into actionable buckets.

## Scope

- Included: repo instructions, tooling baseline, Next.js App Router structure, React components, Supabase Auth/RLS/API routes, dependency risk, docs drift, dead-code candidates, and complexity hotspots.
- Excluded: source edits, deletions, dependency upgrades, formatter writes, migrations, Supabase mutations, Vercel deploys, and reading `.env.local`.

## Acceptance criteria

- Only this markdown file is created or edited.
- Audit commands and scan results are recorded below.
- Findings are classified as `delete-now candidate`, `needs verification`, `split/refactor candidate`, or `keep`.
- Follow-up tasks are small enough for a later implementation session.

## Mandatory pre-edit checklist

- `CLAUDE.md` read completely, including linked docs that affect this task.
- Mandatory keywords checked through `AGENTS.md`, which is linked from `CLAUDE.md`: `READ FIRST`, `APPLY_PATCH_ONLY`, `NO_NODE_WRITE`, `NO_PYTHON_WRITE`, `NO_NPM_RUN_DEV_FOR_ERRORS`, `NO_NPM_RUN_BUILD_FOR_ERRORS`, `DOCS_REQUIRED`, `STATE_ASSUMPTIONS_FIRST`.
- Edit method confirmed: manual file changes use `apply_patch`.
- Verification method confirmed: `npx tsc --noEmit`, lint, tests, Prettier dry-run, and audit checks. No `npm run dev` or `npm run build` for error checking.
- Documentation impact confirmed: this task documents the audit in `docs/tasks/02-06-2026/`.
- Major assumption surfaced: this is a read-only audit. `.env.local` remains unread.

## Skills, MCP, and tools

| Area           | Skill / MCP / Tool                | Purpose                                                                    |
| -------------- | --------------------------------- | -------------------------------------------------------------------------- |
| Review quality | `code-review-and-quality`         | Correctness, readability, architecture, security, and performance rubric.  |
| Simplification | `code-simplification`             | Identify complexity and behavior-preserving refactor candidates.           |
| Deprecation    | `deprecation-and-migration`       | Classify dead, legacy, runtime-dynamic, and migration-sensitive code.      |
| Next.js        | `vercel:nextjs`                   | App Router, proxy, route handlers, Server/Client Component boundaries.     |
| React          | `vercel:react-best-practices`     | Hooks, state, a11y, memoization, and TSX structure.                        |
| Supabase       | `supabase:supabase`               | Auth, service-role containment, RLS, migrations, storage, and advisors.    |
| Security       | `security-and-hardening`          | Untrusted input, SSRF, file upload/proxy, secrets, and auth checks.        |
| Performance    | `performance-optimization`        | Large table/chart/upload/render hotspots and dependency cost.              |
| Shell          | `rg`, `find`, `git`, `npm`, `npx` | Fast static scans and read-only verification commands.                     |
| Browser        | Playwright MCP                    | Reserved for runtime evidence only. Not needed for this static audit pass. |
| shadcn         | shadcn MCP                        | Confirm local registry and primitive inventory.                            |

## Command checklist

| Command                            | Purpose                                                  | Status |
| ---------------------------------- | -------------------------------------------------------- | ------ |
| `git status --short --branch`      | Record dirty worktree before audit.                      | Done   |
| `npx tsc --noEmit`                 | TypeScript baseline.                                     | Done   |
| `npm run lint`                     | ESLint baseline.                                         | Done   |
| `npm test`                         | Vitest baseline.                                         | Done   |
| `npx prettier . --check`           | Formatting dry-run without writes.                       | Done   |
| `npm audit --audit-level=moderate` | Dependency security baseline.                            | Done   |
| Targeted `rg` / `find` scans       | Dead code, docs drift, runtime/API/Supabase/React risks. | Done   |

## Classification rubric

| Bucket                     | Definition                                                                                                              | Required evidence                                          |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `delete-now candidate`     | No static references and no framework/runtime/dynamic contract found.                                                   | `rg`/route/import evidence plus path context.              |
| `needs verification`       | Could be dead or risky, but depends on runtime, env, external service, route convention, migrations, or product intent. | Static evidence and the missing verification needed.       |
| `split/refactor candidate` | Active code with high complexity, mixed responsibilities, repeated patterns, or high review cost.                       | LOC/import/behavior evidence and suggested slice boundary. |
| `keep`                     | Intentional framework, runtime, test fixture, or dynamic usage.                                                         | Why removal would be unsafe or incorrect.                  |

---

## Report

Status: Done

Read-only audit completed on 02 June 2026. No source, package, migration, config, or
existing docs files were intentionally changed. `.env.local` was not read.

### Worktree baseline

Command: `git status --short --branch`

```text
## codex/v2-workspace-plan...origin/codex/v2-workspace-plan
 M docs/claude/feedback-testing-tools.md
 M docs/claude/skills.md
 M package.json
?? docs/tasks/01-06-2026/announcements-runtime-fix.md
?? docs/tasks/02-06-2026/announcement-center-redesign-spec.md
?? docs/tasks/02-06-2026/full-codebase-readonly-audit-plan.md
?? docs/tasks/02-06-2026/shared-ios-segmented-tabs.md
```

The modified files and unrelated untracked task docs existed before this audit artifact.
They were left untouched.

### Verification results

| Check                              | Result             | Notes                                                                                                                           |
| ---------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `npx tsc --noEmit`                 | Pass               | No TypeScript output.                                                                                                           |
| `npm run lint`                     | Pass with warnings | 0 errors, 3 warnings.                                                                                                           |
| `npm test`                         | Pass               | 78 test files and 456 tests passed. Vitest also printed Node `DEP0205` and jsdom navigation warnings.                           |
| `npx prettier . --check`           | Fail               | Existing `.github/copilot-instructions.md` is unformatted. This new audit file was also flagged before final manual formatting. |
| `npm audit --audit-level=moderate` | Fail               | 4 vulnerabilities: `xlsx` high with no fix, `postcss` moderate through `next`, `qs` moderate through `shadcn` dependencies.     |

Lint warnings:

- `src/components/auth/__tests__/LoginForm.rate-limit.test.tsx:5` imports unused `waitFor`.
- `src/components/layout/Sidebar.tsx:35` uses raw `<img>` instead of `next/image`.
- `src/components/pin/PinnedToolbar.tsx:8` imports unused `GripHorizontal`.

Dependency audit:

- `xlsx@0.18.5`: high severity prototype pollution and ReDoS advisories. No npm audit fix is available.
- `next@16.2.6` depends on `postcss@8.4.31`, which is below the audited safe range.
- `shadcn@4.7.0` pulls `qs@6.15.1`; audit says `npm audit fix` is available for that path.
- `npm audit fix --force` proposes installing `next@9.3.3`, which is breaking and must not be run.

### Inventory summary

| Area                             | Result                                                |
| -------------------------------- | ----------------------------------------------------- |
| Tracked files                    | 472                                                   |
| TS/TSX LOC                       | 34,414 total                                          |
| Source files by top-level folder | `components`: 136, `lib`: 93, `app`: 72, `_unused`: 5 |
| Test files by top-level folder   | `components`: 34, `lib`: 26, `app`: 17, `_unused`: 1  |
| App route files                  | 38 Next route convention files under `src/app`        |
| API route handlers               | 12 route handlers under `src/app/api`                 |
| Supabase migrations              | 5 SQL migrations                                      |
| Client modules                   | 126 files contain top-level `"use client"`            |
| shadcn registry                  | `@shadcn` configured                                  |
| Local UI primitives              | 27 files under `src/components/ui`                    |

Largest active TS/TSX files:

| File                                                          | LOC | Classification             |
| ------------------------------------------------------------- | --: | -------------------------- |
| `src/components/table/DraggableRow.tsx`                       | 843 | `split/refactor candidate` |
| `src/components/announcements/AnnouncementManagementPage.tsx` | 745 | `split/refactor candidate` |
| `src/components/table/ApplicantTable.tsx`                     | 710 | `split/refactor candidate` |
| `src/components/candidates/CandidatePreviewDialog.tsx`        | 706 | `split/refactor candidate` |
| `src/components/upload/GlobalDropZone.tsx`                    | 591 | `split/refactor candidate` |
| `src/components/ui/sidebar.tsx`                               | 585 | `keep`                     |
| `src/components/candidates/CandidateFiltersBar.tsx`           | 486 | `split/refactor candidate` |
| `src/components/views/ChartView.tsx`                          | 452 | `split/refactor candidate` |

No multiline JSX `className` strings or `style jsx` blocks were found by static scan.
Dnd-kit placement scan shows `DndContext` instances outside table bodies in active files.

### Findings

| Priority | Bucket                     | Finding                                                                                                                                                 | Evidence                                                                                                                                                                                                       | Follow-up                                                                                                         |
| -------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| P1       | `needs verification`       | `xlsx` is used for user-provided spreadsheet parsing and has high advisories with no npm fix.                                                           | `npm audit`; imports in `src/lib/upload/parseUploadFile.ts` and `src/components/upload/UploadZone.tsx`.                                                                                                        | Decide whether to replace `xlsx`, restrict accepted spreadsheet formats, or add stronger sandbox/size validation. |
| P1       | `needs verification`       | Sheets sync is intentionally incomplete at runtime because `googleapis` is not installed as a direct dependency.                                        | `src/lib/sheets/client.ts:1`, `src/lib/sheets/types.ts:5`, `npm ls googleapis` empty.                                                                                                                          | Either install and type `googleapis`, or replace with a lighter Google API client.                                |
| P1       | `needs verification`       | `scripts/probe-sheets-connection.ts` imports `dotenv`, but `dotenv` is not a direct dependency. It currently exists only transitively through `shadcn`. | `scripts/probe-sheets-connection.ts:5`, `npm ls dotenv`.                                                                                                                                                       | Add direct dev dependency or rewrite the probe to avoid transitive dependency coupling.                           |
| P1       | `needs verification`       | Candidate table RLS allows every authenticated user to read all candidates. This may be intended, but it is broad for applicant data.                   | `supabase/migrations/20260527120500_candidates_and_sync_log.sql:28-31`.                                                                                                                                        | Confirm data access policy; narrow by role if applicant data should not be global to all authenticated users.     |
| P2       | `delete-now candidate`     | Tracked `src/_unused` files have no live references outside `_unused`.                                                                                  | `src/_unused/FloatingChat.tsx`, `MobileBottomNav.tsx`, `Sidebar.tsx`, `TopBar.tsx`, plus one test; `rg` found only live `Sidebar` and `TopBar` imports from `src/components/layout`.                           | Delete in a dedicated deprecation task after one final `rg` and product confirmation.                             |
| P2       | `needs verification`       | `.github/copilot-instructions.md` is stale and describes the old single-page app and `docs/plans` workflow.                                             | Scan found `single-page application` and `docs/plans` in `.github/copilot-instructions.md`.                                                                                                                    | Replace with a short pointer to `CLAUDE.md`/`AGENTS.md` or update to current App Router/docs/tasks rules.         |
| P2       | `needs verification`       | Tooling docs drift from real config and can cause accidental formatter writes.                                                                          | `.prettierrc` uses `singleQuote: false`, `printWidth: 150`, deprecated `jsxBracketSameLine`; `docs/claude/tooling.md` says `singleQuote: true`, `printWidth: 100`, and `npm run format -- --check` as dry-run. | Align docs and config; prefer `npx prettier . --check` for dry-run unless script changes.                         |
| P2       | `split/refactor candidate` | Product UI still has many raw controls despite the shadcn-first rule.                                                                                   | Raw `<button>`, `<input>`, `<select>`, and `<textarea>` scans across app/components, including schedule, notes, candidate filters, table row menus, dashboard, and lab.                                        | Audit by feature. Convert active product controls to shared primitives where behavior and a11y improve.           |
| P2       | `split/refactor candidate` | Several active components are large enough to be difficult to review and reason about.                                                                  | Files over 450 LOC include table row, applicant table, announcement management, preview dialog, upload dropzone, filters, chart view.                                                                          | Split by interaction responsibility, not by arbitrary file count. Add focused tests before refactors.             |
| P2       | `needs verification`       | `postcss` advisory is attached to `next@16.2.6`, and the audit-suggested force fix would downgrade Next.                                                | `npm audit`; `npm ls postcss next`.                                                                                                                                                                            | Track Next patch availability. Do not force-fix.                                                                  |
| P2       | `needs verification`       | `qs` advisory is pulled through `shadcn` transitive dependencies.                                                                                       | `npm audit`; `npm ls qs`.                                                                                                                                                                                      | Try non-force dependency update in a separate dependency task, then re-run audit.                                 |
| P3       | `needs verification`       | Several API routes return upstream database or Supabase error messages directly.                                                                        | `NextResponse.json({ error: ...message })` in admin and announcement routes.                                                                                                                                   | Decide whether internal admin-only surfaces may expose raw messages; otherwise map to stable public error codes.  |
| P3       | `needs verification`       | File preview and portfolio metadata routes implement SSRF protection, but should get focused regression tests if not already comprehensive.             | `src/app/api/candidates/preview-file/route.ts`, `portfolio-metadata/route.ts`; URL parsing and DNS checks present.                                                                                             | Add tests for localhost, private IP, redirect behavior, oversized files, and non-HTML metadata responses.         |
| P3       | `keep`                     | `mockData`, `mockTimeline`, `mockHrStaff`, and `mockResponses` are active, not dead.                                                                    | Imports from dashboard, candidates, public pages, HR, schedule, chat, reports, pin compare.                                                                                                                    | Keep until a real data migration task replaces each consumer.                                                     |
| P3       | `keep`                     | Ignored `.env.local` and `tests/e2e/.auth-state.json` are not tracked.                                                                                  | `git status --ignored` shows both as ignored.                                                                                                                                                                  | Keep ignored. Do not print secrets or auth state in audit output.                                                 |
| P3       | `keep`                     | `src/components/ui/sidebar.tsx` is large but is a shared primitive layer.                                                                               | 585 LOC and local shadcn/sidebar primitive usage.                                                                                                                                                              | Avoid refactor unless a UI primitive task specifically targets sidebar behavior.                                  |

### Follow-up tasks

1. Dependency security task: replace or harden `xlsx` usage in upload parsing.
2. Sheets integration task: resolve `googleapis` and `dotenv` dependency gaps, then run the Sheets probe.
3. Supabase policy task: confirm candidate-data access rules and adjust RLS if all authenticated users should not read all applicant rows.
4. Deletion task: remove `src/_unused` files after final confirmation.
5. Docs/tooling task: update `.github/copilot-instructions.md`, `docs/claude/tooling.md`, and `.prettierrc` drift.
6. Lint cleanup task: remove unused imports and address the raw logo `<img>` warning.
7. UI primitive migration task: replace raw controls in active product UI with local shadcn primitives by feature.
8. Complexity task: split `DraggableRow`, `ApplicantTable`, and `CandidatePreviewDialog` into smaller behavior modules with tests.
9. API hardening task: normalize public error responses and add SSRF/file proxy regression tests.
10. Dependency audit task: update `qs` path and monitor Next/PostCSS patch without force-downgrading Next.

### Read-only guardrail result

This audit intentionally did not:

- run `npm run dev` or `npm run build`;
- run formatter writes or `npm audit fix`;
- edit source, package, migration, config, or existing docs files;
- read `.env.local`;
- apply migrations, SQL, Vercel deploys, or Supabase mutations.

Remaining deviation: this new markdown file needed manual formatting after the first dry-run
check. The existing `.github/copilot-instructions.md` formatting issue remains untouched by
request.

---

## Follow-up Execution Report

Status: Done

Executed safe, evidence-backed follow-up items from this audit. This section is not part of
the original read-only audit pass.

### Completed

| Audit item              | Result                                                                                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Sheets dependency gap   | Added direct `googleapis` runtime dependency and direct `dotenv` dev dependency. Replaced the Sheets `any` placeholder with `sheets_v4.Sheets` typing. |
| `_unused` deletion      | Removed tracked `src/_unused` files after a final reference scan found no live source or test imports.                                                 |
| Copilot docs drift      | Replaced stale single-page app instructions with a short pointer to `CLAUDE.md` and `AGENTS.md`.                                                       |
| Tooling docs drift      | Updated Prettier config documentation, documented `npx prettier . --check`, and corrected the test runner section.                                     |
| Prettier config warning | Removed deprecated `jsxBracketSameLine` from `.prettierrc`.                                                                                            |
| Lint warnings           | Removed unused test and pinned-toolbar imports; replaced the sidebar logo `<img>` with Next `Image`.                                                   |

### Follow-up verification

| Check                              | Result | Notes                                                                                                                             |
| ---------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `npx tsc --noEmit`                 | Pass   | No TypeScript output.                                                                                                             |
| `npm run lint`                     | Pass   | Previous three warnings are gone.                                                                                                 |
| `npm test`                         | Pass   | 77 test files and 451 tests passed. The removed `_unused` test accounts for the lower count. Existing Node/jsdom warnings remain. |
| `npx prettier . --check`           | Pass   | Whole-repo dry-run passes after the Copilot doc and config cleanup.                                                               |
| `npm audit --audit-level=moderate` | Fail   | Remaining issues are `xlsx`, `next`/`postcss`, and `qs`. No audit fix was run.                                                    |

The Sheets probe was not run because it loads `.env.local`; this task did not read or print
local secrets.

### Remaining backlog

1. Replace or meaningfully sandbox `xlsx` for user-provided spreadsheet parsing.
2. Confirm candidate-data access policy before changing Supabase RLS.
3. Track a Next patch for the nested `postcss` advisory; do not force-downgrade Next.
4. Update the `qs` path in a dependency-specific task.
5. Convert raw product UI controls to shared primitives by feature.
6. Split large active components with focused tests.
7. Normalize API error responses and add SSRF/file proxy regression tests.
