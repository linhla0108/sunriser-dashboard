# DnD Fix + Pipeline Kanban
Tag: candidates/fix

## Goal
Fix table drag-and-drop ordering and add cross-column Kanban drag to Pipeline view.

## Scope
- Included: fix filtered drag splice, add cross-column drag with overlay, full code review of candidates page, fix all review issues
- Excluded: pre-existing lint errors in ApplicantDetailDrawer, LLM integration, file data injection

## Acceptance criteria
- Table drag reorder persists correctly with active filters
- Pipeline view supports cross-column drag with "Change to [label]" overlay
- No self-loop dispatch in useViewState
- Keyboard shortcuts don't fire inside text inputs

---

## Report
Status: Done | Commit: d0bae68

Fixed filtered drag splice using prev.map. Added cross-column Kanban with custom collision detection (rectIntersection for columns, closestCenter for items) and "Change to [label]" overlay. Fixed useViewState self-loop with isDispatchingRef guard. Added keyboard shortcut guard in ViewPillNav for input/textarea.

Remaining: 19 pre-existing lint errors in ApplicantDetailDrawer — not in scope.
