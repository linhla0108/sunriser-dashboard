# Combined Date-Time Range Picker

Tag: ui/fix

## Goal

Replace the two announcement datetime controls with one compact range picker that follows the shadcn-first design system.

## Scope

- Included: Add a shared datetime range picker with one trigger, one range calendar, start/end time controls, preset chips, exact time inputs, and clear actions.
- Included: Use the combined picker in announcement management while preserving existing start/end ISO payload behavior.
- Included: Add focused component and announcement form tests.
- Excluded: Backend schema changes, validation contract changes, new date libraries, or schedule behavior changes outside announcements.

## Acceptance criteria

- The announcement form renders one active-window picker instead of separate start and end pickers.
- Start-only, end-only, both, and empty window states remain representable.
- Calendar range selection maps `from` to start date and `to` to end date.
- Time chips and manual time inputs update only the intended side.
- Clear actions can reset each side or the whole range.

---

## Report

Status: Done

Added a shared `DateTimeRangePicker` and replaced the announcement form's two separate datetime controls with one active-window picker. The new picker keeps open-ended windows, uses the shared shadcn-style primitives, supports range date selection, preset time chips, exact time input, per-side clear actions, and clear-all.

Verification: `npm test -- src/components/ui/__tests__/DateTimeRangePicker.test.tsx src/components/announcements/__tests__/AnnouncementManagementPage.test.tsx`; `npx tsc --noEmit`; `npx eslint src/components/ui/date-time-picker.tsx src/components/ui/__tests__/DateTimeRangePicker.test.tsx src/components/announcements/AnnouncementManagementPage.tsx src/components/announcements/__tests__/AnnouncementManagementPage.test.tsx`; `npx prettier --check src/components/ui/date-time-picker.tsx src/components/ui/__tests__/DateTimeRangePicker.test.tsx src/components/announcements/AnnouncementManagementPage.tsx src/components/announcements/__tests__/AnnouncementManagementPage.test.tsx docs/tasks/02-06-2026/summary.md docs/tasks/02-06-2026/combined-date-time-range-picker.md`.

Remaining: None.
