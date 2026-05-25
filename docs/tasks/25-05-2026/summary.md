# Tasks — 25 May 2026

| #   | Task                                      | Tag                | Status           | Note                                                                                |
| --- | ----------------------------------------- | ------------------ | ---------------- | ----------------------------------------------------------------------------------- |
| 1   | Checkbox/index flicker fix                | candidates/fix     | Planned          | visibility swap instead of display toggle                                           |
| 2   | Row status colors + round2 override       | candidates/fix     | Planned          | richer palette, round2 fail beats round1 pass                                       |
| 3   | Context menu: Pin → compare               | candidates/feature | Planned          | remove local pin-to-top, wire usePinned                                             |
| 4   | Bulk action bar merged into filter row    | candidates/ui      | Planned          | Option A: swap filter content when selection > 0                                    |
| 5   | Context menu: Round status submenus       | candidates/plan    | Awaiting confirm | PLAN ONLY — user must confirm UX flow                                               |
| 6   | Auth system hardening                     | auth/fix           | Done             | all 6 fixes shipped — see auth-hardening.md                                         |
| 14  | Auth error resilience                     | auth/fix           | Planned          | 6 gaps: proxy 500, confirm 500, Safari storage crash, 429 UX, signOut race, 401/403  |
| 7   | Pipeline: column colors + sticky header   | candidates/fix     | Planned          | viewUtils.ts + PipelineView.tsx — plan in pipeline-view-improvements.md             |
| 8   | Pipeline: card hover orange border        | candidates/fix     | Planned          | 1-line change in PipelineView.tsx                                                   |
| 9   | Pipeline: remove round chip, add PIC chip | candidates/feature | Planned          | PIC_CHIP_STYLE in viewUtils, new card footer                                        |
| 10  | Pipeline: drag-drop to top of column      | candidates/fix     | Planned          | arrayMove after field update in handleDragEnd                                       |
| 11  | Pipeline: fix group-by control            | candidates/fix     | Planned          | Replace split pills+select with 4-option pill row                                   |
| 12  | Chart view rebuild                        | candidates/feature | Planned          | 6/7 charts missing — full rebuild of ChartView.tsx, see chart-view-audit.md         |
| 13  | Keyboard shortcuts redesign               | workspace/ux       | Done             | removed unsafe globals; scoped view/pager shortcuts                                 |
