# Candidate Table Bulk Selection Workspace

Tag: candidates/table+bulk

## Goal

Track the candidate table bulk-selection work without keeping one oversized task.

## Split tasks

- `candidate-table-ui-cleanup.md` — bug/scope cleanup before behavior work.
- `candidate-table-selected-section.md` — selected rows persist above filtered results.
- `candidate-table-bulk-context-menu.md` — selected-row right-click bulk edit menu.
- `candidate-table-selected-multidrag.md` — selected rows drag as one block.
- `candidate-table-selected-animation.md` — smooth selected-section collapse/expand.
- `compact-bulk-action-button.md` — compact filter-bar bulk action trigger.

## Shared boundaries

- Keep client-side behavior only.
- Preserve existing table sort semantics.
- Keep selected rows above filtered rows when the selected section is visible.
- Keep unselected single-row interactions intact.
- Do not add persistence/server sync.
- Do not extend this behavior to pipeline/chart views.

## Shared verification

- `npx tsc --noEmit`
- `npx eslint 'src/app/(workspace)/candidates/page.tsx' src/components/table/ApplicantTable.tsx src/components/table/DraggableRow.tsx src/components/views/TableView.tsx src/components/candidates/CandidateFiltersBar.tsx src/components/candidates/SearchHighlight.tsx src/components/table/__tests__/ApplicantTable.sort.test.tsx tests/e2e/candidates-table.spec.ts`
- `npm test -- --run src/components/table/__tests__/ApplicantTable.sort.test.tsx src/components/views/__tests__/ApplicantDetailDrawer.test.tsx`
- `npm run test:e2e -- tests/e2e/candidates-table.spec.ts`

---

## Report

Status: Split

This file is now an index for the smaller candidate table bulk-selection tasks. The implementation details, acceptance criteria, and verification notes live in the task-specific files above.
