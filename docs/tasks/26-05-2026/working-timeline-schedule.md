# Working Timeline Schedule

Tag: schedule/feature

## Goal

Thêm 1 screen mới `/schedule` để manager xem lịch trình công việc của người phỏng vấn nội bộ — span / milestone, batch parallel, cutoff time critical.

## Scope

- **Included:**
  - Route `/schedule` mới, sidebar nav entry sau Candidates.
  - Type `TimelineEntry`, mock data seed từ sheet sample (11 entries).
  - Gantt view với batch swimlanes (B1, B2, B3, HR, General) — desktop primary.
  - Agenda view list grouped by day — secondary + mobile fallback.
  - ViewPillNav toggle gantt / agenda.
  - Filter bar: batch multi-select chip + search.
  - Drawer add / edit / delete entry (Sheet pattern giống ApplicantDetailDrawer).
  - Cutoff auto-extract bằng regex từ note → chip ⏰ ngay cạnh entry.
  - PIC parser parse format `- Tên: roles` thành chip list trong drawer.
  - Today marker vertical line trên Gantt.
- **Excluded:**
  - Persistence / server sync (chỉ in-memory state).
  - Drag-to-reschedule trong Gantt (defer cho task sau nếu cần).
  - Link với data từ /candidates.
  - Auto-extract sheet reference từ note (giữ trong note, không tách chip).
  - Sheet URL field (chỉ text).
  - Mobile-only swipe / gesture UX (chỉ stack agenda fallback).

## Acceptance criteria

- Sidebar có nav item "Schedule" sau Candidates; click vào load `/schedule`.
- `/schedule` mặc định mở Gantt view với 5 swimlanes có data từ mock.
- Mỗi entry hiện đúng vị trí trên time axis; span = bar, no-end-date = milestone diamond.
- Cutoff time extract đúng từ note `Cutoff time: DD/MM/YYYY - HH:mm` → hiện chip ⏰.
- Click entry → drawer slide từ phải, hiện full PIC chips (parsed) + note + form edit.
- Drawer edit cập nhật entry; delete xóa khỏi view.
- "+ New entry" button mở drawer với form blank.
- ViewPillNav toggle Gantt ↔ Agenda; cùng data, layout khác.
- Filter batch multi-select chỉ hiện entries của batches selected.
- Search box lọc theo todo + PIC + note.
- `npx tsc --noEmit` + `npm run lint` pass.
- Unit tests cho cutoff parser + PIC parser.

---

## Report

Status: Done

New `/schedule` screen with two views:

- **Gantt view (desktop primary)** — 5 swimlanes (B1, B2, B3, HR, General) collapsible. Spans render as colored bars, milestones (no end date) as rotated-square markers. Vertical today line. Zoom toggle Week / 2-Week / Month with prev/today/next navigation.
- **Agenda view (mobile + secondary)** — vertical card list grouped by day, full PIC chip list + note collapsible inline, cutoff chip beside entry, batch chip. Mobile auto-renders this view via `sm:hidden`.

Shared bits:

- `TimelineEntry` type in [src/lib/types.ts](src/lib/types.ts) with `TIMELINE_BATCHES` const and `normalizeTimelineBatch` helper.
- 11 entries seeded from sheet TSV in [src/lib/mockTimeline.ts](src/lib/mockTimeline.ts).
- Cutoff regex parser in [src/lib/schedule/cutoffExtract.ts](src/lib/schedule/cutoffExtract.ts) — matches `Cutoff time: DD/MM/YYYY - HH:mm` (and en-dash variant); renders as ⏰ chip.
- PIC parser in [src/lib/schedule/picParser.ts](src/lib/schedule/picParser.ts) — splits multi-line `- Name: roles` format into structured chips.
- URL state in [scheduleUrlState.ts](src/lib/schedule/scheduleUrlState.ts) (view, batch[], search, anchor).
- Filters hook in [useScheduleFilters.ts](src/lib/schedule/useScheduleFilters.ts).
- Sidebar nav entry "Schedule" with `CalendarClock` icon, slotted after Candidates.
- Floating pill nav at bottom toggles Gantt ↔ Agenda (hidden on mobile).
- Drawer for view + edit + create + delete using shadcn Sheet.

Verification:

- `npx tsc --noEmit` — pass
- `npx eslint` on schedule files — 0 errors
- `npx vitest run` — 356 tests pass (9 new tests for cutoff + PIC parsers)
- Prettier formatted via `npm run format` on new files

Remaining / out of scope:

- No persistence (in-memory only).
- No drag-to-reschedule on Gantt bars.
- No link with applicant data from /candidates.
- No mobile Gantt — auto-falls back to Agenda on sub-sm widths.

Commit: pending user review.
