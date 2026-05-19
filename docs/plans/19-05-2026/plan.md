# Plan: Candidates Page — DnD Fix, Pipeline Kanban, Code Review & Full Fixes

## Goal
Fix table drag-and-drop ordering, add cross-column Kanban drag to Pipeline view, run a full code review of the candidates page, and fix all identified issues.

## Scope

### Included
- Fix `ApplicantTable` drag-and-drop (sort override undoing drag order)
- Fix filtered drag splice bug (non-filtered items appended to bottom)
- Add cross-column drag to `PipelineView` (Kanban style)
- Show "Change to [label]" overlay when dragging from another column
- Fix dual-trigger conflict between within-column sort and cross-column drop
- Full code review of the candidates page (all components)
- Fix all critical, important, and suggestion-level issues from review
- Fix react-compiler lint error in `ApplicantTable.tsx`
- Fix self-loop double-dispatch in `useViewState`
- Fix keyboard shortcut firing inside inputs in `ViewPillNav`

### Out of scope
- Pre-existing lint errors in `ApplicantDetailDrawer.tsx` and `use-mobile.ts`
- LLM integration for chat
- File data injection from upload into table

## Steps

1. Diagnose table DnD root cause — `filtered` useMemo re-sorting on every render
2. Fix sort/filter separation: sort baked into `items` state, `filtered` applies only filters
3. Fix filtered drag splice: use `prev.map` to splice reordered items back into original slots
4. Add `useDroppable` per column in `PipelineView` with `COL_PREFIX = "col::"` IDs
5. Implement `updateItemColumn` helper to mutate applicant property on cross-column drop
6. Add `rawKey` to `groupApplicants` columns for safe position mutation on empty columns
7. Implement custom `collisionDetection` — `rectIntersection` for columns, `closestCenter` for items
8. Add two-layer state+ref pattern for `sourceColumnKey` (ref for sync callbacks, state for JSX)
9. Add `isExternalDragOver` overlay with "Change to [label]" text and min-h-[500px]
10. Run full code review (`/agent-skills:review`)
11. Fix all issues: GPA dead branch in `DraggableRow`, debug log in `CandidatesPage`, slice cap in `GalleryView`, `useViewState` self-loop, keyboard shortcut guard in `ViewPillNav`
12. Fix react-compiler lint error — move `filtered` useMemo before `handleDragEnd`

## Files to touch

- `src/components/table/ApplicantTable.tsx`
- `src/components/table/DraggableRow.tsx`
- `src/components/v2/views/PipelineView.tsx`
- `src/components/v2/views/viewUtils.ts`
- `src/components/v2/views/GalleryView.tsx`
- `src/components/v2/layout/ViewPillNav.tsx`
- `src/lib/v2/views/useViewState.ts`
- `src/app/v2/(app)/candidates/page.tsx`

---

# Plan: Table Editable Chips for Round, Batch, and PIC

## Goal
Make key applicant classification fields editable directly in the table view through consistent full-width chip controls.

## Scope

### Included
- Make Round 1 and Round 2 use the same chip/select styling and option set.
- Add editable chip/select behavior to Batch.
- Add editable chip/select behavior to PIC.
- Keep dropdowns rendered through a portal with fixed positioning so they are not clipped by the table card overflow.
- Lift chip changes from row-local state to table data state, then to parent views through `onDataChange`.
- Keep root `/` and V2 candidates table data in sync after inline edits.
- Add focused TableView tests for Round, Batch, and PIC chip changes.
- Make chip controls full width inside their table cells.

### Out of scope
- Persisting edits to a backend or localStorage.
- Adding new Batch or PIC management screens.
- Changing filter semantics beyond using the existing updated applicant data.
- Reworking the whole table layout or all V2 lint debt.

