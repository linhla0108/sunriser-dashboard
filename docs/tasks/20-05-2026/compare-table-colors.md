# Compare Table Colors

Tag: candidates/polish

## Goal

Improve compare dialog table contrast and visual scanning for pinned candidates.

## Scope

- Included: stronger table header colors, clearer row striping, sticky row-label contrast, stronger different-value indicator, better dark-mode surfaces.
- Excluded: compare field list changes, compare data model changes, export/share behavior, pinbar route-scope behavior.

## Acceptance criteria

- Header row has enough contrast for candidate names and metadata.
- Alternating rows are visibly distinct in light and dark themes.
- Sticky left labels remain readable while horizontally scrolling.
- Rows with different values are visually emphasized without changing the compared values.
- Removing a pinned candidate from the compare dialog still works.

---

## Report

Status: Done | Commit: uncommitted

Updated compare dialog table styles with shared color constants for borders, headers, row stripes, sticky labels, and different-value labels. Candidate headers now use a darker surface with white text, and row labels/cells use clearer alternating surfaces. The remove action keeps the same behavior with better contrast in the dark header.
