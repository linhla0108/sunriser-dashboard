# Pipeline & Pinbar Drag Offset Fix
Tag: candidates/fix

## Goal
Fix DragOverlay appearing far from the mouse cursor when dragging cards in PipelineView and chips in PinnedToolbar.

## Scope
- Included: `PipelineCard` in `PipelineView.tsx`, `PinnedChip` in `PinnedToolbar.tsx`
- Excluded: drag behavior in `ApplicantTable` (different setup, unaffected)

## Acceptance criteria
- DragOverlay follows the cursor tightly from the grip handle in both PipelineView and PinnedToolbar
- No TypeScript errors

---

## Report
Status: Done | Commit: —

Three separate issues — all three required to fully fix the bug.

**Issue 1 — wrong activator node (`PipelineView.tsx`):**
`setNodeRef` was on the `<article>` (full card), but `listeners` were only on the grip button. dnd-kit measured offset from the card's top-left corner, not the actual grab point. Fix: pass `setActivatorNodeRef` from `useSortable` as `ref` to the grip button.

**Issue 2 — CSS animation fill-mode retaining identity transform:**
The three workspace entry animations (`workspaceSidebarIn`, `workspaceTopbarIn`, `workspaceContentIn`) used `fill-mode: both` (`both` = `backwards` + `forwards`). After each animation completed, the browser retained `transform: matrix(1, 0, 0, 1, 0, 0)` (identity matrix) on the wrapper divs via the `forwards` fill. Even though the identity matrix has no visual effect, any CSS `transform` on an ancestor turns that element into a **containing block** for `position: fixed`. Result: DragOverlay coordinates were relative to the animated div, not the viewport.

Fix: changed `both` → `backwards` in `WorkspaceShell.tsx`. After fix: JS scan returns `[]` — zero transforms on any element at rest.

**Issue 3 — `backdrop-filter` on PinnedToolbar creating a containing block (root cause of pinbar offset):**
dnd-kit's `DragOverlay` in v6 renders **in-place in the React tree** with `position: fixed` — it does NOT portal to `document.body` by default (verified in `core.esm.js` line 3631). The PinnedToolbar's outer div has `backdrop-blur-xl` = `backdrop-filter: blur(24px)`. In Chrome, `backdrop-filter` (non-none) creates a containing block for `position: fixed` descendants — the same mechanism as `transform`. So the DragOverlay's viewport coordinates (`top: 83px, left: 252px`) were interpreted relative to the toolbar div (top: 75px from viewport), not the viewport itself — causing the visible offset.

Confirmed via DevTools JS scan: `backdropFilter: "blur(24px)"` on the PinnedToolbar sticky wrapper. Same issue exists structurally in PipelineView (any future backdrop-filter ancestor would break it too).

Fix: wrap `DragOverlay` with `createPortal(content, document.body)` in both `PinnedToolbar.tsx` and `PipelineView.tsx`. React portals preserve context (so `useDndContext()` inside DragOverlay still works), but move the DOM node to `document.body` — which has no backdrop-filter, transform, or any other containing-block creator. DragOverlay `position: fixed` is now correctly relative to the viewport.