## Steps
1. Create a reusable select-style chip component in `DraggableRow.tsx`.
2. Configure Round options: `Passed`, `Failed`, `Waiting list`.
3. Configure Batch options: `Batch 1`, `Batch 2`, `Batch 3`.
4. Configure PIC options: `Quỳnh`, `Nhiên`, `Yến`, `Minh`, `Huy`, `Linh`.
5. Update Round 1, Round 2, Batch, and PIC cells to call `onUpdateApplicant`.
6. Add `onDataChange` to `ApplicantTable` and emit changed row data after chip edits and row reorder.
7. Forward `onDataChange` through `TableView`.
8. Wire V2 candidates page to merge edited filtered table data back into the full applicants list.
9. Wire root `/` table to use local applicant state instead of reading immutable `mockApplicants`.
10. Fix React setState-in-render warning by avoiding parent callbacks inside functional state updaters.
11. Add in-memory test `localStorage` shim for current Vitest environment.
12. Add targeted tests for Round, Batch, and PIC chip edits.
13. Make chips full-width with truncated labels and dropdown width matching the clicked chip.

## Files to touch
- `src/components/table/DraggableRow.tsx`
- `src/components/table/ApplicantTable.tsx`
- `src/components/v2/views/TableView.tsx`
- `src/app/v2/(app)/candidates/page.tsx`
- `src/app/page.tsx`
- `src/components/v2/views/__tests__/TableView.test.tsx`
- `src/test/setup.ts`

## Acceptance criteria
- Round 1 and Round 2 chips share style and behavior.
- Clicking a Round chip can change its value to `Passed`, `Failed`, `Waiting list`, or unset.
- Clicking a Batch chip can change its value to Batch 1, 2, or 3.
- Clicking a PIC chip can change its value to one of the configured PIC names or unset.
- Changing a chip updates table data and parent data, not just row-local display.
- V2 filtered table edits merge back into the full applicant list without losing hidden filtered-out applicants.
- No React warning: `Cannot update a component while rendering a different component`.
- Chip buttons render full width inside table cells and dropdowns match chip width.
- Focused TypeScript, lint, and TableView tests pass.

---

# Plan: HR Staff Route, Mock CRUD, and Custom Color System

## Goal
Add an HR staff route with mock-data CRUD first, then expose a custom color option that can be reused by other V2 workspace surfaces.

## Scope

### Included
- Add a protected V2 app route for HR staff management.
- Add mock HR staff data, TypeScript types, and client-side CRUD helpers.
- Build the first HR management UI with list, search/filter, create, edit, delete, and status controls.
- Add navigation entry for the HR route in the V2 sidebar.
- Add a custom color option in the V2 theme system.
- Apply custom color through CSS variables so buttons, active states, sidebar accents, charts, and future components can reuse it.
- Add focused tests for mock CRUD behavior, HR page interactions, sidebar navigation, and custom color persistence.

### Out of scope
- Real backend API, database schema, and server actions.
- Role-based authorization beyond the current mock auth guard.
- Import/export for HR staff data.
- Replacing existing applicant mock data.
- Full redesign of V2 settings.

## Architecture decisions
- Use the existing Next.js App Router V2 structure: create `src/app/v2/(app)/hr/page.tsx`.
- Keep HR staff data separate from applicant data in `src/lib/v2/hr/` to avoid coupling hiring candidates with internal staff records.
- Treat CRUD as local client state first. Use a reducer or small custom hook instead of adding a global store.
- Store custom color in the existing theme provider path. Do not create another token source.
- Use CSS custom properties on `document.documentElement` for custom color output, then map them into existing semantic tokens such as `--primary`, `--ring`, `--sidebar-primary`, and chart accents.
- Keep the UI dense and operational, matching the existing V2 workspace style.

## Steps
1. Audit current V2 route and theme contracts.
2. Define `HrStaff` types and mock records in `src/lib/v2/hr/`.
3. Add CRUD helpers or `useHrStaff` hook for create, update, delete, search, filter, and status toggle.
4. Create reusable HR UI components: toolbar, staff table, staff form dialog, delete confirmation, and compact stats strip.
5. Add `src/app/v2/(app)/hr/page.tsx` and wire the page to the HR components.
6. Add the HR navigation item to `V2Sidebar` with a lucide icon and active-state support.
7. Extend theme types to support a custom color mode or custom accent value.
8. Update `ThemeProvider` to persist custom color and write CSS variables to the root element.
9. Update `AppearanceTab` with a color picker, reset action, and preview swatches.
10. Apply the custom color to shared semantic tokens so existing buttons, selected nav, focus rings, and chart accents pick it up.
11. Add tests for HR CRUD hook/helpers, HR page create/edit/delete flows, sidebar HR link, and theme custom color persistence.
12. Verify with `npx tsc --noEmit`, targeted tests if available, `npm run lint`, and `npm run format -- --check`.

