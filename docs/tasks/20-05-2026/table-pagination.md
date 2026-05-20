# Table Pagination
Tag: candidates/feature

## Goal
Add pagination to the candidates table: a bottom bar showing row range and page count, plus prev/next buttons on the right side of the ViewPillNav (separated from view-mode buttons on the left).

## Scope
- Included: table view only — pagination is not applied to pipeline/chart/gallery views
- Included: bottom bar inside the table card showing "15 of 646" (range) and "Page 1/43"
- Included: prev/next icon buttons added to the right of the ViewPillNav, behind a visual separator; only visible when view === "table"
- Excluded: page-size selector, jump-to-page input, URL persistence
- Excluded: pagination in non-table views

## Acceptance criteria
- [ ] Table renders at most 15 rows per page (default page size)
- [ ] Bottom bar displays current row range ("1–15 of 646") and page fraction ("Page 1/43")
- [ ] Prev/next buttons in the pill nav are disabled on first/last page respectively
- [ ] Filtering resets pagination to page 1
- [ ] Row index column (#) counts from the global position, not the page slice (1–15, then 16–30)
- [ ] No regressions in sort, pin, drag-to-reorder

---

## Report
Status: Pending
