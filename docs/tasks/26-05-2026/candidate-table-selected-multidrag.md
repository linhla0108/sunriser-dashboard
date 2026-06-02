# Candidate Table Selected Multi-Drag

Tag: candidates/feature

## Goal

Allow selected rows to move together as one block without disrupting unselected row drag behavior.

## Scope

- Included: selected-block reorder helper, selected-section drag constraint, multi-selection drag overlay.
- Excluded: selected-section animation, context menu actions, backend persistence.

## Acceptance criteria

- Dragging one selected row drags the selected group.
- Selected multi-drag is constrained to the selected section.
- Unselected single-row drag remains unchanged.
- Drag overlay communicates the selected count with a compact preview.

---

## Report

Status: Done | Commit: current commit

Selected-row drag is constrained to the selected section, and the overlay communicates multi-selection with a compact count preview. Unit test mocks include `DragOverlay` so Vitest does not leave dnd-kit overlay behavior unresolved.
