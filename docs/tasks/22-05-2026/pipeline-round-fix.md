# Pipeline Round Fix — Round Switcher + Correct Status Columns
Tag: candidates/fix

## Goal

Fix Pipeline view to properly support 2 rounds. Replace the round selection inside the "Group by" dropdown with a dedicated "Round 1 | Round 2" tab toggle. Each round shows its own status columns and card badges reflect the active round.

## Scope

- Included:
  - Add `"round2"` to the type system, `ROUND_2_GROUPS`, `round2Tone()`, extend `groupApplicants()` for round2
  - Fix drag mutation for round2
  - Round 1 / Round 2 tab toggle UI; card badge reflects active round
  - Per-status column color theming (bg tint, dropzone overlay, drag-over highlight)
  - Remove "View" button; clicking a card opens detail
  - Remove grip handle button; whole card is draggable (click vs drag separated by 6px distance constraint already in place)
- Excluded: Round 3+, Position/Batch grouping behavior changes, data persistence, backend integration

## Acceptance criteria

- [ ] Pill-style "Round 1 | Round 2" tab toggle in header; active = `bg-primary text-white`, inactive = `bg-foreground/5 text-muted-foreground`
- [ ] Switching round changes all columns and card badges to the correct round's status
- [ ] Dragging a card in Round 2 mode writes to `round2Result`, not `round1Result`
- [ ] Each status column has a distinct subtle background tint (Pass → emerald, Fail → rose, Waiting → amber, Not Reviewed → neutral)
- [ ] Cross-column drag-over overlay uses per-status colors (border + bg tint), not the current uniform primary color
- [ ] "View" button removed; clicking anywhere on a card calls `onViewDetail`
- [ ] Grip handle button removed; whole card is draggable — clicks still fire (6px `distance` constraint already active)
- [ ] `npx tsc --noEmit` clean
- [ ] `npm run lint` clean

---

## Implementation Plan

### Dependency graph

```
candidateUrlState.ts   ← type source (CANDIDATE_PIPELINE_GROUP_KEYS)
    │
    └── viewUtils.ts   ← groupApplicants(), ROUND_1_GROUPS, round1Tone()
            │
            └── PipelineView.tsx   ← UI, drag logic, PipelineCard badge
```

Build bottom-up: type layer → data/util layer → UI layer.

---

### Phase 1 — Type + Data Layer (foundation)

#### Task 1 — Add `"round2"` to type system and grouping utils

**Description:** Extend the data layer so `"round2"` is a valid `CandidatePipelineGroup` and `groupApplicants()` can produce round2 status columns. This is the foundation everything else depends on.

**Acceptance criteria:**
- [ ] `CANDIDATE_PIPELINE_GROUP_KEYS` includes `"round2"` → `CandidatePipelineGroup` type now includes `"round2"`
- [ ] `ROUND_2_GROUPS` exported from `viewUtils.ts` with keys `not-reviewed | pass | waiting | fail` and tests against `round2Result`
- [ ] `round2Tone(result?: string)` exported from `viewUtils.ts`, same colour logic as `round1Tone`
- [ ] `groupApplicants(items, "round2")` returns 4 columns grouping by `round2Result`

**Verification:**
- [ ] `npx tsc --noEmit` — no errors
- [ ] `npm run lint` — clean

**Dependencies:** None

**Files:**
- `src/lib/candidates/candidateUrlState.ts` — add `"round2"` to `CANDIDATE_PIPELINE_GROUP_KEYS`
- `src/components/views/viewUtils.ts` — add `ROUND_2_GROUPS`, `round2Tone()`, extend `groupApplicants`

**Scope:** S (2 files, ~20 lines added)

---

### Checkpoint A — after Task 1

- [ ] `npx tsc --noEmit` passes
- [ ] `npm run lint` passes
- [ ] `groupApplicants(mockData, "round2")` would return correct 4 groups (verify by reading the code logic)

---

### Phase 2 — Logic Layer (drag mutation)

#### Task 2 — Fix drag-and-drop mutation for round2

**Description:** When a card is dragged across columns in round2 mode, `updateItemColumn` must write to `round2Result`, not `round1Result`. Currently there is no branch for `groupBy === "round2"`.

**Acceptance criteria:**
- [ ] `ROUND2_KEY_TO_VALUE` map defined in `PipelineView.tsx` mapping `not-reviewed | pass | waiting | fail` → `round2Result` string values
- [ ] `updateItemColumn()` branch for `groupBy === "round2"` returns `{ ...item, round2Result: ROUND2_KEY_TO_VALUE[columnKey] }`
- [ ] Existing round1 branch unchanged

