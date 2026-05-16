> **STATUS: COMPLETED** — All 9 files updated 2026-05-16.

# Implementation Plan: Font & Color Rebrand

> Spec: `docs/superpowers/specs/2026-05-16-design-system-rebrand-design.md`

## Overview

9 files to modify. Tasks are ordered by dependency — globals.css first (tokens), then components in any order (all independent).

---

## Task 1: Update `globals.css` — Font Loading + Token Swap

**File:** `src/app/globals.css`
**Depends on:** nothing
**Estimated changes:** ~40 lines

### Steps

1. **Add `@font-face` declarations** — Insert 4 Proxima Nova face rules at the top of the file, after `@import` statements but before `@theme`:

```css
/* After @import lines, before @theme */
@font-face {
  font-family: 'Proxima Nova';
  src: url('https://res.cloudinary.com/dejueffls/raw/upload/v1777436992/Proxima-Nova-Regular.otf')
    format('opentype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Proxima Nova';
  src: url('https://res.cloudinary.com/dejueffls/raw/upload/v1777436991/Proxima-Nova-Medium.otf')
    format('opentype');
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Proxima Nova';
  src: url('https://res.cloudinary.com/dejueffls/raw/upload/v1777436993/Proxima-Nova-SemiBold.otf')
    format('opentype');
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Proxima Nova';
  src: url('https://res.cloudinary.com/dejueffls/raw/upload/v1777436991/Proxima-Nova-Bold.otf')
    format('opentype');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
```

2. **Update `@theme` block** — Replace font and color tokens:

```css
@theme {
  /* Fonts — Proxima Nova replaces Sohne + Signifier */
  --font-sohne: 'Proxima Nova', 'Helvetica Neue', Helvetica, 'Segoe UI', Arial, sans-serif;
  --font-signifier: 'Proxima Nova', 'Helvetica Neue', Helvetica, 'Segoe UI', Arial, sans-serif;

  /* Colors — Remapped */
  --color-canvas: #fcfcfc;
  --color-ink: #1b1b1b;
  --color-graphite: #000000;
  --color-warm-mist: #ffdad3;
  --color-terracotta: #8d1600;
  --color-fog: #f9f9f9;
  --color-muted-stone: #555555;
  --color-light-steel: #8f7069;
  --color-hint-of-grey: #a3a6af;
  --color-dusk-link: #8b8c8d;

  /* Colors — New primary system */
  --color-primary: #ff5533;
  --color-primary-dark: #e63d1f;
  --color-primary-deep: #8d1600;
  --color-primary-tint: #ffdad3;
  --color-primary-pale: #fff5f3;

  /* Colors — Position accents */
  --color-pos-data: #f76969;
  --color-pos-ai: #55db9c;
  --color-pos-gamedesign: #7b69fb;
  --color-pos-qa: #f9d529;
  --color-pos-unity: #4ba2ff;
  --color-pos-ua: #e9cbff;
  --color-pos-hr: #ff8ab7;

  /* Spacing — unchanged */
  --spacing-4: 4px;
  --spacing-8: 8px;
  --spacing-12: 12px;
  --spacing-16: 16px;
  --spacing-20: 20px;
  --spacing-24: 24px;
  --spacing-28: 28px;
  --spacing-32: 32px;
  --spacing-40: 40px;
  --spacing-64: 64px;
  --spacing-80: 80px;

  /* Border Radius — unchanged */
  --radius-cards: 24px;
  --radius-images: 12px;
  --radius-inputs: 16px;
  --radius-buttons: 9999px;
  --radius-default: 24px;

  /* Shadows — unchanged */
  --shadow-subtle:
    rgba(4, 23, 43, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 20px 25px -5px,
    rgba(0, 0, 0, 0.1) 0px 8px 10px -6px;
  --shadow-card:
    rgba(4, 23, 43, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 20px 25px -5px,
    rgba(0, 0, 0, 0.1) 0px 8px 10px -6px;
}
```

3. **Update `body` rule** — Change font-family to Proxima Nova stack:

```css
body {
  font-family: 'Proxima Nova', 'Helvetica Neue', Helvetica, 'Segoe UI', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}
```

### Verify

- `npm run dev` — page loads, Proxima Nova visible in DevTools computed styles
- No FOIT (flash of invisible text) — `font-display: swap` handles this

---

## Task 2: Sidebar

**File:** `src/components/layout/Sidebar.tsx`
**Depends on:** Task 1
**Changes:**

