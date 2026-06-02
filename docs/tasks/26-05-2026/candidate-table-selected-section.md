# Candidate Table Selected Section

Tag: candidates/feature

## Goal

Keep selected candidates visible above filtered results when search or filters would otherwise hide them.

## Scope

- Included: selected/unselected data partitioning, collapsible selected section, selected-row highlight, pagination of unselected filtered rows.
- Excluded: bulk context menu, multi-drag, animation polish, pipeline/chart selection.

## Acceptance criteria

- Selected rows are derived from the full applicant list, not only filtered results.
- Selected rows appear in a collapsible top section while a filter/search context is active.
- Filtered results remain visible below selected rows and exclude selected candidates.
- Pagination applies only to filtered unselected rows.

---

## Report

Status: Done | Commit: current commit

Selected rows are passed separately to the table, remain visible across filter/search/page changes, and use a distinct selected-row highlight. The selected section starts open and can be collapsed without losing selection.
