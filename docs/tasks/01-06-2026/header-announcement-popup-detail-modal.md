# Header Announcement Popup + Detail Modal

Tag: announcements/feature

## Goal

Replace the header announcement button with a popup inbox and shared detail modal while keeping the full `/announcements` page available.

## Scope

- Included: header bell popup, `Unread/Pinned/All` tabs, compact announcement list items, shared detail modal, context-menu actions, deep-link support with `?announcement=<id>`, and stale announcement date-field normalization to `startsAt` / `endsAt`.
- Excluded: schema changes, new announcement targeting rules, email/push delivery, and removal of the existing inbox page.

## Acceptance criteria

- The top-bar bell opens a popup instead of routing immediately.
- Popup items show only title, priority, and date range, and open a full-detail modal on click.
- The detail modal marks unread announcements as read on open and supports attachment opening.
- Each popup item exposes `Open`, `Mark as read`, `Copy title`, `Copy link`, and `Open inbox page`.
- `/announcements?announcement=<id>` opens the same detail modal on the inbox page.

## Assumption

- Canonical detail link: `/announcements?announcement=<id>`.

---

## Report

Status: Done | Commit: pending

Replaced the header bell route action with a compact shadcn-style announcement center popup. The popup now supports `Unread`, `Pinned`, and `All` tabs, a scrollable compact list, context-menu actions, and a shared detail modal that opens full announcement content and auto-marks unread items as read.

Normalized announcement display code to the real `startsAt` / `endsAt` contract, reused the same detail modal on the `/announcements` page for deep links, and added focused tests for the popup flow, modal flow, and query-param modal opening.

Remaining: verification depends on the repo-wide test/typecheck state at run time.