| Line  | What                    | Old                           | New                                                       |
| ----- | ----------------------- | ----------------------------- | --------------------------------------------------------- |
| 30-36 | Logo `fontFamily` style | `"'Signifier', Georgia, ..."` | Remove inline style (inherits Proxima Nova via CSS)       |
| 30    | Logo `className`        | `text-[22px] font-bold`       | `text-[22px] font-bold` (keep, weight 700 maps correctly) |
| 37    | Subtitle color          | `text-[#777b86]`              | `text-[#8f7069]`                                          |
| 53    | Active bg               | `bg-[#17191c] text-white`     | `bg-[#FF5533] text-white`                                 |
| 54    | Inactive text           | `text-[#4c4c4c]`              | `text-[#555555]`                                          |
| 54    | Inactive hover          | `hover:bg-[#f7f7f8]`          | `hover:bg-[#f9f9f9]`                                      |
| 54    | Inactive hover text     | `hover:text-[#17191c]`        | `hover:text-[#1b1b1b]`                                    |
| 42    | Divider color           | `bg-[#f7f7f8]`                | `bg-[#f9f9f9]`                                            |
| 66    | Version dot             | `bg-[#fbe1d1]`                | `bg-[#ffdad3]`                                            |

---

## Task 3: TopBar

**File:** `src/components/layout/TopBar.tsx`
**Depends on:** Task 1
**Changes:**

| What              | Old                                       | New                                     |
| ----------------- | ----------------------------------------- | --------------------------------------- |
| h1 inline `style` | `fontFamily: "'Signifier', Georgia, ..."` | Remove entirely (inherits Proxima Nova) |
| h1 className      | `text-2xl font-semibold text-[#17191c]`   | `text-2xl font-bold text-[#1b1b1b]`     |
| Subtitle color    | `text-[#777b86]`                          | `text-[#8f7069]`                        |

---

## Task 4: StatsCard

**File:** `src/components/dashboard/StatsCard.tsx`
**Depends on:** Task 1
**Changes:**

| What                 | Old                                         | New                                                         |
| -------------------- | ------------------------------------------- | ----------------------------------------------------------- |
| Title color          | `text-[#777b86]`                            | `text-[#8f7069]`                                            |
| Value inline `style` | `fontFamily: "'Signifier', Georgia, serif"` | Remove entirely                                             |
| Value className      | `text-4xl font-bold`                        | `text-4xl font-bold` (keep — 700 maps to Proxima Nova Bold) |
| Value default color  | `text-[#17191c]`                            | `text-[#1b1b1b]`                                            |
| Value accent color   | `text-[#5d2a1a]`                            | `text-[#FF5533]`                                            |
| Subtitle color       | `text-[#a3a6af]`                            | `text-[#8f7069]`                                            |

---

## Task 5: OverviewCharts

**File:** `src/components/dashboard/OverviewCharts.tsx`
**Depends on:** Task 1
**Changes:**

| What                     | Old                                 | New                                 |
| ------------------------ | ----------------------------------- | ----------------------------------- |
| `PIE_COLORS` array       | `['#17191c', '#fbe1d1', '#777b86']` | `['#FF5533', '#ffdad3', '#8f7069']` |
| "By Position" bar `fill` | `#17191c`                           | `#FF5533`                           |
| "By Batch" bar `fill`    | `#fbe1d1`                           | `#ffdad3`                           |
| "Discovery" bar `fill`   | `#4c4c4c`                           | `#555555`                           |
| ChartCard title color    | `text-[#17191c]`                    | `text-[#1b1b1b]`                    |
| XAxis/YAxis tick fill    | `#777b86`                           | `#8f7069`                           |
| CartesianGrid stroke     | `#f7f7f8`                           | `#f9f9f9`                           |
| Tooltip cursor fill      | `#f7f7f8`                           | `#f9f9f9`                           |
| Tooltip border           | `rgba(4, 23, 43, 0.08)`             | `#eeeeee`                           |
| Tooltip text color       | `#17191c`                           | `#1b1b1b`                           |
| Legend text color        | `#4c4c4c`                           | `#555555`                           |

---

## Task 6: ApplicantTable

**File:** `src/components/table/ApplicantTable.tsx`
**Depends on:** Task 1
**Changes:**