## Files to touch
- `src/app/v2/(app)/hr/page.tsx`
- `src/components/v2/hr/HrStaffToolbar.tsx`
- `src/components/v2/hr/HrStaffTable.tsx`
- `src/components/v2/hr/HrStaffFormDialog.tsx`
- `src/components/v2/hr/HrStaffDeleteDialog.tsx`
- `src/components/v2/hr/HrStaffStats.tsx`
- `src/components/v2/hr/__tests__/HrStaffPage.test.tsx`
- `src/components/v2/layout/V2Sidebar.tsx`
- `src/components/v2/layout/__tests__/V2Sidebar.test.tsx`
- `src/components/v2/settings/AppearanceTab.tsx`
- `src/lib/v2/hr/mockHrStaff.ts`
- `src/lib/v2/hr/types.ts`
- `src/lib/v2/hr/useHrStaff.ts`
- `src/lib/v2/hr/__tests__/useHrStaff.test.ts`
- `src/lib/v2/theme/ThemeProvider.tsx`
- `src/lib/v2/theme/types.ts`
- `src/lib/v2/theme/__tests__/ThemeProvider.test.tsx`
- `src/app/globals.css`

## Acceptance criteria
- HR route is available at `/v2/hr` inside the authenticated V2 workspace shell.
- Sidebar includes an HR item and marks it active on `/v2/hr`.
- HR page renders mock staff records with search/filter controls.
- User can create, edit, delete, and toggle status for staff records without a backend.
- CRUD updates stay local to the current browser session.
- Custom color can be selected in Appearance settings and reset to default.
- Custom color persists through refresh using the existing persistence pattern.
- Custom color visibly affects shared semantic UI surfaces without adding a second theme-token layer.
- TypeScript, lint, formatting checks, and focused tests pass or documented blockers are listed in the report.

## Risks and mitigations
| Risk | Impact | Mitigation |
| ---- | ------ | ---------- |
| Custom color conflicts with shadcn Nova tokens | High | Keep one source of truth in `ThemeProvider` and root CSS variables. |
| Route naming collides with existing HR workspace wording | Medium | Use `/v2/hr` and label the sidebar item `HR Team`. |
| CRUD state grows too complex inside page component | Medium | Extract `useHrStaff` before building UI interactions. |
| Color picker produces inaccessible contrast | Medium | Clamp to accent surfaces first and keep foreground tokens unchanged unless contrast is validated. |
| Existing dirty worktree contains unrelated changes | Medium | Touch only HR, theme, sidebar, and tests listed above. |

## Open questions
- Should the route label be `HR Team`, `Employees`, or `Staff`?
- Should mock HR staff roles include only internal HR roles, or also hiring managers and interviewers?
- Should custom color apply only to the current user preference, or become a workspace-wide mock setting later?

---

# Plan: V2 Glassmorphism Themes

## Goal
Add selectable Glass Orange and Glass Blue themes to the V2 workspace using the existing V2 theme provider and sampled Dribbble reference colors.

## Scope
- Add `main`, `glass-orange`, and `glass-blue` theme values.
- Add V2-only glass CSS tokens for backgrounds, surfaces, borders, shadows, glow, sidebar, cards, and charts.
- Update `/v2/settings` so users can select Main, Glass Orange, or Glass Blue.
- Apply the glass treatment to the V2 shell, sidebar, topbar, dashboard cards, charts, candidate views, drawers, report modal, compare modal, and auth cards.
- Keep the table readable with glass wrappers and near-solid row/content surfaces.
- Verify `/v2/dashboard`, `/v2/candidates`, and `/v2/settings` in browser.
- Out of scope: changing the legacy `/` dashboard route, adding a new theme stack, or copying the Dribbble layout exactly.

