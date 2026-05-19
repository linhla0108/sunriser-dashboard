# Report: Candidates Page — DnD Fix, Pipeline Kanban, Code Review & Full Fixes

## Status
Completed

## Changes

| File | Description |
| ---- | ----------- |
| `src/components/table/ApplicantTable.tsx` | Moved `filtered` useMemo before `handleDragEnd` (fixes react-compiler lint); fixed filtered drag splice using `prev.map` to preserve non-filtered item positions; separated sort (baked into `items` via `handleSort`) from filter (applied in `filtered` only) |
| `src/components/table/DraggableRow.tsx` | Fixed GPA color dead branch — low GPA (< 7.0) now renders `text-amber-600` instead of silently falling through to `text-muted-foreground` |
| `src/components/v2/views/PipelineView.tsx` | Added cross-column Kanban drag: `useDroppable` per column with `COL_PREFIX = "col::"`, `updateItemColumn` helper, custom `collisionDetection` (rectIntersection for columns, closestCenter for items); two-layer state+ref pattern for `sourceColumnKey`; "Change to [label]" overlay on external drag-over; increased slice cap to 120 |
| `src/components/v2/views/viewUtils.ts` | Added `rawKey: string | null` field to all column objects in `groupApplicants`; stores original `position1` string for safe mutation on empty target columns |
| `src/components/v2/views/GalleryView.tsx` | Increased slice cap from 48 to 120; added truncation notice when data exceeds 120 |
| `src/components/v2/layout/ViewPillNav.tsx` | Added guard to skip keyboard shortcuts `1`–`4` when event target is INPUT, TEXTAREA, or contenteditable |
| `src/lib/v2/views/useViewState.ts` | Added `isDispatchingRef` guard to prevent self-loop double-dispatch when setting view state |
| `src/app/v2/(app)/candidates/page.tsx` | Removed debug `console.log` that was logging 646 applicant objects on every drag render |

## Notes

- Pre-existing lint errors in `src/components/v2/common/ApplicantDetailDrawer.tsx` (19 errors) and `src/hooks/use-mobile.ts` (1 error) were not introduced by these changes and were not in scope.
- The react-compiler "Compilation Skipped" warning in `ApplicantTable.tsx` was resolved by reordering declarations (useMemo before the function that captures it) rather than with an eslint-disable comment — the `react-compiler/react-compiler` rule is not registered in this project's ESLint config.
- All changed files pass `npx tsc --noEmit` and `npx eslint` with zero errors.

---

# Report: Table Editable Chips for Round, Batch, and PIC

## Status
Completed

## Session summary
The table now supports inline editing for Round 1, Round 2, Batch, and PIC through full-width chip/select controls. Edits are no longer display-only: changes flow from `DraggableRow` to `ApplicantTable`, then up to root `/` and V2 candidates state through `onDataChange`.

## Changes

| File | Description |
| ---- | ----------- |
| `src/components/table/DraggableRow.tsx` | Added reusable `SelectChip`; Round 1, Round 2, Batch, and PIC now use chip/select controls. Dropdowns render through `createPortal` with `position: fixed` and matching chip width. Fixed outside-click handling so portal option clicks are not swallowed. Chips are full width inside table cells with truncated labels and stable chevrons. |
| `src/components/table/ApplicantTable.tsx` | Added `onDataChange`; emits updated table data after chip edits and row reorder. Keeps default name sort on initialization and resyncs incoming filtered data through an effect. Fixed the React parent-update warning by calling `onDataChange` outside functional state updaters. |
| `src/components/v2/views/TableView.tsx` | Forwarded `onDataChange` from V2 table view to `ApplicantTable`. |
| `src/app/v2/(app)/candidates/page.tsx` | Wired table edits into existing `handleReorder`/`mergeReordered` path so edited filtered rows merge back into the full applicants list while preserving filtered-out rows. |
| `src/app/page.tsx` | Root table now uses local `applicants` state, so inline edits affect export/report data and the detail drawer state instead of reading immutable `mockApplicants`. |
| `src/components/v2/views/__tests__/TableView.test.tsx` | Added coverage for Round chip changes and Batch/PIC chip changes emitting updated data. |
| `src/test/setup.ts` | Added an in-memory `localStorage` shim to unblock the current Vitest/jsdom environment for V2 persistence-dependent table/pin tests. |

