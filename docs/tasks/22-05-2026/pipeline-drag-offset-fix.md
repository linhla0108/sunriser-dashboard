# Pipeline Drag Offset Fix
Tag: candidates/fix

## Goal
Fix DragOverlay appearing far from the mouse cursor when dragging cards in PipelineView.

## Scope
- Included: `PipelineCard` in `PipelineView.tsx` — correct the activator node reference
- Excluded: drag behavior in `ApplicantTable` (different setup, unaffected)

## Acceptance criteria
- DragOverlay follows the cursor tightly from the grip handle
- No TypeScript errors

---

## Report
Status: Done | Commit: —

Two separate issues — both required to fully fix the bug.

**Issue 1 — wrong activator node (`PipelineView.tsx`):**
`setNodeRef` was on the `<article>` (full card), but `listeners` were only on the grip button. dnd-kit measured offset from the card's top-left corner, not the actual grab point. Fix: pass `setActivatorNodeRef` from `useSortable` as `ref` to the grip button.

**Issue 2 — CSS animation fill-mode retaining identity transform (root cause of "far offset"):**
The three workspace entry animations (`workspaceSidebarIn`, `workspaceTopbarIn`, `workspaceContentIn`) used `fill-mode: both` (`both` = `backwards` + `forwards`). After each animation completed, the browser retained `transform: matrix(1, 0, 0, 1, 0, 0)` (identity matrix) on the wrapper divs via the `forwards` fill. Even though identity matrix has no visual effect, any CSS `transform` on an ancestor turns that element into a **containing block** for `position: fixed` — which is how `DragOverlay` is positioned. Result: DragOverlay coordinates were relative to the animated div, not the viewport.

Confirmed via Chrome DevTools JS scan: all three divs showed `transform: matrix(1, 0, 0, 1, 0, 0)` after page load.

Fix: changed `both` → `backwards` in `WorkspaceShell.tsx`. `backwards` only applies the `from` keyframe during the delay period (correct UX), but does NOT retain final state — so no transform remains after animation ends.

After fix: JS scan returns `[]` — zero transforms on any element at rest.
