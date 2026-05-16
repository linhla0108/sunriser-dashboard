# SUN.RISER Dashboard — Improvement Plan

> **STATUS: ACTIVE**
> Created: 2026-05-16 | Based on full codebase audit post-UX overhaul.
> Check off tasks as they are completed.

---

## Legend

| Symbol | Meaning                         |
| ------ | ------------------------------- |
| `[ ]`  | Pending                         |
| `[x]`  | Completed                       |
| 🔴     | Bug / broken feature            |
| 🟡     | UX gap — affects daily workflow |
| 🟢     | Enhancement — nice to have      |
| 🔵     | Functional / integration        |

---

## P0 — Bugs (broken right now)

- [ ] 🔴 **Fix `StatsCard` border radius**
  - File: `src/components/dashboard/StatsCard.tsx:13`
  - Change `rounded-xl` → `rounded-3xl` to match design system
  - 1-line fix

- [ ] 🔴 **Mobile filter button does nothing**
  - File: `src/components/table/ApplicantTable.tsx:187`
  - The `<button>` renders a `SlidersHorizontal` icon but has no `onClick` and no state
  - Fix: implement mobile filter bottom sheet (see P1 task below)

- [ ] 🔴 **`Export Data` button is a no-op**
  - File: `src/app/page.tsx:29`
  - `onClick={() => {}}` — button exists but does nothing
  - Fix: wire up CSV export of currently-filtered rows (see P1 task below)

- [ ] 🔴 **`Create Report` button is a no-op**
  - File: `src/app/page.tsx:36`
  - `onClick={() => {}}` — no modal, no action
  - Fix: at minimum open a "coming soon" modal; ideally a report summary sheet

- [ ] 🔴 **Eye button in table row does nothing**
  - File: `src/components/table/DraggableRow.tsx:137`
  - `<button>` renders `<Eye>` icon with no `onClick`
  - Fix: open applicant detail panel (see P1 task below)

---

## P1 — High Priority UX Gaps

- [ ] 🟡 **Applicant detail slide-over panel**
  - Trigger: click eye button OR click anywhere on a row
  - Panel slides in from the right (fixed, `w-[400px]`, full height on desktop; full screen on mobile)
  - Shows all `Applicant` fields currently invisible in table: DOB, phone, major, experience, portfolio, fullTime, submittedAt, round1Notes, round2Result
  - Allows editing: `round1Result` (select), `round1Notes` (textarea), `pic` (input)
  - Close: X button or Escape or click outside
  - State: local `useState` in page.tsx — changes persist until page refresh

- [ ] 🟡 **Mobile filter bottom sheet**
  - Trigger: tap the `SlidersHorizontal` button (currently broken)
  - Bottom sheet slides up with: Position, Batch, Round 1 filter selects
  - "Apply" button closes sheet and applies all three filters
  - "Clear" resets all three
  - Backdrop tap → dismiss without applying

- [ ] 🟡 **Export Data — CSV download**
  - Exports the currently **filtered** rows (not all 646)
  - Columns: Name, Email, Position, University, GPA, Year, Batch, PIC, Round1, Round2
  - Uses native `Blob` + `URL.createObjectURL` — no extra library needed
  - Filename: `sunriser-2026-applicants-[timestamp].csv`

- [ ] 🟡 **Pagination (50 rows per page)**
  - Currently all 646 rows render to DOM at once — causes lag on low-end devices
  - Simple page controls at bottom of table: `← Prev  Page 1 of 13  Next →`
  - Reset to page 1 whenever filters or search change
  - "N of M" counter in filter bar updates to show current page range

---

## P2 — Medium Priority

- [ ] 🟡 **Bulk select + bulk actions toolbar**
  - Checkbox column (leftmost, before drag handle) — select individual rows or select-all
  - When ≥1 row selected: floating action toolbar appears above table
  - Toolbar actions: Set Round 1 Result (Passed / Failed / Waiting list), Assign PIC, Clear selection
  - Deselect-all clears toolbar

- [ ] 🟡 **Round 2 management**
  - Round 2 column currently shows raw text or `—`
  - Only applicants with `round1Result === 'Passed'` are eligible for Round 2
  - Make the Round 2 cell editable inline (click → dropdown: Passed / Failed / Pending)
  - Dashboard: add a 5th stat card or section for Round 2 stats when data exists