## Bugs found and fixed
- Portal dropdown options were closing before `onClick` fired because outside-click listened on `mousedown` and did not treat the portal menu as inside. Fixed with a `menuRef`.
- React reported `Cannot update a component (CandidatesPage) while rendering a different component (ApplicantTable)` because parent `onDataChange` was called from inside a functional `setItems` updater. Fixed by computing `next` in the event handler, then calling `setItems(next)` and `onDataChange(next)` sequentially.
- Initial test run hit `SecurityError: Cannot initialize local storage without a --localstorage-file path`; fixed by adding an in-memory test storage shim.

## Verification
- `npx tsc --noEmit` passed.
- `npm test -- src/components/v2/views/__tests__/TableView.test.tsx` passed with 4 tests.
- `npx eslint src/components/table/ApplicantTable.tsx src/components/table/DraggableRow.tsx src/components/v2/views/TableView.tsx src/components/v2/views/__tests__/TableView.test.tsx` passed.
- `npx eslint src/components/table/DraggableRow.tsx` passed after the full-width chip style update.

## Remaining notes
- Full `npm run lint` still has unrelated pre-existing V2 lint debt in `ApplicantDetailDrawer.tsx` and `src/hooks/use-mobile.ts`, plus warnings in other V2 files. Those were not introduced by this table chip session.
- The chip edits are session-local UI state. They are not persisted to a backend or durable storage yet.

---

# Report: V2 Glassmorphism Themes

## Status
Completed

## Changes

| File | Description |
| ---- | ----------- |
| `src/styles/v2-themes.css` | Added Main, Glass Orange, and Glass Blue V2 theme tokens, sampled colors, glass surfaces, blur, shadows, glow, and shared `data-v2-*` selectors. |
| `src/lib/v2/theme/types.ts` | Replaced legacy `a/b/c` theme values with `main`, `glass-orange`, and `glass-blue`. |
| `src/lib/v2/theme/ThemeProvider.tsx` | Updated the persisted theme schema and default theme to `main`. |
| `src/lib/v2/theme/__tests__/ThemeProvider.test.tsx` | Updated provider test coverage for the new semantic glass theme values. |
| `src/components/v2/settings/AppearanceTab.tsx` | Added Main, Glass Orange, and Glass Blue theme cards with sampled swatches. |
| `src/app/v2/layout.tsx` | Added the V2 workspace background hook. |
| `src/components/v2/layout/V2WorkspaceShell.tsx` | Added the V2 workspace background hook to the authenticated shell. |
| `src/components/v2/layout/V2Sidebar.tsx` | Added the glass panel hook to the V2 sidebar. |
| `src/components/v2/layout/V2TopBar.tsx` | Applied strong glass styling and semantic primary foreground text. |
| `src/components/v2/layout/ViewPillNav.tsx` | Applied strong glass styling and semantic active icon text. |
| `src/components/v2/common/DrawerShell.tsx` | Applied strong glass styling to docked and floating drawers. |
| `src/components/dashboard/StatsCard.tsx` | Added V2 card and text hooks while preserving the legacy dashboard fallback colors. |
| `src/components/dashboard/OverviewCharts.tsx` | Mapped chart colors, grid colors, tooltip styling, and card panels to V2 glass tokens. |
| `src/components/table/ApplicantTable.tsx` | Added a V2 card hook to the table wrapper for glass theme support. |
| `src/components/table/DraggableRow.tsx` | Added a strong glass hook to row select popovers. |
| `src/components/v2/candidates/CandidateFiltersBar.tsx` | Applied glass field and mobile filter sheet styling. |
| `src/components/v2/views/ChartView.tsx` | Mapped mini chart cards and colors to V2 glass tokens. |
| `src/components/v2/views/PipelineView.tsx` | Applied glass card styling to pipeline columns, cards, and overlays. |
| `src/components/v2/views/GalleryView.tsx` | Applied glass card styling to gallery cards and drag overlays. |
| `src/components/v2/views/ThemedView.tsx` | Removed the old `b/c` skeleton-theme branch so glass themes render the real views. |
| `src/components/v2/views/ApplicantDetailDrawer.tsx` | Applied glass drawer and detail-card styling and removed the render-time ref pattern. |
| `src/components/v2/chat/AiDrawer.tsx` | Applied semantic primary foreground and glass input styling. |
| `src/components/v2/notes/NotesDrawer.tsx` | Applied semantic primary foreground and glass note-card styling. |
| `src/components/v2/report/ReportModal.tsx` | Applied strong glass modal styling and glass report section cards. |
| `src/components/v2/pin/PinnedToolbar.tsx` | Applied strong glass toolbar styling and semantic primary foreground text. |
| `src/components/v2/pin/ComparePage.tsx` | Applied strong glass modal styling and semantic primary foreground text. |
| `src/components/v2/auth/AuthCard.tsx` | Applied glass card styling and semantic primary foreground text. |
| `src/components/v2/auth/LoginForm.tsx` | Switched the primary submit button to semantic primary foreground text. |
| `src/components/v2/auth/SignupForm.tsx` | Switched the primary submit button to semantic primary foreground text. |
| `src/components/v2/auth/ForgotForm.tsx` | Switched the primary submit button to semantic primary foreground text. |
| `src/components/v2/auth/OtpForm.tsx` | Switched the primary submit button to semantic primary foreground text. |
| `src/components/v2/public/PublicReport.tsx` | Switched the public report call-to-action to semantic primary foreground text. |
| `src/components/ui/sidebar.tsx` | Renamed the sidebar rail accessible label and replaced mobile detection state sync with `useSyncExternalStore`. |
| `src/hooks/use-mobile.ts` | Replaced synchronous effect state updates with `useSyncExternalStore`. |
| `src/app/lab/components/GalleryView.tsx` | Restored card container click behavior required by existing lab interaction tests. |
| `src/app/lab/components/KanbanView.tsx` | Restored card container click behavior required by existing lab interaction tests. |

