> **STATUS: COMPLETED** — Implemented 2026-05-16. Proxima Nova + #FF5533 palette fully applied across all components.

# Design Spec: Font & Color Rebrand

> Replace Sohne/Signifier fonts with Proxima Nova and swap Steep's neutral palette for #FF5533 primary system. All layout, shadows, radii, and spacing from Steep are preserved.

## Scope

**In scope:** `globals.css` token layer + all 8 dashboard components (Sidebar, TopBar, StatsCard, OverviewCharts, ApplicantTable, DraggableRow, UploadZone, ChatBox).

**Out of scope:** Layout changes, new features, shadcn/ui base theme remap, responsive breakpoints, dark mode.

---

## 1. Font Loading

Add 4 `@font-face` declarations in `globals.css` before the `@theme` block:

```css
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

### Token Remapping

| Steep Token        | Old Value                                | New Value                                                                    |
| ------------------ | ---------------------------------------- | ---------------------------------------------------------------------------- |
| `--font-sohne`     | `'Sohne', ui-sans-serif, system-ui, ...` | `'Proxima Nova', 'Helvetica Neue', Helvetica, 'Segoe UI', Arial, sans-serif` |
| `--font-signifier` | `'Signifier', Georgia, serif`            | `'Proxima Nova', 'Helvetica Neue', Helvetica, 'Segoe UI', Arial, sans-serif` |

### Weight Mapping

Since Proxima Nova has 400/500/600/700 and Sohne had 400/430/450/480/500:

| Usage       | Old Weight      | New Weight              |
| ----------- | --------------- | ----------------------- |
| Body text   | 400 (Sohne)     | 400                     |
| Body medium | 430 (Sohne)     | 500                     |
| Body semi   | 450/480 (Sohne) | 600                     |
| UI medium   | 500 (Sohne)     | 600                     |
| Headings    | 400 (Signifier) | 700 (Proxima Nova Bold) |

### Body Element

```css
body {
  font-family: 'Proxima Nova', 'Helvetica Neue', Helvetica, 'Segoe UI', Arial, sans-serif;
}
```

---

## 2. Color Palette

### Remapped Steep Tokens

| Token                  | Old       | New       | Role                        |
| ---------------------- | --------- | --------- | --------------------------- |
| `--color-canvas`       | `#ffffff` | `#FCFCFC` | Page background             |
| `--color-ink`          | `#17191c` | `#1b1b1b` | Primary text, dark surfaces |
| `--color-graphite`     | `#000000` | `#000000` | No change                   |
| `--color-warm-mist`    | `#fbe1d1` | `#ffdad3` | Primary tint bg             |
| `--color-terracotta`   | `#5d2a1a` | `#8d1600` | Primary deep accent         |
| `--color-fog`          | `#f7f7f8` | `#f9f9f9` | Secondary bg                |
| `--color-muted-stone`  | `#4c4c4c` | `#555555` | Secondary text              |
| `--color-light-steel`  | `#777b86` | `#8f7069` | Muted text (warm shift)     |
| `--color-hint-of-grey` | `#a3a6af` | `#a3a6af` | No change (placeholder)     |
| `--color-dusk-link`    | `#8b8c8d` | `#8b8c8d` | No change                   |

### New Tokens

| Token                    | Value     | Role                                         |
| ------------------------ | --------- | -------------------------------------------- |
| `--color-primary`        | `#FF5533` | CTA buttons, active states, accents          |
| `--color-primary-dark`   | `#E63D1F` | Hover state for primary                      |
| `--color-primary-deep`   | `#8d1600` | Deep accent (same as remapped terracotta)    |
| `--color-primary-tint`   | `#ffdad3` | Light accent bg (same as remapped warm-mist) |
| `--color-primary-pale`   | `#fff5f3` | Very light primary bg                        |
| `--color-pos-data`       | `#F76969` | Data Analysis position                       |
| `--color-pos-ai`         | `#55DB9C` | AI Engineering position                      |
| `--color-pos-gamedesign` | `#7B69FB` | Game Design position                         |
| `--color-pos-qa`         | `#F9D529` | Game QA position                             |
| `--color-pos-unity`      | `#4BA2FF` | Unity Development position                   |
| `--color-pos-ua`         | `#E9CBFF` | Game User Acquisition position               |
| `--color-pos-hr`         | `#FF8AB7` | Human Resources position                     |

---

## 3. Component Changes

### 3.1 Sidebar (`components/layout/Sidebar.tsx`)

