# Code Review Report — V2 Candidate Views, Drawers, and Compare

**Reviewed by:** Automated Claude agent (scheduled task)
**Date:** 2026-05-19
**Branch:** `codex/v2-workspace-plan`
**Primary commit under review:** [`c6541c6`](.) — `feat(v2): add candidate views drawers and compare` (40 files, +1,912 / −29)
**Earlier reviewed commits:** see [CODE_REVIEW.md](CODE_REVIEW.md) (covers commits through `7848158`)
**Stack:** Next.js 16 · React 19 · TypeScript 5 · Tailwind CSS v4 · shadcn/ui · @dnd-kit · Recharts · Zod · Vitest

**Toolchain status:**

| Tool | Command | Result |
|---|---|---|
| TypeScript | `npx tsc --noEmit` | ✅ no errors |
| ESLint | `npm run lint` | ✅ clean |
| Vitest | `npm test` | ✅ 248/248 passing across 34 files |
| Tests added in this commit | — | 7 new specs (AiDrawer, NotesDrawer, ViewPillNav, PipelineGallery, TableView, useViewState, usePinned) |

---

## Summary

| Priority | New in this review | Carry-over (unresolved from 2026-05-18) |
|----------|--------------------|-----------------------------------------|
| 🔴 Critical | 3 | 2 |
| 🟠 High | 8 | 5 |
| 🟡 Medium | 12 | 4 |
| 🔵 Low / Housekeeping | 7 | 2 |

The new code passes typecheck, lint, and the existing test bar, but ships several behavioural bugs that the tests do not yet exercise (cross-column drag, number-key hijacking, stale-prop pattern repeated in three new views, mis-ordered chart aggregations).

---

## 🔴 Critical

### C-1 · Pipeline drag-across-columns is a silent no-op
[`src/components/v2/views/PipelineView.tsx:25-35`](src/components/v2/views/PipelineView.tsx)

```ts
const [items, setItems] = useState(data)
const columns = useMemo(() => groupApplicants(items, groupBy), [groupBy, items])

function handleDragEnd(event: DragEndEvent) {
  // ...
  setItems(current => arrayMove(current, oldIndex, newIndex))
}
```

`columns` are derived by grouping `items` on a static field (`round1Result`, `position1`, or `batch`). `arrayMove` only reorders the master list, so re-grouping puts every applicant back into the same column it was already in. The user can drag a card from **Fail → Pass** and see absolutely nothing change after release.

**Solution:** On cross-column drop, mutate the grouping field of the dragged item (e.g. `setItems(current => current.map(item => item.id === active.id ? { ...item, round1Result: targetColumn.label } : item))`). Detect target column by reading `over.data.current?.sortable.containerId` or by adding a per-column droppable.

---

### C-2 · Number keys 1–4 hijack any input field while ViewPillNav is mounted
[`src/components/v2/layout/ViewPillNav.tsx:49-61`](src/components/v2/layout/ViewPillNav.tsx)

```ts
function onKeyDown(event: KeyboardEvent) {
  const index = Number(event.key) - 1
  const nextView = V2_VIEW_KEYS[index]
  if (!nextView) return

  event.preventDefault()      // ⚠ also blocks the digit from reaching the input
  setView(nextView)           // ⚠ switches view away from current
}

window.addEventListener("keydown", onKeyDown)
```

Effects on `/v2/candidates`:
- Typing `1` in the table's "Search name, email, position..." input switches to Table view **and** the digit never reaches the input.
- Same for the "Saved view name" input, the AI Drawer chat input, and the Notes title/body.
- `⌘1`/`Ctrl+1` (browser tab navigation) is also intercepted because there is no modifier check.

**Solution:**
```ts
if (event.target instanceof HTMLElement &&
    (event.target.matches("input, textarea, select") || event.target.isContentEditable)) return
if (event.metaKey || event.ctrlKey || event.altKey) return
```

---

### C-3 · Plaintext passwords still shipped in client bundle *(carry-over of C-1 from 2026-05-18)*
[`src/lib/v2/auth/mockUsers.ts`](src/lib/v2/auth/mockUsers.ts) is still imported directly by [`LoginForm.tsx:10`](src/components/v2/auth/LoginForm.tsx) and rendered into the DOM via the quick-login buttons. Anyone with DevTools can read `admin123` / `member123` from the bundle. No change since 2026-05-18.

