# Pipeline View — UI & UX Improvements

Tag: candidates/fix+feature

## Goal

Fix 5 UX issues in the pipeline (Kanban) view: column colors, card hover, card content, drag-drop position, and group-by control.

## Scope

- Included: `PipelineView.tsx`, `viewUtils.ts`
- Excluded: ChartView, table view, mobile layout changes beyond responsive maintenance

---

## Task P1 — Column colors + sticky header

### Current state

`getColumnTheme` returns `colBg: "bg-emerald-50/30"` etc. — 30% opacity makes columns nearly invisible.
Column header is a plain `<div>` with `text-sm font-semibold`, no background, no border, no sticky.

### Changes

**`viewUtils.ts` — expand `getColumnTheme` return type with new tokens:**

```ts
type ColumnTheme = {
  colBg: string // column body fill
  colBorder: string // column border
  headerBg: string // header (darker than body)
  headerText: string // header label color
  countBadge: string // item-count pill
  overlayBg: string // drag-over overlay
  overlayBorder: string
  badgeBg: string
  icon: string
}
```

| Key        | pass                              | fail                        | waiting                       | not-reviewed                             | generic                      |
| ---------- | --------------------------------- | --------------------------- | ----------------------------- | ---------------------------------------- | ---------------------------- |
| colBg      | `bg-emerald-50`                   | `bg-rose-50`                | `bg-amber-50`                 | `bg-foreground/[0.03]`                   | `bg-foreground/[0.03]`       |
| colBorder  | `border-emerald-200`              | `border-rose-200`           | `border-amber-200`            | `border-foreground/10`                   | `border-primary/20`          |
| headerBg   | `bg-emerald-100`                  | `bg-rose-100`               | `bg-amber-100`                | `bg-foreground/[0.06]`                   | `bg-primary/[0.06]`          |
| headerText | `text-emerald-900 font-bold`      | `text-rose-900 font-bold`   | `text-amber-900 font-bold`    | `text-foreground font-bold`              | `text-primary font-bold`     |
| countBadge | `bg-emerald-200 text-emerald-800` | `bg-rose-200 text-rose-800` | `bg-amber-200 text-amber-800` | `bg-foreground/10 text-muted-foreground` | `bg-primary/10 text-primary` |

**`PipelineColumn` — new structure with sticky header + scrollable body:**

```tsx
<div className={`flex w-[280px] shrink-0 flex-col overflow-hidden rounded-2xl border ${theme.colBorder}`}>
  {/* sticky header */}
  <div className={`sticky top-0 z-10 flex items-center justify-between border-b px-3 py-2 ${theme.headerBg} ${theme.colBorder}`}>
    <span className={`text-sm ${theme.headerText}`}>{column.label}</span>
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${theme.countBadge}`}>
      {column.items.length}
    </span>
  </div>
  {/* scrollable items area */}
  <div className={`flex-1 overflow-y-auto p-1.5 ${theme.colBg}`} style={{ maxHeight: "calc(100dvh - 280px)" }}>
    <SortableContext ...>
      <div ref={setNodeRef} className="flex flex-col gap-2">
        {/* items */}
      </div>
    </SortableContext>
  </div>
</div>
```

The outer container (`flex min-h-[520px] gap-3 overflow-x-auto pb-4`) stays unchanged — columns become independently scrollable.

### Acceptance criteria

- Column bodies have clearly visible tinted backgrounds (solid, not /30 opacity)
- Column borders match body color but darker
- Column header has darker background + bold label + count badge
- Header stays fixed at the top when the column's item list scrolls
- At least 3 columns visible simultaneously on desktop without horizontal overflow

---

## Task P2 — Card hover state: primary orange border

### Current state

`hover:shadow-[0_12px_32px_rgba(15,23,42,0.12)]` only — shadow change is too subtle.

### Fix

Add `hover:border-primary/60` to the card:

```tsx
className={`border-foreground/10 bg-card/80 cursor-pointer rounded-2xl border p-3 shadow-[...] transition-all
  ${isDragging ? "ring-primary/30 opacity-40 ring-2" : "hover:border-primary/60 hover:shadow-[0_12px_32px_rgba(15,23,42,0.12)]"}`}
```

### Acceptance criteria

- Hovering any pipeline card shows a visible orange border (`#FF5533` at 60% opacity)
- Non-hovered cards retain the subtle `border-foreground/10` border
- Dragging card has ring, not hover border (no conflict)

---

## Task P3 — Remove round-status chip; show PIC chip instead

### Current state

`PipelineCard` renders a `badge` showing `round1Result` / `round2Result` + GPA.
When `groupBy === "round1"`, showing the round1 result in the card is redundant — the column already tells you the status.

### Changes

Remove `roundBadge()` call and the `badge` render. Add PIC chip + GPA in footer.

**PIC color map** (add to `viewUtils.ts`):

```ts
export const PIC_CHIP_STYLE: Record<string, string> = {
  Quỳnh: "bg-rose-50 border-rose-200 text-rose-700",
  Nhiên: "bg-teal-50 border-teal-200 text-teal-700",
  Yến: "bg-indigo-50 border-indigo-200 text-indigo-700",
  Minh: "bg-lime-50 border-lime-200 text-lime-700",
  Huy: "bg-cyan-50 border-cyan-200 text-cyan-700",
  Linh: "bg-fuchsia-50 border-fuchsia-200 text-fuchsia-700",
}
```

**New card footer** (replaces both badge+gpa divs):

