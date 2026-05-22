# Tasks — 22 May 2026

Base commit: `e79dd1c` (`refactor(agents): streamline guidance by consolidating content to CLAUDE.md`)

| #  | Task                              | Tag          | Status | Note                                                             |
|----|-----------------------------------|--------------|--------|------------------------------------------------------------------|
| 1  | Next.js 16 proxy migration        | repo/fix     | Done   | middleware.ts → proxy.ts; export renamed; root stub deleted      |
| 2  | AuthProvider / ThemeProvider order | auth/fix    | Done   | ThemeProvider must be inside AuthProvider (calls useAuth)        |
| 3  | Candidate Pill Nav Visibility     | candidates/fix | Done   | Always-visible portaled pill nav + table page shortcuts; authenticated browser QA passed |
| 4  | Upload Review Flow                | upload/feature | Blocked QA | Implemented; Playwright auth smoke needs valid `E2E_EMAIL` / `E2E_PASSWORD` |
| 5  | Candidate Table Row Selection and Bulk Actions | candidates/feature | Planned | Hover checkbox, selected-mode checkbox visibility, persistent pagination selection, bulk Batch/PIC/Delete |
| 6  | Pipeline Drag Offset Fix          | candidates/fix | Done   | `fill-mode: both→backwards` on workspace animations + `setActivatorNodeRef`; confirmed via DevTools JS scan |
| 7  | Pipeline Round Fix — Round Switcher | candidates/fix | Planned | Round 1 / Round 2 tab toggle; per-round columns + card badges; drag mutation for round2 |
