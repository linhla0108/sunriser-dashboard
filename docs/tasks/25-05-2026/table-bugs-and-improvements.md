# Table View Bugs & Improvements

Tag: candidates/fix+feature

## Goal

Fix three bugs and one UI redesign in the candidates table view:

1. Checkbox/index flicker on hover
2. Row status colors — richer palette + correct round2 fail override
3. Context menu — Pin becomes "Pin to compare"; Round status sections become submenus (plan only)
4. Bulk action bar — merge into filter bar row (no separate floating bar)

Note: the final compact filter-bar bulk UI was revised on 26 May 2026. See `docs/tasks/26-05-2026/compact-bulk-action-button.md`.

## Scope

- Included: DraggableRow, ApplicantTable, CandidateFiltersBar, BulkActionBar, candidates/page.tsx
- Excluded: GalleryView, PipelineView, any mobile layout beyond ensuring the merged bar still works

---

## Task 1 — Fix checkbox/index width flicker on hover

### Root cause

`DraggableRow.tsx` col-1 `<td>` has `w-8`. On hover, it hides the index text with
`group-hover:hidden` and shows a `<span className="hidden group-hover:flex justify-center">` containing
a `<Checkbox>`. The Checkbox renders at its own intrinsic size (shadcn default: `size-4` = 16px) but the
flex container with `justify-center` can expand slightly, causing a layout shift in the fixed-width column.

### Fix

Replace `display` toggling with `visibility` toggling so both the number and the checkbox always
occupy the same box. Use a relative container so they overlap:

```tsx
<div className="relative flex size-4 items-center justify-center mx-auto">
  <span className="absolute group-hover:invisible">{index + 1}</span>
  <span className="absolute invisible group-hover:visible flex items-center justify-center">
    <Checkbox checked={false} ... />
  </span>
</div>
```

This keeps the cell dimension constant — no reflow.

### Files

- `src/components/table/DraggableRow.tsx` lines 291–312 (col-1 td)

### Acceptance criteria

- Hover any table row → first column width does not change
- Checkbox appears cleanly where the number was
- In selection mode, checkbox is always visible at same size as hover state

---

## Task 2 — Row status colors + round2 fail override

### Color palette

Current: `bg-green-50/60` = `#f0fdf4` at 60% opacity — barely visible.

**New row background colors** (solid, no opacity, subtle left border accent):

| Status       | Row bg          | Left accent border              |
| ------------ | --------------- | ------------------------------- |
| Passed       | `bg-emerald-50` | `border-l-2 border-emerald-300` |
| Failed       | `bg-red-50`     | `border-l-2 border-red-300`     |
| Waiting list | `bg-amber-50`   | `border-l-2 border-amber-300`   |
| No status    | (none)          | (none)                          |

**Chip colors** (update CHIP_STYLES — current `bg-green-100` is fine but `bg-red-50` and `bg-amber-50` are too light):

| Status       | New chip style                                                   |
| ------------ | ---------------------------------------------------------------- |
| Passed       | keep `border-green-300 bg-green-100 text-green-900`              |
| Failed       | `border-red-300 bg-red-100 text-red-800` (was bg-red-50)         |
| Waiting list | `border-amber-300 bg-amber-100 text-amber-800` (was bg-amber-50) |

### Round2 fail override logic

Current logic (line 269 DraggableRow.tsx):

```ts
const rowBg = applicant.round1Result === "Passed" ? "bg-green-50/60" : ...
```

New logic — effective status considers round2:

```ts
function effectiveStatus(a: Applicant): string | undefined {
  if (a.round2Result) return a.round2Result // round2 is definitive if set
  return a.round1Result
}

const status = effectiveStatus(applicant)
const rowBg =
  status === "Passed"
    ? "bg-emerald-50 border-l-2 border-emerald-300"
    : status === "Failed"
      ? "bg-red-50 border-l-2 border-red-300"
      : status === "Waiting list"
        ? "bg-amber-50 border-l-2 border-amber-300"
        : ""
```

### Files

- `src/components/table/DraggableRow.tsx` — `CHIP_STYLES`, `rowBg` logic

### Acceptance criteria

- Row with round1=Passed, round2=null → green tint with left green border
- Row with round1=Passed, round2=Failed → red tint with left red border (override)
- Row with round1=Failed → red tint regardless of round2
- Row with no status → plain white, no border
- Chips for Failed and Waiting list are visually richer than before (100 shade, not 50)

---

## Task 3 — Context menu: Pin → Pin to compare

### Current state

- Context menu has "Pin to top" / "Unpin row" (DraggableRow.tsx lines 533–543)
- Calls `onTogglePin?.(applicant.id)` → local `pinnedIds` state in ApplicantTable
- Moves pinned rows to the top of the current sort
- Separately: `PinStarButton` (rendered as `pinAction` ReactNode in action column) uses `usePinned` hook for the compare toolbar

### Problem

Two competing pin systems. "Pin to top" is a local visual trick with no real utility. The compare toolbar (`PinnedToolbar`) via `usePinned` is the real feature.

### Plan

**Remove local pin-to-top:**

- `ApplicantTable.tsx`: delete `pinnedIds` state, `togglePin` function
- Remove `isPinned` and `onTogglePin` from `DraggableRow` props
- Remove `isPinned={...}` and `onTogglePin={...}` from `DraggableRow` in ApplicantTable render

**Wire context menu to usePinned:**

