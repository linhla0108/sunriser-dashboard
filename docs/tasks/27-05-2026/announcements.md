# Announcements With Read Status And Push Notice

Tag: announcements/feature

## Goal

Build an announcement system where admins and managers can publish pinned, prioritized announcements with due dates and attachments to all active users, and users can see instant notifications plus unread/read status.

## Scope

- Included: announcement creation by `admin` and `manager`, active-user audience, title/body, priority, due date, pinned flag, attachments, unread/read state per user, unread count, instant in-app push notification, read counts for publishers, soft delete, and task-level documentation.
- Excluded: email, SMS, mobile push, scheduled future publishing, per-role targeting, comment threads, acknowledgement signatures, and announcement analytics beyond basic read counts.

## Acceptance criteria

- Admins and managers can create announcements with title, body, priority, optional due date, optional attachments, and pinned state.
- All active authenticated users can view non-deleted announcements regardless of due date.
- Users can distinguish unread and read announcements and mark an announcement as read.
- Unread state is per user and survives refresh/sign-out.
- New announcements trigger an instant in-app notification for active users without refreshing the page.
- Pinned announcements render above unpinned announcements.
- Due date is informational only and never hides an announcement.
- Attachments are accessible only to authenticated active users who can view the announcement.
- Supabase RLS prevents inactive users and unauthenticated users from reading announcements or attachments.
- Managers can edit/delete only their own announcements. Admins can edit/delete all announcements.
- Authors are treated as read immediately after creation and do not receive a self-toast.
- Verification includes `npx tsc --noEmit`, scoped lint, and focused Vitest coverage before any build/dev-server verification.

## Spec

### Objective

HQ needs a reliable channel for system-wide announcements so active users do not miss important updates. Managers and admins are the publishers. Every active authenticated user is the audience. Success means a user can see a new announcement immediately, understand whether it is unread or read, and mark it as read.

### Locked decisions

- Audience: all users with `user_access.active = true`.
- Publishers: `admin` and `manager`.
- Edit/delete: admins manage all; managers manage only their own announcements.
- Notification: instant in-app only through Supabase Realtime, no browser or OS push.
- Due date: field name is `due_at`; it is informational and never hides announcements.
- Attachments: private bucket, max 10 MB per file, allowed types are PDF, DOCX, XLSX, PNG, and JPG.
- Delete behavior: soft delete with `deleted_at`; clients never physically delete rows.
- Author behavior: author sees the created announcement, is marked read immediately, and does not receive a self-toast.

### Tech stack

- Next.js 16 App Router with React 19.
- Supabase Auth, Postgres, RLS, Storage, and Realtime Postgres changes.
- `@supabase/ssr` and `@supabase/supabase-js` for client/server access.
- Tailwind CSS v4 and existing shadcn/ui components.
- Vitest and Testing Library for focused unit/component coverage.

### Commands

```bash
npx tsc --noEmit
npm run lint
npm test -- src/lib/announcements
npm test -- src/components/announcements
npm run format -- --check
```

Do not use `npm run dev` or `npm run build` only to check implementation errors.

### Project structure

```text
supabase/migrations/                         -> announcement tables, indexes, storage bucket policies, RLS, realtime publication
src/app/(workspace)/announcements/           -> member announcement inbox page
src/app/(workspace)/admin/announcements/     -> publisher management page
src/app/api/announcements/                   -> read / write / stats / storage routes
src/components/announcements/                -> announcement list, composer, unread badge, toast, attachment list
src/lib/announcements/                       -> types, data access helpers, realtime subscription hook
docs/tasks/27-05-2026/announcements.md       -> this living spec and final report
```

### Data model

Proposed tables:

- `announcements`: source record for title, body, priority, pinned state, due date, author, and timestamps.
- `announcement_attachments`: metadata for uploaded files attached to announcements.
- `announcement_reads`: one row per user per announcement after the user marks it read.

Unread should be derived from visible announcements that do not have an `announcement_reads` row for the current user. The only eager read row is the author row created with the announcement so the author is treated as read immediately.

Priority values should be constrained to `low`, `normal`, `high`, and `urgent`.

### Realtime notification model

Use Supabase Realtime Postgres Changes on `announcements` inserts. The migration must add the announcements table to the `supabase_realtime` publication. The client should subscribe only while authenticated and active, then show an in-app notification and refresh/invalidate the announcement list when a visible announcement is inserted.

This is instant in-app push, not operating-system push, email, SMS, or mobile push.

### Authorization model

- Publisher roles: `admin`, `manager`.
- Audience: all active authenticated users.
- Read access: active authenticated users can select non-deleted announcements.
- Write access: admins/managers can create/update announcements; managers are limited to their own rows.
- Read state: users can insert/update only their own `announcement_reads` rows.
- Attachment access: authenticated active users who can read the announcement can access attachment metadata and signed downloads. Upload rights follow publisher/manage rights.
- Authorization must not rely on `raw_user_meta_data`.

### Code style

Use explicit typed helpers, narrow client/server boundaries, and existing naming conventions.

```ts
export type AnnouncementPriority = "low" | "normal" | "high" | "urgent"

export interface AnnouncementSummary {
  id: string
  title: string
  body: string
  priority: AnnouncementPriority
  pinned: boolean
  dueAt: string | null
  authorUserId: string
  createdAt: string
  updatedAt: string
  readAt: string | null
  attachments: AnnouncementAttachment[]
}

export function isUnreadAnnouncement(announcement: AnnouncementSummary) {
  return announcement.readAt === null
}
```

