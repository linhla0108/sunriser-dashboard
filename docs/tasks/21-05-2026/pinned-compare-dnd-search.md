# Pinned Compare DnD and Search

Tag: candidates/feature

## Goal

Pinned candidates can be reordered without drag-to-delete, and the compare dialog can reorder, sort, search, and highlight pinned candidate data.

## Scope

- Included: remove the pinned toolbar drag-to-delete zone while keeping chip remove buttons and Clear.
- Included: keep pinned toolbar drag-and-drop only for reordering pinned candidates.
- Included: add drag-and-drop reordering inside the compare dialog using the same pinned order.
- Included: add compare-dialog sort control for pinned candidate order.
- Included: add compare-dialog text search across compare data, with matching text highlighted like candidate table search.
- Excluded: changing how candidates are pinned from the table, pipeline, gallery, or report flows.
- Excluded: adding URL state for compare-dialog search/sort unless a later task explicitly asks for shareable compare modal state.
- Excluded: replacing the existing compare table visual style.

## Acceptance criteria

- Dragging a pinned chip over another pinned chip reorders the pinned list.
- Dragging a pinned chip outside the list never removes it.
- The toolbar no longer renders the full-screen delete drop zone or "Drop here to delete" UI.
- Chip removal still works through the existing X button.
- Clear still removes all pinned candidates after confirmation.
- Compare dialog candidate columns can be reordered by drag-and-drop.
- Compare dialog reorder updates the shared pinned order so toolbar and dialog stay in sync.
- Compare dialog includes a sort select with supported fields: pinned order, name, position, university, GPA, batch, PIC, Round 1, and Round 2.
- Choosing a sort option updates the compare column order without mutating candidate data.
- Compare dialog includes a search input that filters or focuses compare rows/cells by text match.
- Search matches are highlighted with the existing SearchHighlight behavior, including literal handling for terms like `C++`.
- Empty search shows the full compare data without highlight.
- Sort and search controls have accessible labels and usable keyboard focus states.
- Existing table-view search highlighting remains unchanged.

## Implementation slices

### Slice 1: Toolbar reorder-only cleanup

Remove the custom delete-zone collision path from the pinned toolbar. Keep the dnd-kit sortable chip list, drag overlay, X remove button, and Clear action.

Verification:

- `npm test -- src/components/pin/__tests__/PinnedToolbar.test.tsx`
- Manual check: drag a pinned chip across the toolbar and outside the toolbar; only chip-to-chip drops reorder.

### Slice 2: Compare dialog ordering foundation

Move compare dialog order changes through `usePinned().reorder`, so the dialog and toolbar share one source of truth.

Verification:

- Add focused tests for compare dialog order and shared pinned order.
- Manual check: reorder in compare dialog, close dialog, toolbar reflects the same order.

### Slice 3: Compare dialog sort control

Add a compact select control above the compare table. Sorting applies to the displayed compare order and can write that order back through `reorder` when the user chooses a field.

Verification:

- Focused tests cover each sortable value family: text, number, and optional fields.
- Manual check: choose GPA, name, batch, and PIC sorts; missing optional values stay at the bottom.

### Slice 4: Compare dialog search and highlight

Add a search input for compare data and wrap visible compare text with `SearchHighlight`. Keep row labels, candidate names, metadata, and field values searchable.

Verification:

- `npm test -- src/components/candidates/__tests__/SearchHighlight.test.tsx`
- Focused compare tests cover case-insensitive matching and literal special characters.
- Manual check: search by candidate name, university, position, batch, and `C++`-style text if present.

### Checkpoint: Complete

- `npm test -- src/components/pin/__tests__/PinnedToolbar.test.tsx`
- `npm test -- src/components/candidates/__tests__/SearchHighlight.test.tsx`
- New compare-dialog focused tests pass.
- `npm run lint`
- Browser smoke on `/candidates`: pin at least three candidates, reorder toolbar chips, open compare, reorder columns, sort, search, and verify highlights.

---

## Report

Status: Done | Commit: uncommitted

Implemented reorder-only pinned chips and removed the drag-to-delete zone. Pinned chips now expose the dnd-kit sortable listeners so chip-to-chip drag can reorder the pinned list.

Implemented compare dialog controls. Pinned candidates can be reordered inside the compare table, sort can reorder candidates by pinned order, name, position, university, GPA, batch, PIC, Round 1, or Round 2, and search filters/highlights compare rows using the existing SearchHighlight behavior.

Verification:

- Passed: `npm test -- src/components/pin/__tests__/PinnedToolbar.test.tsx`
- Passed: `npm test -- src/components/pin/__tests__/ComparePage.test.tsx`
- Passed: `npm test -- src/components/candidates/__tests__/SearchHighlight.test.tsx`
- Passed: `npx tsc --noEmit`
- Passed: `npm run lint` with two pre-existing warnings outside this task.
- Passed: `npm run build`
- Blocked: browser interactive smoke on `/candidates`. The route redirects to `/login?from=%2Fcandidates`, and Browser MCP is locked by another Chromium instance.

Remaining: run the manual candidate flow after a valid dev session is available.
