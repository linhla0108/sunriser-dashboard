# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md
@docs/claude/skills.md
@docs/claude/design-system.md
@docs/claude/tooling.md
@docs/claude/plans.md
@docs/claude/feedback-turbopack.md
@docs/claude/feedback-dndkit.md
@docs/claude/feedback-tailwind-v4.md
@docs/claude/feedback-testing-tools.md

## Stack

- **Next.js 16** App Router on React 19, Turbopack
- **Supabase** (`@supabase/ssr` + `@supabase/supabase-js`) for auth, profile, settings, RBAC
- **Tailwind CSS v4** (config-less) + **shadcn/ui** (`base-nova`, neutral)
- **@dnd-kit**, **Recharts**, **lucide-react**, **sonner**, **cmdk**, **animejs**
- **Vitest** for unit, **Playwright** for e2e

## UI Primitive Rule

- Prefer shared `shadcn/ui` primitives from `src/components/ui/` over raw HTML controls whenever an equivalent exists.
- Do not introduce raw `<button>`, `<input>`, `<select>`, `<textarea>`, `<dialog>`, or checkbox/radio controls in product UI unless there is no local shadcn primitive yet and the task explicitly keeps that gap temporary.
- If a needed primitive is missing, add or create the shared `src/components/ui/*` component first, then consume it from feature code.

## Scripts

```bash
npm run dev          # next dev (Turbopack)
npm run build        # production build
npm run lint         # eslint
npm run format       # prettier (+ tailwind class sort)
npm test             # vitest run
npm run test:watch   # vitest in watch mode
npm run test:e2e     # playwright e2e
```

**Error checking:** use `npx tsc --noEmit` and `npm run lint`. Never `npm run dev` / `npm run build` just to check errors — see `docs/claude/tooling.md`.

Run a single Vitest file: `npm test -- path/to/file.test.ts`.
Run a single Playwright spec: `npx playwright test tests/e2e/auth.spec.ts`.

## Routing & route groups

```
src/app/
├── layout.tsx           Root html. Providers: TooltipProvider → AuthProvider → ThemeProvider
├── page.tsx             redirect("/dashboard")
├── login | signup | forgot | otp | auth/confirm   public auth routes
├── lab                  unauthenticated experiments
├── public               public share pages
├── api/admin/*          server-only admin routes (service_role)
└── (workspace)/         protected route group, wrapped by WorkspaceShell
    ├── layout.tsx       <WorkspaceShell>
    ├── dashboard
    ├── candidates       table + pipeline + gallery + chart views
    ├── compare          pinned candidate comparison
    ├── schedule         interview Gantt / agenda
    ├── settings
    ├── admin/users      RequireAdmin gated
    └── hr
```

**Auth gate:** `src/proxy.ts` (Next.js 16 middleware, renamed from `middleware.ts`) checks the Supabase session for every non-public route and redirects to `/login?from=…`. Public allow-list lives at the top of `proxy.ts`. The path-safety helper is `src/lib/auth/safePath.ts`.

## Provider / shell hierarchy

```
RootLayout
└── TooltipProvider
    └── AuthProvider                       loads user_profiles / user_access / user_settings; exposes can()
        └── ThemeProvider                  reads settings; persists theme/mode → Supabase + localStorage
            └── (workspace)/layout.tsx
                └── WorkspaceShell
                    └── RequireAuth                  redirects unauthenticated, shows InactiveAccount
                        └── DrawerRegistryProvider   single source of truth for chat/notes/detail drawers
                            └── UploadSessionProvider
                                └── SidebarProvider (shadcn)
                                    └── GlobalDropZone + WorkspaceContextMenu + Sidebar + TopBar + page
```

`ThemeProvider` **must** sit inside `AuthProvider` (it calls `useAuth`).

## State patterns

- **Auth user shape:** `AppUser` extends Supabase user with `profile`, `access` (role + permissions), `settings`. Built in `src/lib/auth/loadProfile.ts`. Use `can(action)` for permission gating (Create Report needs `edit`, Export Data needs `delete`).
- **URL state for candidates:** filter / sort / view / page / group are persisted as search params on `/candidates`. The page parses URL → state; state → router.replace.
- **Drawer state:** centralized via `DrawerRegistry`. Components call `registry.toggle("chat" | "notes" | …)` instead of holding local open flags.
- **Upload session:** dropped files land in `UploadSessionProvider`, persisted as draft (`persistUploadSessionDraft`); "Analyze in Table" navigates to `/candidates`. Files are parsed but not yet merged into the table dataset.
- **Pinned compare:** `usePinned` drives `PinnedToolbar`, the row context-menu "Pin to compare", and `/compare`.

