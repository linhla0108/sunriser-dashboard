# /lab Route — Redesign Implementation Plan (v2)

> **Created:** 2026-05-16 | **Updated:** 2026-05-16 (v3 — API corrections after npm/doc verification)
> **Register:** Product (ATS dashboard tool)
> **Status:** READY TO IMPLEMENT

---

## Scene (impeccable design law)

An HR coordinator at SUN.RISER, morning, MacBook Pro, bright office. 646 applicant cards to scan before a shortlisting meeting in 2 hours. She needs to filter fast, read names/GPAs clearly, and mark round 1 results without friction. Every slow hover, every missing cursor, every low-contrast label costs her time.

**Forced answers:** light theme, warm canvas, high information density, crisp Ink-on-Canvas typography, Warm Mist as the only accent background.

---

## New Libraries Added

### Anime.js v4 (`animejs@4.4.1`)

**Role:** All entrance/exit and sequential animations — replaces CSS keyframes.
**Install:** `npm install animejs`
**Import pattern (verified against v4.4.1 docs):**

```ts
import { animate, stagger } from 'animejs'
// createTimeline lives in a subpath — only import if needed:
import { createTimeline } from 'animejs/timeline'
```

**React pattern:**

```tsx
const ref = useRef<HTMLDivElement>(null)
useEffect(() => {
  if (!ref.current) return
  animate(ref.current, {
    translateX: ['420px', '0px'],
    opacity: [0, 1],
    duration: 300,
    ease: 'outCubic',
  })
}, [trigger])
```

**Used for:**
| Where | Animation | API |
|---|---|---|
| `ApplicantDrawer` open | Slide in from right | `animate(ref, { translateX, opacity })` |
| `FilterBuilder` open | Slide in from right | same |
| `ComparePanel` open | Slide in from right | same |
| `CommandPalette` open | Scale + fade from center | `animate(ref, { scale: [0.96, 1], opacity })` |
| `BulkToolbar` mount | Rise from bottom | `animate(ref, { translateY: ['100%', '0%'], opacity })` |
| `KanbanView` cards on mount | Stagger fade-in | `animate(cards, { opacity, translateY }, stagger(30))` |
| `GalleryView` cards on page change | Stagger fade-in | same |
| `ApplicantDrawer` tab switch | Content crossfade | `animate(contentRef, { opacity: [0, 1], translateY: [4, 0] })` |

**NOT used for:** hover effects (keep CSS `transition-*` — no JS event listener overhead for simple state transitions).

**`prefers-reduced-motion` rule:** All `useEffect` animations check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` before running anime.js. If true, skip animate() call — React renders the final state immediately.

---

### Skeleton React (`@skeletonlabs/skeleton-react@4.15.2`)

**Role:** Accessible, Zag.js-powered interactive components — replaces custom tab logic, modal backdrops, star ratings, pagination, popovers.
**Install:** `npm install @skeletonlabs/skeleton-react`
**Tailwind v4 compatibility:** ✅ Safe — peer deps are only `react ^18/^19` and `react-dom ^18/^19`. No Tailwind dependency at all.

**⚠️ Do NOT import Skeleton's CSS file.** The package ships `dist/index.css` which contains Skeleton's default theme styles. Importing it will conflict with our Steep design tokens and Tailwind v4 globals.

```ts
// ❌ Never add this:
import '@skeletonlabs/skeleton-react/dist/index.css'
// ✅ Only import component code:
import { Tabs, Dialog, Popover, Pagination, RatingGroup } from '@skeletonlabs/skeleton-react'
```

**Styling:** All components accept `className` props. Apply Steep tokens directly. Components are unstyled when the CSS file is not imported — we own 100% of the visual output.

**Prop note:** Component props extend Zag.js base types internally. The plan's prop usage (`value`, `onValueChange`, `open`, `onOpenChange`, `page`, `count`) matches the Zag.js API convention. If TypeScript errors appear during Phase 3, check the `Props$X` base types via IDE autocomplete.

**Replaces:**

| Component                         | What Skeleton provides                                 | Benefit over custom                                            |
| --------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------- |
| `ApplicantDrawer` tabs            | `Tabs` / `Tabs.List` / `Tabs.Trigger` / `Tabs.Content` | Accessible (ARIA roles, keyboard nav), controlled/uncontrolled |
| `ApplicantDrawer` scorecard stars | `RatingGroup`                                          | Accessible star rating with keyboard support                   |
| `ExportModal` dialog              | `Dialog` / `Dialog.Backdrop` / `Dialog.Content`        | Focus trap, ESC close, ARIA dialog                             |
| `FilterBuilder` sheet             | `Dialog`                                               | same                                                           |
| `CommandPalette`                  | `Dialog`                                               | Focus trap, backdrop click close built-in                      |
| `SavedViewsPopover`               | `Popover` / `Popover.Content`                          | Floating, auto-positioned, click-outside close                 |
| `GalleryView` pagination          | `Pagination`                                           | Accessible pagination with Zag.js                              |
| `LabTableView` pagination         | `Pagination`                                           | same                                                           |

**Styling approach:** Every Skeleton component accepts `className`. Apply Steep tokens directly:

```tsx
<Tabs.Trigger
  value="profile"
  className="cursor-pointer px-4 py-2 text-sm font-medium text-[#555555] transition-colors duration-150 data-[state=active]:border-b-2 data-[state=active]:border-[#8d1600] data-[state=active]:text-[#1b1b1b]"
