# Implementation Plan: Table Pagination

## Overview

Add page-by-page navigation to the candidates table view. Pagination state lives in `CandidatesPage` and flows down — sliced data to `TableView`, display info to `ApplicantTable`'s bottom bar, and nav callbacks to `ViewPillNav`'s new right-side controls.

## Architecture Decisions

- **Pagination state hoisted to `CandidatesPage`** (not inside `ApplicantTable`) so both the table bottom bar and `ViewPillNav` can read from the same source without a global store.
- **`ViewPillNav` accepts optional `pagination` prop** — when undefined (non-table views), no extra UI renders; when provided, shows separator + prev/next buttons on the right.
- **Row index offset** — `ApplicantTable` receives `indexOffset` prop so the `#` column shows global row numbers (16, 17… on page 2), not per-page indices.
- **Default page size: 15** — hardcoded constant, no UI to change it (out of scope).
- **Filter resets page** — `usePagination` exposes a `reset()` and the hook auto-resets when `totalItems` changes.

---

## Dependency graph

```
src/lib/candidates/usePagination.ts        (new — no deps)
        │
        ├── src/app/(workspace)/candidates/page.tsx  (wire hook, slice data, pass props)
        │       │
        │       ├── src/components/views/TableView.tsx  (pass indexOffset + paginationInfo)
        │       │       │
        │       │       └── src/components/table/ApplicantTable.tsx  (bottom bar display)
        │       │
        │       └── src/components/layout/ViewPillNav.tsx  (prev/next buttons)
```

---

## Task List

### Phase 1: Hook

- [ ] **Task 1** — `usePagination` hook

**Description:** New hook in `src/lib/candidates/usePagination.ts`. Takes `totalItems: number` and optional `pageSize = 15`. Returns `{ currentPage, totalPages, startIndex, endIndex, canGoPrev, canGoNext, goPrev, goNext }`. Resets `currentPage` to 1 in a `useEffect` whenever `totalItems` changes.

**Acceptance criteria:**

- [ ] Given 646 items and pageSize 15, `totalPages` === 43
- [ ] `startIndex` / `endIndex` are correct for page 1 (0–14) and last page
- [ ] Changing `totalItems` (filter) resets `currentPage` to 1

**Files touched:** `src/lib/candidates/usePagination.ts` (new)
**Scope:** XS

---

### Checkpoint A

- [ ] Hook unit-testable in isolation, no React tree needed for logic

---

### Phase 2: Wire to CandidatesPage + slice data

- [ ] **Task 2** — Connect pagination to `CandidatesPage` and slice filtered data

**Description:** In `CandidatesPage`, call `usePagination(filtered.length)`. Slice `filtered` with `startIndex`/`endIndex` to produce `pagedData`. Pass `pagedData` to `TableView` instead of `filtered`. Pass `indexOffset={startIndex}` and `paginationInfo` object to `TableView`. Pass pagination callbacks to `ViewPillNav`.

**Acceptance criteria:**

- [ ] Table renders exactly `pageSize` rows (or fewer on last page)
- [ ] Navigating to page 2 shows rows 16–30 with correct `#` index

**Files touched:**

- `src/app/(workspace)/candidates/page.tsx`
- `src/components/views/TableView.tsx` (thread `indexOffset` + `paginationInfo` props)

**Scope:** S
**Depends on:** Task 1

---

### Phase 3: Bottom bar in ApplicantTable

- [ ] **Task 3** — Bottom bar display below the table card

**Description:** Add optional props to `ApplicantTable`: `paginationInfo?: { start: number; end: number; total: number; currentPage: number; totalPages: number }` and `indexOffset?: number`. When `paginationInfo` is provided, render a bottom bar below (outside) the card with:

- Left: "**16–30** of **646**" (bold numbers, muted label text)
- Right: "Page **2** / **43**"

The `#` column uses `indexOffset + i + 1` instead of `i + 1`.

**Acceptance criteria:**

- [ ] Bottom bar visible only when `paginationInfo` prop is provided
- [ ] Row index matches global position (not per-page)
- [ ] Bottom bar is `text-xs text-muted-foreground` matching table typography

**Files touched:** `src/components/table/ApplicantTable.tsx`
**Scope:** S
**Depends on:** Task 2

---

### Checkpoint B

- [ ] Table paginates correctly, bottom bar shows correct numbers
- [ ] Filter change resets to page 1 — verify manually

---

### Phase 4: Prev/Next in ViewPillNav

- [ ] **Task 4** — Add prev/next pagination buttons to the right of ViewPillNav

**Description:** Add optional prop `pagination?: { canGoPrev: boolean; canGoNext: boolean; goPrev: () => void; goNext: () => void }` to `ViewPillNav`. When provided and the current view is `"table"`, render after the existing view buttons:

- A vertical divider (`w-px h-5 bg-border`)
- `ChevronLeft` icon button — disabled when `!canGoPrev`
- `ChevronRight` icon button — disabled when `!canGoNext`

Both buttons use the same `size-10 rounded-full` style as existing view buttons.

**Acceptance criteria:**

- [ ] Buttons appear only in table view
- [ ] Left button is disabled on page 1; right button disabled on last page
- [ ] Clicking navigates pages; bottom bar updates
- [ ] No visual change on pipeline/chart/gallery views

**Files touched:** `src/components/layout/ViewPillNav.tsx`
**Scope:** S
**Depends on:** Tasks 2, 3

---

### Checkpoint C (final)

- [ ] Full flow: filter → reset to page 1 → navigate pages → row indices correct → pill buttons disabled correctly
- [ ] TypeScript `npx tsc --noEmit` — no errors
- [ ] `npm run lint` — clean
- [ ] No regressions: sort, pin, drag-to-reorder still work

---

## Risks and Mitigations

| Risk                            | Impact | Mitigation                                                                                                        |
| ------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------- |
| Drag-to-reorder across pages    | Medium | Out of scope — drag only reorders within current page; `handleDragEnd` already only operates on the `items` slice |
| Filter + pagination interaction | Medium | `usePagination` auto-resets on `totalItems` change                                                                |
| Row `#` mismatch                | Low    | Thread `indexOffset` through `TableView` → `ApplicantTable` → `DraggableRow`                                      |