**Verification:**
- [ ] `npx tsc --noEmit` — no errors

**Dependencies:** Task 1

**Files:**
- `src/components/views/PipelineView.tsx` — add `ROUND2_KEY_TO_VALUE`, extend `updateItemColumn`

**Scope:** XS (1 file, ~8 lines)

---

### Checkpoint B — after Task 2

- [ ] `npx tsc --noEmit` passes
- [ ] Drag logic is type-safe for both round1 and round2

---

### Phase 3 — UI Layer (switcher + badge)

#### Task 3 — Round tab toggle UI + card badge fix

**Description:** Replace the round selection mechanism in the header with a pill-style "Round 1 | Round 2" tab toggle. Remove "Round 1" from the Group by `<select>` (keep Position / Batch). Update `PipelineCard` and `PipelineCardOverlay` to display the correct round's result based on active `groupBy`.

**Acceptance criteria:**
- [ ] Pill toggle "Round 1 | Round 2" rendered in the header, using `rounded-full` pills, active state `bg-primary text-white`, inactive `bg-foreground/5 text-muted-foreground`
- [ ] Clicking a round tab calls `setGroupBy("round1")` or `setGroupBy("round2")`
- [ ] Group by `<select>` retains only "Position" and "Batch" options
- [ ] `PipelineCard` badge: shows `applicant.round1Result` + `round1Tone` when `groupBy === "round1"`, `applicant.round2Result` + `round2Tone` when `groupBy === "round2"`, hides badge when groupBy is position/batch (or shows both — designer call, but hiding is simpler)
- [ ] `PipelineCardOverlay` badge follows same logic
- [ ] No multiline `className` strings (Turbopack constraint)
- [ ] No styled-jsx

**Verification:**
- [ ] `npx tsc --noEmit` — no errors
- [ ] `npm run lint` — clean
- [ ] Manual: switch to Round 2 tab → columns change → cards show round2Result badge
- [ ] Manual: drag card to different column in Round 2 → card moves, badge updates to new status
- [ ] Manual: switch to Position grouping → columns show by position, round tab stays accessible

**Dependencies:** Tasks 1 and 2

**Files:**
- `src/components/views/PipelineView.tsx` — header UI, pass `groupBy` to `PipelineCard` and `PipelineCardOverlay`

**Scope:** S (1 file, ~30–40 lines changed)

---

### Phase 4 — Column Color Theming

#### Task 4 — Per-status column bg + overlay colors

**Description:** Each status column gets a distinct color theme applied to (a) the column background tint, (b) the cross-column drag-over overlay border and bg, (c) the "Change to X" overlay badge. Position/Batch columns remain neutral. Colors align with existing badge tokens: emerald for Pass, rose for Fail, amber for Waiting, neutral for Not Reviewed.

**Color map (Tailwind v4 classes):**

| Status key | Column bg | Overlay bg | Overlay border | Badge bg |
|---|---|---|---|---|
| `pass` | `bg-emerald-50/30` | `bg-emerald-50/60` | `border-emerald-300/60` | `bg-emerald-100/80` |
| `fail` | `bg-rose-50/30` | `bg-rose-50/60` | `border-rose-300/60` | `bg-rose-100/80` |
| `waiting` | `bg-amber-50/30` | `bg-amber-50/60` | `border-amber-300/60` | `bg-amber-100/80` |
| `not-reviewed` | `bg-foreground/[0.02]` | `bg-foreground/5` | `border-foreground/20` | `bg-foreground/8` |
| any other (position/batch) | none | `bg-primary/8` | `border-primary/40` | `bg-primary/10` (existing) |

**Implementation approach:** Add `getColumnTheme(columnKey: string)` to `viewUtils.ts` returning a typed object `{ colBg, overlayBg, overlayBorder, badgeBg, badgeText, badgeIcon }`. `PipelineColumn` calls it and applies to column wrapper + overlay elements.

**Acceptance criteria:**
- [ ] `getColumnTheme` exported from `viewUtils.ts`; returns correct tokens per key; unknown keys fall back to primary/neutral
- [ ] Column wrapper `<div>` has a subtle bg tint for round-status columns
- [ ] Cross-column drag-over overlay uses per-column border + bg color, not uniform primary
- [ ] "Change to X" badge uses per-column bg and text color
- [ ] No Tailwind v4 violations (no multiline className, no `--spacing-*`)

