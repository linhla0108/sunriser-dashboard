# Spec: V2 Replaces V1 at Root

## Assumptions

1. V2 should become the default product shell for the main dashboard app.
2. V1 should not be deleted in the first implementation pass because V2 still imports shared V1-era components.
3. `/lab` should remain available unless the user explicitly asks to remove it.
4. `/compare` should keep the current behavior and redirect to `/candidates` because the existing V2 compare page is a TODO redirect, not a real page.
5. Old `/v2/*` URLs should keep working through redirects during the transition.

## Objective

Move the SUN.RISER dashboard from a legacy single-page root shell to the existing V2 App Router workspace. The primary user is an HR or recruitment operator who opens the app, signs in, reviews candidates, changes candidate views, pins candidates, creates mock reports, and shares public report links.

Success means users experience V2 at root-level routes and do not need to know the `/v2` prefix. The migration must keep auth, themes, drawer state, candidate views, report sharing, and public report reading intact.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript 5
- Tailwind CSS v4 with CSS-first tokens
- shadcn/ui components with Nova/base semantics
- Vitest 4 with React Testing Library
- localStorage-backed mock auth, theme, view, drawer, pinned, chat, notes, and report state

## Commands

- Type check: `npx tsc --noEmit`
- Test all: `npm test`
- Focus auth tests: `npm test -- src/components/v2/auth/__tests__`
- Focus layout tests: `npm test -- src/components/v2/layout/__tests__`
- Focus view tests: `npm test -- src/components/v2/views/__tests__`
- Focus public/report tests: `npm test -- src/lib/v2/public/__tests__ src/components/v2/report`
- Lint: `npm run lint`
- Format check: `npm run format -- --check`
- Dev server for final manual verification only: `npm run dev`

## Project Structure

- `src/app/page.tsx` is the root entry and should redirect to `/dashboard`.
- `src/app/layout.tsx` owns the HTML shell, font, global CSS import, and must also import V2 theme CSS or wrap the root with a V2 provider boundary.
- `src/app/(workspace)/dashboard/page.tsx` should host the V2 dashboard route if route groups are used.
- `src/app/(workspace)/candidates/page.tsx` should host the V2 candidates route if route groups are used.
- `src/app/(workspace)/settings/page.tsx` should host the V2 settings route if route groups are used.
- `src/app/(workspace)/layout.tsx` should wrap protected workspace pages in `V2WorkspaceShell`.
- `src/app/login/page.tsx`, `src/app/signup/page.tsx`, `src/app/forgot/page.tsx`, and `src/app/otp/page.tsx` should host root-level auth pages.
- `src/app/public/layout.tsx`, `src/app/public/page.tsx`, `src/app/public/results/page.tsx`, and `src/app/public/report/[shareId]/page.tsx` should host root-level public pages.
- `src/app/v2/**` should become compatibility redirect pages or thin re-exports only during migration.
- `src/components/v2/**` contains reusable V2 UI and should remain the main component source.
- `src/lib/v2/**` contains reusable V2 state, auth, theme, report, and persistence logic.
- `docs/plans/19-05-2026/plan.md` contains the implementation plan.
- `docs/plans/19-05-2026/report.md` must be updated after implementation.

## Related Component Audit

### Root and layout

- `src/app/page.tsx` currently renders the V1 SPA with `Sidebar`, `TopBar`, `MobileBottomNav`, `GlobalDropZone`, `FloatingChat`, `ApplicantTable`, `ApplicantDrawer`, and `ExportModal`.
- `src/app/layout.tsx` currently imports only `globals.css`. It must also include V2 theme CSS or delegate V2 providers to route-group layouts.
- `src/app/v2/layout.tsx` currently wraps all V2 routes with `TooltipProvider`, `ThemeProvider`, `AuthProvider`, `Toaster`, and a `data-v2-workspace` wrapper. The root migration must preserve this provider order.
- `src/app/v2/(app)/layout.tsx` wraps protected pages with `V2WorkspaceShell`.

### Protected workspace

- `src/components/v2/layout/V2WorkspaceShell.tsx` requires `RequireAuth`, `DrawerRegistryProvider`, `SidebarProvider`, `V2Sidebar`, `V2TopBar`, `PinnedToolbar`, `AiDrawer`, `NotesDrawer`, and `ReportModal`.
- `src/components/v2/layout/V2Sidebar.tsx` hard-codes `/v2/dashboard`, `/v2/candidates`, and `/v2/settings`.
- `src/app/v2/(app)/dashboard/page.tsx` uses shared dashboard widgets from `src/components/dashboard`.
- `src/app/v2/(app)/candidates/page.tsx` owns candidates local state, filters, `ViewPillNav`, `TableView`, `PipelineView`, `ChartView`, `GalleryView`, and `ApplicantDetailDrawer`.
- `src/app/v2/(app)/settings/page.tsx` owns `AppearanceTab`, `WorkspaceTab`, and `AccountTab`.
- `src/app/v2/(app)/compare/page.tsx` currently redirects to `/v2/candidates`, so `/compare` should redirect to `/candidates` until a real route is built.

### Auth

