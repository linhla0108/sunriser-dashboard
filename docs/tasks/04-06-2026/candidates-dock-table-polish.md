# Candidates Dock Table Polish

Tag: candidates/fix

## Goal

Correct the remaining `/candidates` dock, table, and bottom pill interaction defects after browser verification.

## Scope

- Included: AI/Notes dock sizing, multi-direction resize handles, drawer glass with adaptive body height, grab handle polish, table sticky hover opacity and scroll shadow, dock-aware bottom pill alignment, and pagination press feedback.
- Excluded: route changes, auth behavior, candidate data contracts, announcement contracts, chat response logic, notes persistence logic, and broad page redesign.

## Acceptance criteria

- Drawer resize hover and focus states do not expose coarse outline, border, or ring artifacts.
- Floating and docked AI/Notes drawers expose side and corner resize handles.
- Docked stack layout allows horizontal width resize and vertical split resize while keeping panels inside the viewport.
- Drawer bodies adapt to the current panel height and do not enforce a `320px` body minimum that can hide drawer actions.
- Drawer shell, body, AI messages, Notes empty state, notes cards, and inputs use consistent light glass that remains readable.
- Top-center grab handles are compact, visually clean, and do not shift or overlap drawer header content.
- Bottom view and pagination pills center against the applicant table/main content when docked drawers shrink the workspace.
- Pagination previous and next buttons show transient SUN orange icon feedback as soon as the button is pressed, before page navigation finishes.
- Candidate row hover uses an opaque neutral background across sticky and non-sticky cells.
- Sticky `#` and `Name` cells do not reveal horizontally scrolled content underneath.
- Sticky `Name` header and body shadow is absent at horizontal scroll `0` and visible after horizontal scroll.
- Focused TypeScript, lint, component tests, and Playwright verification pass.

---

## Report

Status: Done | Commit: a40da2f

Corrected the `/candidates` dock, table, and bottom pill interaction defects.

AI and Notes now have clean top-center grab handles, light glass drawer bodies that adapt to the current drawer height, and eight resize handles in floating and docked modes. Docked stack resize now updates drawer width, main workspace flow width, and the vertical split while keeping panels in the viewport. Candidate rows now use opaque row surfaces and an opaque neutral hover across sticky and normal cells, and the sticky Name shadow only appears after horizontal table scroll. Bottom view and pagination pills now center on the applicant table when the dock changes the workspace width. Pagination arrow buttons now show a transient primary icon state at press time.

Verification passed with targeted component tests, TypeScript, scoped lint, and Playwright browser checks on `/candidates`.

Remaining: no known deviations.
