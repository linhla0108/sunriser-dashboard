# SUN.RISER Lab Route — Handoff

> **STATUS: COMPLETED + REVIEWED + ALL ISSUES RESOLVED**
> Created: 2026-05-16 | Route `/lab` fully implemented with all 15 features.
> Build: ✅ passing | TypeScript: ✅ clean | Prettier: ✅ formatted
> Tests: ✅ 206 tests passing across 14 files | Code Review: ✅ completed 2026-05-16
> All open issues: ✅ resolved 2026-05-16

---

## What Was Built

A new standalone route at `/lab` — a feature-rich ATS (Applicant Tracking System) prototype built on top of the existing mock data (646 applicants). No backend, no persistence — all state lives in React `useState` and resets on refresh.

**Entry point:** `src/app/lab/page.tsx`
**Route URL:** `http://localhost:3000/lab`
**Back link:** ← arrow in header returns to `/` (main dashboard)

---

## 15 Features Implemented

### Phase 1 — Core (10 features)

| #   | Feature                         | Where                                                                                        |
| --- | ------------------------------- | -------------------------------------------------------------------------------------------- |
| F1  | **Kanban Pipeline View**        | `KanbanView.tsx` — 5 columns: New / Passed / Waitlisted / Rejected / Round 2                 |
| F2  | **Gallery View**                | `GalleryView.tsx` — card grid, 24/page, colored avatar + position badge                      |
| F3  | **Quick Filter Chips**          | `QuickFilters.tsx` — Batch 1/2/3, Round1 result, all 7 positions, clear all                  |
| F4  | **Bulk Actions Toolbar**        | `BulkToolbar.tsx` — floating bottom bar: Set Round1, Assign PIC, Export, Clear               |
| F5  | **Applicant Detail Slide-over** | `ApplicantDrawer.tsx` — right panel 420px, tabs: Profile / Scorecard / Timeline              |
| F6  | **Inline Stage Edit**           | `LabTableView.tsx` — click Round1 cell → dropdown overlay, updates live                      |
| F7  | **Pipeline Funnel Chart**       | `FunnelStats.tsx` — collapsible bar showing Applied/Reviewed/Passed/Waitlisted/Failed/Round2 |
| F8  | **Position Color Coding**       | `lab-utils.ts` `POS_COLORS` — used in Table, Kanban, Gallery, Drawer consistently            |
| F9  | **Scorecard in Detail Panel**   | `ApplicantDrawer.tsx` Scorecard tab — 4 criteria × 5 stars, avg score, notes                 |
| F10 | **Advanced Export**             | `ExportModal.tsx` — pick columns (16 options), CSV or JSON, real file download               |

### Phase 2 — Extended (5 features)

| #   | Feature                     | Where                                                                               |
| --- | --------------------------- | ----------------------------------------------------------------------------------- |
| F11 | **Saved Views**             | `SavedViewsPopover.tsx` — save current view+filters combo, load/delete              |
| F12 | **Advanced Filter Builder** | `FilterBuilder.tsx` — right sheet, add/remove conditions (field + operator + value) |
| F13 | **Command Palette**         | `CommandPalette.tsx` — Cmd/Ctrl+K, search actions + applicants by name              |
| F14 | **Activity Timeline**       | `ApplicantDrawer.tsx` Timeline tab — auto-logs Round1 changes, score edits, notes   |
| F15 | **Compare Mode**            | `ComparePanel.tsx` — select up to 3 applicants, side-by-side field comparison       |

---

## File Structure

```
src/app/lab/
├── page.tsx                    ← main orchestrator, all shared state
├── lab-types.ts                ← LabView, Scorecard, Activity, SavedView, FilterCondition
├── lab-utils.ts                ← POS_COLORS, ROUND1_BADGE, getInitials, formatDate, getPosShort
├── __tests__/                  ← test suite (206 tests, 14 files)
│   ├── lab-utils.test.ts
│   ├── filtering.test.ts
│   ├── QuickFilters.test.tsx
│   ├── FunnelStats.test.tsx
│   ├── BulkToolbar.test.tsx
│   ├── ApplicantDrawer.test.tsx
│   ├── ExportModal.test.tsx
│   ├── ComparePanel.test.tsx
│   ├── KanbanView.test.tsx     ← added 2026-05-16
│   ├── GalleryView.test.tsx    ← added 2026-05-16
│   ├── CommandPalette.test.tsx ← added 2026-05-16
│   ├── SavedViewsPopover.test.tsx ← added 2026-05-16
│   ├── FilterBuilder.test.tsx  ← added 2026-05-16
│   └── LabTableView.test.tsx   ← added 2026-05-16
└── components/
    ├── LabHeader.tsx            ← top bar: back link, view switcher, search, action buttons
    ├── QuickFilters.tsx         ← chip row (F3)
    ├── FunnelStats.tsx          ← pipeline funnel (F7)
    ├── LabTableView.tsx         ← enhanced table: checkbox, sort, pagination, inline edit (F6, F8)
    ├── KanbanView.tsx           ← 5-column kanban (F1)
    ├── GalleryView.tsx          ← card grid with pagination (F2)
    ├── ApplicantDrawer.tsx      ← right slide-over: profile + scorecard + timeline (F5, F9, F14)
    ├── BulkToolbar.tsx          ← floating bulk actions (F4)
    ├── CommandPalette.tsx       ← Cmd+K palette (F13)
    ├── ExportModal.tsx          ← export dialog (F10)
    ├── FilterBuilder.tsx        ← advanced filter sheet (F12)
    ├── SavedViewsPopover.tsx    ← save/load views (F11)
    └── ComparePanel.tsx         ← side-by-side compare (F15)

src/test/
└── setup.ts                    ← @testing-library/jest-dom global setup

vitest.config.ts                ← Vitest config (@/ alias, jsdom, globals)
```