## Notes
- Dribbble page fetch was blocked by WAF through plain shell access, but the browser session exposed the CDN image URLs. The implementation sampled the CDN images directly.
- Sampled orange colors: `#d26c30`, `#efc385`, `#da8f48`, and `#f0c07c`.
- Sampled blue colors: `#7bbfe7`, `#8dd1f6`, `#bce3fb`, and `#94c6e3`.
- Verification passed: `npm run lint` with two warnings, `npx tsc --noEmit`, `npm test`, `npm run build`, and browser checks for `/v2/settings`, `/v2/dashboard`, and `/v2/candidates`.
- The remaining lint warnings are pre-existing or accepted warnings: unused `hasFilters` in `CandidateFiltersBar` and `<img>` usage in `V2Sidebar`.

---

# Report: Clickable Controls Shadcn Button Normalization

## Status
Completed

## Changes

| File | Description |
| ---- | ----------- |
| `src/components/ui/button.tsx` | Added `plain` variant and `plain` size; added pointer and not-allowed cursor states to the shared button primitive. |
| `src/app/globals.css` | Added base cursor rules for native interactive controls. |
| `src/components/ui/select.tsx` | Added pointer and not-allowed cursor states to select triggers, items, and scroll controls. |
| `src/components/ui/dropdown-menu.tsx` | Added pointer and not-allowed cursor states to dropdown menu item primitives. |
| `src/components/ui/tabs.tsx` | Added pointer and not-allowed cursor states to tab triggers. |
| `src/components/ui/checkbox.tsx` | Added pointer cursor to checkbox control. |
| `src/components/ui/radio-group.tsx` | Added pointer cursor to radio items. |
| `src/components/ui/switch.tsx` | Added pointer cursor to switch control. |
| `src/components/ui/slider.tsx` | Added pointer, grab, grabbing, and not-allowed cursor states to slider controls. |
| `src/components/ui/input.tsx` | Preserved disabled not-allowed cursor and added pointer cursor to file input button. |
| `src/components/ui/sidebar.tsx` | Converted sidebar trigger raw button and added cursor states to sidebar button variants. |
| `src/app/page.tsx` | Converted top-bar action buttons to shared `Button`. |
| `src/components/upload/GlobalDropZone.tsx` | Converted upload popup actions and backdrop close surface to shared `Button`. |
| `src/components/upload/UploadZone.tsx` | Converted clickable upload drop zone and actions to shared `Button`. |
| `src/components/layout/Sidebar.tsx` | Converted navigation buttons to shared `Button`. |
| `src/components/layout/TopBar.tsx` | Converted mobile menu button to shared `Button`. |
| `src/components/layout/MobileBottomNav.tsx` | Converted bottom navigation buttons to shared `Button`. |
| `src/components/table/DraggableRow.tsx` | Converted row avatar, inline-edit, and action buttons to shared `Button`. |
| `src/components/chat/FloatingChat.tsx` | Converted floating chat buttons and suggested prompt buttons to shared `Button`. |
| `src/components/v2/**` | Converted raw V2 buttons to shared `Button` and kept owned primitives where appropriate. |
| `src/app/lab/components/**` | Converted raw lab buttons to shared `Button`; converted simple backdrops and layered clickable cards safely. |