### C-4 · Session `expiresAt` never enforced *(carry-over of C-2 from 2026-05-18)*
[`src/lib/v2/auth/AuthProvider.tsx:22-33`](src/lib/v2/auth/AuthProvider.tsx) still derives `user` without reading `session.expiresAt`. Sessions remain valid forever in `localStorage`.

---

## 🟠 High

### H-1 · "Top universities" chart shows insertion order, not top
[`src/components/v2/views/ChartView.tsx:93-102`](src/components/v2/views/ChartView.tsx)

```ts
function topUniversities(data: Applicant[]) {
  return Array.from(
    data.reduce(
      (map, item) => map.set(item.university, (map.get(item.university) ?? 0) + (item.round1Result === "Passed" ? 1 : 0)),
      new Map<string, number>()
    )
  )
    .slice(0, 6)   // ⚠ first 6 universities encountered, not top by pass count
    .map(([name, count]) => ({ name, count }))
}
```

`Map` iteration is insertion order. The label says "Pass rate by university" but the chart is "first six universities to appear in the dataset". With the mock data ordering this often hides the highest-performing universities.

**Solution:** `.sort(([, a], [, b]) => b - a).slice(0, 6)`.

### H-2 · `applicantsByMonth` shows months in random insertion order
[`src/components/v2/views/ChartView.tsx:104-111`](src/components/v2/views/ChartView.tsx)

Same `Map`-iteration pitfall. X-axis can read "May, Feb, Apr, Jan, Mar" depending on which submission record is first.

**Solution:** sort by parsed month index, or aggregate into a fixed 12-slot array indexed by month number.

### H-3 · Three new views repeat the `useState(data)` stale-prop bug
- [`GalleryView.tsx:19`](src/components/v2/views/GalleryView.tsx)
- [`PipelineView.tsx:22`](src/components/v2/views/PipelineView.tsx)
- (Pre-existing in [`ApplicantTable.tsx:54`](src/components/table/ApplicantTable.tsx) — H-5 in the prior report, still unfixed)

`useState(data)` snapshots the prop once. Any future change to `data` (filtering at parent, server-fetched refresh, upload pipeline) will be silently ignored. Latent today because `mockApplicants` is a module-level constant; it will break the first time data flows in.

**Solution:** Either lift sort/reorder state to the parent and pass controlled items, or sync via effect:
```ts
useEffect(() => { setItems(data) }, [data])
```

### H-4 · TopBar "Create Report" and "Export Data" are still no-ops
[`src/components/v2/layout/V2WorkspaceShell.tsx:38`](src/components/v2/layout/V2WorkspaceShell.tsx)

`V2WorkspaceShell` now wires `onOpenChat` / `onOpenNotes` but **not** `onCreateReport` / `onExportData`. Both buttons are visible but click nothing — same UX bug as M-3 in the prior report.

### H-5 · `ViewPillNav` still has duplicate scroll listeners *(carry-over of M-5)*
[`ViewPillNav.tsx:40-46`](src/components/v2/layout/ViewPillNav.tsx) attaches the same callback to both `window` and `document` with `capture: true`. For a scrollable `<main>` the capture-phase handler fires once and the bubbling handler may or may not fire depending on `stopPropagation` — `lastY` updates twice per frame, making the show/hide logic flicker.

### H-6 · LocalStorage write on every keystroke
[`src/lib/v2/persistence/usePersistedState.ts:26-32`](src/lib/v2/persistence/usePersistedState.ts) writes via `useEffect(..., [key, value])` on every render. The new code multiplies the cost:
- `NotesDrawer` typing → `JSON.stringify` of the entire notes array per keystroke (potentially many KB).
- `AiDrawer` send → array stringify (small but per-message).
- `usePinned` / `useViewState` add custom-event re-dispatch on top.

On low-end devices and long notes, input lag is real.

**Solution:** Debounce localStorage writes (~250 ms) inside `usePersistedState`, or accept a `{ debounceMs }` option for value-heavy keys.

### H-7 · Self-receive loop in custom-event sync hooks
[`usePinned.ts:19-30`](src/lib/v2/pin/usePinned.ts) and [`useViewState.ts:21-29`](src/lib/v2/views/useViewState.ts) dispatch their own `CustomEvent` after `setStoredValue`, then listen to the same window event to fan out updates to sibling hook instances. The dispatching instance also receives the event and calls `setStoredValue(next)` a second time. React de-duplicates same-value updates so there is no infinite loop, but every update triggers an extra effect run and another `localStorage.setItem`. Under React strict-mode double-effect this doubles again.

