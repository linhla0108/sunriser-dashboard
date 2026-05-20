# Column Sort — 3-State for All Headers
Tag: candidates/feature

## Goal
All table columns except `#` (index) and `Actions` get 3-state sort: default → asc → desc → default. Columns that already have sort get the 3rd "default/reset" state. Columns that have no sort get the full 3-state button added.

## Scope
- Included: Name, Position, University, GPA, Year, Batch, PIC, Round 1, Round 2
- Excluded: `#` column (row index, not a data field), Actions column
- Excluded: Changing any visual style beyond the sort icon states

## Current state
Already sortable (2-state only): Name, University, GPA, Batch
Not sortable at all: Position, Year, PIC, Round 1, Round 2

---

## Architecture decisions

**SortKey null = no active sort.** Use `sortKey: SortKey | null` instead of adding a `"none"` direction. When null, items render in original incoming data order.

**Original order tracking.** Keep a `originalOrder` ref that stores the data array as received from props (re-synced on `data` prop change). When sort resets to null, restore from this ref.

**3-state cycle per click:**
- Click unsorted column → sortKey = col, sortDir = "asc"
- Click active asc column → sortDir = "desc"
- Click active desc column → sortKey = null (restore original order)

**Column → field mapping (new columns):**

| Column header | Field         | Sort type  | Notes                                    |
|---------------|---------------|------------|------------------------------------------|
| Position      | `position1`   | asc/desc   | string localeCompare                     |
| Year          | `yearOfStudy` | asc/desc   | string localeCompare ("Năm 2/3/4" sorts naturally) |
| PIC           | `pic`         | asc/desc   | optional string; undefined → sort last  |
| Round 1       | `round1Result`| asc/desc   | optional string; undefined → sort last  |
| Round 2       | `round2Result`| asc/desc   | optional string; undefined → sort last  |

---

## Acceptance criteria
- [ ] All 9 columns (excluding `#` and Actions) show a sort button
- [ ] Clicking an unsorted column header → data sorts asc, icon turns active (chevron up)
- [ ] Clicking the same active asc header → data sorts desc, icon turns active (chevron down)
- [ ] Clicking the same active desc header → sort clears, data returns to original prop order, icon back to neutral (ChevronsUpDown)
- [ ] Only one column can be active at a time (clicking a new column resets previous)
- [ ] Optional fields (PIC, Round 1, Round 2) with undefined values sort to bottom in both asc and desc
- [ ] `SortIcon` shows 3 distinct states: neutral (inactive), up (asc), down (desc)
- [ ] TypeScript has no errors (`npx tsc --noEmit` passes)

---

## Tasks

### Task 1 — Type + state changes
**Files:** `src/components/table/ApplicantTable.tsx`

- Expand `SortKey` to `"name" | "position" | "university" | "gpa" | "year" | "batch" | "pic" | "round1" | "round2"`
- Change `sortKey` state from `SortKey` to `SortKey | null` (initial: `null`)
- Change initial `items` state to use original prop order (no pre-sort on init), OR keep pre-sort on name — **decision:** start with `sortKey: "name", sortDir: "asc"` to match current behavior
- Add `originalOrderRef = useRef<Applicant[]>([])` synced on `data` prop change

**Acceptance criteria:**
- [ ] Types compile, no regressions on existing sort buttons

---

### Task 2 — handleSort 3-state cycle + SortIcon 3-state display
**Files:** `src/components/table/ApplicantTable.tsx`

Update `handleSort(key)`:
```
if sortKey !== key → setSortKey(key), setSortDir("asc"), setItems(sorted asc)
if sortKey === key && sortDir === "asc" → setSortDir("desc"), setItems(sorted desc)
if sortKey === key && sortDir === "desc" → setSortKey(null), setItems(originalOrderRef.current)
```

Update `SortIcon`:
- `col !== sortKey` → `ChevronsUpDown` (neutral, muted)
- `col === sortKey && sortDir === "asc"` → `ChevronUp` (primary)
- `col === sortKey && sortDir === "desc"` → `ChevronDown` (primary)

**Acceptance criteria:**
- [ ] Existing 4 sort columns now cycle through 3 states
- [ ] Clicking a new column while another is active: old column icon resets to neutral

---

### Task 3 — Expand sortApplicants for new keys
**Files:** `src/components/table/ApplicantTable.tsx`

Extend the `sortApplicants` function with branches for:
- `"position"` → `a.position1.localeCompare(b.position1)`
- `"year"` → `a.yearOfStudy.localeCompare(b.yearOfStudy)`
- `"pic"` → optional string sort, undefined → empty string for sort (sorts to top on asc), or use a sentinel ("zzz") to push undefined to bottom
- `"round1"` → `round1Result`, undefined → sentinel for bottom
- `"round2"` → `round2Result`, undefined → sentinel for bottom

Use consistent convention: undefined optional fields → `"￿"` sentinel so they always sort to the bottom (regardless of asc or desc direction, swap sentinel position).

**Acceptance criteria:**
- [ ] Sorting by Round 1: rows with no result appear after all rows with a result in asc; before all rows in desc
- [ ] Actually — undefined should always be last in both directions. Use conditional: if one value is undefined and other is not, always put undefined last.

---

### Task 4 — Add sort buttons to Position, Year, PIC
**Files:** `src/components/table/ApplicantTable.tsx`

Replace the three plain `<TableHead>` static labels with `<Button>` + `<SortIcon>` pattern (same markup as existing Name/GPA/Batch/University headers). Each button calls `handleSort("position")`, `handleSort("year")`, `handleSort("pic")`.

**Acceptance criteria:**
- [ ] Position, Year, PIC column headers are clickable and visually match existing sort headers
- [ ] Responsive visibility classes preserved (`lg:table-cell` for Year and PIC)

---

### Task 5 — Add sort buttons to Round 1, Round 2
**Files:** `src/components/table/ApplicantTable.tsx`

Same pattern for Round 1 and Round 2 columns. Round 2 is `hidden sm:table-cell`.

**Acceptance criteria:**
- [ ] Round 1 and Round 2 headers are clickable sort buttons
- [ ] Responsive visibility preserved

---

### Checkpoint — Final verification
- [ ] `npx tsc --noEmit` — zero errors
- [ ] `npm run lint` — zero new lint warnings
- [ ] Manual smoke: click each column header 3 times, confirm cycle works correctly
- [ ] Original order restores correctly after cycling through all 3 states

---

## Report
Status: Done

All 5 tasks implemented in a single focused slice (all changes in `ApplicantTable.tsx`). 7 new tests in `src/components/table/__tests__/ApplicantTable.sort.test.tsx` — all pass. No regressions introduced (the one pre-existing `TopBar.test.tsx` failure exists on the baseline commit).