>
  Profile
</Tabs.Trigger>
```

---

## Design System: Steep Tokens (already in globals.css)

| Role                             | Value                               | Use           |
| -------------------------------- | ----------------------------------- | ------------- |
| `--color-canvas` `#fcfcfc`       | Page bg, card surface               |
| `--color-ink` `#1b1b1b`          | Primary text, filled buttons        |
| `--color-muted-stone` `#555555`  | Secondary text, icons               |
| `--color-hint-of-grey` `#767676` | Placeholders only                   |
| `--color-warm-mist` `#ffdad3`    | Accent bg (hover tint, avatar bg)   |
| `--color-terracotta` `#8d1600`   | Active borders, badges, active text |
| `--color-fog` `#f9f9f9`          | Subtle section bg, inactive chip bg |
| Border default                   | `#e8e8e8`                           | Card outlines |

**No `#FF5533` anywhere in /lab.** That is the main app's primary. Terracotta (`#8d1600`) replaces it everywhere.

---

## Current AI Slop Inventory (all fixed in this plan)

| Problem                      | Root cause                                   | Fix                                                      |
| ---------------------------- | -------------------------------------------- | -------------------------------------------------------- |
| No mouse pointer             | `cursor-pointer` missing on every `<button>` | Add to all interactive elements                          |
| Flicker on hover             | No CSS `transition-*`                        | Add `transition-colors duration-150`                     |
| No drawer animation          | Renders instantly                            | anime.js slide-in on mount                               |
| No card hover feedback       | No transform/shadow change                   | CSS `hover:-translate-y-0.5 transition-all duration-200` |
| Bright alien Kanban colors   | `#4BA2FF`, `#55DB9C`, `#F9D529`, `#F76969`   | Replace with Ink / Muted Stone / Terracotta              |
| `#FF5533` bleeding into /lab | Main app primary color misused               | Replace with Terracotta throughout                       |
| Custom tab implementation    | Not accessible, no keyboard nav              | Skeleton `Tabs`                                          |
| Custom modal backdrop        | No focus trap, no ESC close                  | Skeleton `Dialog`                                        |
| Custom star rating           | Not keyboard accessible                      | Skeleton `RatingGroup`                                   |
| Custom pagination            | Duplicated in 2 components                   | Skeleton `Pagination`                                    |
| Custom popover               | No auto-positioning                          | Skeleton `Popover`                                       |
| Stale ApplicantDrawer state  | `useState` lazy init runs once               | `useEffect` sync on `applicant?.id`                      |

---

## Phase 0 — Security Blockers from /ship (fix FIRST, no skipping)

### B1: `javascript:` URI — ApplicantDrawer portfolio link

**File:** `src/app/lab/components/ApplicantDrawer.tsx`

```tsx
const safePortfolio = a.portfolio && /^https?:\/\//i.test(a.portfolio) ? a.portfolio : undefined
// Render: {safePortfolio && <a href={safePortfolio} rel="noreferrer noopener" ...>}
```

### B2: CSV quote-escaping — ExportModal

