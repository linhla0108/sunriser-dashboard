# Compact Bulk Action Button

Tag: candidates/ui

## Goal

Make the candidate table bulk action UI more compact by replacing the visible bulk cluster with one action button.

## Scope

- Included: candidate filter bar bulk trigger, bulk popover menu, stale standalone bulk component cleanup, focused e2e coverage.
- Excluded: table selection model, URL state, data mutation behavior, pipeline/chart views, broader filter redesign.

## Acceptance criteria

- When one or more candidates are selected, the filter row remains visible.
- The filter row shows one orange `{N} selected` button with a chevron instead of separate count, action, and clear controls.
- The popover includes `Set Batch`, `Assign PIC`, `Clear selection`, and `Delete selected`.
- Existing Batch, PIC, and Delete confirmation flows keep their current behavior.
- Clearing selection from the popover hides the compact bulk button.

---

## Report

Status: Done | Commit: current commit

`CandidateFiltersBar` now keeps normal filters visible while selected rows are active and renders one compact `{N} selected` popover trigger in the filter row. `Clear selection` moved into that popover menu, and the unused standalone `BulkActionBar` component was removed.

The focused Playwright coverage now opens the compact bulk button, verifies the menu actions, and clears selection from the popover.

Verification:

- `npx eslint src/components/candidates/CandidateFiltersBar.tsx tests/e2e/candidates-table.spec.ts` — pass
- `npm test -- src/components/table/__tests__/ApplicantTable.sort.test.tsx` — 10 tests pass
- `npx playwright test tests/e2e/candidates-table.spec.ts -g "selecting a row shows bulk count"` — pass

Remaining:

- Full `npm run lint` still fails on unrelated existing `react-hooks/set-state-in-effect` errors in admin/dashboard files.