**Solution:** Tag the event with a session-unique id (`Symbol.for("v2.dispatcher")` or a `useRef`-generated nonce) and ignore events whose `detail.dispatcherId` matches the current instance.

### H-8 · OTP page remains a no-op auth bypass *(carry-over of H-1 from 2026-05-18)*

### H-9 · `RequireAuth` ignores `?from=` redirect *(carry-over of H-3 from 2026-05-18)*

### H-10 · `/v2/settings` sidebar link still 404s *(carry-over of H-2 from 2026-05-18)*

`/v2/candidates` and `/v2/compare` now exist, so that part of H-2 is resolved; `/v2/settings` is still broken.

### H-11 · `ThemeProvider` still doesn't subscribe to OS color-scheme changes *(carry-over of H-4 from 2026-05-18)*

---

## 🟡 Medium

### M-1 · `GalleryView` silently truncates to 48 items
[`GalleryView.tsx:36`](src/components/v2/views/GalleryView.tsx): `items.slice(0, 48)`. No "Show more", no badge indicating 598 hidden applicants out of 646.

### M-2 · `PipelineView` silently truncates to 40 cards per column
[`PipelineView.tsx:70`](src/components/v2/views/PipelineView.tsx). Same problem; large columns lose tail items invisibly.

### M-3 · `ComparePage` diff highlight tints **every** cell in a differing row
[`ComparePage.tsx:91-103`](src/components/v2/pin/ComparePage.tsx)

```ts
const different = new Set(values).size > 1
return <td className={`... ${different ? "bg-[var(--v2-primary)]/5" : ""}`}>
```

If 4 candidates have GPA 8.5 and 1 has 7.0, all 5 cells get the orange tint instead of just the outlier. The diff highlight loses its purpose.

**Solution:** highlight cells whose value is not the modal value, or only the cell that differs in pairwise mode.

### M-4 · `SavedViewsMenu` has no click-outside-to-close
[`SavedViewsMenu.tsx:35-77`](src/components/v2/views/SavedViewsMenu.tsx) is a raw absolutely-positioned `<div>`. Only the trigger button closes it. Use the existing `Popover` from `@/components/ui/popover` or attach a document `pointerdown` listener that closes when the click is outside the menu.

### M-5 · `SavedViewsMenu` doesn't close after loading a saved view
`loadSaved` calls `setView(...)` but never `setOpen(false)`. UX expectation broken.

### M-6 · `PinnedToolbar` uses `window.confirm`
[`PinnedToolbar.tsx:51-54`](src/components/v2/pin/PinnedToolbar.tsx). Browser-native modal ignores the design system. Project already has `Dialog` from shadcn — use it.

### M-7 · `DrawerShell` pointer capture never explicitly released
[`DrawerShell.tsx:25-34`](src/components/v2/common/DrawerShell.tsx) sets `setPointerCapture` on `pointerdown` but binds no `onPointerUp` / `onPointerCancel`. Browsers auto-release on pointerup in most cases, but if a pointer is cancelled (touch interruption, OS gesture, dev-tools focus loss), capture can linger. Add explicit release for robustness.

### M-8 · `DrawerRegistry.setMode` reassigns its function parameter
[`DrawerRegistry.tsx:48-58`](src/lib/v2/drawer/DrawerRegistry.tsx)

```ts
const setMode = useCallback((id, nextMode) => {
  // ...
  if (...) {
    toast(...)
    nextMode = "float"     // ⚠ mutating parameter
  }
  if (id === "chat") setChatMode(nextMode)
  // ...
})
```

ESLint `no-param-reassign` is off, so this passes — but it muddies the value flow. Use a local `const resolved = condition ? "float" : nextMode`.

### M-9 · `AiDrawer` "pending" is cosmetic — assistant reply is computed eagerly
[`useChat.ts:32-44`](src/lib/v2/chat/useChat.ts) appends both messages **before** the 160 ms `setTimeout`, so the disabled-while-pending button can't reflect real async work and there is no "thinking..." indicator. Either defer the assistant message push inside the timeout, or drop the fake pending.

### M-10 · `ChartView` imports Recharts synchronously *and* nests the V1 dashboard charts
[`ChartView.tsx:8-9`](src/components/v2/views/ChartView.tsx) imports `recharts` directly. [`ChartView.tsx:39`](src/components/v2/views/ChartView.tsx) also renders `<OverviewCharts />` (V1 dashboard component, which itself imports Recharts). The candidate page eagerly loads ~100 KB gzipped Recharts even for users who never select Chart view. Convert to `next/dynamic` and decide whether OverviewCharts truly belongs here.

