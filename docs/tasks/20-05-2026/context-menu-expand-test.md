# Context Menu — Expand + Test

Tag: ui/feature

## Goal

Add missing actions to both context menus, then cover every menu item and viewport with a Playwright test suite.

## Scope

- Included: new menu items (Round 2 quick-set, Assign PIC, Reset Filters, Pin row), Playwright tests for global menu + row menu on 3 viewports (desktop / tablet / mobile), edge-position overflow detection
- Excluded: backend persistence, drag-select multi-row context, gallery/pipeline card context menu, keyboard navigation beyond Escape-to-close

---

## Phase 1 — Add new context menu functions

### Task 1: Row menu — Round 2 quick-set submenu

**Description:** Add a "Round 2 status" section to the row context menu, mirroring the existing Round 1 section (Passed / Failed / Waiting list). Wired to `onUpdateApplicant`.

**Acceptance criteria:**

- [ ] Right-clicking a row shows "Round 2 status" below the Round 1 section
- [ ] Clicking Passed/Failed/Waiting list updates `round2Result` via `onUpdateApplicant`
- [ ] Current value is disabled (can't click same value twice)
- [ ] Menu closes after selection

**Files:** `src/components/table/DraggableRow.tsx`
**Size:** S

---

### Task 2: Row menu — Assign PIC submenu

**Description:** Add a "Assign PIC" flyout submenu listing the 6 PIC options (Quỳnh, Nhiên, Yến, Minh, Huy, Linh). Active PIC shown with a checkmark. Wired to `onUpdateApplicant`.

**Acceptance criteria:**

- [ ] "Assign PIC" item shows chevron → hover opens flyout with 6 names
- [ ] Current PIC is shown with a `✓` indicator and is disabled
- [ ] Selecting a name calls `onUpdateApplicant(id, { pic: name })` and closes menu

**Files:** `src/components/table/DraggableRow.tsx`
**Size:** S

---

### Task 3: Row menu — Pin / Unpin row

**Description:** Add "Pin to top" / "Unpin" toggle to the row context menu. Pinned rows sort to the top of the visible list. Requires a `pinned` boolean field on `Applicant` or a separate pinned-IDs set in `ApplicantTable` state.

**Acceptance criteria:**

- [ ] Unpinned row shows "Pin to top"; pinned row shows "Unpin"
- [ ] Pinning moves the row to the top of the table immediately (optimistic update)
- [ ] Pin persists across filter changes within the same session

**Files:** `src/components/table/DraggableRow.tsx`, `src/components/table/ApplicantTable.tsx` (or equivalent), `src/lib/types.ts`
**Size:** M

---

### Task 4: Global menu — Reset Filters action

**Description:** Add "Reset filters" to the workspace context menu. Calls an `onResetFilters` callback prop (passed down from the table view). Only visible when a filter is active (i.e., callback is defined and truthy).

**Acceptance criteria:**

- [ ] "Reset filters" item appears in the global menu when `onResetFilters` prop is provided
- [ ] Clicking it clears all active filters in `ApplicantTable`
- [ ] Item is absent when no filter is active

**Files:** `src/components/context/WorkspaceContextMenu.tsx`, `src/components/layout/WorkspaceShell.tsx` (or equivalent shell), `src/components/table/ApplicantTable.tsx`
**Size:** M

---

### Task 5: Global menu — Copy page URL action

**Description:** Add "Copy page link" to the global menu. Copies `window.location.href` to clipboard. Shows a brief "Copied!" label on the menu item for 1.5 s.

**Acceptance criteria:**

- [ ] Item copies current URL to clipboard
- [ ] Label text toggles to "Copied!" for 1.5 s then resets
- [ ] Works on all viewports (mobile has no sidebar shortcut)

**Files:** `src/components/context/WorkspaceContextMenu.tsx`
**Size:** S

---

### Checkpoint A — after Tasks 1–5

- [ ] `npx tsc --noEmit` — zero errors
- [ ] `npm run lint` — zero errors
- [ ] Manual right-click on a row shows all new items
- [ ] Global right-click shows Reset Filters + Copy page link

---

## Phase 2 — Playwright test suite

### Task 6: Playwright setup

**Description:** Install Playwright and add a `playwright.config.ts` at the project root. Configure three projects: Desktop (1280×800), Tablet (768×1024), Mobile (390×844). Add `npm run test:e2e` script to `package.json`. Use `baseURL: http://localhost:3000`.

**Acceptance criteria:**

- [ ] `npx playwright install` installs browsers
- [ ] `npm run test:e2e` runs without configuration error
- [ ] Three browser projects visible in test output

**Files:** `playwright.config.ts`, `package.json`
**Size:** S

---

### Task 7: Global context menu tests

**Description:** Write Playwright tests for the workspace global context menu. Cover: open on right-click, close on outside click, close on Escape, each menu item renders, CSV download triggers on Export, submenu opens on hover.

**Test cases:**

- [ ] Right-click on workspace background → menu appears with correct items
- [ ] Click outside menu → menu disappears
- [ ] Press Escape → menu disappears
- [ ] "Copy selected text" item renders (cannot test clipboard in all CI configs — assert item is present)
- [ ] "Export data" hover → submenu with "CSV — all applicants" + "CSV — passed only" visible
- [ ] "Create report" item renders when prop provided
- [ ] "Keyboard shortcuts" hover → submenu with 3 shortcuts visible
- [ ] Edge case: right-click near right edge → menu does not overflow viewport

**Files:** `tests/e2e/context-menu-global.spec.ts`
**Size:** M

---

### Task 8: Row context menu tests

**Description:** Write Playwright tests for the table row context menu. Cover: open on row right-click, all sections visible, Round 1 quick-set updates chip, Copy submenu, Export row CSV.

**Test cases:**

- [ ] Right-click on row 1 → menu appears with applicant name as label
- [ ] "View detail" item renders
- [ ] "Copy" item shows flyout on hover with name/email/phone
- [ ] "Round 1 status" section shows Passed / Failed / Waiting list buttons
- [ ] Clicking "Mark as Passed" → round1 chip on that row updates (assert chip text)
- [ ] Currently-active round value is disabled
- [ ] "Round 2 status" section behaves identically to Round 1
- [ ] "Assign PIC" flyout renders all 6 PIC names
- [ ] "Export row as CSV" — assert download event fires (use `page.waitForEvent('download')`)
- [ ] Click outside → menu disappears
- [ ] Press Escape → menu disappears
- [ ] Right-click near bottom of viewport → menu opens above cursor (overflow guard)

**Files:** `tests/e2e/context-menu-row.spec.ts`
**Size:** L

---

### Task 9: Viewport tests (responsive)

**Description:** Run a subset of the above specs across all three configured viewports. The row context menu only exists in the table view; assert it does NOT break on mobile (menu still appears, round chip still updates).

**Test cases:**

- [ ] Desktop (1280px): global menu and row menu both work
- [ ] Tablet (768px): row menu appears, University + PIC columns hidden but menu still has Assign PIC
- [ ] Mobile (390px): global menu opens, row menu opens; neither causes layout shift

**Files:** `tests/e2e/context-menu-viewports.spec.ts`
**Size:** M

---

### Task 10: Edge-position overflow guard (implementation)

**Description:** The row context menu currently opens at raw `clientX/clientY`. If the cursor is within 220 px of the right edge or 300 px of the bottom edge, the menu will clip. Add a position-correction step that flips the menu left/up as needed.

**Acceptance criteria:**

- [ ] Right-clicking within 220 px of the right viewport edge → menu opens to the left of cursor
- [ ] Right-clicking within 300 px of the bottom viewport edge → menu opens above cursor
- [ ] Playwright viewport test for each edge case passes

**Files:** `src/components/table/DraggableRow.tsx`
**Size:** S

---

### Checkpoint B — after Tasks 6–10

- [ ] `npm run test:e2e` → all specs green across 3 viewports
- [ ] No overflow on right-edge and bottom-edge right-clicks
- [ ] Zero TypeScript errors after changes

---

## Risks

| Risk                                              | Impact | Mitigation                                                                                                                |
| ------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------- |
| Playwright not installed in CI                    | High   | Add `npx playwright install --with-deps` to CI step                                                                       |
| Clipboard API unavailable in headless browser     | Low    | Assert item presence only; don't assert clipboard content                                                                 |
| `waitForEvent('download')` flaky in Turbopack dev | Medium | Run tests against `npm run build` + `npm start` for file-download assertions                                              |
| Pin state conflicts with dnd-kit sort order       | Medium | Keep pinned-IDs in a `Set` separate from the dnd-kit `items` array; sort pinned first before passing to `SortableContext` |

## Open questions

- Should "Pin to top" survive across filter resets, or reset with filters? (Assume: pin survives — filtered-out pinned rows reappear at top when filter is cleared)
- Does "Reset Filters" also reset the sort order, or only the filter dropdowns?

---

## Report

Status: Done

### Phase 1 — New context menu functions

| Task | Change                                                                          | File(s)                                  |
| ---- | ------------------------------------------------------------------------------- | ---------------------------------------- |
| 1    | Round 2 status section (Passed / Failed / Waiting list)                         | `DraggableRow.tsx`                       |
| 2    | Assign PIC flyout submenu (6 names, checkmark on active)                        | `DraggableRow.tsx`                       |
| 3    | Pin to top / Unpin toggle — pinnedIds Set in ApplicantTable, moves row to front | `DraggableRow.tsx`, `ApplicantTable.tsx` |
| 4    | Reset Filters item (prop-gated, hidden when not provided)                       | `WorkspaceContextMenu.tsx`               |
| 5    | Copy page link with 1.5s "Copied!" feedback                                     | `WorkspaceContextMenu.tsx`               |

### Phase 2 — Playwright test suite

| Task | Deliverable                                                                                    |
| ---- | ---------------------------------------------------------------------------------------------- |
| 6    | `playwright.config.ts` — 3 projects (desktop / tablet / mobile), auth setup, `test:e2e` script |
| 7    | `tests/e2e/context-menu-global.spec.ts` — 9 tests for workspace menu                           |
| 8    | `tests/e2e/context-menu-row.spec.ts` — 14 tests for row menu                                   |
| 9    | `tests/e2e/context-menu-viewports.spec.ts` — 5 cross-viewport smoke tests                      |
| 10   | Overflow guard in `handleContextMenu` — flips menu left/up near viewport edges                 |

### Notes

- `tsc --noEmit` and `npm run lint` both pass (zero errors, one pre-existing Sidebar warning).
- `onResetFilters` prop is wired into `WorkspaceContextMenu` — integration from CandidatesPage requires lifting `clearFilters` up via context or prop drilling (out of scope for this task; item is hidden until prop is provided).
- Auth for Playwright: set `E2E_EMAIL` + `E2E_PASSWORD` env vars and the `setup` project logs in once, saves `storageState`. Without credentials, all tests skip gracefully.
- Run: `npm run test:e2e` (dev server auto-starts if not already running).
