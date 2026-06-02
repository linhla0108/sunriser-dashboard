# Handoff — 26 May 2026

Branch: `codex/v2-workspace-plan`

## Current checkpoint

This checkpoint is being committed because the selected-section UI bug is still not accepted and the user asked to push the completed/in-progress task files before continuing.

## Candidate Table Bulk Selection

Status: In progress / needs follow-up

Done in this checkpoint:

- Bulk-selection workflow files are present in the workspace.
- Selected rows are kept in a top selected section while filters/search are active.
- Selected section has animejs open/close animation.
- Bulk context menu and selected multi-drag work in focused tests.
- Compact bulk action button lives in the filter bar.

Known unresolved issue:

- Selected-section row border/highlight still has visual mismatch in some cases.
- The user reports spacing still differs from filtered results and last selected row styling can still look wrong.
- Avoid reintroducing `border-separate border-spacing-0` on the main table; it fixed a measured 1px inset but broke the existing row border/highlight workaround.
- Current attempted mitigation:
  - Keep main table border model unchanged.
  - In selected-section nested table, use `-ml-px w-[calc(100%+1px)] min-w-[601px]`.
  - For selected rows, preserve status `rowBg` and draw selected/status rail via inset shadows rather than relying only on `border-left`.

Recommended next investigation:

- Reproduce in browser with several selected rows, including a row with no round status and the last selected row.
- Compare selected-section nested-table row geometry against filtered-result row geometry.
- Prefer a selected-section-specific row renderer or wrapper-level rail if collapsed-table border conflict continues.

Recent verification for candidate table:

- `npx eslint src/components/table/ApplicantTable.tsx src/components/table/DraggableRow.tsx` — pass
- `npx tsc --noEmit` — pass
- `npm test -- --run src/components/table/__tests__/ApplicantTable.sort.test.tsx` — 10 tests pass
- `npm run test:e2e -- tests/e2e/candidates-table.spec.ts` — 8 tests pass

## Schedule

Status: Done / polish in progress

Done:

- `/schedule` screen exists with Gantt and Agenda views.
- Sidebar has Schedule nav.
- Mock timeline data, schedule URL state, filters, cutoff parser, and PIC parser are present.
- Schedule task doc says feature verification passed earlier.

In progress / needs review:

- Schedule drawer polish task exists as a planned/in-progress spec.
- Some shared sheet/drawer animation styles are modified; verify shared Sheet usage before accepting.

Recommended next verification:

- Re-run `npx tsc --noEmit`.
- Run focused lint on schedule files and shared `sheet.tsx`.
- Browser check `/schedule` desktop and mobile.

## Dirty-worktree caution

This branch had multiple task streams active at once. Before continuing implementation, review the commit diff and avoid mixing candidate-table bug fixes with schedule polish unless explicitly requested.