## Steps
1. Open the Dribbble orange and blue references and capture CDN image URLs.
2. Pixel-sample the reference images and choose primary, background, chart, and glow colors.
3. Update V2 theme types, provider schema, default value, and theme tests.
4. Update `AppearanceTab` with Main, Glass Orange, and Glass Blue cards.
5. Add V2 glass theme selectors and CSS variables in `src/styles/v2-themes.css`.
6. Add shared `data-v2-*` hooks for glass panels, cards, fields, muted text, headings, and glow surfaces.
7. Apply glass styles to the V2 shell, sidebar, topbar, nav pill, drawers, dashboard widgets, candidate filters, table, pipeline, gallery, compare, report, and auth surfaces.
8. Fix any test blockers discovered during verification without changing unrelated behavior.
9. Run lint, typecheck, full tests, production build, and browser verification.

## Files to touch
- `src/styles/v2-themes.css`
- `src/lib/v2/theme/types.ts`
- `src/lib/v2/theme/ThemeProvider.tsx`
- `src/lib/v2/theme/__tests__/ThemeProvider.test.tsx`
- `src/components/v2/settings/AppearanceTab.tsx`
- `src/app/v2/layout.tsx`
- `src/components/v2/layout/V2WorkspaceShell.tsx`
- `src/components/v2/layout/V2Sidebar.tsx`
- `src/components/v2/layout/V2TopBar.tsx`
- `src/components/v2/layout/ViewPillNav.tsx`
- `src/components/v2/common/DrawerShell.tsx`
- `src/components/dashboard/StatsCard.tsx`
- `src/components/dashboard/OverviewCharts.tsx`
- `src/components/table/ApplicantTable.tsx`
- `src/components/table/DraggableRow.tsx`
- `src/components/v2/candidates/CandidateFiltersBar.tsx`
- `src/components/v2/views/ChartView.tsx`
- `src/components/v2/views/PipelineView.tsx`
- `src/components/v2/views/GalleryView.tsx`
- `src/components/v2/views/ThemedView.tsx`
- `src/components/v2/views/ApplicantDetailDrawer.tsx`
- `src/components/v2/chat/AiDrawer.tsx`
- `src/components/v2/notes/NotesDrawer.tsx`
- `src/components/v2/report/ReportModal.tsx`
- `src/components/v2/pin/PinnedToolbar.tsx`
- `src/components/v2/pin/ComparePage.tsx`
- `src/components/v2/auth/AuthCard.tsx`
- `src/components/v2/auth/LoginForm.tsx`
- `src/components/v2/auth/SignupForm.tsx`
- `src/components/v2/auth/ForgotForm.tsx`
- `src/components/v2/auth/OtpForm.tsx`
- `src/components/v2/public/PublicReport.tsx`
- `src/components/ui/sidebar.tsx`
- `src/hooks/use-mobile.ts`
- `src/app/lab/components/GalleryView.tsx`
- `src/app/lab/components/KanbanView.tsx`

---

# Plan: Clickable Controls Shadcn Button Normalization

## Goal
Normalize every clickable button-like surface to use the shared shadcn `Button` component and ensure correct cursor states.

## Scope
- Convert raw `<button>` tags in non-test source files to `Button`.
- Add a plain `Button` variant and size so existing custom visual styles remain stable.
- Preserve drag, resize, pagination, dropdown, and dialog primitive behavior.
- Convert simple clickable backdrops, upload zones, and clickable cards where conversion is valid.
- Keep non-button primitives such as `DropdownMenuItem`, `Dialog.Backdrop`, and pagination triggers when they own their own accessibility behavior.
- Exclude test files and unrelated feature changes.