### M-11 · `ThemedView` indirection without real theming
[`ThemedView.tsx`](src/components/v2/views/ThemedView.tsx) routes between a "shadcn" and "skeleton" component based on theme, but both `GalleryView.skeleton.tsx` and `PipelineView.skeleton.tsx` are 1-line re-exports of the shadcn version:
```ts
export { GalleryView as GalleryViewSkeleton } from "./GalleryView"
```
This is dead abstraction. Either remove `ThemedView` or wire up actual Skeleton-themed variants.

### M-12 · `nanoid(8)` ID collisions become realistic at scale
Used for chat messages, notes, saved views, and pin IDs. 8-char alphabets ≈ 2.8 × 10¹⁴ combinations. Local-only mocks make collisions almost impossible *today*, but if this code is reused across users or merged into a multi-user dataset, prefer `nanoid()` (default 21 chars) for stored items.

### M-13 · `next-themes` still installed and unused *(carry-over of M-7)*

### M-14 · Mixed UI libraries in Lab still in place *(carry-over of M-1 from 2026-05-18 — Skeleton Dialog inside lab/)*

### M-15 · `xlsx` still pinned at 0.18.5 with known CVEs *(carry-over of M-6 from 2026-05-18)*

---

## 🔵 Low / Housekeeping

### L-1 · `gpaBands` mutates an array literal
[`ChartView.tsx:113-124`](src/components/v2/views/ChartView.tsx) builds `bands` with `count: 0` and mutates with `bands[i].count += 1`. Each call creates a new array so this is safe, but `reduce` would express the same intent without mutation.

### L-2 · `ComparePage` re-enforces a constraint already enforced upstream
[`ComparePage.tsx:25-29`](src/components/v2/pin/ComparePage.tsx) `.slice(0, 5)` is redundant — `usePinned` already caps at 5 via the Zod schema. Pick one place.

### L-3 · "Saved {time}" timestamp on notes shows time only
[`NotesDrawer.tsx:51`](src/components/v2/notes/NotesDrawer.tsx) — across days this is ambiguous. Use a relative formatter (`Intl.RelativeTimeFormat`) or include the date.

### L-4 · Hard-coded hex values inside `ChartView`'s mini chart
[`ChartView.tsx:62-83`](src/components/v2/views/ChartView.tsx) uses `#FF5533`, `#6B5549`, `#767676`, `#f9f9f9`, breaking the V2 token convention (`var(--v2-primary)`). Aligns the chart with V1 styling but inconsistent with the rest of v2.

### L-5 · `PipelineView` "Group by" label uses implicit-association only
[`PipelineView.tsx:44-55`](src/components/v2/views/PipelineView.tsx). Wrapping a `<select>` inside `<label>` works, but adding `htmlFor` improves screen-reader stability.

### L-6 · Minor a11y — mini chart `aria-label` is on the drag handle only
[`ChartView.tsx:64-72`](src/components/v2/views/ChartView.tsx). A screen-reader user gets the visible `<h3>` for context but the surrounding `<article>` could be a `region` with `aria-labelledby`.

### L-7 · `viewUtils.initials` and `V2TopBar.getInitials` duplicated *(carry-over of L-2 from 2026-05-18 — now in three places: `lab-utils.ts`, `V2TopBar.tsx`, `viewUtils.ts`)*

### L-8 · `useShortcut` triggers handlers from inside inputs
[`useShortcut.ts:13-21`](src/lib/v2/keyboard/useShortcut.ts) fires `handler()` even when focus is in an input/textarea. ⌘J / ⌘N are unlikely to clash, but the helper should still guard against firing when typing.

---

## Performance Benchmark

| Concern | Where | Estimated impact | Suggested fix |
|---|---|---|---|
| Recharts duplicated | `OverviewCharts` (dashboard) + `ChartView` (candidates) | +100 KB gz eagerly loaded on every authenticated page | `next/dynamic` with skeleton fallback for both |
| `xlsx` eager import | `GlobalDropZone` | +250 KB gz on first paint | dynamic import on drop event |
| `JSON.stringify` per keystroke | `usePersistedState` × NotesDrawer | Up to 50 KB stringify on long notes (~0.5–2 ms input lag on mid-tier laptops) | Debounce 250 ms |
| Custom-event echo | `usePinned`, `useViewState` | Each setIds/setView → +1 extra setState + write per instance | Tag dispatcher id, skip own events |
| Full-set `groupApplicants` recompute | `PipelineView` | O(n) per render of 646 applicants × number of groups | Memoize on `(items, groupBy)` (already done) — but acceptable |
| 646 applicants always in memory | `mockData.ts` | Module-level constant; fine for mock | n/a |
| `animejs` & `@skeletonlabs/skeleton-react` | `lab/` only | +50 KB gz on lab route | route-level dynamic import |
| `next-themes` unused | package.json | +5 KB gz, listed but never imported | `npm uninstall next-themes` |

