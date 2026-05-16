> **STATUS: COMPLETED** — Implemented 2026-05-16. FloatingChat, GlobalDropZone, MobileBottomNav, responsive sidebar/layout, data-cid labels — all shipped.

# Design Spec: UX Layout Overhaul

> Builds on: `docs/superpowers/specs/2026-05-16-design-system-rebrand-design.md`
> Font/color tokens (#FF5533, Proxima Nova) are already applied. This spec covers layout restructure, new components, spacing/contrast system, and responsive design.

---

## Scope

**In scope:**

- Remove `upload` + `chat` from sidebar nav and View type
- `FloatingChat` — global fixed chat panel, bottom-right
- `GlobalDropZone` — global file drop interceptor with popup card
- `TopBar` — permanent "Create Report" + "Export Data" actions
- Spacing, typography, and contrast system normalization
- `data-cid` labels on all key containers
- Responsive layout: mobile (bottom nav) + tablet (icon sidebar)

**Out of scope:**

- Real LLM integration
- Report generation / export logic (buttons are placeholder UI)
- Dark mode
- File data injection into table (pre-existing known limitation)

---

## 1. Architecture

### 1.1 View Type

```ts
// Before
type View = 'dashboard' | 'table' | 'upload' | 'chat'

// After
type View = 'dashboard' | 'table'
```

### 1.2 Root Layout (`src/app/page.tsx`)

```
page.tsx  (activeView: 'dashboard' | 'table')
  GlobalDropZone                 ← wraps everything, intercepts drops
    <div class="flex h-screen">
      Sidebar                    ← 2 nav items only
      <main>
        TopBar                   ← always has action buttons
        [activeView render]
          dashboard → StatsCard × 4 + OverviewCharts
          table     → ApplicantTable
    FloatingChat                 ← fixed, outside main flow
```

`GlobalDropZone` and `FloatingChat` are siblings inside the root `div`. Both are always mounted — they hold their own local state.

### 1.3 New Files

| Path                                       | Purpose                                              |
| ------------------------------------------ | ---------------------------------------------------- |
| `src/components/chat/FloatingChat.tsx`     | New — wraps existing ChatBox logic as floating panel |
| `src/components/upload/GlobalDropZone.tsx` | New — document-level drop listener + popup card      |

### 1.4 Deleted/Retired

| Path                                   | Action                                             |
| -------------------------------------- | -------------------------------------------------- |
| `src/components/upload/UploadZone.tsx` | Keep — parsing logic imported by `GlobalDropZone`  |
| `src/components/chat/ChatBox.tsx`      | Retire — inner panel logic moves to `FloatingChat` |
| `upload` view in `page.tsx`            | Removed                                            |

---

## 2. GlobalDropZone

### 2.1 Trigger

- Attaches `dragover` + `drop` listeners to `document` on mount (removed on unmount)
- Activates on any file drop anywhere on the page
- Accepts: `.xlsx .xls .csv .tsv .json`
- Ignores drops from within the popup itself (prevent re-trigger)

### 2.2 States

```
idle         → invisible
dragging     → full-screen backdrop (rgba(0,0,0,0.35)) + centered drop hint text
processing   → backdrop stays, spinner card
popup-open   → backdrop stays, popup card visible
error        → popup card with error message
```

Backdrop click while in `popup-open` → close without analyzing.
`Escape` key → close.

### 2.3 Popup Card

Reuses existing card style: `bg-white rounded-3xl p-6 space-y-5`.
Width: `max-w-[480px] w-full`. Centered via `fixed inset-0 flex items-center justify-center`.

```
data-cid="drop-zone-popup"

┌─────────────────────────────────────────────┐
│ [FileIcon 32px]  filename.xlsx          [✕] │  ← close button top-right
│                  1.2 MB · 646 rows           │
│                  20 columns detected         │
├─────────────────────────────────────────────┤
│ COLUMNS DETECTED                             │
│ [col1][col2][col3][col4][col5]               │
│ [col6][col7][col8][col9] [+12 more ▸]        │  ← expands inline
├─────────────────────────────────────────────┤
│ Don't see your column?                       │
│ ┌──────────────────────────────────┐  [+ ]  │
│ │ Filter or add column name...     │        │
└─────────────────────────────────────────────┘
│ [Analyze in Table ──────────────] [Clear]   │
└─────────────────────────────────────────────┘
```

### 2.4 Column Filter + Add Input

- Text input filters the displayed column pills in real-time (case-insensitive substring match)
- `[+]` button: if input matches an existing column → highlight it; if no match → adds it as a custom tag (visually distinct, e.g. dashed border + primary color)
- `[+12 more ▸]` button: expands the collapsed pills list to show all columns. Label becomes `[▴ collapse]`
- Custom-added columns are shown alongside detected columns; they don't affect actual parse logic (future: could be used to map/alias columns)

### 2.5 "Analyze" Action

Calls `onAnalyze()` which sets `activeView = 'table'`. Popup closes. Parsed data flows into table (future — noted as known limitation for now, consistent with pre-existing behavior).

---

## 3. FloatingChat

### 3.1 Collapsed State

```
data-cid="chat-trigger"

Fixed: bottom-24 right-6 (bottom-6 on desktop, above bottom-nav on mobile)
  w-14 h-14 rounded-full bg-[#FF5533] shadow-lg
  Bot icon (white, 20px)
  Unread badge (future — not in scope now)
```

### 3.2 Open Panel

```
data-cid="chat-panel"

Fixed: bottom-24 right-6, above the trigger button
  w-[380px] h-[560px] bg-white rounded-3xl
  shadow: rgba(4,23,43,0.08) 0px 0px 0px 1px + heavy drop shadow
  overflow: hidden
  animation: slide up + fade in (150ms ease-out)

┌─────────────────────────────────┐
│ SUN.RISER AI    [context ⊞] [✕]│  data-cid="chat-panel-header"
│ ● Connected: 2026.xlsx          │
├─────────────────────────────────┤
│                                 │
│  [message thread — scrollable]  │  data-cid="chat-messages"
│                                 │
├─────────────────────────────────┤  ← collapsible Data Context
│ ▴ DATA CONTEXT                  │  data-cid="chat-context-panel"
│ SUN.RISER 2026.xlsx  646 rows   │
│ Batch 1 · Batch 2 · Batch 3     │
│ Suggested: [query1] [query2]... │
├─────────────────────────────────┤
│ [textarea]             [Send ▶] │  data-cid="chat-input-bar"
└─────────────────────────────────┘
```

### 3.3 Data Context Panel

- Toggle via `[⊞]` icon button in header (or chevron `▴/▾` in the section label)
- Collapsed by default on first open; state remembered via `useState`
- When collapsed: input bar moves up, message thread gains ~120px height

### 3.4 State Persistence

- Messages, input text, and context-panel open/closed state persist in `useState` inside `FloatingChat` — survive panel open/close toggles (component stays mounted)
- Reset on page refresh (consistent with existing behavior, no persistence required)

---

## 4. Sidebar

### 4.1 Desktop (≥ 1024px)

Unchanged width (240px). Remove `upload` and `chat` nav items. Only:

- Dashboard (`LayoutDashboard`)
- Table (`Table2`)

Remove `Upload` import from `lucide-react`.

### 4.2 Tablet (640px–1023px)

Icon-only mode: `w-16` (64px). No labels. Tooltip on hover (`title` attribute).
Active item: icon background `bg-[#FF5533]` circle, no text.
Logo: show only first letter "S" or sun icon.

### 4.3 Mobile (< 640px)

Sidebar hidden. Replaced by **bottom navigation bar**:

```
data-cid="mobile-bottom-nav"
Fixed bottom-0, full width, h-16
bg-white border-t border-[#f9f9f9]
2 items centered: [Dashboard] [Table]
Active: #FF5533 icon + label. Inactive: #767676
```

Chat trigger moves to `bottom-[72px] right-4` on mobile (above the nav bar).

---

## 5. TopBar

### 5.1 Action Buttons (always present)

```tsx
// page.tsx passes this to TopBar for all views:
actions={
  <>
    <button data-cid="btn-export-data">Export Data</button>
    <button data-cid="btn-create-report">Create Report</button>
  </>
}
```

**Export Data** — secondary style: `h-9 px-4 rounded-full border border-[#1b1b1b] text-[#1b1b1b] text-sm font-semibold hover:bg-[#f9f9f9]`

**Create Report** — primary style: `h-9 px-4 rounded-full bg-[#FF5533] text-white text-sm font-semibold hover:bg-[#E63D1F]`

Both are `onClick={() => {}}` placeholder for now.

### 5.2 Mobile TopBar

On mobile (< 640px): hide subtitle. Show only title + a single `⋮` overflow menu button that reveals Export + Create Report in a dropdown. This avoids cramping the narrow header.

---

## 6. Typography & Spacing System

### 6.1 Type Scale (add to `globals.css @theme`)

```css
--text-display: 36px; /* StatsCard values */
--text-h1: 22px; /* Page title */
--text-h2: 15px; /* Card section headings */
--text-label: 11px; /* Uppercase section labels */
--text-body: 14px; /* Default text */
--text-small: 12px; /* Captions, timestamps, badges */
--text-mono: 12px; /* Monospace numbers, codes */

--weight-bold: 700;
--weight-semi: 600;
--weight-medium: 500;
--weight-normal: 400;
```

Apply consistently — replace all scattered `text-xs/sm/2xl/4xl` that don't match the scale.

### 6.2 Contrast Fixes

All text colors that fail WCAG AA on `#FCFCFC`:

| Old color | New color | Ratio   | Applied to                                |
| --------- | --------- | ------- | ----------------------------------------- |
| `#8f7069` | `#6B5549` | 5.1:1 ✓ | Subtitles, sidebar subtitle, muted labels |
| `#a3a6af` | `#767676` | 4.6:1 ✓ | Timestamps, placeholder text              |

Exception: `#a3a6af` is kept for decorative-only elements (version dot, drag handle icon) where text meaning is not conveyed by color alone.

### 6.3 Spacing Normalization

| Location              | Old                        | New              |
| --------------------- | -------------------------- | ---------------- |
| Page padding          | `p-8`                      | `px-8 py-6`      |
| TopBar bottom margin  | `mb-8`                     | `mb-6`           |
| Stats grid gap        | `gap-5`                    | `gap-6`          |
| Charts grid gap       | `gap-5`                    | `gap-6`          |
| Card internal padding | varies (`p-5`/`p-6`)       | `p-6` everywhere |
| Sidebar nav gap       | `space-y-1`                | `space-y-0.5`    |
| Sidebar px            | `px-3` nav / `px-6` header | keep             |

---

## 7. Responsive Design

### 7.1 Breakpoints

Using Tailwind v4 defaults:

- `sm`: 640px (tablet lower bound)
- `lg`: 1024px (desktop lower bound)

### 7.2 Layout Containers

```
Mobile  (<640px):  sidebar hidden, bottom-nav, main w-full px-4 py-4
Tablet  (640–1023): sidebar w-16, main ml-16 px-6 py-5
Desktop (≥1024px): sidebar w-[240px], main ml-[240px] px-8 py-6
```

### 7.3 Content Grids

| Component      | Mobile        | Tablet        | Desktop       |
| -------------- | ------------- | ------------- | ------------- |
| StatsCard grid | `grid-cols-2` | `grid-cols-2` | `grid-cols-4` |
| OverviewCharts | `grid-cols-1` | `grid-cols-1` | `grid-cols-2` |
| Chart height   | `h-[160px]`   | `h-[200px]`   | `h-[220px]`   |

### 7.4 ApplicantTable — Responsive Columns

Mobile hides: `Batch`, `Year`, `PIC`, `GPA`. Shows: Name/Email, Position, Round1.
Tablet hides: `PIC`, `Year`. Shows all others.
Desktop: all columns (current behavior).

Implemented via `hidden sm:table-cell` / `hidden lg:table-cell` Tailwind classes on `<th>` and `<td>`.

### 7.5 FloatingChat — Mobile Behavior

On mobile, when panel opens: panel becomes `fixed inset-0` (full screen), with header showing close `[✕]` button. Closes on `[✕]` or `Escape`. Same internal layout.

### 7.6 GlobalDropZone — Mobile Behavior

On mobile: popup card changes from centered modal to a **bottom sheet**:

- `fixed bottom-0 left-0 right-0`
- `rounded-t-3xl` (top corners only)
- `max-h-[80vh] overflow-y-auto`
- Slide up animation (translate-y from 100% to 0, 200ms)

Drag-to-dismiss: swipe down closes (native `touch` event or simple close button).

---

## 8. Component Labels (`data-cid`)

Every key container gets `data-cid` for direct referencing:

| Component               | `data-cid` value                                                         |
| ----------------------- | ------------------------------------------------------------------------ |
| Sidebar                 | `sidebar`                                                                |
| Sidebar nav (each item) | `nav-item-dashboard`, `nav-item-table`                                   |
| Mobile bottom nav       | `mobile-bottom-nav`                                                      |
| TopBar                  | `topbar`                                                                 |
| Export Data button      | `btn-export-data`                                                        |
| Create Report button    | `btn-create-report`                                                      |
| StatsCard (each)        | `stats-total`, `stats-passed`, `stats-rate`, `stats-gpa`                 |
| Chart cards             | `chart-by-position`, `chart-round1`, `chart-by-batch`, `chart-discovery` |
| ApplicantTable          | `applicant-table`                                                        |
| Table search input      | `table-search`                                                           |
| FloatingChat trigger    | `chat-trigger`                                                           |
| FloatingChat panel      | `chat-panel`                                                             |
| Chat panel header       | `chat-panel-header`                                                      |
| Chat message thread     | `chat-messages`                                                          |
| Chat data context       | `chat-context-panel`                                                     |
| Chat input bar          | `chat-input-bar`                                                         |
| GlobalDropZone backdrop | `drop-zone-backdrop`                                                     |
| GlobalDropZone popup    | `drop-zone-popup`                                                        |
| Drop zone column input  | `drop-zone-col-input`                                                    |

---

## 9. Files Changed

| File                                          | Change type                                                                                 |
| --------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `src/app/globals.css`                         | Add type scale tokens, update contrast colors                                               |
| `src/app/page.tsx`                            | Remove `upload`/`chat` views, add `FloatingChat` + `GlobalDropZone`, pass actions to TopBar |
| `src/components/layout/Sidebar.tsx`           | Remove upload/chat nav, add tablet icon-only mode, add mobile hide                          |
| `src/components/layout/TopBar.tsx`            | Pass-through actions slot already exists — update mobile behavior                           |
| `src/components/layout/MobileBottomNav.tsx`   | **New** — mobile nav bar                                                                    |
| `src/components/chat/FloatingChat.tsx`        | **New** — floating panel wrapping ChatBox logic                                             |
| `src/components/chat/ChatBox.tsx`             | Retire (logic absorbed into FloatingChat)                                                   |
| `src/components/upload/GlobalDropZone.tsx`    | **New** — global drop handler + popup                                                       |
| `src/components/upload/UploadZone.tsx`        | Keep for parsing utilities (no visual changes)                                              |
| `src/components/dashboard/StatsCard.tsx`      | Spacing + contrast updates, `data-cid`                                                      |
| `src/components/dashboard/OverviewCharts.tsx` | Spacing + responsive height, `data-cid`                                                     |
| `src/components/table/ApplicantTable.tsx`     | Responsive column hiding, `data-cid`                                                        |
| `src/components/table/DraggableRow.tsx`       | Responsive column hiding (td)                                                               |
| `src/components/layout/TopBar.tsx`            | Mobile overflow menu for actions                                                            |

---

## 10. What Does NOT Change

- Border radii system (24px cards, pill buttons, 16px inputs)
- Shadow values (Steep layered shadow)
- Color tokens (#FF5533 primary, position accent palette)
- Proxima Nova font loading
- DnD functionality in ApplicantTable
- File parsing logic in UploadZone
- Mock data and all static data
- shadcn/ui base component primitives
- Semantic colors (green passed, red failed, amber waiting)
- Chat mock responses (still hard-coded, no real LLM)
