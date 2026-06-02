# Shadcn-First Announcements

Tag: announcements/refactor

## Goal

Align the announcements feature and repo guidance with a shadcn-first UI rule so equivalent native controls are replaced with shared primitives.

## Scope

- Included: announcements form/input cleanup, shadcn-first documentation updates, and memory capture for the new rule.
- Excluded: broad repo-wide migration of every existing native control outside the announcements feature.

## Acceptance criteria

- Announcements management uses shared shadcn primitives where equivalents already exist or can be added locally.
- Repo guidance states that agents must prefer shadcn components over raw HTML controls when an equivalent primitive exists.
- The task is documented in `docs/tasks/01-06-2026/`.

---

## Report

Status: Done | Commit: pending

Replaced native announcements controls with shared shadcn primitives by adding `Textarea`, switching priority to `Select`, switching pinned state to `Checkbox`, upgrading loading states to `Skeleton`, and replacing the native `datetime-local` due-date field with a shared shadcn-style `DateTimePicker` built from `Popover` and `Calendar`.

Updated repo guidance in `CLAUDE.md` and `docs/claude/design-system.md` so agents default to `src/components/ui/` primitives instead of raw HTML controls when an equivalent exists.

Verification:

- `npx tsc --noEmit`
- `npx eslint src/components/announcements/AnnouncementInbox.tsx src/components/announcements/AnnouncementManagementPage.tsx src/components/ui/textarea.tsx src/components/ui/calendar.tsx src/components/ui/date-time-picker.tsx`
- `npm test -- src/lib/announcements src/components/announcements`

Remaining: the rule is now codified, but this task intentionally did not migrate every existing native control in unrelated features across the repo.