| What                      | Old                                | New                                |
| ------------------------- | ---------------------------------- | ---------------------------------- |
| SortIcon inactive color   | `text-[#a3a6af]`                   | `text-[#a3a6af]` (keep)            |
| SortIcon active color     | `text-[#17191c]`                   | `text-[#FF5533]`                   |
| Search input focus border | `focus:border-[#17191c]`           | `focus:border-[#FF5533]`           |
| Search placeholder        | `placeholder:text-[#a3a6af]`       | keep                               |
| Search text color         | `text-[#17191c]`                   | `text-[#1b1b1b]`                   |
| Select focus border       | `focus:border-[#17191c]`           | `focus:border-[#FF5533]`           |
| Select text color         | `text-[#17191c]`, `text-[#4c4c4c]` | `text-[#1b1b1b]`, `text-[#555555]` |
| Header text               | `text-[#a3a6af]`                   | keep                               |
| Header hover              | `hover:text-[#17191c]`             | `hover:text-[#FF5533]`             |
| Record count              | `text-[#a3a6af]`                   | `text-[#8f7069]`                   |
| Table border-b            | `border-[#f7f7f8]`                 | `border-[#f9f9f9]`                 |
| Border color in select    | `border-[#e5e7eb]`                 | `border-[#e2e2e2]`                 |
| Chevron icon color        | `text-[#777b86]`                   | `text-[#8f7069]`                   |

---

## Task 7: DraggableRow

**File:** `src/components/table/DraggableRow.tsx`
**Depends on:** Task 1
**Changes:**

| What                  | Old                                           | New                     |
| --------------------- | --------------------------------------------- | ----------------------- |
| Name color            | `text-[#17191c]`                              | `text-[#1b1b1b]`        |
| Email color           | `text-[#a3a6af]`                              | keep                    |
| Position/university   | `text-[#4c4c4c]`                              | `text-[#555555]`        |
| GPA high color        | `text-[#17191c]`                              | `text-[#1b1b1b]`        |
| GPA mid color         | `text-[#4c4c4c]`                              | `text-[#555555]`        |
| Year color            | `text-[#777b86]`                              | `text-[#8f7069]`        |
| Batch badge bg        | `bg-[#f7f7f8]`                                | `bg-[#f9f9f9]`          |
| Batch badge text      | `text-[#4c4c4c]`                              | `text-[#555555]`        |
| PIC color             | `text-[#777b86]`                              | `text-[#8f7069]`        |
| Row hover             | `hover:bg-[#f7f7f8]/70`                       | `hover:bg-[#f9f9f9]/70` |
| Row border-b          | `border-[#f7f7f8]`                            | `border-[#f9f9f9]`      |
| Eye button hover text | `hover:text-[#17191c]`                        | `hover:text-[#FF5533]`  |
| Eye button hover bg   | `hover:bg-[#f7f7f8]`                          | `hover:bg-[#f9f9f9]`    |
| Drag handle color     | `text-[#a3a6af]`                              | keep                    |
| Drag handle hover     | `hover:text-[#777b86]`                        | `hover:text-[#8f7069]`  |
| Round1Badge           | **NO CHANGE** — semantic green/red/amber stay |

---

## Task 8: UploadZone

**File:** `src/components/upload/UploadZone.tsx`
**Depends on:** Task 1
**Changes:**

| What                      | Old                               | New                               |
| ------------------------- | --------------------------------- | --------------------------------- |
| Drag border active        | `border-[#17191c]`                | `border-[#FF5533]`                |
| Drag bg active            | `bg-[#f7f7f8]`                    | `bg-[#fff5f3]`                    |
| Hover border              | `hover:border-[#17191c]`          | `hover:border-[#FF5533]`          |
| Hover bg                  | `hover:bg-[#f7f7f8]/50`           | `hover:bg-[#fff5f3]/50`           |
| Icon container drag bg    | `bg-[#17191c]`                    | `bg-[#FF5533]`                    |
| Icon container default bg | `bg-[#f7f7f8]`                    | `bg-[#f9f9f9]`                    |
| Icon default color        | `text-[#4c4c4c]`                  | `text-[#555555]`                  |
| Heading text              | `text-[#17191c]`                  | `text-[#1b1b1b]`                  |
| Subtitle text             | `text-[#a3a6af]`                  | `text-[#8f7069]`                  |
| File type pills bg        | `bg-[#f7f7f8]`                    | `bg-[#f9f9f9]`                    |
| File type pills text      | `text-[#777b86]`                  | `text-[#8f7069]`                  |
| File type pills border    | `border-[#e5e7eb]`                | `border-[#e2e2e2]`                |
| Processing spinner border | `border-[#17191c]`                | `border-[#FF5533]`                |
| Processing text           | `text-[#4c4c4c]`                  | `text-[#555555]`                  |
| File info name            | `text-[#17191c]`                  | `text-[#1b1b1b]`                  |
| File info meta            | `text-[#777b86]`                  | `text-[#8f7069]`                  |
| Column label              | `text-[#a3a6af]`                  | `text-[#8f7069]`                  |
| Column pill text          | `text-[#4c4c4c]`                  | `text-[#555555]`                  |
| Column pill bg            | `bg-[#f7f7f8]`                    | `bg-[#f9f9f9]`                    |
| Column pill border        | `border-[#e5e7eb]`                | `border-[#e2e2e2]`                |
| "Analyze" button bg       | `bg-[#17191c] hover:bg-[#2d3035]` | `bg-[#FF5533] hover:bg-[#E63D1F]` |
| "Clear" button border     | `border-[#17191c]`                | `border-[#1b1b1b]`                |
| "Clear" button text       | `text-[#17191c]`                  | `text-[#1b1b1b]`                  |
| "Clear" hover bg          | `hover:bg-[#f7f7f8]`              | `hover:bg-[#f9f9f9]`              |
| File icon spreadsheet     | `text-[#17191c]`                  | `text-[#FF5533]`                  |
| File icon csv             | `text-[#4c4c4c]`                  | `text-[#555555]`                  |
| File icon other           | `text-[#777b86]`                  | `text-[#8f7069]`                  |