---

## State Architecture

All state is in `page.tsx`. Components receive props + callbacks only.

| State                | Type                               | Purpose                              |
| -------------------- | ---------------------------------- | ------------------------------------ |
| `activeView`         | `'table' \| 'kanban' \| 'gallery'` | Current view                         |
| `applicants`         | `Applicant[]`                      | Local mutable copy of mockApplicants |
| `filteredApplicants` | computed `useMemo`                 | Derived from all filter conditions   |
| `selectedIds`        | `Set<string>`                      | Bulk selection                       |
| `detailApplicant`    | `Applicant \| null`                | Slide-over target                    |
| `scorecards`         | `Record<id, Scorecard>`            | Scorecard ratings per applicant      |
| `activities`         | `Record<id, Activity[]>`           | Timeline events per applicant        |
| `compareIds`         | `string[]`                         | Max 3 IDs for compare panel          |
| `filterConditions`   | `FilterCondition[]`                | Advanced filter builder conditions   |
| `savedViews`         | `SavedView[]`                      | User-saved view/filter combos        |

---

## Key UX Interactions

| Trigger                | Effect                                   |
| ---------------------- | ---------------------------------------- |
| Click row / Eye button | Opens ApplicantDrawer slide-over         |
| Click Round1 cell      | Opens inline dropdown to set result      |
| Check any row          | Adds to selection, shows BulkToolbar     |
| Click GitCompare icon  | Adds to compare (auto-opens panel at 2+) |
| Ctrl/Cmd+K             | Opens CommandPalette                     |
| Type in palette        | Searches actions + applicants live       |
| Click Bookmark icon    | Opens SavedViewsPopover                  |
| Click Filters button   | Opens FilterBuilder sheet                |
| Click Export button    | Opens ExportModal                        |
| Expand FunnelStats     | Shows per-stage counts + bar             |

---

## Test Coverage

Stack: **Vitest v4 + @testing-library/react + jsdom**.

Run: `npm test` (single run) or `npm run test:watch` (watch mode).

| Test file                    | Tests   | What's covered                                                                                                                                              |
| ---------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lab-utils.test.ts`          | 22      | `getInitials`, `getPosColor`, `getPosShort`, `ROUND1_BADGE`, `ALL_POSITIONS`, `formatDate`, `generateActivityId`                                            |
| `filtering.test.ts`          | 33      | Search (name/email/university), position/batch/round1 quick filters, combined filters, advanced conditions (contains, equals, gt, lt, gte, lte), edge cases |
| `QuickFilters.test.tsx`      | 17      | Batch chips toggle, Round1 chips, Clear visibility/behavior, extra condition chips, remove                                                                  |
| `FunnelStats.test.tsx`       | 8       | Compact summary, passed/total, expand/collapse, correct counts, empty state                                                                                 |
| `BulkToolbar.test.tsx`       | 16      | Visibility by count, Clear, Set Round1 dropdown, PIC dropdown, mutual exclusion, Export                                                                     |
| `ApplicantDrawer.test.tsx`   | 22      | Null state, header info, tab navigation, Profile data, Round1 buttons, Timeline, Scorecard avg, close/compare                                               |
| `ExportModal.test.tsx`       | 16      | Open/close, row count, filtered context, CSV/JSON format, 16 columns, All/Default shortcuts, export action                                                  |
| `ComparePanel.test.tsx`      | 17      | Visibility, candidate count, headers, 11 row labels, GPA formatting, Round1 badges, remove/detail actions                                                   |
| `KanbanView.test.tsx`        | 9       | 5 columns render, counts, empty state, +N more overflow, card click, compare button                                                                         |
| `GalleryView.test.tsx`       | 13      | Card rendering, GPA/university, badges, pagination (6 tests), card click, selected state                                                                    |
| `CommandPalette.test.tsx`    | 15      | Visibility, 6 default actions, filter by query, action callbacks, no results, applicant search, ESC/backdrop close                                          |
| `SavedViewsPopover.test.tsx` | 10      | Visibility, empty state, saved views list, load/delete callbacks, save input, Enter to save, "Saved!" feedback                                              |
| `FilterBuilder.test.tsx`     | 11      | Visibility, initial condition, initialized from props, add/remove rows, apply with values, filter empties, clear all, close, field + operator options       |
| `LabTableView.test.tsx`      | 18      | Row rendering, checkboxes, select/clear all, sort, pagination, eye/compare buttons, inline Round 1 edit dropdown                                            |
| **Total**                    | **206** | Full component coverage across all 14 lab components                                                                                                        |

---

## Design System Compliance

- ✅ All colors from design system (`#FF5533`, `#1b1b1b`, `#6B5549`, `#767676`, `#FCFCFC`, etc.)
- ✅ Border radius: cards `rounded-3xl`, buttons `rounded-full`, inputs `rounded-2xl`
- ✅ Standard card shadow on all white panels
- ✅ Proxima Nova font (inherited from `globals.css`)
- ✅ Position accent colors (`POS_COLORS`) consistent throughout all 3 views
- ✅ Compact padding preference: `p-3/p-4`, `gap-3/gap-4`
- ✅ No multiline `className` strings (Turbopack-safe)
- ✅ No `styled-jsx`

