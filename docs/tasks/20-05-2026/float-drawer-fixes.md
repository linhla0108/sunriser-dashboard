# Float Drawer Fixes
Tag: ui/fix

## Goal
Fix three UX issues with the floating Chat and Notes drawers: chat input must always be visible at the bottom, both panels must be freely draggable in float mode, and clicking a partially-covered panel must bring it to the front.

## Scope
- Included: `DrawerShell`, `AiDrawer`, `DrawerRegistry` (float position + z-index state)
- Excluded: dock mode behaviour, resize handle, keyboard shortcuts, mobile layout

## Acceptance criteria
- [ ] Chat input row is always visible at the bottom of the chat panel, even when many messages exist
- [ ] In float mode, dragging the grip handle moves the panel freely anywhere on screen (both Chat and Notes)
- [ ] In float mode, clicking anywhere on a panel that is behind the other raises it to the top (higher z-index)
- [ ] Panels open to sensible staggered default positions (not stacked exactly on top of each other)
- [ ] Dock mode is unaffected

---

## Implementation plan

### Task 1 — Fix chat input sticky to bottom (S)

**Root cause:** `DrawerShell` line 137 wraps children in `overflow-auto`. `AiDrawer` uses `min-h-[420px]` on its content div. When content overflows the panel height, the whole children area scrolls — the input scrolls off-screen instead of staying anchored.

**Fix:**
1. In `DrawerShell`, change the children wrapper from `overflow-auto` to `overflow-hidden flex flex-col`:
   ```tsx
   <div className="min-h-0 flex-1 overflow-hidden flex flex-col p-4">{children}</div>
   ```
2. In `AiDrawer`, remove `min-h-[420px]` from the outer div — the flex layout handles sizing. The messages area already has `flex-1 overflow-auto` which will scroll correctly once the parent is `overflow-hidden`.

**Verify:** Open chat, send several messages until the list is long → input stays pinned at bottom.

---

### Task 2 — Free drag in float mode (M)

**Root cause:** `DrawerShell.startHeaderDrag` returns early if `!docked`. Float panels have static CSS classes (`inset-x-3 bottom-24`) with no position state.

**Fix:**
1. Add `floatPos: Record<V2DrawerId, { x: number; y: number } | null>` to `DrawerRegistry`. Default `null` (fall back to CSS-default position). Store as `usePersistedState` with a zod schema.
2. Add `setFloatPos(id, pos)` to the registry value.
3. In `DrawerShell`, when `!docked`:
   - If `floatPos[id]` is set, override the fixed-position CSS classes with inline `style={{ left: pos.x, top: pos.y }}`.
   - On grip `pointerDown`: capture pointer, store start clientX/Y and current pos.
   - On `pointerMove` (while captured): call `registry.setFloatPos(id, { x: ..., y: ... })`.
   - On `pointerUp` / `pointerCancel`: release capture.
4. Default staggered positions: chat at `{ x: window.innerWidth - 420, y: 80 }`, notes at `{ x: window.innerWidth - 440, y: 120 }` — set on first open if `floatPos[id]` is null.
5. Clamp position to keep panel within viewport (min 0, max viewport minus panel width/height).

**Files:**
- `src/lib/drawer/DrawerRegistry.tsx`
- `src/components/common/DrawerShell.tsx`

**Verify:** Float both panels → drag each one to a corner → reload page → positions restored.

---

### Task 3 — Z-index on overlap click (S)

**Root cause:** Both floating panels have hard-coded `z-50`. When one overlaps the other, the one rendered later in the DOM wins — clicking the one below does nothing to reorder them.

**Fix:**
1. Add `activeFloatId: V2DrawerId | null` and `setActiveFloat(id)` to `DrawerRegistry`.
2. In `DrawerShell`, on the root `<aside>` add `onPointerDown={() => !docked && registry.setActiveFloat(id)}`.
3. Compute z-index: active float = `z-50`, inactive float = `z-40`. Apply via `cn()` conditional.

**Files:**
- `src/lib/drawer/DrawerRegistry.tsx`
- `src/components/common/DrawerShell.tsx`

**Verify:** Open both in float mode → overlap them → click the panel underneath → it comes to front.

---

### Checkpoint
- [ ] TypeScript: `npx tsc --noEmit` passes
- [ ] Lint: `npm run lint` passes
- [ ] Manual: all three acceptance criteria verified in browser

---

## Report
Status: Done | Commits: 55cfe1a, 129f991, fbf0aa6

Task 1: DrawerShell content wrapper changed to `overflow-hidden flex flex-col`; AiDrawer drops `min-h-[420px]`; NotesDrawer adds `overflow-auto` so notes scroll internally.
Task 3: `activeFloatId` (non-persisted) added to registry; `onPointerDown` on float aside calls `setActiveFloat`; active gets `z-50`, inactive `z-40`.
Task 2: `floatPos` (persisted per drawer) added to registry. Grip button in float mode uses pointer-capture drag; position clamped to viewport; CSS defaults apply when pos is null (first open).
