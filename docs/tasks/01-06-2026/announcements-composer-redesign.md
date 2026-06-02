# Announcements Composer Redesign

Tag: announcements/feature

## Goal

Redesign the announcements composer so it feels like a polished command surface for internal publishing, supports a date range with time controls, supports `@staff` mentions in the body, and replaces the raw attachment picker with a guided drop workflow.

## Scope

- Included: announcements composer UI redesign, date-range picker UX, priority control polish, title/body placeholders, `@staff` mention suggestions, attachment dropzone redesign, and scoped drag-drop behavior for announcement attachments.
- Included: focused updates to shared shadcn primitives if the composer needs a reusable primitive that does not exist yet.
- Excluded: announcement inbox redesign beyond any small data-display updates required by the new composer fields.
- Excluded: unrelated schema changes outside the approved announcement active-window contract.
- Excluded: broad workspace-wide upload redesign outside the announcements composer flow.

## Acceptance criteria

- The composer uses a polished shadcn-first layout with clear hierarchy, grouped controls, and touch-friendly interaction states.
- The composer exposes a date-range picker with time input for both ends of the range.
- Title and body inputs expose useful placeholders without replacing visible labels.
- Typing `@` inside the body opens a staff suggestion list with inline filtering, keyboard navigation, and insertion into the body text.
- The priority input is visually clearer than the current plain select and communicates urgency without relying on color alone.
- The attachments area becomes a dedicated composer section with guided copy, visible drop target states, and a list of queued files.
- Dragging a file while the composer is mounted activates an announcement attachment drop experience and feeds the dropped files into the attachments list instead of the workspace upload sheet.
- The old upload sheet flow is not triggered from the announcements composer drag-drop path.
- The task is documented in `docs/tasks/01-06-2026/`.

## Approved decisions

- Use real `startsAt` and `endsAt` fields for the announcement active window.
- Source mention candidates from real user accounts in `user_profiles` and `user_access`.
- Use a page-scoped drag overlay inside the announcements composer route instead of reviving the old workspace-wide upload sheet.
- Keep the body as plain text with mention token insertion, not a rich-text editor.

## Spec

### Objective

Build a more deliberate announcement publishing surface for admins and managers. The form should feel faster to scan, harder to misuse, and more expressive for coordinated internal updates.

Primary users:

- Admins publishing org-wide updates
- Managers publishing team updates

Success looks like:

- Publishers can define a clear active window for an announcement.
- Publishers can mention staff members in the body without leaving the composer.
- Attachment handling is obvious and drag-drop friendly.
- The form feels consistent with the repo's shadcn-first UI rule.

### Tech stack

- Next.js 16 App Router
- React 19
- Tailwind CSS v4
- shadcn/ui local primitives from `src/components/ui/`
- Supabase-backed announcement CRUD already present in `src/lib/announcements/`

### Commands

- Type check: `npx tsc --noEmit`
- Lint scoped files: `npx eslint <files>`
- Test announcements: `npm test -- src/lib/announcements src/components/announcements`
- Format touched files: `npx prettier --write <files>`

### Project structure

- `src/components/announcements/` -> announcement inbox and management UI
- `src/components/ui/` -> shared shadcn primitives and composed inputs
- `src/lib/announcements/` -> announcement client/data contracts/validation
- `src/lib/admin/` and `src/lib/auth/` -> candidate staff/account sources for mention suggestions
- `docs/tasks/01-06-2026/` -> task record and implementation report

### Code style

- Keep feature logic in the announcements feature or shared `ui` primitives.
- Prefer composed shadcn primitives over raw HTML controls.
- Keep custom interaction helpers small and explicit.
- Favor plain text insertion for mentions over a full rich-text editor unless a later requirement forces richer formatting.

Example:

```tsx
<section className="border-border/70 bg-card/80 rounded-3xl border p-4 shadow-sm">
  <Label htmlFor="announcement-title">Title</Label>
  <Input
    id="announcement-title"
    placeholder="Quarterly hiring update, office closure, policy reminder..."
    value={title}
    onChange={event => setTitle(event.target.value)}
  />
</section>
```

### Testing strategy

- Unit and component coverage in `src/components/announcements/__tests__/` and nearby `src/lib/announcements` tests.
- Focused tests for date-range parsing/serialization helpers.
- Focused interaction tests for mention suggestions and attachment queue state if the resulting logic is non-trivial.
- Verify no regression in current create/edit/delete announcement flows.

### Boundaries

- Always: use `apply_patch` for edits, keep the UI shadcn-first, run `npx tsc --noEmit`, scoped lint, and focused tests.
- Ask first: any announcement schema change, any new dependency beyond local shadcn composition, any decision to source mentions from mock HR staff instead of real user accounts.
- Never: use `npm run dev` or `npm run build` only to check errors, re-enable the old workspace upload sheet for this flow, or silently change unrelated upload behavior.

---

## Report

Status: Done | Commit: pending

Implemented the redesigned announcements composer in incremental slices. The legacy single `dueAt` field was replaced in product code with a real `startsAt` and `endsAt` active window, the body now supports inline `@staff` suggestions sourced from real active accounts, the title and body now expose clearer placeholders, the priority control was upgraded from a plain select to an expressive button-based choice surface, and attachments now use a dedicated queue panel with page-scoped drag and drop instead of the old workspace upload sheet behavior.

Verification:

- `npx tsc --noEmit`
- `npx eslint src/lib/announcements/attachments.ts src/lib/announcements/__tests__/attachments.test.ts src/lib/announcements/mentions.ts src/lib/announcements/__tests__/mentions.test.ts src/lib/announcements/types.ts src/lib/announcements/validation.ts src/lib/announcements/list.ts src/lib/announcements/client.ts src/lib/announcements/useAnnouncementRealtime.ts src/lib/announcements/__tests__/validation.test.ts src/lib/announcements/__tests__/list.test.ts src/lib/announcements/__tests__/useAnnouncementRealtime.test.tsx src/components/announcements/AnnouncementInbox.tsx src/components/announcements/AnnouncementManagementPage.tsx src/components/announcements/__tests__/AnnouncementInbox.test.tsx src/components/announcements/__tests__/AnnouncementManagementPage.test.tsx`
- `npm test -- src/lib/announcements src/components/announcements`

Remaining: the inbox visual language was only updated where needed for the active-window contract; broader announcements inbox redesign was intentionally left out of scope.
