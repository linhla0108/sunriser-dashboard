# Radix-Style Segmented Control

Tag: ui/refactor

## Goal

Replace the announcement filter tabs with a dedicated segmented control that follows the Radix Themes `SegmentedControl.Root` and `SegmentedControl.Item` shape.

## Scope

- Included: local shared segmented-control primitive, announcement popup filter migration, focused test update, and task documentation.
- Excluded: adding `@radix-ui/themes`, changing announcement filtering behavior, changing the full announcement page, and changing unrelated tabs.

## Acceptance criteria

- A shared `SegmentedControl` primitive exposes `Root` and `Item`.
- The announcement popup uses `SegmentedControl.Root` and `SegmentedControl.Item` for `Unread`, `Pinned`, and `All`.
- The selected item uses the app primary background and primary foreground text.
- `Tabs` remains a tabs primitive and is no longer restyled to fake a segmented control.
- Verification uses `npx tsc --noEmit`, scoped lint, focused announcement tests, and Prettier check.

---

## Report

Status: Done | Commit: 82f89a8

Added a local `SegmentedControl` primitive with `Root` and `Item` exports, following the Radix Themes component shape without adding `@radix-ui/themes` as a dependency. The announcement popup now uses this segmented control for `Unread`, `Pinned`, and `All`; shared `Tabs` was restored to its tab styling.

Verification:

- `npx tsc --noEmit`
- `npx eslint src/components/ui/segmented-control.tsx src/components/ui/tabs.tsx src/components/announcements/AnnouncementCenter.tsx src/components/announcements/__tests__/AnnouncementCenter.test.tsx src/components/views/ApplicantDetailDrawer.tsx 'src/app/(workspace)/settings/page.tsx'`
- `npm test -- src/components/announcements src/lib/announcements`
- `npx prettier --check src/components/ui/segmented-control.tsx src/components/ui/tabs.tsx src/components/announcements/AnnouncementCenter.tsx src/components/announcements/__tests__/AnnouncementCenter.test.tsx docs/tasks/02-06-2026/summary.md docs/tasks/02-06-2026/radix-style-segmented-control.md docs/tasks/02-06-2026/shared-ios-segmented-tabs.md`
