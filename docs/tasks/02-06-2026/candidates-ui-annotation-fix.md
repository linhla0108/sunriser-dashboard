# Candidates UI Annotation Fix

Tag: candidates/fix

## Goal

Polish the `/candidates` table, filter bar, floating navigation, and academic preview UI to resolve browser annotation feedback.

## Scope

- Included: filter bar redesign, table sticky columns, row visual fixes, hidden table reorder handle, split floating navigation/pagination, preview fallback/loading/zoom improvements, and wider text preview popovers.
- Excluded: data model changes, route changes, pipeline/chart drag behavior changes, and source URL/proxy behavior changes.

## Acceptance criteria

- The filter bar no longer shows the result count and the search icon is readable.
- The view switcher stays stable while table pagination controls live in a separate floating pill.
- The table keeps `#` and `Name` sticky during horizontal scroll without header bleed.
- The last visible candidate row preserves its status color border.
- Table row reordering is hidden and inactive.
- Academic preview UI hides visible source hosts, improves unsupported states, uses an animated loading indicator, supports wheel zoom, and fits shorter PDF previews.
- Focused unit tests and TypeScript checks pass.

---

## Report

Status: Done | Commit: a40da2f

Polished the candidates table, filters, floating navigation, and academic preview UI.
The filter count was removed, table pagination now lives in a separate floating pill, the first two table columns stay sticky, table row reorder is hidden, preview host text is hidden, unsupported previews use a cleaner empty state, PDF loading uses an animated status icon, and PDF wheel zoom changes in 10 percent steps.

Remaining: no known deviations.
