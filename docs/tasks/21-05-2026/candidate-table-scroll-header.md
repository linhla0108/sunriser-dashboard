# Candidate Table Scroll and Header Stickiness

Tag: candidates/fix

## Goal

Keep the `/candidates` table view usable in a fixed workspace viewport by making the table content scroll inside the table area, preserving the sticky workspace header, and leaving enough bottom space for the floating view pill nav.

## Scope

- Included: `/candidates` table view only.
- Included: height-aware table layout with internal vertical scroll for rows and horizontal scroll for columns.
- Included: sticky table header inside the internal table scroll area.
- Included: enough bottom padding so pagination text, the table card, and the floating ViewPillNav do not overlap.
- Included: recheck that the workspace `TopBar` stays sticky while scrolling `/candidates`.
- Excluded: pipeline, chart, gallery, HR, settings, and public report layout changes.
- Excluded: table data model changes, pagination size changes, and new candidate URL params.

## Architecture decisions

- Keep `/candidates` as the page-level owner of the table view option. The page should pass layout intent down instead of moving URL state or view-state logic into `ApplicantTable`.
- Let the workspace shell remain the outer scroll owner for non-table views. For table view, constrain the candidates content with a viewport-aware height so the table card can own row scrolling.
- Keep `TopBar` sticky in `WorkspaceShell`. If stickiness is broken, fix the wrapper/scroll-container relationship rather than duplicating headers inside the candidates page.
- Keep `ViewPillNav` fixed. Add page/content bottom clearance instead of moving the nav into the table.

## Dependency graph

```
Workspace scroll container + sticky TopBar
    |
    v
Candidates page height and bottom clearance
    |
    v
TableView layout contract
    |
    v
ApplicantTable internal scroll + sticky table header
    |
    v
Browser verification across desktop and mobile widths
```

## Implementation tasks

### Task 1: Restore sticky workspace header behavior

Description: Confirm why `TopBar` no longer sticks on `/candidates`, then adjust only the scroll-container/wrapper classes needed for sticky positioning.

Acceptance criteria:

- [x] Scrolling `/candidates` keeps the workspace header visible at the top.
- [x] The sticky header still works with the pinned toolbar visible on `/candidates`.
- [x] Other workspace routes keep normal page scrolling.

Verification:

- [ ] Manual browser check on `/candidates?view=table`.
- [ ] Manual browser check on one non-candidates workspace route.
- [x] Existing `WorkspaceShell` tests still pass.

Dependencies: None

Estimated scope: Small

### Task 2: Add table-view internal scrolling

Description: Give the candidates table view a bounded height and make the row area scroll inside the table card, while preserving horizontal overflow for narrow screens.

Acceptance criteria:

- [x] In `/candidates?view=table`, table rows scroll inside the table card instead of pushing the whole page endlessly.
- [x] The table header stays visible while the table body scrolls.
- [x] Horizontal table scrolling still works on small widths.
- [x] Drag, sort, inline chips, pin, detail view, and pagination controls remain usable.

Verification:

- [x] Focused table tests pass.
- [ ] Manual browser check with enough rows to require vertical scroll.
- [ ] Manual browser check at mobile and desktop widths.

Dependencies: Task 1

Estimated scope: Medium

### Task 3: Add bottom clearance for the floating pill nav

Description: Increase `/candidates` bottom padding so the fixed ViewPillNav does not cover the table card footer, pagination text, or final scrollable content.

Acceptance criteria:

- [x] The table pagination summary remains readable above the pill nav.
- [x] The last visible table rows and empty-state content are not hidden behind the pill nav.
- [x] Mobile clearance accounts for the nav being at `bottom-20`; desktop clearance accounts for `sm:bottom-6`.

Verification:

- [ ] Manual browser check at mobile and desktop widths.
- [ ] Visual screenshot check for overlap around the bottom of the table view.

Dependencies: Task 2

Estimated scope: Small

## Checkpoint

- [x] `npm test -- ApplicantTable TableView ViewPillNav WorkspaceShell`
- [ ] `npm test -- TopBar WorkspaceShell`
- [x] `npx tsc --noEmit`
- [x] `npm run lint`
- [x] `npm run build`
- [ ] Browser smoke: `/candidates?view=table`, scroll page, scroll table, switch view pills, paginate table.

---

## Report

Status: Blocked QA | Commit: uncommitted

Implementation is complete, but the task is not Done because protected-route browser QA is blocked. The workspace top bar sticky behavior now belongs to the animated shell wrapper, so the header is not constrained by a short parent wrapper. The shared table primitive now supports an optional scroll-container class, and `ApplicantTable` uses it for bounded vertical scrolling with a sticky table header. The candidates page also has extra bottom padding so the floating ViewPillNav does not cover the table footer area.

Verification passed:
- `npm test -- ApplicantTable TableView ViewPillNav WorkspaceShell` — 5 files, 36 tests.
- `npm test -- WorkspaceShell` — 1 file, 3 tests.
- `npx tsc --noEmit`.
- `npm run lint` — passed with existing warnings in `Sidebar.tsx` and `ApplicantTable.sort.test.tsx`.
- `npm run build`.

Blocked QA: protected-route browser QA could not complete because the dev server redirected to `/login?from=%2Fcandidates`, and the old mock `admin@sunriser.com` / `admin123` login was rejected by Supabase with `Invalid login credentials`. Mark this task Done only after `/candidates?view=table` is smoke-tested visually with a valid dev account.
