# Candidates Annotation Polish

Tag: candidates/fix

## Goal

Resolve the browser annotation feedback on `/candidates` while preserving the compact, warm, task-focused recruitment workspace.

## Scope

- Included: floating view and pager pills, table hover and sticky-column affordances, year cell readability, announcement popup controls and empty state, docked AI/Notes drawer spacing, and AI/Notes drawer drag handle placement.
- Excluded: data changes, route changes, auth or permission behavior, announcement contracts, candidate filtering logic, and floating drawer positioning behavior.

## Acceptance criteria

- The view selector stays visually centered when table page navigation appears.
- The table footer pagination pill has more horizontal breathing room without becoming oversized.
- Candidate rows show a coherent hover state across sticky and non-sticky cells.
- The sticky Name column communicates horizontal scroll depth with a subtle edge shadow.
- The Year column is easier to read at table density.
- The announcement popup uses an `Inbox` icon for opening the announcements page.
- Announcement empty state no longer uses a dashed border.
- Announcement segmented tabs have slightly more surrounding padding.
- Docked AI and Notes drawers sit inset from the viewport, use rounded panel corners, keep a gap when stacked, and do not resize the main workspace content.
- AI and Notes drawer drag handles sit at the top/header level and use a smaller control style.
- Focused TypeScript, lint, and relevant component tests pass.

---

## Report

Status: Done | Commit: 82f89a8, a40da2f

Polished the `/candidates` annotation feedback across floating navigation, table rows, announcement popup, and docked drawers.

The view pill now remains centered while the table pager sits beside it. Table hover states now stay coherent across sticky and normal cells, the sticky Name column has an edge shadow, and the Year column is more readable. The announcement popup now uses an Inbox icon for the page link, gives the segmented tabs more padding, and removes the dashed empty-state border. Docked AI and Notes drawers now sit inset with rounded panel corners, keep a gap when stacked, overlay the workspace without shrinking it, and expose smaller top/header drag handles.

Verification passed with TypeScript, scoped lint, targeted component tests, and a browser check on `/candidates`.

Remaining: follow-up corrections are tracked in `docs/tasks/04-06-2026/candidates-annotation-corrections.md`.
