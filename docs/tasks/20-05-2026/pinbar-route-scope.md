# Pinbar Route Scope

Tag: candidates/fix

## Goal

Show the pinned candidates toolbar only on `/candidates` and remove the sticky tab mode.

## Scope

- Included: route-gate `PinnedToolbar` to `/candidates`, keep pinned items persisted while navigating away, remove sticky tab toggle/state/UI, update focused tests.
- Excluded: clearing pinned state on route change, moving `PinnedToolbar` into `CandidatesPage`, changing compare dialog behavior, changing pin buttons in table/pipeline/gallery cards.

## Plan

- Keep `PinnedToolbar` owned by `WorkspaceShell` so the toolbar remains a workspace-level overlay.
- Use `usePathname()` in `WorkspaceShell` and render `PinnedToolbar` only when `pathname === "/candidates"`.
- Simplify `PinnedToolbar` to one presentation: the existing full-width sticky bar.
- Preserve `usePinned` storage/event behavior so pinned candidates survive navigation and refresh.
- Update tests to cover route visibility and absence of sticky tab controls.

## Acceptance criteria

- Pinbar renders on `/candidates` when there are pinned candidates.
- Pinbar does not render on `/dashboard`, `/settings`, `/hr`, or `/compare`.
- Sticky tab controls are removed; no "Use sticky tab" or "Use sticky bar" action remains.
- Existing pinbar actions still work: reorder, drag-to-delete, compare, clear, remove chip.
- Pinned IDs remain in `v2.pinned` while navigating away from `/candidates`.

---

## Report

Status: Done | Commit: uncommitted

Implemented route gating in `WorkspaceShell` with `usePathname()`. Removed sticky tab mode from `PinnedToolbar`, including the `PinBarMode` state, mode toggle button, tab-specific classes, and unused tab icons. Updated `PinnedToolbar` tests to assert the sticky tab controls are gone while reorder/delete behavior remains covered. Updated `WorkspaceShell` tests to assert the toolbar appears only on `/candidates`.

During verification, full lint was blocked by a pre-existing `react-hooks/set-state-in-effect` error in `usePagination`. Fixed that hook without changing its public return shape: it still resets to page 1 when `totalItems` or `pageSize` changes, but avoids synchronous state updates inside an effect.

## Verification

- `npm test -- src/lib/candidates/__tests__/usePagination.test.ts src/components/pin/__tests__/PinnedToolbar.test.tsx src/components/layout/__tests__/WorkspaceShell.shortcuts.test.tsx` — passed, 15 tests.
- `npx tsc --noEmit` — passed.
- `npm run lint` — passed with 2 existing warnings:
  - `src/components/layout/Sidebar.tsx`: `<img>` warning from Next.js lint.
  - `src/components/table/__tests__/ApplicantTable.sort.test.tsx`: unused `rowOrder` warning.