## Steps
1. Scan the repository for raw `<button>` tags, `role="button"`, and clickable non-button elements.
2. Add `plain` variant and `plain` size to `src/components/ui/button.tsx`.
3. Convert raw `<button>` tags to `Button variant="plain" size="plain"`.
4. Convert simple clickable `div` surfaces to `Button` when valid.
5. Use layered full-card `Button` elements for clickable cards that contain nested action buttons.
6. Keep `Dialog.Backdrop`, `DropdownMenuItem`, and pagination triggers as their existing components.
7. Run scans for raw button tags and unsupported clickable tags.
8. Run TypeScript, lint, and diff whitespace checks.

## Files to touch
- `src/components/ui/button.tsx`
- `src/app/globals.css`
- `src/app/page.tsx`
- `src/components/upload/GlobalDropZone.tsx`
- `src/components/upload/UploadZone.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/TopBar.tsx`
- `src/components/layout/MobileBottomNav.tsx`
- `src/components/table/DraggableRow.tsx`
- `src/components/chat/FloatingChat.tsx`
- `src/components/v2/**`
- `src/app/lab/components/**`

---

# Plan: V2 Replaces V1 at Root

## Goal
Make V2 the primary application experience by moving the current V2 workspace to `/` and keeping legacy V1 only as temporary fallback code until parity is verified.

## Scope

### Included
- Replace the legacy root SPA at `src/app/page.tsx` with the V2 app entry.
- Move authenticated V2 workspace routes from `/v2/*` to root-level routes where the product needs them: `/dashboard`, `/candidates`, and `/settings`.
- Keep public/auth routes available at stable root-level paths: `/login`, `/signup`, `/forgot`, `/otp`, and `/public/...`.
- Update V2 navigation, redirects, auth guards, report share URLs, and tests to use the new root-level route contract.
- Preserve V2 theme, shadcn Nova tokens, sidebar provider wiring, drawers, pinned toolbar, candidate views, and mock auth behavior.
- Add compatibility redirects from old `/v2/*` paths to the new root paths during the transition.
- Keep V1 components untouched unless a V2 route still imports them for shared widgets such as stats, charts, or the applicant table.

### Out of scope
- Real backend integration.
- Rewriting mock auth or replacing localStorage persistence.
- Deleting all V1 source files in the first pass.
- Changing the public report data model.
- Fixing unrelated lab route issues.

## Architecture decisions
- Treat V2 as the route contract and V1 as legacy code. Do not keep two active product shells at `/`.
- Use route duplication or thin re-export files first, then remove `/v2` only after tests and redirects prove the new paths work.
- Keep `src/app/v2/layout.tsx` provider behavior intact when moving to root by introducing an equivalent root provider boundary.
- Keep protected workspace pages under a shared layout so `V2WorkspaceShell`, `SidebarProvider`, `AuthProvider`, `ThemeProvider`, `TooltipProvider`, and `Toaster` stay in one place.
- Update string paths centrally where possible, starting with sidebar nav, auth redirects, report URLs, and tests.
- Do not add another token layer. Continue using `src/app/globals.css` plus `src/styles/v2-themes.css`.

## Steps
1. Audit all V1 and V2 route imports, hard-coded `/v2` links, auth redirects, report share URLs, and tests.
2. Define the target route map:
   - `/` redirects to `/dashboard`.
   - `/dashboard` replaces `/v2/dashboard`.
   - `/candidates` replaces `/v2/candidates`.
   - `/compare` keeps the current `/v2/compare` behavior and redirects to `/candidates` until a real compare page exists.
   - `/settings` replaces `/v2/settings`.
   - `/login`, `/signup`, `/forgot`, `/otp` replace the auth routes under `/v2`.
   - `/public`, `/public/results`, and `/public/report/[shareId]` replace the public routes under `/v2/public`.