- [ ] 🟡 **`Create Report` modal — summary sheet**
  - Modal opens with a printable summary:
    - Total / Passed / Failed / Waiting list counts
    - Pass rate per position
    - Top 10 GPA candidates
  - "Print" button calls `window.print()`
  - "Close" dismisses

---

## P3 — Polish & Low Priority

- [ ] 🟢 **Fix XSS risk in chat bubble renderer**
  - File: `src/components/chat/FloatingChat.tsx:41`
  - Currently uses `dangerouslySetInnerHTML` to render `**bold**` markdown
  - Safe fix: replace with a tiny regex that returns `<strong>` nodes via React, not raw HTML injection
  - Critical once real LLM responses are connected

- [ ] 🟢 **Discovery channel chart — use brand color**
  - File: `src/components/dashboard/OverviewCharts.tsx:189`
  - Bar fill is `#555555` (grey) — inconsistent with the other 3 charts which use primary/brand colors
  - Change to `#6B5549` (warm muted) or gradient from `#ffdad3` → `#FF5533`

- [ ] 🟢 **TopBar subtitle visible on mobile**
  - File: `src/components/layout/TopBar.tsx:33`
  - Subtitle has `hidden sm:block` — completely invisible on mobile
  - Show a shorter version (e.g. "SUN.RISER 2026") below the title on small screens

- [ ] 🟢 **Skeleton loading states**
  - StatsCards and Charts currently render instantly from mock data — no issue now
  - Add skeleton shimmer placeholders for when real API calls are added later
  - Low priority until real data integration

- [ ] 🟢 **Keyboard navigation in table**
  - Arrow keys to move between rows
  - Enter to open detail panel

---

## P4 — Future / Integration

- [ ] 🔵 **Real AI chat — Claude API integration**
  - Replace mock replies in `FloatingChat` with actual Claude API calls
  - Pass `mockApplicants` (or uploaded data) as context
  - Fix XSS issue (P3 above) first
  - Known: `dangerouslySetInnerHTML` must be replaced before going live

- [ ] 🔵 **Upload → inject data into table**
  - Currently `GlobalDropZone` parses file but "Analyze in Table" only switches views
  - Lift parsed row data to `page.tsx` state
  - Pass to `ApplicantTable` as `data` prop replacing `mockApplicants`
  - Requires column mapping UI (map uploaded columns → `Applicant` type fields)

- [ ] 🔵 **State persistence**
  - Round 1 edits, DnD order, filters — all reset on refresh
  - `localStorage` for: `round1Result` overrides, `pic` assignments, row order
  - Low priority for demo context; required for production use

---

## File Index

| File                                          | Affected by                                              |
| --------------------------------------------- | -------------------------------------------------------- |
| `src/app/page.tsx`                            | Export Data, Create Report, detail panel state           |
| `src/components/dashboard/StatsCard.tsx`      | P0 border radius fix                                     |
| `src/components/dashboard/OverviewCharts.tsx` | P3 discovery chart color                                 |
| `src/components/table/ApplicantTable.tsx`     | Pagination, bulk select, mobile filter                   |
| `src/components/table/DraggableRow.tsx`       | Eye button → detail panel, checkbox, Round 2 inline edit |
| `src/components/layout/TopBar.tsx`            | P3 subtitle mobile                                       |
| `src/components/chat/FloatingChat.tsx`        | P3 XSS fix, P4 AI integration                            |
| `src/components/upload/GlobalDropZone.tsx`    | P4 data injection                                        |
| `src/lib/mockData.ts`                         | No changes — source of truth for mock                    |
| `src/lib/types.ts`                            | No changes expected                                      |

---

## Completed

_(Move tasks here as they are done)_

- [x] Design system rebrand — Proxima Nova + #FF5533 palette (`2026-05-16-design-system-rebrand-design.md`)
- [x] UX layout overhaul — FloatingChat, GlobalDropZone, MobileBottomNav, responsive layout (`2026-05-16-ux-layout-overhaul-design.md`)
