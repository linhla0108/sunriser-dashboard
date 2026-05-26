# Candidate Search Highlight

Tag: candidates/feature

## Goal

Show the active candidate search term inside visible candidate text across table, pipeline, and gallery views.

## Scope

- Included: case-insensitive highlight for the current search query.
- Included: table fields for name, email, position, and university.
- Included: pipeline card fields for name and position.
- Included: gallery card fields for name, position, and university.
- Included: safe handling for search text with regex characters.
- Excluded: changing filter matching rules.
- Excluded: highlighting fields that are not rendered in a view.
- Excluded: chart view highlighting.

## Architecture decisions

- Highlighting is display-only. It uses the already-normalized `search` value from the candidates page.
- Candidate views receive `searchQuery` as a prop instead of reading URL params directly.
- `SearchHighlight` escapes the search term before building a matcher, so terms like `C++` are treated as literal text.
- Highlight markup uses inline `mark` elements with token-based styling and no layout-changing behavior.

## Acceptance criteria

- [x] Searching by name highlights matching name text in table, pipeline, and gallery.
- [x] Searching by email highlights matching email text in the table.
- [x] Searching by position highlights visible position text in table, pipeline, and gallery.
- [x] Searching by university highlights visible university text in table and gallery.
- [x] Empty search renders plain text with no `mark` elements.
- [x] Regex-special search text does not break rendering.

---

## Report

Status: Done | Commit: uncommitted

Added a reusable search highlight renderer and wired `searchQuery` through the candidate table, pipeline, and gallery view contracts. The table highlights name, email, position, and university. Pipeline highlights name and position. Gallery highlights name, position, and university.

Remaining: full `npm test` timed out across unrelated suites in this environment. Focused affected tests passed after rerun.

## Verification

- `npm test -- candidateUrlState SearchHighlight TableView PipelineGallery` — passed, 5 files, 33 tests.
- `npx tsc --noEmit` — passed.
- `npm run lint` — passed with 2 existing warnings:
  - `src/components/layout/Sidebar.tsx`: Next.js `<img>` warning.
  - `src/components/table/__tests__/ApplicantTable.sort.test.tsx`: unused `rowOrder` warning.
- `npm run build` — passed.
- Browser smoke passed for `/candidates?search=An&view=gallery`.
