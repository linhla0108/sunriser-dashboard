# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

@AGENTS.md
@docs/claude/skills.md
@docs/claude/design-system.md
@docs/claude/tooling.md
@docs/claude/feedback-turbopack.md
@docs/claude/feedback-dndkit.md
@docs/claude/feedback-tailwind-v4.md

## Architecture

Single-page application — one URL (`/`), no client-side routing. `src/app/page.tsx` is a `'use client'` component that holds `activeView` state and conditionally renders one of two views. Upload and chat are overlays, not views.

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

**State flow:** `activeView` lives only in `page.tsx`. GlobalDropZone's "Analyze in Table" calls `onAnalyze()` → `activeView = 'table'`. File data from drop zone is NOT passed to the table (known limitation).

## Key files

| Path                                       | Purpose                                                                      |
| ------------------------------------------ | ---------------------------------------------------------------------------- |
| `src/lib/types.ts`                         | `Applicant`, `DashboardStats`, `Position`, `Round1Result` types              |
| `src/lib/mockData.ts`                      | Static mock data (646 applicants) + `dashboardStats`                         |
| `src/lib/utils.ts`                         | `cn()` utility (clsx + tailwind-merge)                                       |
| `src/app/globals.css`                      | Tailwind v4 `@theme` tokens — colors, type scale, radius, shadows, keyframes |
| `src/components/ui/`                       | shadcn/ui components (style: `base-nova`, baseColor: `neutral`)              |
| `src/components/layout/`                   | Sidebar, TopBar, MobileBottomNav                                             |
| `src/components/chat/FloatingChat.tsx`     | Floating AI chat panel                                                       |
| `src/components/upload/GlobalDropZone.tsx` | Document-level drop zone wrapper                                             |

## UI stack

- **Tailwind CSS v4** — config-less, CSS-first. No `tailwind.config.js`; theme tokens live in `src/app/globals.css`.
- **shadcn/ui** — aliased to `@/components/ui`. Add components with `npx shadcn add <component>`.
- **Recharts** — used in `OverviewCharts.tsx` for bar/pie charts.
- **@dnd-kit** — drag-to-reorder rows in `ApplicantTable` via `DraggableRow`.
- **lucide-react** — icon library.

## Known limitations

- Uploaded file data is not injected into the table (upload parses only; "Analyze in Table" just switches views).
- Chat replies are hard-coded mock responses — no LLM integration.
- All state resets on page refresh (no persistence).
