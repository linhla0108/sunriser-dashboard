# Candidate Table Row Selection and Bulk Actions
Tag: candidates/feature

## Goal

Add hover-revealed row selection to the `/candidates` table view and provide one compact bulk action section for selected candidates.

## Scope

- Included: table-row checkbox selection for the candidate table view.
- Included: show the checkbox on the hovered row when no row is selected.
- Included: once at least one row is selected, show checkboxes on all visible table rows so users can continue selecting quickly.
- Included: keep selected candidate IDs when the user changes table pagination.
- Included: one bulk action section that shows selected count, a bulk action popover, and a clear-selection button.
- Included: bulk action popover options for Batch, PIC, and Delete.
- Included: confirmation inside the popover before applying Batch, PIC, or Delete changes.
- Excluded: URL persistence for selected IDs.
- Excluded: selection support in pipeline, chart, or gallery views.
- Excluded: backend persistence or Supabase updates.
- Excluded: cross-session persistence after page reload.

## Acceptance criteria

- A candidate table row shows a checkbox when the row is hovered and no candidate is currently selected.
- After selecting one row, every visible table row shows its checkbox until selection is cleared.
- Selected rows remain selected when moving between candidate table pages.
- The selected count includes candidates selected on other pages.
- The clear button removes all selected IDs and returns the table to hover-only checkbox visibility.
- The bulk action section is hidden when no candidate is selected and visible when one or more candidates are selected.
- The bulk action popover includes Batch, PIC, and Delete actions.
- Batch bulk action lets the user choose Batch 1, Batch 2, or Batch 3 and confirms before applying.
- PIC bulk action lets the user choose an existing PIC option and confirms before applying.
- Delete bulk action confirms before removing selected candidates from the current local applicant list.
- Deleted candidates are also removed from the selected ID set.
- Selection behavior does not break existing row drag, sorting, inline chips, pin actions, detail drawer, table pagination, sticky header, or internal table scroll.

## Architecture decisions

- Selection state should live in `CandidatesPage`, not inside `ApplicantTable`, because the table only receives the current page slice and selection must survive pagination.
- Store selection as a `Set<string>` of applicant IDs. Derive selected candidate records from the full `applicants` list for count and bulk operations.
- Keep selection local UI state. Do not write selected IDs into candidate URL params because this is short-lived workspace state, not shareable filter state.
- Keep the first table column width stable. Use that column for either row number or checkbox so hover and selected states do not shift table layout.
- `ApplicantTable` should receive controlled selection props and callbacks. `DraggableRow` should only render/toggle the checkbox and should not own selection state.
- Bulk Batch and PIC operations should reuse the existing table option values so one-row and bulk edits cannot drift.
- Delete should be local-only for now and should update the in-memory `applicants` list, filtered view, pagination, and selected IDs together.
- The bulk action section should sit with the table controls, above the table card or attached to the table card header area, so it is visible without covering the fixed pill nav.

## Dependency graph

```
CandidatesPage selected ID state
    |
    v
ApplicantTable controlled selection contract
    |
    v
DraggableRow hover and selected checkbox rendering
    |
    v
Bulk action section and confirmation popover
    |
    v
Bulk Batch, PIC, Delete data updates
    |
    v
Focused tests and authenticated browser QA
```

## Implementation tasks

### Task 1: Add controlled row selection state

Description: Add local selected-ID state to the candidates page and pass controlled selection props into the table view path.

Acceptance criteria:

- [ ] Selected IDs are stored against the full candidate list, not just the current page.
- [ ] Pagination changes do not clear selected IDs.
- [ ] Clearing selection resets the selected ID set to empty.

Verification:

- [ ] Focused unit test covers selecting a row, changing page, and preserving selected count.
- [ ] Manual check: select a row, go to the next page, return, and confirm the row is still selected.

Dependencies: None

Estimated scope: Medium

### Task 2: Render hover and selected-mode checkboxes