- Logo text: `font-family` → Proxima Nova 700 (was Signifier 400)
- Subtitle: color → `--color-light-steel` (#8f7069)
- Active nav item: `bg-[#FF5533] text-white` (was `bg-[#17191c] text-white`)
- Inactive hover: `hover:bg-fog` (unchanged pattern, new fog value)
- Version dot: `bg-primary-tint` (was warm-mist)

### 3.2 TopBar (`components/layout/TopBar.tsx`)

- Heading: `font-family` → Proxima Nova 700, remove inline Signifier `style` prop
- Subtitle: color → `#8f7069`

### 3.3 StatsCard (`components/dashboard/StatsCard.tsx`)

- Title: color → `#8f7069`
- Value: font → Proxima Nova 700, remove inline Signifier `style` prop
- Accent value: color → `#FF5533` (was `#5d2a1a` terracotta)
- Subtitle: color → `#8f7069`

### 3.4 OverviewCharts (`components/dashboard/OverviewCharts.tsx`)

- Chart title: font inherits Proxima Nova
- "Applications by Position" bar fill: use position colors mapped to each position name
- "Round 1 Results" pie: `PIE_COLORS` → `['#FF5533', '#ffdad3', '#8f7069']` (primary, tint, muted)
- "Applications by Batch" bar fill: `#ffdad3` → `#FF5533` (primary)
- "Discovery Channels" bar fill: `#4c4c4c` → `#555555`
- Tooltip border: use `--color-border` equivalent
- Grid/axis tick colors: `#8f7069` (was `#777b86`)

### 3.5 ApplicantTable (`components/table/ApplicantTable.tsx`)

- Search input focus border: `focus:border-[#FF5533]` (was `focus:border-[#17191c]`)
- Select dropdowns focus border: same
- Sort icon active color: `text-[#FF5533]` (was `text-[#17191c]`)
- Header text colors: `#8f7069` (was `#a3a6af`)
- Record count color: `#8f7069`
- All hardcoded `#17191c` → `#1b1b1b`, `#4c4c4c` → `#555555`, `#777b86` → `#8f7069`

### 3.6 DraggableRow (`components/table/DraggableRow.tsx`)

- Name color: `#1b1b1b` (was `#17191c`)
- Position/university text: `#555555` (was `#4c4c4c`)
- GPA high color: `#1b1b1b`, mid: `#555555`, low: `#a3a6af`
- Round1Badge: keep semantic green/red/amber — no change
- Row hover: `hover:bg-[#f9f9f9]` (was `#f7f7f8`)
- Eye button hover: `hover:text-[#FF5533]` (was `hover:text-[#17191c]`)

### 3.7 UploadZone (`components/upload/UploadZone.tsx`)

- Drop zone dragging border: `border-[#FF5533]` (was `border-[#17191c]`)
- Drop zone hover border: `hover:border-[#FF5533]`
- Icon container dragging bg: `bg-[#FF5533]` (was `bg-[#17191c]`)
- "Analyze in Table" button: `bg-[#FF5533] hover:bg-[#E63D1F]` (was `bg-[#17191c] hover:bg-[#2d3035]`)
- "Clear" button border: `border-[#1b1b1b]` (was `border-[#17191c]`)
- File type pills: bg → `#f9f9f9`
- All text color swaps per mapping

### 3.8 ChatBox (`components/chat/ChatBox.tsx`)

- User avatar: `bg-[#FF5533]` (was `bg-[#17191c]`)
- AI avatar: `bg-[#ffdad3]` (was `bg-[#fbe1d1]`), icon color → `#8d1600`
- User bubble: `bg-[#FF5533]` (was `bg-[#17191c]`)
- Send button: `bg-[#FF5533] hover:bg-[#E63D1F]` (was `bg-[#17191c] hover:bg-[#2d3035]`)
- Connection badge Wifi icon: stays green (semantic)
- Connected text: `font-semibold` color → `#1b1b1b`
- All muted text → `#8f7069`

---

## 4. Files Changed

1. `src/app/globals.css` — font-face declarations, @theme color tokens
2. `src/components/layout/Sidebar.tsx`
3. `src/components/layout/TopBar.tsx`
4. `src/components/dashboard/StatsCard.tsx`
5. `src/components/dashboard/OverviewCharts.tsx`
6. `src/components/table/ApplicantTable.tsx`
7. `src/components/table/DraggableRow.tsx`
8. `src/components/upload/UploadZone.tsx`
9. `src/components/chat/ChatBox.tsx`

---

## 5. What Does NOT Change

- Border radii (24px cards, pill buttons, 16px inputs)
- Shadow values (Steep layered shadow)
- Spacing scale (4px base unit)
- Layout structure (240px sidebar, ml-[240px] main)
- DnD functionality
- File parsing logic
- Mock data
- shadcn/ui base component primitives (only colors used in custom components change)
- Semantic colors (green passed, red failed, amber waiting)