3. Create a root-level V2 provider/layout boundary that mirrors the current V2 provider stack.
4. Move or re-export V2 app pages into the new root route locations.
5. Replace `src/app/page.tsx` with a redirect to `/dashboard`.
6. Update `V2Sidebar`, `RequireAuth`, auth forms, report modal, public report CTA, and tests to use root-level paths.
7. Add compatibility redirects for `/v2`, `/v2/dashboard`, `/v2/candidates`, `/v2/compare`, `/v2/settings`, auth routes, and public report routes.
8. Run focused route/auth tests and update snapshots or expectations that mention `/v2`.
9. Run `npx tsc --noEmit`, focused Vitest suites for auth/layout/views/report, `npm run lint`, and `npm run format -- --check`.
10. Start the app only after static checks pass, then verify root routes in browser: `/`, `/login`, `/dashboard`, `/candidates`, `/settings`, and a public report URL.
11. Create the implementation report in `docs/plans/19-05-2026/report.md` with completed files, verification, and any legacy V1 deletion follow-up.

## Files to touch
- `src/app/page.tsx`
- `src/app/layout.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/candidates/page.tsx`
- `src/app/compare/page.tsx`
- `src/app/settings/page.tsx`
- `src/app/login/page.tsx`
- `src/app/signup/page.tsx`
- `src/app/forgot/page.tsx`
- `src/app/otp/page.tsx`
- `src/app/public/page.tsx`
- `src/app/public/results/page.tsx`
- `src/app/public/report/[shareId]/page.tsx`
- `src/app/v2/page.tsx`
- `src/app/v2/(app)/**`
- `src/app/v2/public/**`
- `src/app/v2/login/page.tsx`
- `src/app/v2/signup/page.tsx`
- `src/app/v2/forgot/page.tsx`
- `src/app/v2/otp/page.tsx`
- `src/app/v2/public/layout.tsx`
- `src/components/v2/layout/V2Sidebar.tsx`
- `src/components/v2/auth/RequireAuth.tsx`
- `src/components/v2/auth/LoginForm.tsx`
- `src/components/v2/auth/SignupForm.tsx`
- `src/components/v2/auth/ForgotForm.tsx`
- `src/components/v2/auth/OtpForm.tsx`
- `src/components/v2/report/ReportModal.tsx`
- `src/components/v2/public/PublicReport.tsx`
- `src/components/v2/layout/__tests__/*.test.tsx`
- `src/components/v2/auth/__tests__/*.test.tsx`
- `src/components/v2/views/__tests__/*.test.tsx`
- `src/lib/v2/auth/__tests__/AuthProvider.test.tsx`

## Acceptance criteria
- Visiting `/` sends the user to the V2 dashboard flow, not the legacy SPA shell.
- The V2 workspace is reachable at `/dashboard`, `/candidates`, and `/settings`.
- `/compare` redirects to `/candidates` until the current TODO compare page is replaced by a real page.
- Auth routes work at root-level paths and unauthenticated workspace visits redirect to `/login?from=<root-path>`.
- Old `/v2/*` paths redirect to equivalent new root-level paths.
- Sidebar active states and navigation no longer depend on `/v2`.
- Report sharing creates root-level public report URLs.
- V2 candidate views, drawers, pin toolbar, themes, and workspace shortcuts still work after route migration.
- TypeScript, focused tests, lint, and format checks pass or blockers are documented in the report.

## Risks and mitigations
| Risk | Impact | Mitigation |
| ---- | ------ | ---------- |
| Root layout provider changes break auth or theme hydration | High | Mirror the existing `src/app/v2/layout.tsx` provider stack before moving pages. |
| Hard-coded `/v2` links remain in components or tests | High | Use `rg "/v2"` before and after implementation, then decide which leftovers are intentional compatibility redirects. |
| V1 deletion removes shared components still used by V2 | Medium | Keep shared V1-era components such as stats, charts, and applicant table until V2 owns replacements. |
| Public report links break old shares | Medium | Add `/v2/public/report/[shareId]` compatibility redirect to `/public/report/[shareId]`. |
| Dirty worktree contains unrelated edits | Medium | Touch only route migration files and tests needed for route expectations. |

## Open questions
- Should `/candidates` be the default after login instead of `/dashboard`?
- Should legacy `/lab` remain available after V2 becomes primary?
- After this migration lands, should V1 files be deleted in a separate cleanup plan or kept as shared component sources until V2 replacements exist?
