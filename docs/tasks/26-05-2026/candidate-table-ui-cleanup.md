# Candidate Table UI Cleanup

Tag: candidates/bug

## Goal

Remove small table UI glitches before changing bulk-selection behavior.

## Scope

- Included: checkbox/index hover layout shift, clear button wording, search highlight spacing, row dropdown alignment.
- Excluded: selected-section data flow, context menu behavior, drag behavior, animation.

## Acceptance criteria

- Hovering a row shows the checkbox without changing the first column width.
- Clear actions use unambiguous labels: `Clear selection` and `Clear filter`.
- Search highlighting does not add padding or inline width changes.
- Row dropdown menu items align consistently.

---

## Report

Status: Done | Commit: current commit

The table UI cleanup was completed as part of the candidate table bulk work. Focused e2e coverage verifies checkbox hover does not resize the first cell.