## Candidate views

`/candidates` swaps between Table / Pipeline / Gallery / Chart from `src/components/views/`. All views share dataset + URL-driven filter/sort/group state.

- `TableView` → `ApplicantTable` → `DraggableRow` (dnd-kit). Row selection + bulk actions live inside `CandidateFiltersBar` (no separate floating bar — selection shows one orange `{N} selected` popover button).
- `PipelineView` — kanban grouped by round1, round2, PIC, or batch. Drag mutation writes the right field; round2 overrides round1 for row color. Per-status color map in `viewUtils.ts`.
- `ChartView` — 7 Recharts cards, draggable layout, global filter shared with the other views.
- `GalleryView` — card grid.

The `dnd-kit` rule: `DndContext` must wrap the table **card**, never sit inside `<table>` — see `docs/claude/feedback-dndkit.md`.

## Supabase

- Migrations in `supabase/migrations/`. Key one: `20260521120000_user_access_and_profiles.sql` (creates `user_profiles`, `user_access`, `user_settings` + RLS + signup trigger).
- Server-only admin work uses `src/lib/supabase/admin.ts` (service_role) through `src/app/api/admin/*` routes. Never import that module from client code.
- Client uses `@supabase/ssr` browser client + the proxy server client.

## Key files

| Path                                                | Purpose                                                                 |
| --------------------------------------------------- | ----------------------------------------------------------------------- |
| `src/proxy.ts`                                      | Next 16 middleware — Supabase session check + redirect                  |
| `src/lib/auth/AuthProvider.tsx`                     | Session, profile loader, `can()` helper                                 |
| `src/lib/auth/loadProfile.ts`                       | Builds `AppUser` from `user_profiles` / `user_access` / `user_settings` |
| `src/lib/theme/ThemeProvider.tsx`                   | Theme + mode, persisted to Supabase                                     |
| `src/lib/drawer/DrawerRegistry.tsx`                 | Centralized drawer open/close                                           |
| `src/lib/upload/UploadSessionContext.tsx`           | Upload draft session                                                    |
| `src/lib/types.ts`                                  | `Applicant`, `DashboardStats`, `Position`, round result types           |
| `src/lib/mockData.ts`                               | Static mock candidates + stats                                          |
| `src/lib/views/viewUtils.ts`                        | Shared view helpers + `PIC_CHIP_STYLE` color map                        |
| `src/app/globals.css`                               | Tailwind v4 `@theme` tokens                                             |
| `src/components/layout/WorkspaceShell.tsx`          | Protected workspace frame                                               |
| `src/components/auth/RequireAuth.tsx`               | Inactive / unauthenticated guard inside shell                           |
| `src/components/views/`                             | Table / Pipeline / Gallery / Chart                                      |
| `src/components/table/DraggableRow.tsx`             | Row, checkbox, context menu (round1/2 status submenus)                  |
| `src/components/candidates/CandidateFiltersBar.tsx` | Filters + compact bulk-action popover                                   |
| `src/components/pin/`                               | Pin to compare, `PinnedToolbar`, `ComparePage`                          |
| `src/components/schedule/`                          | Schedule swimlanes + agenda                                             |
| `src/components/admin/UserEditDrawer.tsx`           | Admin user management UI                                                |

## Testing

- Unit tests: `**/__tests__/*.test.{ts,tsx}`. Config in `vitest.config.ts`, jsdom env, setup in `src/test/setup.ts`.
- E2E tests: `tests/e2e/*.spec.ts`. Auth-state caching via `tests/e2e/global-setup.ts` (writes `.auth-state.json`).

## Task documentation

Every non-trivial task gets a file in `docs/tasks/DD-MM-YYYY/`, indexed by `summary.md`. See `docs/claude/plans.md` for the format. Write the plan section **before** code; add the report section **after**.

## Known limitations

- Upload parses files but does not merge them into the candidates dataset; "Analyze in Table" only routes to `/candidates`.
- Chat replies are mock — no LLM call yet.
- Dashboard stats and table data are computed from different sources and can disagree (tracked in `docs/tasks/23-05-2026/`).
