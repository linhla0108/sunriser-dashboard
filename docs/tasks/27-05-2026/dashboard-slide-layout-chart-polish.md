# Dashboard Slide Layout + ChartView Card Polish

Tag: dashboard/refactor+ui

## Goal

Restructure `/dashboard` into a 2-slide horizontal layout and make the ChartView cards visually stand out instead of blending into the page background.

## Scope

- Included:
  - Remove `position` and `batch` group-by options from PipelineView toggle (only round1/round2 remain)
  - Copy `ChartView` from candidates into `/dashboard`
  - Convert `/dashboard` from vertical stack to 2 horizontal slides:
    - Slide 0 — Overview: StatsCard × 4 + OverviewCharts
    - Slide 1 — Charts: ChartView (using `mockApplicants`)
  - Bottom-center pill nav (Overview / Charts) via `createPortal`, glass panel style copied from `ViewPillNav`
  - Keyboard shortcuts: ← → to switch slides
  - Polish ChartView card surface so it lifts above the `#FCFCFC` page bg
- Excluded:
  - Persisting slide state to URL or settings
  - Mobile swipe gestures (keyboard + pill nav only for now)
  - Changing StatsCard or OverviewCharts visual treatment

## Acceptance criteria

- Pipeline view group-by toggle shows only "Round 1" and "Round 2"
- `/dashboard` shows Overview slide by default
- Clicking pill nav buttons or pressing ← / → animates the slide horizontally with `translateX` + 300ms ease-in-out
- Pill nav stays fixed bottom-center, above page content, no SSR hydration warning
- ChartView cards have visible 1px border (`#E8E4DF`), 3-layer drop shadow, and a primary-tinted hover state
- Card title color upgraded from muted brown to ink (`#1b1b1b`) with a small primary dot accent
- DnD grip handle hidden until card hover/focus (less visual noise)
- `npx tsc --noEmit` passes

---

## Report

Status: Done | Commit: pending

Changed files:

- `src/components/views/PipelineView.tsx` — group-by toggle reduced to round1 + round2 only
- `src/app/(workspace)/dashboard/page.tsx` — converted to slide layout with `translateX` transform, keyboard handler, and portaled pill nav (uses `mounted` guard for SSR safety)
- `src/components/views/ChartView.tsx` — ChartCard wrapper: added `border-[#E8E4DF]`, replaced 2-layer shadow with 3-layer (`0_2px_4px`, `0_12px_24px_-8px`, `0_28px_48px_-16px` all using `rgba(15,23,42,…)`), hover state tints border + shadow with `#FF5533`; title color → `#1b1b1b` with `size-1.5` primary dot; grip handle now `opacity-0 group-hover:opacity-100`

Behavior notes:

- Slide animates only `translateX`; no transform applied to children to avoid conflict with dnd-kit's sortable transforms inside ChartView
- Card hover transitions only `border-color` and `box-shadow` (not `transform`) so it doesn't clash with `useSortable` transform on the same article
- Pill nav uses `bottom-20 sm:bottom-6` so it clears the mobile bottom nav

Remaining: none.