### UI behavior

- Add an announcements entry in the workspace navigation with an unread badge.
- Add a top-bar notification button/badge for unread announcements.
- Show pinned announcements first, then unread, then newest.
- Use compact dashboard styling from the existing design system.
- Use accessible labels for icon-only controls.
- Show clear empty states for no announcements and no unread announcements.
- Use existing `sonner` or a small in-app notification surface for realtime arrival.

### Testing strategy

- Unit tests for visibility/read-state derivation.
- Component tests for unread/read rendering, pinned ordering, priority labels, and mark-read interaction.
- Auth/RLS migration review for:
  - inactive users denied,
  - unauthenticated users denied,
  - users only mark their own read rows,
  - managers/admins can publish,
  - managers cannot edit or delete another manager's row.
- Realtime hook test should mock Supabase channel subscription and assert cleanup on unmount/sign-out.

### Boundaries

- Always: use `apply_patch` for manual edits, keep service-role usage server-only, enable RLS on new public tables, use app metadata/JWT role for authorization, update task docs during the same task.
- Ask first: adding a new third-party dependency, adding OS/browser push notifications, changing existing role names, changing auth/session strategy, or making announcements target specific groups instead of all active users.
- Never: expose `service_role` to client code, authorize from user-editable metadata, store attachment files in public buckets, disable RLS to make realtime or storage easier, or use `npm run dev`/`npm run build` only for error checking.

## Success criteria

- A manager creates an urgent pinned announcement with an attachment.
- An active member already on the dashboard receives an in-app notification without refresh.
- The member sees the announcement as unread in the announcement center and unread badge count increases.
- The member marks it read, and the read state persists after refresh.
- Another member still sees the same announcement as unread until they mark it read.
- An inactive user cannot load announcement rows or attachment metadata.
- An admin can see read counts for all announcements and a manager can see read counts for their own announcements.

## Phased plan summary

### Phase 0 — Spec and contract freeze

- Update this task doc to match the locked decisions.
- Define stable TypeScript contracts in `src/lib/announcements/types.ts`.

### Phase 1 — Supabase foundation

- Add the `announcement_priority` enum.
- Add `announcements`, `announcement_attachments`, and `announcement_reads`.
- Add helper functions and RLS policies for active-user access and publisher ownership.
- Add `announcements` to `supabase_realtime`.
- Document private bucket setup for `announcement-attachments` because this repo does not yet have an established SQL bucket-migration pattern.

### Required manual setup

- Create a private Storage bucket named `announcement-attachments`.
- Do not expose the bucket publicly.
- Keep file access behind signed server routes or service-role-backed server handlers only.

### Phase 2 — Data and API layer

- Add `zod` validation schemas and announcement helpers.
- Add create, update, soft-delete, attachment signing, and stats routes.

### Phase 3 — Realtime and app state

- Add realtime subscription, shared unread state, and `sonner` toast handling.

### Phase 4 — Member UI

- Add `/announcements`, sidebar badge, top-bar notification button, inbox states, and signed attachment downloads.

### Phase 5 — Publisher UI

- Add publisher guard, create/edit form, management list, read counts, and soft-delete confirmation flow.

### Phase 6 — QA, security review, and report

- Run the required verification commands.
- Review RLS, route auth, storage privacy, and service-role containment.
- Finish the task report in this file.

---

## Report

Status: Done | Commit: pending

Shipped:

- Supabase migration for `announcement_priority`, `announcements`, `announcement_attachments`, `announcement_reads`, helper functions, RLS, `updated_at` triggers, and Realtime publication wiring.
- Shared workspace announcements provider with unread count, read persistence, and realtime insert handling.
- Member inbox route at `/announcements` with unread/read state, pinned ordering, due-date labels, attachment downloads, sidebar badge, and top-bar badge.
- Publisher route at `/admin/announcements` with manager/admin guard, create/edit form, soft delete, attachment upload, and read-count display.
- Server routes for attachment upload, signed attachment download, and stats aggregation.
- Focused tests for validation, sorting, realtime subscription cleanup, inbox interaction, layout badges, and publisher guard behavior.
- Applied the announcements schema to the linked Supabase project and created the private `announcement-attachments` Storage bucket.
- Browser-checked `/announcements` and `/admin/announcements` on the local app after the remote schema was applied.

Verification run:

- `npx tsc --noEmit`
- `npm run lint` (warnings only in unrelated existing files)
- `npm test -- src/lib/announcements`
- `npm test -- src/components/announcements`
- focused layout/auth tests for announcement integration
- `npm run format -- --check`
- browser verification on `http://localhost:3000/announcements` and `http://localhost:3000/admin/announcements`
- remote verification that `public.announcements`, `public.announcement_attachments`, and `public.announcement_reads` exist and the `announcement-attachments` bucket is private

Remaining:

- `npm run format -- --check` is misconfigured in this repo as `prettier --write . --check`, so it rewrites files instead of acting as a dry check.
- `npm run lint` still reports unrelated existing warnings in `src/components/auth/__tests__/LoginForm.rate-limit.test.tsx`, `src/components/layout/Sidebar.tsx`, `src/components/pin/PinnedToolbar.tsx`, and `src/components/views/PipelineView.tsx`.