## Notes
- The plan was documented after implementation because the initial cursor and button normalization work started before this plan file was created.
- `rg "<button|</button>" src --glob '!**/__tests__/**'` returns no raw button tags.
- A custom scan for `onClick` found only approved component surfaces: `Button`, `Dialog.Backdrop`, `DropdownMenuItem`, `Pagination.PrevTrigger`, and `Pagination.NextTrigger`.
- `npx tsc --noEmit` passed.
- `npm run lint` passed with two warnings: unused `hasFilters` in `CandidateFiltersBar.tsx`, and Next.js `<img>` warning in `V2Sidebar.tsx`.
- `git diff --check` passed.

---

# Report: V2 Replaces V1 at Root

## Status
Completed

## Changes

| File | Description |
| ---- | ----------- |
| `src/app/layout.tsx` | Added V2 providers (TooltipProvider, ThemeProvider, AuthProvider, Toaster) and V2 theme CSS import to the root layout. |
| `src/app/page.tsx` | Replaced V1 SPA with a redirect to `/dashboard`. |
| `src/app/(workspace)/layout.tsx` | Created workspace route group layout wrapping pages with `V2WorkspaceShell`. |
| `src/app/(workspace)/dashboard/page.tsx` | Root dashboard page with V2 stats and charts. |
| `src/app/(workspace)/candidates/page.tsx` | Root candidates page with full view/filter/reorder logic. |
| `src/app/(workspace)/settings/page.tsx` | Root settings page with Appearance, Workspace, and Account tabs. |
| `src/app/(workspace)/compare/page.tsx` | Redirect to `/candidates` (existing behavior preserved). |
| `src/app/login/page.tsx` | Root login page pointing success to `/dashboard`. |
| `src/app/signup/page.tsx` | Root signup page pointing success to `/otp`. |
| `src/app/forgot/page.tsx` | Root forgot-password page. |
| `src/app/otp/page.tsx` | Root OTP page pointing success to `/dashboard`. |
| `src/app/public/layout.tsx` | Root public layout with navigation links pointing to `/login`. |
| `src/app/public/page.tsx` | Redirect to `/public/results`. |
| `src/app/public/results/page.tsx` | Root public results page. |
| `src/app/public/report/[shareId]/page.tsx` | Root public report page. |
| `src/components/v2/layout/V2Sidebar.tsx` | Updated nav hrefs to root paths and added HR Team nav item. |
| `src/components/v2/auth/RequireAuth.tsx` | Updated redirect to `/login?from=<pathname>`. |
| `src/components/v2/report/ReportModal.tsx` | Updated share URL to `/public/report/{shareId}`. |
| `src/components/v2/public/PublicReport.tsx` | Updated login CTA to `/login`. |
| `src/app/v2/page.tsx` | Compatibility redirect to `/dashboard`. |
| `src/app/v2/(app)/dashboard/page.tsx` | Compatibility redirect to `/dashboard`. |
| `src/app/v2/(app)/candidates/page.tsx` | Compatibility redirect to `/candidates`. |
| `src/app/v2/(app)/settings/page.tsx` | Compatibility redirect to `/settings`. |
| `src/app/v2/(app)/compare/page.tsx` | Compatibility redirect to `/candidates`. |
| `src/app/v2/login/page.tsx` | Compatibility redirect to `/login`. |
| `src/app/v2/signup/page.tsx` | Compatibility redirect to `/signup`. |
| `src/app/v2/forgot/page.tsx` | Compatibility redirect to `/forgot`. |
| `src/app/v2/otp/page.tsx` | Compatibility redirect to `/otp`. |
| `src/app/v2/public/layout.tsx` | Stripped to passthrough (content moved to root public layout). |
| `src/app/v2/public/page.tsx` | Compatibility redirect to `/public/results`. |
| `src/app/v2/public/results/page.tsx` | Compatibility redirect to `/public/results`. |
| `src/app/v2/public/report/[shareId]/page.tsx` | Compatibility redirect to `/public/report/{shareId}`. |
| `src/components/v2/auth/__tests__/RequireAuth.test.tsx` | Updated mock pathname and expected redirect to root paths. |
| `src/components/v2/layout/__tests__/V2Sidebar.test.tsx` | Updated mock pathname to `/dashboard`. |
| `src/components/v2/layout/__tests__/V2WorkspaceShell.shortcuts.test.tsx` | Updated mock pathname to `/dashboard`. |