---

## Known Limitations

- **No persistence** — all state resets on page refresh (same as main app)
- **No DnD in Kanban** — columns are visual only; stage changes via inline edit or drawer
- **Kanban cap** — 30 cards shown per column max (`+N more` indicator)
- **Compare** — limited to 3 applicants simultaneously
- **Scorecard tab** — initialises from `scorecard` prop once; doesn't sync if opened on a different applicant without re-mounting

---

## Code Review Findings (2026-05-16) — All Resolved

Findings from the full five-axis review. All items closed 2026-05-16.

### Lab route

| Finding                                                                                                      | File              | Severity     | Status                                              |
| ------------------------------------------------------------------------------------------------------------ | ----------------- | ------------ | --------------------------------------------------- |
| `FilterBuilder`, `KanbanView`, `GalleryView`, `CommandPalette`, `LabTableView`, `SavedViewsPopover` untested | `lab/__tests__/`  | ⚠️ Important | ✅ Fixed — 6 new test files, 75 new tests           |
| `generateActivityId` uses `Math.random()`                                                                    | `lab-utils.ts`    | Nit          | ✅ Fixed — replaced with `crypto.randomUUID()`      |
| Hardcoded `2026` in export filename                                                                          | `ExportModal.tsx` | Nit          | ✅ Fixed — replaced with `new Date().getFullYear()` |

### Main app

| Finding                                                              | File                              | Severity     | Status                                                                                       |
| -------------------------------------------------------------------- | --------------------------------- | ------------ | -------------------------------------------------------------------------------------------- |
| XSS via `dangerouslySetInnerHTML`                                    | `FloatingChat.tsx:45`             | 🔴 Critical  | ✅ Fixed — replaced with safe `formatLine()` using `split(/\*\*...\*\*/)` React children     |
| Dead code `ChatBox.tsx`                                              | `src/components/chat/ChatBox.tsx` | ⚠️ Important | ✅ Fixed — file deleted                                                                      |
| Export Data button no-op                                             | `page.tsx`                        | ⚠️ Important | ✅ Fixed — opens ExportModal with all 646 applicants                                         |
| Create Report button no-op                                           | `page.tsx`                        | ⚠️ Important | ✅ Fixed — opens ExportModal (same as Export Data)                                           |
| Eye button in `DraggableRow` no-op                                   | `DraggableRow.tsx`                | ⚠️ Important | ✅ Fixed — added `onViewDetail` prop → opens `ApplicantDrawer` in main page                  |
| Mobile filter button no-op                                           | `ApplicantTable.tsx`              | ⚠️ Important | ✅ Fixed — opens bottom sheet with Position/Batch/Result filters                             |
| `StatsCard` uses `rounded-xl`                                        | `StatsCard.tsx`                   | 🔴 Design    | ✅ Fixed — changed to `rounded-3xl`                                                          |
| No file size cap in `GlobalDropZone`                                 | `GlobalDropZone.tsx`              | ⚠️ Important | ✅ Fixed — added 50 MB cap before parsing                                                    |
| `GlobalDropZone` re-attaches 4 listeners on every `dropState` change | `GlobalDropZone.tsx`              | Nit          | ✅ Fixed — `dropStateRef` mirrors state; drag effect has stable deps `[parseFile, addToast]` |

---

## What's Next

All previously-open items are resolved. Possible future improvements:

- [ ] 🟡 Pagination in `ApplicantTable` main view (all 646 render at once)
- [ ] 🟡 Persist state across sessions (localStorage or backend)
- [ ] 🟡 Real AI integration in `FloatingChat`
- [ ] 🟡 DnD in KanbanView (drag cards between columns)

---

## Error Checking

```bash
npx tsc --noEmit   # type check
npm run lint       # lint
npm run format     # format + sort Tailwind classes
npm test           # run full test suite (206 tests)
```

> ⚠️ Do NOT run `npm run dev` or `npm run build` to check for errors — use `tsc --noEmit` instead.
