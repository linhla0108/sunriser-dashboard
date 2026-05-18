# GitHub Copilot Instructions

Shared rules for this repo — identical to CLAUDE.md / AGENTS.md.

## Architecture

Single-page application — one URL (`/`), no client-side routing. `src/app/page.tsx` is a `'use client'` component that holds `activeView` state and conditionally renders one of two views.

```
page.tsx  (activeView: 'dashboard' | 'table')
├── GlobalDropZone     — document-level drag-and-drop; popup card + toast stack
├── Sidebar            — hidden on mobile; icon-only on tablet (sm), full on desktop (lg)
├── MobileBottomNav    — fixed bottom nav, sm:hidden
├── FloatingChat       — fixed floating button + panel; full-screen on mobile
└── main
    ├── TopBar         — title/subtitle + actions (Export Data, Create Report)
    ├── dashboard view — StatsCard × 4 + OverviewCharts (Recharts)
    └── table view     — ApplicantTable (dnd-kit sortable + filters)
```

**State flow:** `activeView` lives only in `page.tsx`. GlobalDropZone's "Analyze in Table" calls `onAnalyze()` → `activeView = 'table'`.

## Key files

| Path | Purpose |
| --- | --- |
| `src/lib/types.ts` | `Applicant`, `DashboardStats`, `Position`, `Round1Result` types |
| `src/lib/mockData.ts` | Static mock data (646 applicants) + `dashboardStats` |
| `src/lib/utils.ts` | `cn()` utility (clsx + tailwind-merge) |
| `src/app/globals.css` | Tailwind v4 `@theme` tokens — colors, type scale, radius, shadows, keyframes |
| `src/components/ui/` | shadcn/ui components (style: `base-nova`, baseColor: `neutral`) |
| `src/components/layout/` | Sidebar, TopBar, MobileBottomNav |
| `src/components/chat/FloatingChat.tsx` | Floating AI chat panel |
| `src/components/upload/GlobalDropZone.tsx` | Document-level drop zone wrapper |

## UI Stack

- **Tailwind CSS v4** — config-less, CSS-first. No `tailwind.config.js`; theme tokens in `src/app/globals.css`.
- **shadcn/ui** — aliased to `@/components/ui`. Add with `npx shadcn add <component>`.
- **Recharts** — bar/pie charts in `OverviewCharts.tsx`.
- **@dnd-kit** — drag-to-reorder rows in `ApplicantTable`.
- **lucide-react** — icons.

## Design System

### Colors

| Token | Hex | Usage |
| --- | --- | --- |
| Primary | `#FF5533` | Buttons, active states, accents |
| Primary hover | `#E63D1F` | Hover on primary buttons |
| Ink | `#1b1b1b` | Headings, body text |
| Muted stone | `#555555` | Secondary text |
| Light steel | `#6B5549` | Hints, subtitles |
| Fog | `#f9f9f9` | Backgrounds, dividers |
| Canvas | `#FCFCFC` | Page background |

### Typography

Font: `Proxima Nova`. Type scale tokens (all `rem`):
- `--text-display: 2.25rem` — stat values
- `--text-h1: 1.375rem` — page titles
- `--text-h2: 0.9375rem` — card titles
- `--text-body: 0.875rem` — body text
- `--text-small: 0.75rem` — captions

### Spacing — Compact

| Context | Use | Avoid |
| --- | --- | --- |
| Main content wrapper | `p-3 sm:p-4 lg:p-6` | `p-4 sm:p-6 lg:p-10` |
| Card inner padding | `p-4` | `p-6` |
| Section gaps | `gap-4 mb-4` | `gap-6 mb-6` |

### Border Radius

- Cards: `rounded-3xl`
- Buttons/pills: `rounded-full`
- Inputs/selects: `rounded-2xl`
- Small chips: `rounded-xl`

### Shadows

```js
// Standard card shadow
boxShadow: 'rgba(4, 23, 43, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.1) 0px 8px 10px -6px'
```

## Tailwind v4 Rules

- **Never add `--spacing-N` to `@theme`** — overrides the multiplier, breaks the entire spacing scale.
- **Type scale tokens must use `rem`**, not `px`.
- `calc()` output is intentional — do not fight it.
- No multiline `className` strings (Turbopack rejects newlines in JSX string attributes).
- No `<style jsx>` or `<style jsx global>` — put keyframes in `globals.css`.

## @dnd-kit Rule

`DndContext` renders a `<div>` — never place it inside `<table>`. Put it outside the entire table card. `SortableContext` is safe inside `<table>`.

## Tooling

```bash
npx tsc --noEmit   # type checking (fast)
npm run lint       # ESLint
npm run format     # Prettier + Tailwind class sort
```

**Never run `npm run dev` or `npm run build` to check for errors** — use tsc/lint instead.

## Plans Documentation Rule

After completing a plan, create a dated folder inside `docs/plans/` using format `DD-MM-YYYY` (e.g. `18-05-2026`). Reuse today's folder if it already exists.

```
docs/plans/
└── 18-05-2026/
    ├── plan.md      ← written before implementation
    └── report.md   ← updated after implementation is complete
```

Never create standalone plan/report files scattered across the source tree.

**Language:** All plans and reports must be written in **English**. Use clear, simple, direct language — short sentences, concrete nouns, no ambiguous pronouns, no filler phrases. Easy for LLMs to parse.

**`plan.md`** must include: Goal, Scope, Steps, Files to touch.

**`report.md`** must include: Status, a table of `File | Description` (relative paths, one sentence each), Notes.

Report is updated only after implementation is complete. Skip for trivial single-line edits.

## Code Style

- Surgical changes only — no refactors beyond what the task requires.
- No premature abstractions. Three similar lines beats a helper.
- No comments unless the WHY is non-obvious.
- No error handling for impossible scenarios.
