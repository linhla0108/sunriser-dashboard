# Candidates Annotation Corrections

Tag: candidates/fix

## Goal

Correct the remaining `/candidates` UI annotation drift with one acceptance criterion per confirmed request.

## Scope

- Included: bottom view/pagination pill balance, table row hover, sticky Name scroll shadow, AI/Notes grab handles, docked drawer layout flow, drawer glass body, and resize bar hover treatment.
- Excluded: data changes, route changes, auth behavior, candidate filtering logic, announcement contracts, chat logic, and notes persistence behavior.

## Acceptance criteria

- View and table pagination pills stay separate but match height, padding, radius, button size, icon size, and visual weight.
- Candidate row hover uses one neutral background across normal cells and sticky `#`/`Name` cells.
- Sticky `Name` column shadow is off at horizontal scroll `0` and on when the table is horizontally scrolled.
- Sticky `Name` header shadow follows the same horizontal scroll state.
- AI and Notes drawers use a small top-center grab handle in both floating and docked modes.
- Docked drawers reserve layout flow again; main content narrows by the dock width and keeps a gap before the dock lane.
- Docked drawers remain inset from the viewport, rounded, and gapped when stacked.
- Drawer body and inner AI/Notes surfaces use readable light transparency consistent with the drawer header.
- Drawer resize bar hover stays subtle and does not show outline, border, or ring artifacts.
- Focused TypeScript, lint, component tests, and browser verification pass.

---

## Report

Status: Done | Commit: a40da2f

Corrected the remaining `/candidates` annotation drift.

The bottom view and pagination pills now match height and control sizing while staying separate. Candidate table hover now uses a neutral row hover across sticky and normal cells. The sticky Name column and header shadow now toggle only after horizontal scroll. AI and Notes drawers now use a top-center grab handle in both floating and docked modes. Docked drawers reserve layout width again with a 12px gap before the dock lane. Drawer bodies and inner AI/Notes surfaces use light glass transparency, and resize bars use only a subtle hover fill.

Verification passed with targeted component tests, TypeScript, scoped lint, and browser verification on `/candidates`.

Remaining: follow-up polish for dock resize, sticky table opacity, dock-aware bottom pills, and pagination click feedback is tracked in `docs/tasks/04-06-2026/candidates-dock-table-polish.md`.