```tsx
<div className="mt-3 flex items-center justify-between gap-2">
  {applicant.pic ? (
    <span
      className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${PIC_CHIP_STYLE[applicant.pic] ?? "bg-muted border-border text-muted-foreground"}`}
    >
      {applicant.pic}
    </span>
  ) : (
    <span className="text-muted-foreground/60 text-xs">No PIC</span>
  )}
  <span className="text-muted-foreground text-xs font-semibold">GPA {applicant.gpa.toFixed(1)}</span>
</div>
```

Same footer on `PipelineCardOverlay` (drag ghost).

### Acceptance criteria

- Round status badges no longer appear on cards
- Each card shows a colored PIC chip (distinct color per staff member) and GPA
- Cards with no PIC show a muted "No PIC" label
- PIC chip colors match the `DraggableRow` chip style (same color map)

---

## Task P4 — Drag-drop: always drop to top of target column + scroll

### Current state

When dragging to a column zone (`isColumnDrop === true`), the item keeps its position in the flat `data` array. If the column has 50 items and the dragged item was originally #200 in the data array, it stays near position #200, which means it could appear anywhere in the column list (possibly out of view).

The user sees a "flick" because the DragOverlay disappears and the item suddenly appears somewhere not visible.

### Recommendation: drop to TOP

Newly-classified items should be at the top so the user can immediately verify the change. This is the convention in most Kanban tools (Jira, Linear, etc.).

### Implementation

In `handleDragEnd`, after a cross-column drop (`targetColumnKey !== dragSourceColumnKey`):

1. Update the item's field (existing logic — move it to target column)
2. Find the first existing item that belongs to the target column (from pre-move `columns` ref)
3. Use `arrayMove` to place the moved item just before that first item

```ts
if (targetColumnKey !== dragSourceColumnKey) {
  newData = newData.map(item => (item.id === String(active.id) ? updateItemColumn(item, groupBy, targetColumnKey, columns) : item))

  // Place moved item at top of target column
  const targetColItems = columns.find(c => c.key === targetColumnKey)?.items ?? []
  const firstTargetItem = targetColItems.find(i => i.id !== String(active.id))
  if (firstTargetItem) {
    const fromIdx = newData.findIndex(i => i.id === String(active.id))
    const toIdx = newData.findIndex(i => i.id === firstTargetItem.id)
    if (fromIdx >= 0 && toIdx >= 0) newData = arrayMove(newData, fromIdx, toIdx)
  }
}
```

For within-column sort (`isColumnDrop === false`): keep current `arrayMove` behavior (user explicitly chose position).

### Scroll-to

After drop, the item is at the top of the target column. Since columns are independently scrollable (`overflow-y-auto`), the user should see it immediately **if the column was already scrolled to top**. If not, the column header is sticky so the first item is just below the header.

No programmatic scroll needed — dropping to top + sticky header means the new item is always in view without any scroll manipulation.

### Acceptance criteria

- Dragging a card to a column zone places it as the first item in that column
- No visible flicker — item appears at top, which is already in view
- Dragging a card onto a specific item (within-column reorder) still places it at that item's position
- Dragging to an empty column: item is the only item in that column

---

## Task P5 — Group by: replace split control with unified pill toggle

### Current state bug

Two separate UI elements compete for "group by":

- Pill toggle: "Round 1" | "Round 2" (only round options)
- Select dropdown: "Group by: [Position / Batch]"

When Position/Batch is active, the Round 1/2 pills appear unselected with no indication of which mode is active. The two-element design reads as "round-specific" + "other" which doesn't match the user's mental model of a single grouping dimension.

### Fix

Replace both elements with a single 4-option pill row:

```tsx
const GROUP_OPTIONS: { key: PipelineGroupBy; label: string }[] = [
  { key: "round1", label: "Round 1" },
  { key: "round2", label: "Round 2" },
  { key: "position", label: "Position" },
  { key: "batch", label: "Batch" },
]

<div className="bg-foreground/5 flex flex-wrap items-center gap-0.5 rounded-full p-1">
  {GROUP_OPTIONS.map(opt => (
    <button
      key={opt.key}
      onClick={() => setGroupBy(opt.key)}
      className={`rounded-full px-3 py-1 text-sm font-semibold transition-colors ${groupBy === opt.key ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
    >
      {opt.label}
    </button>
  ))}
</div>
```

Remove the `isRoundGroupBy` variable (no longer needed). Remove the `<label>` + `<select>` entirely.

### Acceptance criteria

- Single pill row shows all 4 options: Round 1 / Round 2 / Position / Batch
- Active option is highlighted in primary orange
- Selecting any option immediately groups the pipeline correctly
- No select dropdown anywhere
- URL state still updates correctly via `onGroupByChange`

---

## Dependency order

```
P5 (group-by fix)      → no deps, simplest (single file, 15 lines)
P1 (column colors)     → no deps, touches viewUtils.ts + PipelineView.tsx
P2 (card hover)        → no deps, 1-line change in PipelineView.tsx
P3 (remove chip/add PIC) → depends on P1 token additions in viewUtils.ts
P4 (drag-drop top)     → no deps, logic only in PipelineView.tsx
```

## Report

Status: Done — Commit: 676805e

All 5 pipeline tasks shipped. Column themes now use solid backgrounds with per-status color maps in `viewUtils.ts`. Headers are sticky with colored backgrounds and count badges. Cards show `hover:border-primary/60` orange border. Round-status chips removed; PIC colored chip + GPA shown in card footer. Cross-column drag drops to top of target column via `arrayMove`. Group-by is a single 4-option pill row; select dropdown removed.
