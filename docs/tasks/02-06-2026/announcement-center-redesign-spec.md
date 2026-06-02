# Announcement Center Redesign Spec

Tag: ui/spec

## Goal

Define a replacement interaction for the current top-bar announcement popup, which is too cramped and feels like the wrong surface for reading updates.

## Scope

- Included: announcement entry point in the top bar, preview behavior, unread affordance, navigation flow into full announcement content, and success criteria for a redesign.
- Excluded: announcement database schema, realtime delivery model, publisher permissions, attachment storage, and composer/admin workflow changes.

## Acceptance criteria

- The redesign removes the current dense popup-inbox interaction from the bell button.
- The bell still shows unread count and remains the entry point for announcements.
- Users can preview whether there are unread items without reading full announcement bodies inside a cramped surface.
- Full announcement reading happens in a roomier surface than the current popup.
- The full `/announcements` page remains available unless a later approved task explicitly removes it.
- Verification for implementation uses `npx tsc --noEmit`, scoped lint, and focused announcement tests before any `dev` or `build` usage.

## Spec

### Assumptions I am making

1. The main complaint is the current `AnnouncementCenter` popover in the top bar, not the announcement feature as a whole.
2. The existing announcement data contract is acceptable; the interaction model is what needs to change.
3. The right fix is to demote the bell to a lightweight preview/launcher and move actual reading into a larger, calmer surface.
4. We should preserve the existing `/announcements` route and shared detail dialog unless the redesign proves they should be replaced with a drawer or sheet.

These assumptions need confirmation before implementation.

### Objective

The current bell popover asks users to browse tabs, perform actions, and open detail content inside a cramped floating surface. That is poor information hierarchy for announcements. The redesign should make the bell useful for awareness and triage, while moving actual reading into a full, stable reading surface.

Success means:

- A user can tell if something is unread from the top bar in under a second.
- A user is not expected to browse or read announcement details inside a small popover.
- The route into full announcement reading is obvious and low-friction.
- The interface feels intentional instead of like a mini inbox squeezed into a floating card.

### Tech stack

- Next.js 16 App Router
- React 19
- Tailwind CSS v4
- Local shadcn/ui primitives from `src/components/ui/`
- Existing announcement state in `src/lib/announcements/AnnouncementProvider.tsx`

### Commands

```bash
npx tsc --noEmit
npx eslint src/components/announcements/AnnouncementCenter.tsx src/components/announcements/AnnouncementInbox.tsx src/components/announcements/AnnouncementDetailDialog.tsx src/lib/announcements/presentation.ts src/lib/announcements/AnnouncementProvider.tsx
npm test -- src/components/announcements src/lib/announcements
npx prettier --check docs/tasks/02-06-2026/announcement-center-redesign-spec.md
```

Do not use `npm run dev` or `npm run build` only to check for implementation errors.

### Project structure

```text
src/components/announcements/              -> announcement center trigger, inbox, detail dialog
src/components/layout/TopBar.tsx           -> top-bar bell entry point
src/lib/announcements/                     -> shared state, sorting, presentation helpers
src/app/(workspace)/announcements/page.tsx -> full announcements page
docs/tasks/02-06-2026/                     -> this spec and follow-up implementation report
```

### Current UI diagnosis

The current `AnnouncementCenter` mixes too many jobs into one popover:

- awareness: unread badge on the bell
- browsing: `Unread`, `Pinned`, `All` tabbed list
- row actions: context menu
- detail opening: modal launch

That makes the bell surface do too much in too little space. The result is a cramped popup that behaves like a miniature inbox instead of a clean launcher.

### Proposed interaction direction

Replace the current popup-inbox with a lighter announcement preview panel:

- Bell button remains in the top bar with unread count.
- Clicking the bell opens a compact preview card, not a tabbed inbox.
- The preview card shows:
  - one short status line such as `3 unread announcements`
  - up to 3 latest unread items
  - each item with title, priority, and publish time only
  - one obvious `Open announcements` action
  - optional `Mark all read` only if product explicitly wants bulk-read later
- Clicking a preview item routes to `/announcements?announcement=<id>` instead of opening another modal from inside the popup.

This keeps the floating surface lightweight and makes the page the primary reading environment.

### Alternative if the user wants stronger in-place reading

If the user explicitly wants faster reading without leaving context, the better alternative is a right-side `Sheet` or drawer, not the current popover. That would still avoid tabs and context menus inside a tiny overlay.

### Code style

Prefer composed shadcn primitives and explicit state transitions.

```tsx
<PopoverContent className="w-[22rem] rounded-3xl p-0">
  <section className="space-y-3 p-4">
    <header className="flex items-center justify-between">
      <div>
        <h2 className="text-sm font-semibold">Announcements</h2>
        <p className="text-muted-foreground text-xs">3 unread updates</p>
      </div>
      <Button asChild size="sm" variant="outline">
        <Link href="/announcements">Open announcements</Link>
      </Button>
    </header>
  </section>
</PopoverContent>
```

### Testing strategy

- Component tests for bell unread badge, preview rendering, and empty/unread states.
- Component or page tests for click-through routing to `/announcements?announcement=<id>`.
- Regression coverage to ensure mark-read behavior still works from the full reading surface.
- Focused tests only; no broad unrelated UI verification.

### Boundaries

- Always: use `apply_patch` for manual edits, keep the bell lightweight, preserve announcement state correctness, and document the task in `docs/tasks/02-06-2026/`.
- Ask first: replacing the page with a drawer-only experience, adding bulk actions like `Mark all read`, changing the detail modal contract, or changing realtime toast behavior.
- Never: reintroduce a dense tabbed inbox popup, change schema just to support UI layout, or use `npm run dev`/`npm run build` only for error checking.

## Success criteria

- The bell no longer opens the current tabbed popup inbox.
- The bell gives quick awareness, not full inbox management.
- Users reach full announcement reading through a stable, roomy surface.
- Unread count and per-item unread state remain accurate.
- The redesigned surface is visually calmer and easier to scan than the current popup.

## Open questions

- Should the bell open a lightweight preview popover or a right-side sheet?
- Should clicking a preview item route to the page or open the shared detail dialog on the page only after route transition?
- Do you want any action besides `Open announcements` inside the bell surface, or should it be strictly read-only preview?

---

## Report

Status: In Progress | Commit: pending

Spec written before implementation. Waiting for approval on the interaction direction before changing code.
