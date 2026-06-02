# Candidate Table Bulk Context Menu

Tag: candidates/feature

## Goal

Let users bulk-edit selected candidates from the row context menu while preserving single-row actions for unselected rows.

## Scope

- Included: selected-row right-click bulk menu, single-row menu preservation, sticky round-status flyouts.
- Excluded: filter-bar bulk button, selected section rendering, multi-drag, server persistence.

## Acceptance criteria

- Right-clicking a selected row opens a bulk edit menu for all selected candidates.
- Right-clicking an unselected row keeps the single-row context menu.
- Bulk menu includes Set Batch, Assign PIC, Set Round 1, Set Round 2, and Delete selected.
- Bulk menu excludes single-item actions such as View detail, Copy, Pin, and Export.

---

## Report

Status: Done | Commit: current commit

Selected rows now open the bulk edit context menu on right-click. Round status actions use hover-activated sticky flyouts, and unselected rows keep their existing single-row menu.
