# Tasks — 25 May 2026

| #   | Task                                      | Tag                | Status           | Note                                                                                      |
| --- | ----------------------------------------- | ------------------ | ---------------- | ----------------------------------------------------------------------------------------- |
| 1   | Checkbox/index flicker fix                | candidates/fix     | Done             | commit 8b22beb — visibility swap, no layout shift                                         |
| 2   | Row status colors + round2 override       | candidates/fix     | Done             | commit 8b22beb — emerald/red/amber palette, round2 overrides round1                       |
| 3   | Context menu: Pin → compare               | candidates/feature | Done             | commit 8b22beb — usePinned wired, local pin-to-top removed                                |
| 4   | Bulk action bar merged into filter row    | candidates/ui      | Done             | commit 8b22beb — CandidateFiltersBar swaps to bulk mode when selection > 0                |
| 5   | Context menu: Round status submenus       | candidates/feature | Done             | Submenu flyout cho Round 1/2 status trong context menu                                    |
| 6   | Auth system hardening                     | auth/fix           | Done             | all 6 fixes shipped — see auth-hardening.md                                               |
| 14  | Auth error resilience                     | auth/fix           | Done             | 6 fixes: proxy 500, confirm 500, Safari storage crash, 429 UX, signOut safe, 401/403      |
| 15  | Auth hard-reload deadlock fix             | auth/fix           | Done             | split onAuthStateChange (sync) from profile loader (effect) — see auth-reload-deadlock.md |
| 7   | Pipeline: column colors + sticky header   | candidates/fix     | Done             | commit 676805e — solid bg, colored headers, sticky, per-status themes                     |
| 8   | Pipeline: card hover orange border        | candidates/fix     | Done             | commit 676805e — hover:border-primary/60 added                                            |
| 9   | Pipeline: remove round chip, add PIC chip | candidates/feature | Done             | commit 676805e — PIC_CHIP_STYLE map, colored PIC chip + GPA in footer                     |
| 10  | Pipeline: drag-drop to top of column      | candidates/fix     | Done             | commit 676805e — arrayMove places card at top of target column                            |
| 11  | Pipeline: fix group-by control            | candidates/fix     | Done             | commit 676805e — single 4-option pill row, select dropdown removed                        |
| 12  | Chart view rebuild                        | candidates/feature | Done             | commit 9f1214b — all 7 charts, global filter, % labels, draggable cards                   |
| 13  | Keyboard shortcuts redesign               | workspace/ux       | Done             | removed unsafe globals; scoped view/pager shortcuts                                       |
| 16  | Playwright e2e tests                      | repo/test          | Done             | auth 9/9 pass; candidates-table 1/5 pass (4 fail: pre-existing lab color/bulk issues)     |