## Notes
- V1 source files were not deleted. Shared V1-era widgets (stats cards, charts, applicant table) are still in active use by V2.
- `/lab` route remains untouched.
- The root layout now owns all V2 providers so the `src/app/v2/layout.tsx` providers become redundant for the new root routes, but the V2 compatibility redirects short-circuit before rendering, so double-wrapping is not a problem.
- 38 test files, 269 tests — all pass.
- `npm run lint` passed with 2 pre-existing warnings.

---

# Report: HR Staff Route, Mock CRUD, and Custom Color System

## Status
Completed

## Changes

| File | Description |
| ---- | ----------- |
| `src/lib/v2/hr/types.ts` | `HrStaff`, `HrRole`, and `HrStatus` type definitions. |
| `src/lib/v2/hr/mockHrStaff.ts` | 8 mock HR staff records matching real PIC names. |
| `src/lib/v2/hr/useHrStaff.ts` | Client-side CRUD reducer hook with search, role, and status filters. |
| `src/components/v2/hr/HrStaffStats.tsx` | Stats strip showing total, active, and inactive counts. |
| `src/components/v2/hr/HrStaffToolbar.tsx` | Search input, role filter, status filter, and Add button. |
| `src/components/v2/hr/HrStaffTable.tsx` | Responsive table with avatar, role, status badge, toggle, edit, and delete actions. |
| `src/components/v2/hr/HrStaffFormDialog.tsx` | Create/edit dialog with keyed inner component to avoid setState-in-effect lint error. |
| `src/components/v2/hr/HrStaffDeleteDialog.tsx` | Delete confirmation dialog using shadcn Dialog. |
| `src/app/(workspace)/hr/page.tsx` | `/hr` page wiring all HR components together. |
| `src/components/v2/layout/V2Sidebar.tsx` | Added `HR Team` nav item with `UsersRound` icon at `/hr`. |
| `src/lib/v2/theme/types.ts` | Added `customColor` and `setCustomColor` to `ThemeContextValue`. |
| `src/lib/v2/theme/ThemeProvider.tsx` | Persists custom color to `v2.custom-color`; applies HSL-converted value to `--primary` and `--ring` CSS variables on the root element. |
| `src/components/v2/settings/AppearanceTab.tsx` | Added custom accent color section with a native color picker and reset button. |
| `src/lib/v2/theme/__tests__/ThemeProvider.test.tsx` | Added test coverage for custom color set and reset behavior. |

## Notes
- HR data is session-local; no backend or localStorage persistence.
- `AlertDialog` was not installed; used `Dialog` for the delete confirmation instead.
- Custom color converts hex to HSL and applies to `--primary` and `--ring` CSS variables so all shadcn primary surfaces pick it up without adding a second token layer.
- 269 tests pass, 0 lint errors.
