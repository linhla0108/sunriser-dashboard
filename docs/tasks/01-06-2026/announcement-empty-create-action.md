# Announcement Empty Create Action

Tag: announcements/fix

## Goal

Keep the announcement publisher action visible when the inbox has no announcements.

## Scope

- Included: Empty-state inbox rendering and focused component coverage.
- Excluded: Role policy changes, announcement data contracts, and management form behavior.

## Acceptance criteria

- Admins and managers can reach announcement creation from an empty announcement inbox.
- Non-publishers do not see the publisher action.
- Existing loading and error states remain unchanged.
- Verification uses focused announcement tests, `npx tsc --noEmit`, and lint.

---

## Report

Status: Done | Commit: pending

The announcement inbox now renders its header for the empty state, so publisher users can reach the creation page even before any announcements exist. The publisher action is labeled `Create`; non-publishers still do not see it.

Verification:

- `npm test -- src/components/announcements` passed.
- `npm run lint` passed with existing warnings.
- `npx tsc --noEmit` failed on an unrelated modified file: `src/app/(workspace)/admin/users/page.tsx` uses `ContextMenuTrigger` with an unsupported `asChild` prop.

Remaining: Clear the unrelated TypeScript failure before treating the whole workspace as green.
