# Candidate Preview And Pager Polish

Tag: candidates/fix

## Goal

Make PDF preview wheel zoom intentional and move table pagination details into the table footer while keeping page navigation in a separate floating pill.

## Scope

- Included: modifier-gated PDF wheel zoom, table footer rows-per-page and page label, separated floating page navigation buttons.
- Excluded: changing candidate filtering, sorting, or PDF button zoom behavior.

## Acceptance criteria

- PDF mouse-wheel zoom changes by one 10 percent step only while Ctrl or Command is held.
- PDF mouse-wheel zoom remains clamped to the existing minimum and maximum zoom levels.
- Table rows-per-page and `Page X / Y` appear at the bottom right of the table.
- Previous and next buttons are in their own pill placed next to the primary view pill.

---

## Report

Status: Done | Commit: a40da2f

PDF wheel zoom now requires Ctrl or Command, moves in 10 percent steps, and remains bounded by the shared zoom levels. Table footer pagination owns rows-per-page and `Page X / Y`, while the floating secondary pill only contains previous and next navigation buttons.

Remaining: None.