Removing eager Recharts + eager `xlsx` and uninstalling `next-themes` would shave roughly **350 KB gzipped** off the first paint of the candidates route.

---

## Priority Action Plan

| # | Action | Severity | Effort |
|---|---|---|---|
| 1 | Guard `ViewPillNav` keydown against form fields and modifiers (C-2) | 🔴 | XS |
| 2 | Fix pipeline cross-column drag to actually re-assign grouping field (C-1) | 🔴 | M |
| 3 | Remove plaintext passwords from client bundle (C-3 / prior C-1) | 🔴 | S |
| 4 | Enforce `session.expiresAt` (C-4 / prior C-2) | 🔴 | S |
| 5 | Sort `topUniversities` by count desc before slicing (H-1) | 🟠 | XS |
| 6 | Sort `applicantsByMonth` chronologically (H-2) | 🟠 | XS |
| 7 | Sync `data` prop into Gallery/Pipeline/Chart state, and into ApplicantTable (H-3) | 🟠 | XS |
| 8 | Wire `onCreateReport` / `onExportData` or hide buttons (H-4) | 🟠 | XS |
| 9 | Deduplicate scroll listeners in `ViewPillNav` (H-5) | 🟠 | XS |
| 10 | Debounce localStorage writes (H-6) | 🟠 | S |
| 11 | Add dispatcher-id guard to custom-event sync hooks (H-7) | 🟠 | XS |
| 12 | Guard OTP route against direct navigation (H-8) | 🟠 | S |
| 13 | Honour `?from` redirect on login (H-9) | 🟠 | XS |
| 14 | Add `/v2/settings` stub or disable the link (H-10) | 🟠 | XS |
| 15 | Subscribe `ThemeProvider` to `prefers-color-scheme` (H-11) | 🟠 | XS |
| 16 | Add pagination/"show more" to Gallery & Pipeline (M-1, M-2) | 🟡 | S |
| 17 | Highlight diff cells against majority value in Compare (M-3) | 🟡 | S |
| 18 | Replace SavedViewsMenu with a Popover (close-on-outside + close-on-load) (M-4, M-5) | 🟡 | S |
| 19 | Replace `window.confirm` in PinnedToolbar with Dialog (M-6) | 🟡 | S |
| 20 | Add explicit pointer-up release in DrawerShell (M-7) | 🟡 | XS |
| 21 | Defer assistant reply behind the fake pending delay (M-9) | 🟡 | XS |
| 22 | Lazy-load Recharts in ChartView and decide on OverviewCharts duplication (M-10, M-11) | 🟡 | S |
| 23 | Drop ThemedView (or implement real Skeleton-themed variants) (M-11) | 🟡 | S |
| 24 | Bump `xlsx` to 0.20.x; uninstall `next-themes` (M-13, M-15) | 🟡 | XS |
| 25 | Consolidate `getInitials` into `@/lib/utils` (L-7) | 🔵 | XS |
| 26 | Use design tokens instead of hex in ChartView mini-charts (L-4) | 🔵 | XS |

---

## Notes on what landed correctly

A few things in this commit are worth calling out as good calls:

- **Zod schemas guard every persisted shape** (`pinnedSchema`, `notesSchema`, `messageSchema`, `viewSchema`, `savedViewsSchema`, drawer mode/width schemas). Storage corruption falls back to default cleanly.
- **`useSyncExternalStore` trick in `RequireAuth`** correctly defers the "no user" decision to post-hydration, avoiding flash redirects on first paint.
- **`DrawerRegistry` mutual exclusion** — if both drawers try to dock, the second falls back to float with a toast. Sensible UX.
- **Tests added for new behaviour** — 7 new specs maintain the existing 248-test green bar and exercise the new pin / view / drawer flows.
- **`viewUtils.round1Tone` and `groupApplicants`** were correctly extracted as pure utilities and reused across `TableView`, `PipelineView`, `GalleryView`, and `ComparePage`. Good shared-utility hygiene.

---

*This report was generated automatically. No source files were modified.*
