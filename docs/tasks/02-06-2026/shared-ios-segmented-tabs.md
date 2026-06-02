# Shared iOS-Style Segmented Tabs

Tag: ui/refactor

## Goal

Make the shared default `Tabs` control read as an iOS-style segmented control with a primary selected segment.

## Scope

- Included: default shared tab list and trigger styling, announcement popup tab override cleanup, and focused verification.
- Excluded: tab behavior changes, `line` tab variant changes, announcement data changes, routing changes, realtime changes, and popup interaction redesign.

## Acceptance criteria

- Default `TabsList` uses a soft primary-tinted track with a subtle primary border.
- Default active `TabsTrigger` uses `bg-primary` and `text-primary-foreground`.
- Default tab triggers keep stable equal-width segment sizing and readable inactive text.
- The `line` variant remains visually separate from the segmented default.
- The announcement popup keeps the existing `Unread`, `Pinned`, and `All` filtering behavior.
- Verification uses `npx tsc --noEmit`, scoped lint, and focused announcement tests.

---

## Report

Status: Done | Commit: pending

Implemented the shared default tab visual refresh and simplified the announcement popup tab classes. Behavior remains unchanged.

Verification:

- `npx tsc --noEmit`
- `npx eslint src/components/ui/tabs.tsx src/components/announcements/AnnouncementCenter.tsx src/components/views/ApplicantDetailDrawer.tsx 'src/app/(workspace)/settings/page.tsx'`
- `npm test -- src/components/announcements src/lib/announcements`
- `npx prettier --check src/components/ui/tabs.tsx src/components/announcements/AnnouncementCenter.tsx docs/tasks/02-06-2026/summary.md docs/tasks/02-06-2026/shared-ios-segmented-tabs.md`
