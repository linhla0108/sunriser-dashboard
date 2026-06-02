# Announcements Runtime Fix

Tag: announcements/fix

## Goal

Restore the announcements feature in the active runtime by aligning the live database schema with the shipped active-window contract and by making the bell-center UI report fetch failures honestly.

## Scope

- Included: applying the missing `starts_at` and `ends_at` schema change to the live Supabase project used by this workspace.
- Included: updating the bell announcement center so loading and error states are visible instead of falling through to an empty state.
- Included: focused test coverage for the center error state.
- Excluded: broader announcements UX redesign beyond the runtime bug and error-state fix.

## Acceptance criteria

- The live Supabase project exposes `announcements.starts_at` and `announcements.ends_at`.
- `http://localhost:3000/announcements` loads without the PostgREST `42703` missing-column error.
- The announcement center popover shows a real error message when provider loading fails instead of `No announcements in this tab.`.
- Focused typecheck, lint, tests, and Playwright verification pass for the touched scope.

---

## Report

Status: In Progress | Commit: pending
