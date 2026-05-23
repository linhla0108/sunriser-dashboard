# Candidate Pill Nav Visibility
Tag: candidates/fix

## Goal

Keep the `/candidates` view pill nav visible and reachable while preventing candidate content from being hidden below it.

## Scope

- Included: remove the scroll-driven hide/show behavior from the candidate view pill nav.
- Included: recheck `/candidates` bottom spacing for table, pipeline, chart, and gallery views.
- Included: preserve table pagination buttons inside the pill nav.
- Included: add keyboard shortcuts for previous and next page navigation in table view.
- Included: preserve keyboard shortcuts for switching candidate views.
- Included: verify that table internal scroll, sticky table header, and workspace `TopBar` behavior do not regress.
- Excluded: changing candidate URL params, candidate filters, pagination size, data model, or non-candidates route layout.

## Acceptance criteria

- The pill nav remains visible when the user scrolls down, scrolls up, scrolls the table body, or switches candidate views.
- The pill nav no longer uses opacity/pointer-event state to hide itself during scroll.
- The bottom of each candidate view remains readable above the fixed pill nav on mobile and desktop widths.
- Table pagination controls in the pill nav remain usable and disabled states still work on first and last pages.
- Table pagination supports keyboard shortcuts in table view and shows those shortcuts in the pill nav tooltips.
- Existing view buttons and keyboard shortcuts continue to switch views.

## Architecture decisions

- `ViewPillNav` should stay fixed and always mounted. The scroll-listener visibility state should be removed instead of tuned, because the requested behavior is no hide/show on scroll.
- Table pagination shortcuts should live in `ViewPillNav`, next to the pagination buttons, because that component already owns the table-only previous and next actions.
- `/candidates` should own page-level bottom clearance. The clearance should account for the mobile `bottom-20` pill nav and desktop `sm:bottom-6` position.
- `WorkspaceShell` should remain the outer scroll owner. Table view should keep its current bounded internal table scroll behavior.
- Tests should describe the new invariant: scroll events do not hide the pill nav.

## Dependency graph

```
ViewPillNav visibility behavior
    |
    v
Candidates page bottom clearance
    |
    v
Table, pipeline, chart, and gallery visual recheck
    |
    v
Focused tests and browser smoke
```

## Implementation tasks

### Task 1: Make ViewPillNav always visible

Description: Remove the scroll visibility state and scroll event listeners from `ViewPillNav` while preserving view switching, pagination controls, and keyboard shortcuts.

Acceptance criteria:

- [x] Scroll events do not add `opacity-0` or `pointer-events-none` to the nav.
- [x] View buttons remain clickable and keep their `aria-pressed` state.
- [x] Keyboard shortcuts still work while not typing in text inputs.

Verification:

- [x] Focused `ViewPillNav` tests pass.
- [x] Manual check: scroll `/candidates` and confirm the pill nav remains visible.

Dependencies: None

Estimated scope: Small

### Task 2: Recheck candidate bottom clearance

Description: Confirm whether current `/candidates` bottom padding is enough now that the pill nav is always visible, then adjust only the page-level spacing if content is hidden behind the nav.

Acceptance criteria:

- [x] Table footer and pagination summary remain visible above the nav.
- [x] Pipeline column bottoms, gallery card bottoms, and chart card bottoms are not hidden below the nav.
- [x] Mobile and desktop widths both have enough clearance without adding excessive empty space.

Verification:

- [x] Manual browser check at mobile width.
- [x] Manual browser check at desktop width.
- [x] Screenshot or visual check around the bottom of each candidate view.

Dependencies: Task 1

Estimated scope: Small

### Task 3: Add table pagination shortcuts

Description: Add keyboard shortcuts for previous and next page navigation when the pill nav is in table view, and expose those shortcuts in the previous and next page tooltips.

Acceptance criteria:

- [x] Previous and next shortcuts only call pagination actions while `view === "table"`.
- [x] Disabled previous and next states do not call pagination actions.
- [x] The shortcut handler does not intercept typing inside inputs, textareas, or editable content.
- [x] Tooltips for previous and next page show the shortcuts.

