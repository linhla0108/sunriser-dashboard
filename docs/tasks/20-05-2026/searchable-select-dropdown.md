# Searchable Select Dropdown
Tag: ui/feature

## Goal
Make the shared select feel like a polished searchable select: the popup opens below the trigger instead of covering it, users can type to filter options, and the selected value remains as muted hint text while searching.

## Scope
- Included: shared searchable select component, non-overlapping popup placement, selected-value-as-muted-hint behavior, option filtering, disabled unavailable options, keyboard and mouse selection, empty state, focused visual QA.
- Included: migrate candidate filter selects and HR/settings selects that benefit from quick search.
- Excluded: multi-select, creatable options, async remote search, backend filtering, table inline chip dropdown rewrite.

## Acceptance criteria
- Dropdown content opens below or above the trigger with a small offset and does not cover the trigger in normal viewport space.
- Typing inside the select filters options without changing the selected value until an option is chosen.
- When the select has a value and the search input is empty, the selected label appears muted like placeholder text while the dropdown is open.
- Clearing the search text restores the muted selected-label hint without clearing the committed value.
- Selecting an option updates the value, closes the dropdown, and clears the transient search query.
- Values that currently have no matching data remain visible in the dropdown but are disabled, visually muted, and cannot be selected. Do not hide them.
- Disabled unavailable options apply to data-backed filters such as empty batches or positions with zero candidates.
- Keyboard use supports focus, typing, arrow navigation, Enter selection, Escape close, and Tab blur without trapping focus.
- Existing non-search selects either keep their current behavior or opt into the new searchable variant explicitly.
- TypeScript and lint checks pass, and browser QA covers desktop and mobile select opening/searching.

---

## Report
Status: Done

Added a shared `SearchableSelect` for opt-in searchable dropdowns. The popup opens below the trigger with a small offset, includes a search input, keeps the selected value as the input hint while searching, filters visible options without committing the value, supports disabled visible options, and commits mouse/keyboard selection before closing.

Migrated the high-value selects first: candidate desktop filters, candidate mobile filter sheet, HR staff toolbar, HR staff form, and public admitted-position filtering. Candidate filter options now use the full applicant list to disable zero-match position, batch, and result choices while keeping them visible.

Verification:
- `npm test -- src/components/ui/__tests__/SearchableSelect.test.tsx`
- `npx tsc --noEmit`
- `npm run lint` exits 0 with two existing warnings in unrelated files.
- Browser QA on `http://localhost:3000/candidates`: desktop position dropdown opened below the trigger, search narrowed to Data Analysis, selection committed to `?position=Data+Analysis+Intern`, and count updated to 7 of 40. Mobile filter sheet rendered searchable select triggers correctly.

Remaining: Existing mobile page/table horizontal overflow is still visible around the candidate surface. It is outside this searchable-select task.
