# Announcement Create Modal

Tag: ui/refactor

## Goal

Move announcement creation into an inbox modal and remove the obsolete admin announcement management route.

## Scope

- Included: `/announcements` create modal, create-only composer state, campaign schedule copy, always-visible attachment dropzone, priority card polish, two-month calendar range picker, custom time grids, and related tests.
- Excluded: edit/delete announcement UI, backend schema changes, announcement API contract changes, and unrelated announcement center redesign work.

## Acceptance criteria

- Publishers create announcements from `/announcements` without navigating to `/admin/announcements`.
- `/admin/announcements` page and obsolete managed-list UI are removed.
- The composer is create-only and always shows the attachment dropzone.
- Campaign schedule copy uses `Thời gian chiến dịch`, `Chọn thời gian chiến dịch`, and `Xóa thời gian chiến dịch`.
- The date/time range picker uses two months where space allows, primary orange range styling, no broken focus ring, and custom hour/minute grids instead of a native time input.
- Priority options use larger centered icons with priority-specific color treatment.

---

## Report

Status: Done | Commit: 82f89a8

Moved announcement creation into a modal on `/announcements`, removed the admin announcement route and managed-list UI, simplified the composer to create-only behavior, made the attachment dropzone always visible, and polished campaign scheduling, calendar range styling, custom time selection, and priority choices.

Verification: `npm test -- src/components/announcements/__tests__/AnnouncementInbox.test.tsx src/app/(workspace)/announcements/__tests__/page.test.tsx src/components/ui/__tests__/DateTimeRangePicker.test.tsx`; `npx tsc --noEmit`; scoped `npx eslint`; scoped `npx prettier --check`; `curl -I http://localhost:3000/announcements`.

Remaining: Interactive Playwright browser verification was blocked because the shared browser profile was already in use by the in-app browser.