Verification:

- [x] Focused `ViewPillNav` tests pass.
- [x] Manual check: use shortcuts in `/candidates?view=table`.

Dependencies: Task 1

Estimated scope: Small

### Task 4: Regression check sticky and internal scroll behavior

Description: Recheck the previous candidate layout fixes while the nav remains visible: workspace topbar sticky behavior, table internal scroll, sticky table header, horizontal table overflow, and pill pagination controls.

Acceptance criteria:

- [x] The workspace `TopBar` remains sticky while scrolling `/candidates`.
- [x] Table rows scroll inside the table area and the table header stays visible.
- [x] Horizontal table scrolling still works on narrow widths.
- [x] Previous and next page buttons remain reachable in the pill nav.

Verification:

- [x] `npm test -- ViewPillNav TableView ApplicantTable WorkspaceShell`
- [ ] `npx tsc --noEmit`
- [ ] `npm run lint`
- [x] Browser smoke: `/candidates?view=table`, `/candidates?view=pipeline`, `/candidates?view=chart`, `/candidates?view=gallery`.

Dependencies: Task 2

Estimated scope: Small

## Checkpoint

- [x] Plan reviewed before implementation.
- [x] Focused tests pass.
- [x] Build type check passes.
- [x] Scoped lint passes for touched files.
- [x] Browser smoke confirms the pill nav is visible and content is not hidden underneath it.

---

## Report

Status: Done | Commit: uncommitted

Implemented the pill nav behavior change. `ViewPillNav` no longer hides itself while scrolling. It now renders through a React portal to `document.body`, so the fixed bottom position is relative to the viewport instead of the animated workspace content wrapper. The table view pagination controls support keyboard shortcuts: left arrow for previous page and right arrow for next page. The previous and next tooltips show those shortcuts. The shortcut handler still ignores input, textarea, and editable-content typing.

Also corrected the `WorkspaceShell.shortcuts.test.tsx` provider order so the existing workspace shell regression tests match the current app order: `AuthProvider` outside `ThemeProvider`.

Verification passed:
- `npm test -- ViewPillNav` — 1 file, 7 tests.
- `npm test -- ViewPillNav TableView ApplicantTable WorkspaceShell` — 5 files, 40 tests.
- `npm run build`.
- `npx eslint src/components/layout/ViewPillNav.tsx src/components/layout/__tests__/ViewPillNav.test.tsx src/components/layout/__tests__/WorkspaceShell.shortcuts.test.tsx`.
- `git diff --check`.
- Authenticated browser smoke with the provided dev account.
- Desktop `/candidates?view=table`: nav is fully visible before and after workspace/table scrolling; `parentIsBody: true`; table internal scroll and sticky header verified.
- Table pagination shortcuts: `ArrowRight` moved to page 2; `ArrowLeft` returned to page 1.
- Desktop `/candidates?view=pipeline`, `/candidates?view=chart`, and `/candidates?view=gallery`: active view switched correctly and the nav stayed fully visible after scrolling.
- Mobile 390x844 `/candidates?view=table`: nav stayed fully visible with the mobile bottom offset.

Evidence:
- Desktop fixed nav: `docs/tasks/22-05-2026/candidate-pill-nav-desktop-fixed.png`.
- Mobile fixed nav: `docs/tasks/22-05-2026/candidate-pill-nav-mobile-fixed.png`.
- Earlier unauthenticated redirect evidence, before valid credentials were provided: `docs/tasks/22-05-2026/candidate-pill-nav-auth-redirect.png`.

Unrelated repo blockers:
- Full `npm run lint` still fails on existing admin-page issues outside this task: `src/app/(workspace)/admin/users/page.tsx:45` and `src/components/admin/UserEditDrawer.tsx:35` use state updates in effects. Existing warnings remain in `UserEditDrawer.tsx`, `Sidebar.tsx`, and `ApplicantTable.sort.test.tsx`.
- Standalone `npx tsc --noEmit` is currently blocked by an untracked file outside this task: `src/lib/upload/__tests__/parseUploadFile.test.ts` imports missing `../parseUploadFile`.