- `src/components/v2/auth/RequireAuth.tsx` redirects unauthenticated users to `/v2/login?from=<pathname>`.
- `src/app/v2/login/page.tsx` redirects successful login to `/v2/dashboard`.
- `src/app/v2/signup/page.tsx` redirects successful signup to `/v2/otp`.
- `src/app/v2/otp/page.tsx` redirects successful OTP to `/v2/dashboard`.
- `src/app/v2/forgot/page.tsx` has no route string but must be duplicated or moved to `/forgot`.

### Public and report sharing

- `src/components/v2/report/ReportModal.tsx` writes share snapshots to `v2.report.shares` and creates URLs at `/v2/public/report/{shareId}`.
- `src/components/v2/public/PublicReport.tsx` reads `v2.report.shares` and links missing reports back to `/v2/login`.
- `src/app/v2/public/layout.tsx` links the public shell brand and login action to `/v2/login`.
- `src/app/v2/public/page.tsx` redirects to `/v2/public/results`.
- `src/app/v2/public/report/[shareId]/page.tsx` renders `PublicReport`.

### Tests that must change

- `src/components/v2/auth/__tests__/RequireAuth.test.tsx` mocks `/v2/dashboard` and expects `/v2/login?from=%2Fv2%2Fdashboard`.
- `src/components/v2/layout/__tests__/V2Sidebar.test.tsx` mocks `/v2/dashboard` for active nav.
- `src/components/v2/layout/__tests__/V2WorkspaceShell.shortcuts.test.tsx` mocks `/v2/dashboard`.
- Other V2 tests should be scanned with `rg "/v2" src/**/*.test.tsx src/**/*.test.ts`.

## Code Style

Use thin route files and keep business logic in reusable V2 components.

```tsx
import { redirect } from "next/navigation"

export default function HomePage() {
  redirect("/dashboard")
}
```

```tsx
import { V2WorkspaceShell } from "@/components/v2/layout/V2WorkspaceShell"

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return <V2WorkspaceShell>{children}</V2WorkspaceShell>
}
```

Conventions:

- Use named imports and existing `@/` aliases.
- Keep route files small.
- Prefer route groups such as `(workspace)` and `(auth)` when they reduce provider coupling without changing URLs.
- Keep V2 component names unless the component itself is being redesigned.
- Do not introduce a new state store.
- Do not introduce a second theme-token layer.

## Testing Strategy

- Unit and component tests remain colocated under `__tests__`.
- Route migration tests should focus on route strings, redirects, auth guard behavior, sidebar links, and report URL creation.
- Existing candidate view tests should remain behavior tests and should not be rewritten only because routes moved.
- Use `rg "/v2"` as a required migration check. Leftover matches must be intentional compatibility redirects, localStorage keys, package/component names, or source directory names.
- Browser verification after static checks should visit `/`, `/login`, `/dashboard`, `/candidates`, `/settings`, `/public/results`, and a generated `/public/report/{shareId}` URL.

## Boundaries

- Always: preserve V2 providers, preserve `SidebarProvider` around sidebar consumers, preserve localStorage key compatibility, preserve public report snapshot reading, and keep `/lab` available.
- Always: run `npx tsc --noEmit`, focused tests, `npm run lint`, and `npm run format -- --check` before marking implementation complete.
- Ask first: deleting V1 components, changing localStorage keys, removing `/v2/*` compatibility redirects, adding dependencies, or changing the mock auth model.
- Never: remove failing tests to make the migration pass, commit secrets, change unrelated lab route behavior, or stack new design-token systems over the current Nova/V2 theme tokens.

## Success Criteria

- `/` redirects to `/dashboard`.
- `/dashboard`, `/candidates`, and `/settings` render inside `V2WorkspaceShell`.
- `/compare` redirects to `/candidates`.
- `/login`, `/signup`, `/forgot`, and `/otp` render the current V2 auth screens at root-level paths.
- Unauthenticated workspace access redirects to `/login?from=<encoded-root-path>`.
- Login success routes to `/dashboard`.
- Signup success routes to `/otp`.
- OTP success routes to `/dashboard`.
- `V2Sidebar` links point to `/dashboard`, `/candidates`, and `/settings`, and active state works with root-level paths.
- Report share links use `/public/report/{shareId}`.
- Public report missing-state CTA links to `/login`.
- `/public` redirects to `/public/results`.
- Old `/v2/*` paths redirect to equivalent root-level paths.
- Static checks and focused tests pass, or blockers are documented in `report.md`.

## Plan Recheck Findings

1. The original plan treated `/compare` as a full primary workspace route. Current code shows `/v2/compare` redirects to `/v2/candidates`, so the plan was corrected to preserve redirect behavior instead.
2. The original plan listed broad `/v2` app globs but did not call out auth page and public layout route strings. These files are now explicit migration surfaces.
3. The provider boundary is the highest-risk part. Moving V2 to root must preserve `TooltipProvider`, `ThemeProvider`, `AuthProvider`, `Toaster`, `RequireAuth`, `DrawerRegistryProvider`, and `SidebarProvider`.
4. Shared V1-era widgets are still in active V2 use. V1 source deletion must be a later cleanup after replacement widgets exist.
5. `/v2` string scanning is required both before and after implementation because route strings appear in components, pages, and tests.

## Open Questions

1. Should login success go to `/dashboard` or `/candidates`?
2. Should old `/v2/*` redirects be permanent for this project, or temporary for one release only?
3. Should V1 root upload and chat overlays be rebuilt in V2 before V1 deletion, or are V2 `AiDrawer` and report flows enough for launch?
