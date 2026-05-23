# Candidate URL State Persistence
Tag: candidates/feature

## Goal
Make the candidates page shareable and refresh-safe by storing search, filters, view mode, pagination, sort, and pipeline grouping in URL search params.

## Scope
- Included: `search`, `position`, `batch`, `result`, `view`, `page`, `sort`, and `group` URL params.
- Included: safe parsing for invalid params and clean URL output for default params.
- Excluded: URL state for dashboard, settings, HR, or compare pages.
- Excluded: browser history entries for every filter change.
- Excluded: visual search-term highlighting. Covered by `candidate-search-highlight.md`.

## Architecture decisions

- Candidates page owns URL state. Child components receive typed props and do not read URL params directly.
- Default params are omitted from the URL. Example: `view=table`, `page=1`, and `sort=name.asc` do not need to appear.
- Sort uses `sort=key.dir`, such as `sort=gpa.desc`. Cleared sort uses `sort=none`.
- URL updates use replace-style navigation so typing in search does not create a long browser history stack.
- The active `search` param is passed down as data. Visual rendering of the highlight is handled in a separate task.

## Acceptance criteria
- [x] Navigating to a shared URL restores view, search, filters, sort, pagination, and pipeline group.
- [x] Changing search or filters updates the URL and resets the table page to 1.
- [x] Default params are omitted from the URL.
- [x] Invalid params fall back to defaults without crashing.
- [x] URL parse/write behavior is covered by unit tests.

---

## Report
Status: Done | Commit: uncommitted

The candidates page now supports shareable URLs such as `/candidates?search=An&view=pipeline&group=batch&sort=gpa.desc&page=2`. The page reads and normalizes URL params once, then passes typed state into the filter bar, table, pipeline, gallery, and view nav.

Remaining: full `npm test` timed out across unrelated suites in this environment. Focused affected tests passed after rerun.

## Verification
- `npm test -- candidateUrlState SearchHighlight TableView PipelineGallery` — passed, 5 files, 33 tests.
- `npx tsc --noEmit` — passed.
- `npm run lint` — passed with 2 existing warnings:
  - `src/components/layout/Sidebar.tsx`: Next.js `<img>` warning.
  - `src/components/table/__tests__/ApplicantTable.sort.test.tsx`: unused `rowOrder` warning.
- `npm run build` — passed.
- Browser smoke passed for gallery URL search and pipeline URL group/sort/search state.