**Verification:**
- [ ] `npx tsc --noEmit` — no errors
- [ ] `npm run lint` — clean
- [ ] Manual: drag card over "Pass" column → green tinted overlay; over "Fail" → rose

**Dependencies:** Task 3 (column rendering already works)

**Files:**
- `src/components/views/viewUtils.ts` — add `getColumnTheme()`
- `src/components/views/PipelineView.tsx` — apply theme in `PipelineColumn`

**Scope:** S (2 files, ~25 lines)

---

### Checkpoint C — after Tasks 3–4

- [ ] `npx tsc --noEmit` passes
- [ ] `npm run lint` passes
- [ ] Round switching, badges, and column colors all work visually

---

### Phase 5 — Card UX

#### Task 5 — Remove View button + grip handle; whole-card drag + click-to-detail

**Description:** Remove the explicit "View" button from the card bottom. Remove the `GripVertical` drag handle button. Spread `listeners` on the `<article>` element so the whole card is draggable. Add `onClick` on `<article>` to open detail. The existing `PointerSensor` `activationConstraint: { distance: 6 }` already prevents accidental drag on short clicks — no additional mechanism needed.

**Interaction contract:**
- Short press / click → `onClick` fires → `onViewDetail?.(applicant)` called
- Press + move ≥6px → dnd-kit drag activates → `onClick` does NOT fire (pointer event consumed by dnd-kit)
- `cursor-pointer` on card (click is primary action; drag is secondary)
- During active drag: card becomes `opacity-40` (existing), `cursor-grabbing` via CSS `[data-dragging] { cursor: grabbing }`

**What changes in `PipelineCard`:**
- Remove `setActivatorNodeRef` assignment from grip button
- Remove `<Button>` grip handle element entirely
- Remove `<Button>` "View" element entirely
- Add `{...listeners}` to `<article>` (in addition to existing `ref={setNodeRef}`, `style`, `{...attributes}`)
- Add `onClick={() => onViewDetail?.(applicant)}` to `<article>`
- Add `cursor-pointer` to `<article>` className
- Adjust avatar/name layout since grip column is gone (reclaim the ~20px horizontal space)

**What changes in `PipelineCardOverlay`:**
- No grip icon needed — it's just a visual preview, no listeners

**Acceptance criteria:**
- [ ] Clicking a card (no drag movement) opens detail view
- [ ] Dragging a card (≥6px movement) moves it between columns without firing detail open
- [ ] No "View" button visible on any card
- [ ] No grip handle icon visible on any card
- [ ] `PipelineCardOverlay` renders cleanly without grip icon
- [ ] Card layout fills the freed horizontal space (avatar + name left-aligned, no gap for handle)

**Verification:**
- [ ] `npx tsc --noEmit` — no errors
- [ ] `npm run lint` — clean
- [ ] Manual: single click → detail opens
- [ ] Manual: click-and-hold + drag 10px+ → card drags, no detail open

**Dependencies:** Task 3 (card structure stable after badge + groupBy prop changes)

**Files:**
- `src/components/views/PipelineView.tsx` — `PipelineCard` and `PipelineCardOverlay`

**Scope:** S (1 file, ~20 lines removed / changed)

---

### Checkpoint D — final

- [ ] `npx tsc --noEmit` passes
- [ ] `npm run lint` passes
- [ ] All acceptance criteria checked
- [ ] Task updated in `docs/tasks/22-05-2026/summary.md`

---

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| `groupBy` prop threading — `PipelineCard` currently doesn't receive `groupBy` | Med | Pass as prop in Task 3; `PipelineCardOverlay` also needs it |
| round2Result sparse in mock (only 13 candidates) | Low | "Not Reviewed" column will dominate — accurate representation |
| Whole-card drag vs click conflict | Med | `PointerSensor` `distance: 6` constraint already in place — confirmed sufficient |
| Turbopack: multiline className | Low | All classNames must be single-line strings |
| Column bg tint Tailwind purge | Low | Use static class strings, not dynamic template strings; Tailwind v4 scans source |

## Open questions

None — scope fully confirmed with user.

---

## Report

Status: Done | Commits: `93b600b`, `4dab42d`, `d6a67d0`

Data layer extended with round2 type, groups, tone, column theme util. Drag mutation writes to the correct round field. Header replaced with pill tab toggle (Round 1 / Round 2) + Group by select (Position / Batch). Each column has a per-status bg tint and drag-over overlay. Cards now open detail on click; grip handle and View button removed; whole card is draggable via 6px distance constraint separation.