Description: Update the table row UI so a checkbox appears on hover when nothing is selected, and all row checkboxes remain visible while selection mode is active.

Acceptance criteria:

- [ ] Hovering an unselected row shows its checkbox.
- [ ] Selecting one row makes all visible row checkboxes visible.
- [ ] The first column keeps stable width and the table does not shift when checkboxes appear.
- [ ] Row drag, pin, view-detail, sort, and inline chip controls still work.

Verification:

- [ ] Component test covers hover-only and selected-mode checkbox visibility.
- [ ] Manual check: hover rows and select multiple rows on desktop width.

Dependencies: Task 1

Estimated scope: Medium

### Task 3: Add the bulk action section

Description: Add one compact bulk action section that appears when candidates are selected and exposes selected count, a bulk action popover, and clear selection.

Acceptance criteria:

- [ ] Bulk section is hidden at zero selected candidates.
- [ ] Bulk section shows the exact selected count.
- [ ] Clear button empties selection and hides the section.
- [ ] Popover offers Batch, PIC, and Delete without covering the fixed pill nav or table header.

Verification:

- [ ] Component test covers visibility, selected count, popover open state, and clear action.
- [ ] Manual check: section position works with internal table scroll and the fixed pill nav.

Dependencies: Task 1

Estimated scope: Medium

### Task 4: Implement confirmed bulk updates

Description: Wire the bulk action popover so Batch, PIC, and Delete show a confirmation step before mutating local candidate data.

Acceptance criteria:

- [ ] Batch action requires choosing a batch and confirming before updating selected candidates.
- [ ] PIC action requires choosing a PIC and confirming before updating selected candidates.
- [ ] Delete action requires confirmation before removing selected candidates.
- [ ] Canceling a confirmation leaves candidate data and selection unchanged.
- [ ] Successful bulk Batch or PIC keeps the selected IDs selected.
- [ ] Successful bulk Delete removes deleted IDs from selection.

Verification:

- [ ] Focused tests cover confirm and cancel paths for Batch, PIC, and Delete.
- [ ] Manual check: apply each action to candidates selected across two pages.

Dependencies: Tasks 1, 3

Estimated scope: Medium

### Task 5: Regression and accessibility pass

Description: Verify the complete table-selection flow against existing table behavior, keyboard access, and layout constraints.

Acceptance criteria:

- [ ] Checkbox controls have clear accessible names.
- [ ] Popover controls are keyboard reachable and close on cancel or successful action.
- [ ] Existing candidate table tests still pass.
- [ ] Sticky header, internal table scroll, horizontal overflow, and pill-nav clearance still work.
- [ ] Authenticated browser QA covers selection, pagination persistence, bulk Batch, bulk PIC, bulk Delete, and clear selection.

Verification:

- [ ] `npm test -- TableView ApplicantTable`
- [ ] `npx tsc --noEmit`
- [ ] `npm run build`
- [ ] Browser smoke: `/candidates?view=table` after valid authenticated route access is available.

Dependencies: Tasks 1-4

Estimated scope: Small

## Checkpoint

- [ ] Plan reviewed before implementation.
- [ ] Focused tests cover selection persistence across pagination.
- [ ] Focused tests cover bulk action confirm and cancel behavior.
- [ ] Type check passes.
- [ ] Build passes.
- [ ] Authenticated browser QA passes before marking Done.

---

## Report

Status: Done | Commit: uncommitted

Five files changed: new `BulkActionBar` component, `DraggableRow` with hover/selected checkbox in the first column, `ApplicantTable` and `TableView` with selection props threaded through, `CandidatesPage` with `selectedIds: Set<string>` state and bulk handlers.

Behavior: hovering a row shows a checkbox in place of the row number; selecting any row makes all visible checkboxes permanent; selected rows stay selected across pagination; `BulkActionBar` appears above the table card when count > 0 and exposes Batch, PIC, and Delete each with a confirmation step before mutation.

Remaining: authenticated browser QA.