**File:** `src/app/lab/components/ExportModal.tsx`

```ts
const str = String(val ?? '')
const escaped = str.replace(/"/g, '""')
return escaped.includes(',') || escaped.includes('"') ? `"${escaped}"` : escaped
```

### B3: Write `formatLine()` unit tests

**Files:** `src/components/chat/FloatingChat.tsx` + create `src/components/chat/__tests__/FloatingChat.test.tsx`

**Step 1 — export the function** (it's currently private):

```ts
// FloatingChat.tsx — add export keyword
export function formatLine(line: string): React.ReactNode[] {
```

**Step 2 — write 5 tests:** plain text → returns string, single bold `**x**` → wraps in `<strong>`, multiple bold spans → each wrapped, XSS payload `**<img onerror=alert(1)>**` → renders as literal text inside `<strong>` (React escapes it), unclosed marker `**foo` → returned as literal string (no crash).

### B4: ApplicantDrawer stale state

**File:** `src/app/lab/components/ApplicantDrawer.tsx`

The file currently only imports `useState` — add `useEffect` to the import.

```ts
// Add useEffect to existing React import
import { useState, useEffect } from 'react'

// Add inside the component, after the existing useState declarations:
useEffect(() => {
  setLocalSc(scorecard ?? { cvQuality: 0, experience: 0, gpaScore: 0, communication: 0, notes: '' })
  setTab('profile')
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [applicant?.id])
// Intentionally excludes `scorecard` from deps — we only want to reset on applicant change,
// not on every scorecard update (which would discard in-progress star ratings).
```

### B5: `readOnly` prop for main page.tsx context

**File:** `src/app/lab/components/ApplicantDrawer.tsx` + `src/app/page.tsx`
Add `readOnly?: boolean`. When true: only show Profile tab (hide Scorecard + Timeline).

**Verify Phase 0:** `npm test` — all existing 206 tests + 5 new FloatingChat tests pass.

---

## Phase 1 — Install Libraries

```bash
npm install animejs @skeletonlabs/skeleton-react
```

Add anime.js TypeScript types check:

```bash
npx tsc --noEmit
```

If types error: `npm install --save-dev @types/animejs` (check if needed — v4 ships its own types).

Add a reduced-motion utility to `src/app/lab/lab-utils.ts`:

```ts
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}
```

**Verify Phase 1:** `npx tsc --noEmit` clean, `npm test` still 211+ passing.

---

## Phase 2 — Steep Color Alignment

Replace all `#FF5533` / orange primary in /lab components:

**LabHeader:**

- BETA badge: `bg-[#8d1600] text-[#ffdad3]`
- Active filter border: `border-[#8d1600] bg-[#ffdad3] text-[#8d1600]`
- Filter count badge: `bg-[#8d1600]`
- Search focus: `focus:border-[#1b1b1b]`
- Inactive view button text: `text-[#767676]` → `text-[#555555]`

**KanbanView column accent colors** (replace bright colors entirely):
| Column | Old | New header text | New count badge |
|---|---|---|---|
| New | `#4BA2FF` | `text-[#1b1b1b]` | `bg-[#1b1b1b] text-[#fcfcfc]` |
| Passed | `#55DB9C` | `text-[#8d1600]` | `bg-[#ffdad3] text-[#8d1600]` |
| Waitlisted | `#F9D529` | `text-[#555555]` | `bg-[#f9f9f9] text-[#555555]` |
| Rejected | `#F76969` | `text-[#555555]` | `bg-[#f9f9f9] text-[#555555]` |
| Round 2 | `#FF5533` | `text-[#1b1b1b]` | `bg-[#1b1b1b] text-[#fcfcfc]` |

**Round1 badges** (LabTableView, ApplicantDrawer):

- Passed: `bg-[#ffdad3] text-[#8d1600]`
- Failed: `bg-[#f9f9f9] text-[#555555]`
- Waiting list: `bg-[#f9f9f9] text-[#555555]`

**QuickFilters chips:**

- Active: `bg-[#1b1b1b] text-[#fcfcfc]` (Ink pill)
- Inactive: `bg-[#f9f9f9] text-[#555555] hover:bg-[#ffdad3]/40`

**GalleryView:**

- Selected card border: `border-[#8d1600]` not `#FF5533`
- Avatar bg: `bg-[#ffdad3]`, avatar text: `text-[#8d1600]`

**FunnelStats:**

- Replace any `#FF5533` bar color with `#8d1600`

**Verify Phase 2:** `npx tsc --noEmit`, `npm run format`.

---

## Phase 3 — Skeleton Component Integration

Work component by component. After each component: run `npm test` and fix any broken assertions to match the new Skeleton HTML structure.

### 3.1 ApplicantDrawer — Tabs + RatingGroup

**Confirmed Skeleton sub-components (from v4.15.2 types):**

- `Tabs` → `Tabs.List`, `Tabs.Trigger`, `Tabs.Indicator`, `Tabs.Content`
- `RatingGroup` → `RatingGroup.Label`, `RatingGroup.Control`, `RatingGroup.Item`, `RatingGroup.HiddenInput`

**Replace custom tab implementation with Skeleton Tabs:**

```tsx
import { Tabs } from '@skeletonlabs/skeleton-react'

<Tabs value={tab} onValueChange={(v) => setTab(v as DrawerTab)}>
  <Tabs.List className="mt-3 flex gap-1 border-b border-[#f0f0f0]">
    {visibleTabs.map((t) => (
      <Tabs.Trigger
        key={t}
        value={t}
        className="cursor-pointer h-8 rounded-t px-3 text-xs font-semibold capitalize text-[#555555] transition-colors duration-150 data-[selected]:text-[#1b1b1b] data-[selected]:border-b-2 data-[selected]:border-[#8d1600] data-[selected]:-mb-px"
      >
        {t}
      </Tabs.Trigger>
    ))}
  </Tabs.List>
  <Tabs.Content value="profile"><ProfileTab {...} /></Tabs.Content>
  {!readOnly && <Tabs.Content value="scorecard"><ScorecardTab {...} /></Tabs.Content>}
  {!readOnly && <Tabs.Content value="timeline"><TimelineTab {...} /></Tabs.Content>}
</Tabs>
```

**Skeleton active state attribute:** Zag.js uses `data-selected` (not `data-state=active`) for the active trigger. Use `data-[selected]:` Tailwind variant.

**Replace star rating with Skeleton RatingGroup:**

```tsx
import { RatingGroup } from '@skeletonlabs/skeleton-react'

// Each criterion row — replaces the manual [1,2,3,4,5].map() buttons:
;<RatingGroup value={localSc[key]} onValueChange={(v) => handleScoreChange(key, v)} count={5}>
  <RatingGroup.Control className="flex gap-1">
    {[1, 2, 3, 4, 5].map((i) => (
      <RatingGroup.Item
        key={i}
        index={i}
        className="flex h-8 flex-1 cursor-pointer items-center justify-center rounded-xl bg-[#f9f9f9] text-[#c0c0c0] transition-colors duration-150 data-[highlighted]:bg-[#8d1600] data-[highlighted]:text-white"
      >
        <Star size={13} />
      </RatingGroup.Item>
    ))}
  </RatingGroup.Control>
  <RatingGroup.HiddenInput />
</RatingGroup>
```

**Note:** `data-highlighted` is the Zag.js attribute for filled/active stars in RatingGroup. Verify at runtime — may be `data-checked` or `data-selected` depending on version.

**Update ApplicantDrawer.test.tsx:** After Skeleton integration, `screen.getByRole('tab', { name: 'profile' })` works (ARIA tabs). Update existing click assertions to use ARIA queries.

### 3.2 ExportModal — Dialog

**Confirmed Skeleton sub-components:** `Dialog.Trigger`, `Dialog.Backdrop`, `Dialog.Positioner`, `Dialog.Content`, `Dialog.Title`, `Dialog.Description`, `Dialog.CloseTrigger`

**Replace custom backdrop/close with Skeleton Dialog:**

```tsx
import { Dialog } from '@skeletonlabs/skeleton-react'

;<Dialog
  open={open}
  onOpenChange={(isOpen) => {
    if (!isOpen) onClose()
  }}
>
  <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/20" />
  <Dialog.Positioner className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <Dialog.Content
      aria-label="Export applicants"
      className="w-full max-w-[460px] rounded-3xl bg-white p-5"
      style={{ boxShadow: '0 24px 64px rgba(4,23,43,0.16)' }}
    >
      {/* existing modal body — remove the manual <div onClick={onClose}> backdrop */}
    </Dialog.Content>
  </Dialog.Positioner>
</Dialog>
```

Benefits: focus trap, ESC closes, backdrop click closes, ARIA `role="dialog"`. Note `Dialog.Positioner` wraps `Dialog.Content` — this is the Zag.js pattern (not `Dialog.Content` directly inside `Dialog`).

### 3.3 FilterBuilder — Dialog

Same Dialog pattern. The slide-in animation (Phase 4) is applied to the inner content div inside `Dialog.Content`, not the Dialog wrapper itself.

### 3.4 CommandPalette — Dialog

Same Dialog pattern. The panel scales + fades in (Phase 4 anime.js). The `Dialog.Positioner` centers it; anime.js animates the `Dialog.Content` inner div.

### 3.5 SavedViewsPopover — Popover

**Confirmed Skeleton sub-components:** `Popover.Trigger`, `Popover.Positioner`, `Popover.Content`, `Popover.Arrow`, `Popover.ArrowTip`, `Popover.CloseTrigger`

```tsx
import { Popover } from '@skeletonlabs/skeleton-react'

;<Popover
  open={open}
  onOpenChange={(isOpen) => {
    if (!isOpen) onClose()
  }}
>
  <Popover.Trigger asChild>
    <button ref={saveViewAnchorRef} className="...existing bookmark button...">
      <Bookmark size={15} />
    </button>
  </Popover.Trigger>
  <Popover.Positioner>
    <Popover.Content
      className="z-50 w-72 rounded-3xl bg-white p-4"
      style={{ boxShadow: '0 8px 32px rgba(4,23,43,0.12)' }}
    >
      {/* existing popover body unchanged */}
    </Popover.Content>
  </Popover.Positioner>
</Popover>
```

Note: `Popover.Positioner` wraps `Popover.Content` — same Zag.js nesting pattern as Dialog. Auto-positioned via floating-ui; click-outside closes automatically.

### 3.6 GalleryView + LabTableView — Pagination

**Confirmed Skeleton sub-components:** `Pagination.FirstTrigger`, `Pagination.PrevTrigger`, `Pagination.Item`, `Pagination.Ellipsis`, `Pagination.NextTrigger`, `Pagination.LastTrigger`

```tsx
import { Pagination } from '@skeletonlabs/skeleton-react'

;<Pagination page={page} count={totalPages} onPageChange={(details) => setPage(details.page)}>
  <Pagination.PrevTrigger className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[#555555] transition-colors duration-150 hover:bg-[#f9f9f9] disabled:opacity-40">
    <ChevronLeft size={14} />
  </Pagination.PrevTrigger>
  <Pagination.Item className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-sm text-[#555555] transition-colors duration-150 hover:bg-[#f9f9f9] data-[selected]:bg-[#1b1b1b] data-[selected]:text-white" />
  <Pagination.Ellipsis className="flex h-8 w-8 items-center justify-center text-[#767676]">
    …
  </Pagination.Ellipsis>
  <Pagination.NextTrigger className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[#555555] transition-colors duration-150 hover:bg-[#f9f9f9] disabled:opacity-40">
    <ChevronRight size={14} />
  </Pagination.NextTrigger>
</Pagination>
```

**Note:** `onPageChange` receives a `details` object — use `details.page` not a raw number.

**Update GalleryView.test.tsx and LabTableView.test.tsx:** Pagination assertions change from text `'← Prev'` / `'Next →'` to ARIA queries (`getByRole('button', { name: 'previous page' })` etc.).

**Verify Phase 3:** `npm test` — all tests pass (updated to match Skeleton HTML). `npx tsc --noEmit` clean.

---

## Phase 4 — Anime.js Animation Layer

All animations respect `prefersReducedMotion()` — skip animate() if true.

### 4.1 ApplicantDrawer — slide-in from right

```tsx
import { animate } from 'animejs'
import { prefersReducedMotion } from '../lab-utils'

const panelRef = useRef<HTMLDivElement>(null)
const backdropRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  if (!applicant || !panelRef.current) return
  if (prefersReducedMotion()) return
  animate(panelRef.current, {
    translateX: ['420px', '0px'],
    opacity: [0, 1],
    duration: 300,
    ease: 'outCubic',
  })
  animate(backdropRef.current!, { opacity: [0, 1], duration: 200 })
}, [applicant?.id])
```

### 4.2 FilterBuilder + ComparePanel — slide-in from right (same pattern)

```tsx
useEffect(() => {
  if (!open || !panelRef.current || prefersReducedMotion()) return
  animate(panelRef.current, {
    translateX: ['100%', '0%'],
    duration: 280,
    ease: 'outCubic',
  })
}, [open])
```

### 4.3 CommandPalette — scale + fade from center

```tsx
useEffect(() => {
  if (!open || !panelRef.current || prefersReducedMotion()) return
  animate(panelRef.current, {
    scale: [0.96, 1],
    opacity: [0, 1],
    duration: 200,
    ease: 'outCubic',
  })
}, [open])
```

### 4.4 BulkToolbar — rise from bottom on first selection

```tsx
const toolbarRef = useRef<HTMLDivElement>(null)
const prevCount = useRef(0)

useEffect(() => {
  if (
    selectedCount > 0 &&
    prevCount.current === 0 &&
    toolbarRef.current &&
    !prefersReducedMotion()
  ) {
    animate(toolbarRef.current, {
      translateY: ['64px', '0px'],
      opacity: [0, 1],
      duration: 250,
      ease: 'outCubic',
    })
  }
  prevCount.current = selectedCount
}, [selectedCount])
```

### 4.5 KanbanView — stagger card entrance on mount

```tsx
import { animate, stagger } from 'animejs'

const columnRef = useRef<HTMLDivElement>(null)
useEffect(() => {
  if (!columnRef.current || prefersReducedMotion()) return
  const cards = columnRef.current.querySelectorAll<HTMLElement>('.kanban-card')
  if (!cards.length) return
  animate(cards, {
    opacity: [0, 1],
    translateY: [8, 0],
    duration: 220,
    delay: stagger(25, { start: 50 }),
  })
}, []) // Mount only — not on every filter change
```

Apply `className="kanban-card ..."` to each card div.

### 4.6 GalleryView — stagger on page change

```tsx
const gridRef = useRef<HTMLDivElement>(null)
useEffect(() => {
  if (!gridRef.current || prefersReducedMotion()) return
  const cards = gridRef.current.querySelectorAll<HTMLElement>('.gallery-card')
  animate(cards, {
    opacity: [0, 1],
    translateY: [12, 0],
    duration: 250,
    delay: stagger(20),
  })
}, [page]) // Runs on every page change
```

Apply `className="gallery-card ..."` to each card div.

### 4.7 ApplicantDrawer — tab content crossfade

```tsx
const contentRef = useRef<HTMLDivElement>(null)
useEffect(() => {
  if (!contentRef.current || prefersReducedMotion()) return
  animate(contentRef.current, {
    opacity: [0, 1],
    translateY: [4, 0],
    duration: 150,
    ease: 'outQuad',
  })
}, [tab])
```

**Verify Phase 4:** `npm test` — 211+ tests pass. Animations don't affect test assertions (DOM structure unchanged, classes unchanged). `npx tsc --noEmit` clean.

---

## Phase 5 — CSS Hover Baseline (Tailwind, no JS)

Simple hover states: keep as CSS. Add `cursor-pointer` and `transition-*` to every interactive element. Done per-component alongside Phase 3/4 edits.

**Global rules for /lab:**

- Every `<button>`: `cursor-pointer transition-colors duration-150`
- Every `<Link>`: `cursor-pointer transition-colors duration-150`
- Every clickable `<tr>` / `<div>` card: `cursor-pointer transition-all duration-200`
- Card hover lift: `hover:-translate-y-0.5 hover:shadow-md` (KanbanView), `hover:-translate-y-1 hover:shadow-lg` (GalleryView)
- Row hover: `hover:bg-[#ffdad3]/20`
- Input focus: `focus:border-[#1b1b1b] focus:outline-none transition-colors duration-150`
- Chip/button active state: smooth with `transition-colors duration-150`

---

## Phase 6 — Typography Tightening

Per component, tighten these specifically:

- Applicant name text: add `tracking-tight` (approx `-0.009em`)
- Column headers in LabTableView: `text-[#555555]` (from `#767676`)
- Any data value (GPA number, batch number): upgrade from `#767676` to `#555555`
- Card position badges: `text-xs font-semibold tracking-wide`
- LabHeader title "Lab": `tracking-tight`
- Section labels (e.g., "PROFILE", "SCORECARD"): `tracking-widest text-[#555555]`

The `#767676` value stays only for: placeholder text, disabled elements, timestamps.

---

## Phase 7 — Verify

```bash
npm test          # must show 211+ tests passing (206 existing + 5 new FloatingChat)
npx tsc --noEmit  # must be clean
npm run format    # Tailwind class sort + Prettier
```

If any test breaks: fix the test to match new Skeleton component HTML structure. Do not remove assertions — rewrite them to use ARIA queries (`getByRole('tab')`, `getByRole('dialog')`, etc.) instead of text matching brittle class names.

---

## Implementation Order

```
Phase 0  →  Phase 1  →  Phase 2  →  Phase 3  →  Phase 4  →  Phase 5  →  Phase 6  →  Phase 7
(blockers)  (install)   (colors)   (skeleton)  (animejs)   (hover CSS) (type)     (verify)
```

Each phase ends with `npx tsc --noEmit` before moving on.
Phase 3 components: after each one, run `npm test` to catch test regressions immediately.

---

## Success Criteria

- [ ] Every clickable element shows `cursor: pointer`
- [ ] All hover states have CSS transitions (no flicker)
- [ ] ApplicantDrawer slides in from right via anime.js (300ms outCubic)
- [ ] Kanban cards stagger-fade on mount via anime.js
- [ ] Gallery cards stagger on page change via anime.js
- [ ] BulkToolbar rises from bottom via anime.js
- [ ] No `#FF5533` anywhere in /lab
- [ ] Kanban uses Steep palette (Ink / Terracotta / Muted Stone)
- [ ] ApplicantDrawer tabs use Skeleton `Tabs` (keyboard accessible, ARIA)
- [ ] Scorecard uses Skeleton `RatingGroup` (accessible star rating)
- [ ] ExportModal / FilterBuilder / CommandPalette use Skeleton `Dialog` (focus trap)
- [ ] SavedViewsPopover uses Skeleton `Popover` (auto-positioned)
- [ ] GalleryView + LabTableView pagination use Skeleton `Pagination`
- [ ] All 5 /ship blockers resolved
- [ ] 211+ tests passing
- [ ] TypeScript clean
- [ ] Prettier formatted
- [ ] `prefers-reduced-motion` respected — no anime.js runs when user has motion disabled

---

## What Does NOT Change

- `/` main dashboard — untouched
- `globals.css` token values — untouched
- All 15 /lab feature logic and state — untouched
- Component props/interfaces — only additive changes (`readOnly`, `className` on Skeleton wrappers)

---

## Risk Notes

| Risk                                                                      | Mitigation                                                                                                              |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Skeleton component HTML differs from custom → test failures               | Update test assertions to use ARIA queries after each Phase 3 component                                                 |
| Anime.js SSR — `window` not available                                     | All anime.js calls inside `useEffect` (client-only). `prefersReducedMotion()` guards `window` access.                   |
| Skeleton Popover auto-positioning overlaps viewport edge                  | Skeleton/Zag.js handles this automatically with floating-ui                                                             |
| Skeleton CSS file injected accidentally                                   | Do NOT import `@skeletonlabs/skeleton-react/dist/index.css`. Only import component functions.                           |
| RatingGroup active state attribute — `data-highlighted` vs `data-checked` | Render once in dev and inspect the DOM to confirm the exact Zag.js attribute before writing CSS                         |
| `Pagination.onPageChange` receives object not number                      | `onPageChange={(details) => setPage(details.page)}` — not `onPageChange={setPage}`                                      |
| Dialog.Content must be inside Dialog.Positioner                           | Both Dialog and Popover use a Positioner wrapper — `Root → Positioner → Content`. Skip Positioner = broken positioning. |
| `formatLine` not exported — B3 tests will fail to import                  | Export `formatLine` from `FloatingChat.tsx` as the first step of B3.                                                    |