- In `DraggableRow.tsx`: call `usePinned()` hook directly (it's already available via `@/lib/pin/usePinned`)
- Replace "Pin to top" button with "Pin to compare" / "Unpin"
- Icon: keep `Pin` / `PinOff` lucide icons

Context menu button:

```tsx
const { has, add, remove } = usePinned()
const isPinned = has(applicant.id)
...
<button onClick={() => { isPinned ? remove(applicant.id) : add(applicant.id); closeAll() }}>
  {isPinned ? <PinOff /> : <Pin />} {isPinned ? "Unpin" : "Pin to compare"}
</button>
```

**No changes needed to:**

- `TableView.tsx` — still renders `PinStarButton` as `renderPinAction` (star icon in actions column)
- `PinStarButton.tsx` — unchanged
- `PinnedToolbar.tsx` — unchanged

### Files

- `src/components/table/DraggableRow.tsx` — remove isPinned/onTogglePin props, add usePinned hook
- `src/components/table/ApplicantTable.tsx` — remove pinnedIds state, togglePin, props

### Acceptance criteria

- Right-clicking a row → context menu shows "Pin to compare" (or "Unpin" if already pinned)
- Clicking "Pin to compare" → candidate appears in PinnedToolbar at top of page
- Clicking star button in action column → same PinnedToolbar behavior (unchanged)
- Both star and context menu reflect same pinned state (same usePinned store)
- "Pin to top" row-sorting behavior is removed (rows no longer jump to top on pin)
- `isPinned` and `onTogglePin` props removed from DraggableRowProps interface

---

## Task 4 — Round status submenus in context menu [PLAN ONLY]

### Problem

Context menu currently has 6 flat inline buttons for Round 1 + Round 2 status changes (lines 458–529).
This makes the menu very tall and mixes status-setting with other actions at the same visual level.

### Proposed design

Replace flat list with two submenu triggers that expand on hover/click:

```
┌─────────────────────────────┐
│ Nguyễn Văn A                │
├─────────────────────────────┤
│ 👁 View detail              │
│ ⎘ Copy            ▶         │
│ 👤 Assign PIC     ▶         │
├─────────────────────────────┤
│ 🔵 Set Round 1 status ▶     │  ← new submenu trigger
│    ✓ Mark as Passed         │     (expands to flyout)
│    ✗ Mark as Failed         │
│    ⏳ Waiting list           │
│ 🔵 Set Round 2 status ▶     │  ← new submenu trigger
│    ✓ Mark as Passed         │
│    ✗ Mark as Failed         │
│    ⏳ Waiting list           │
├─────────────────────────────┤
│ 📌 Pin to compare           │
│ ⬇ Export row as CSV         │
└─────────────────────────────┘
```

### SubMenu type change

```ts
type SubMenu = "copy" | "pic" | "round1" | "round2" | null
```

Two new `useRef` for the submenu trigger buttons:

- `round1BtnRef`
- `round2BtnRef`

### Flow confirmation needed

Before implementing, confirm with user:

- Should clicking the submenu trigger toggle it (current behavior for copy/pic), or should it open on hover?
- What icon to use for "Set Round 1/2 status" (currently using CheckCircle2 / XCircle / Clock inline)?
- Should the current disabled-if-already-set behavior carry over to the submenu?

### Files (when implementing)

- `src/components/table/DraggableRow.tsx` — SubMenu type, two new btnRefs, two flyout panels

**STATUS: PLAN ONLY — do not implement until user confirms UX flow**

---

## Task 5 — Merge Bulk Action Bar into Filter Bar

Superseded UI note: this task removed the separate floating card. A later 26 May update keeps the normal filters visible and exposes bulk actions through one `{N} selected` popover button instead of showing separate count, action, and clear controls.

### Problem

`BulkActionBar` (when rows are selected) renders as a separate card between filters and the table.
This creates visual clutter and empty space in the filter row when selection is active.

### Current design

When `selectedIds.size > 0`, the normal filter controls remain visible.
The right side of `CandidateFiltersBar` shows one orange `{N} selected` popover button.
The popover contains `Set Batch`, `Assign PIC`, `Clear selection`, and `Delete selected`.

This replaced the earlier separate count, action, and clear controls.

### Changes

- `BulkActionBar.tsx` — delete file (content merged into CandidateFiltersBar or inlined)
- `CandidateFiltersBar.tsx` — add selectedCount + bulk action props; keep filters visible and render one compact bulk trigger when selected > 0
- `candidates/page.tsx` — remove `<BulkActionBar>` render, pass bulk props to `<CandidateFiltersBar>`

### Acceptance criteria

- No separate floating BulkActionBar card below filters
- When ≥1 row selected → filter bar keeps filters and shows one "{N} selected" popover button
- When 0 rows selected → normal filter controls render
- All bulk action functionality (Set Batch, Assign PIC, Clear selection, Delete) works identically
- No empty whitespace gap between filters and table

---

## Dependency order

```
Task 1 (checkbox flick)        → no deps, implement first (1 file, 20 lines)
Task 2 (row colors)            → no deps, can parallel with T1
Task 3 (pin → compare)         → no deps, implement after T1/T2
Task 5 (bulk bar merge)        → no deps, implement after T3
Task 4 (round submenus)        → BLOCKED on user confirmation of flow
```

## Report

Status: Done — Commit: 8b22beb

All 4 table tasks shipped in one commit. Checkbox uses visibility toggle — no layout shift confirmed by e2e test. Row colors use emerald/red/amber-50 backgrounds with left border accents. Context menu "Pin to compare" wires directly to `usePinned` hook; local pin-to-top state removed from `ApplicantTable`. Bulk action bar merged into `CandidateFiltersBar`, removing the separate floating card. Later compact UI revision: filters stay visible and bulk actions live behind one `{N} selected` popover button.

Task 4 (Round status submenus) remains plan-only pending user UX confirmation.
