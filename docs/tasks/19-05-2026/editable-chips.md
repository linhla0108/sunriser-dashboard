# Editable Chips
Tag: candidates/feature

## Goal
Make Round, Batch, and PIC fields editable directly in the table view through full-width chip controls.

## Scope
- Included: Round 1/2 chip select, Batch chip select, PIC chip select, portal dropdowns, data flow to parent views via onDataChange
- Excluded: backend persistence, new Batch/PIC management screens, reworking entire table layout

## Acceptance criteria
- Clicking a Round chip changes value to Passed/Failed/Waiting list or unset
- Clicking a Batch chip changes value to Batch 1/2/3
- Clicking a PIC chip changes value to configured PIC names or unset
- Chip edits flow to parent state, not just row-local display
- V2 filtered edits merge back without losing hidden filtered-out applicants
- No React "Cannot update while rendering" warning
- Chips render full width with truncated labels

---

## Report
Status: Done | Commit: d0bae68

Added reusable SelectChip in DraggableRow. Portal dropdowns with position:fixed avoid table overflow clipping. Fixed outside-click by adding menuRef. Fixed React setState-in-render warning by computing next state before calling setItems and onDataChange sequentially. Root table now uses local applicants state for inline edits.