---

## Task 9: ChatBox

**File:** `src/components/chat/ChatBox.tsx`
**Depends on:** Task 1
**Changes:**

| What                  | Old                               | New                               |
| --------------------- | --------------------------------- | --------------------------------- |
| User avatar bg        | `bg-[#17191c]`                    | `bg-[#FF5533]`                    |
| AI avatar bg          | `bg-[#fbe1d1]`                    | `bg-[#ffdad3]`                    |
| AI avatar icon color  | `text-[#5d2a1a]`                  | `text-[#8d1600]`                  |
| User bubble bg        | `bg-[#17191c]`                    | `bg-[#FF5533]`                    |
| AI bubble text        | `text-[#17191c]`                  | `text-[#1b1b1b]`                  |
| AI bubble border      | `border-[#f0f0f0]`                | `border-[#eeeeee]`                |
| Send button bg        | `bg-[#17191c] hover:bg-[#2d3035]` | `bg-[#FF5533] hover:bg-[#E63D1F]` |
| Input text color      | `text-[#17191c]`                  | `text-[#1b1b1b]`                  |
| Input placeholder     | `placeholder:text-[#a3a6af]`      | keep                              |
| Timestamp color       | `text-[#a3a6af]`                  | keep                              |
| Data context labels   | `text-[#a3a6af]`                  | `text-[#8f7069]`                  |
| File badge bg         | `bg-[#f7f7f8]`                    | `bg-[#f9f9f9]`                    |
| File badge icon       | `text-[#4c4c4c]`                  | `text-[#555555]`                  |
| File badge name       | `text-[#17191c]`                  | `text-[#1b1b1b]`                  |
| File badge meta       | `text-[#777b86]`                  | `text-[#8f7069]`                  |
| Sheet name text       | `text-[#4c4c4c]`                  | `text-[#555555]`                  |
| Sheet row count       | `text-[#a3a6af]`                  | keep                              |
| Sheet hover bg        | `hover:bg-[#f7f7f8]`              | `hover:bg-[#f9f9f9]`              |
| Suggested query text  | `text-[#4c4c4c]`                  | `text-[#555555]`                  |
| Suggested query hover | `hover:bg-[#f7f7f8]`              | `hover:bg-[#f9f9f9]`              |
| Connected badge text  | `text-[#4c4c4c]`                  | `text-[#555555]`                  |
| Connected name        | `text-[#17191c]`                  | `text-[#1b1b1b]`                  |

---

## Execution Strategy

**Parallelizable:** Tasks 2–9 are all independent of each other (they only depend on Task 1).

```
Task 1 (globals.css)
  ├── Task 2 (Sidebar)
  ├── Task 3 (TopBar)
  ├── Task 4 (StatsCard)
  ├── Task 5 (OverviewCharts)
  ├── Task 6 (ApplicantTable)
  ├── Task 7 (DraggableRow)
  ├── Task 8 (UploadZone)
  └── Task 9 (ChatBox)
```

After all tasks: run `npm run build` to verify no TS/build errors, then visual check in browser.

---

## Verification Checklist

- [ ] Proxima Nova loads (check DevTools → Network → font files, Computed → font-family)
- [ ] No Signifier/Georgia serif visible anywhere
- [ ] Active sidebar item is #FF5533 orange-red
- [ ] StatsCard accent values are #FF5533
- [ ] Pie chart uses #FF5533 primary
- [ ] "Analyze" and "Send" buttons are #FF5533
- [ ] User chat bubble is #FF5533
- [ ] All hover states use updated colors
- [ ] No remaining hardcoded `#17191c`, `#5d2a1a`, `#fbe1d1`, `#777b86`, `#4c4c4c` in component files
- [ ] Green/red/amber semantic colors unchanged
- [ ] Shadows and radii unchanged
- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes
