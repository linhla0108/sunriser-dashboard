# Shadcn Calendar Primitive Alignment

Tag: ui/fix

## Goal

Align the shared calendar primitive with the shadcn Calendar component contract while preserving current date picker behavior.

## Scope

- Included: Update `src/components/ui/calendar.tsx` to use shadcn's Calendar structure and shared `Button` primitive.
- Included: Keep `react-day-picker` as the underlying calendar engine because shadcn Calendar depends on it.
- Excluded: Add new dependencies, change date picker behavior, or alter feature-level scheduling flows.

## Acceptance criteria

- `Calendar` is a local shadcn/ui primitive that composes shared `Button` instead of a minimal custom DayPicker wrapper.
- Existing `DateTimePicker` usage still accepts `mode="single"`, `selected`, and `onSelect`.
- TypeScript passes for the changed component.

---

## Report

Status: Done | Commit: 82f89a8

Aligned the shared Calendar primitive with the shadcn component structure. The component now renders calendar day buttons through the local `Button` primitive and keeps `react-day-picker` as the underlying shadcn dependency.

Verification: `npx tsc --noEmit`; `npx eslint src/components/ui/calendar.tsx src/components/ui/date-time-picker.tsx`; `npx prettier --check src/components/ui/calendar.tsx docs/tasks/02-06-2026/summary.md docs/tasks/02-06-2026/shadcn-calendar-primitive-alignment.md`.

Remaining: None.
