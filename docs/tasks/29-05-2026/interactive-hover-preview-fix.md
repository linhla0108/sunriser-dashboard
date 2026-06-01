# Interactive Hover Preview Fix

Tag: candidates/fix

## Goal

Make description, portfolio, and message hover previews stable while allowing users to hover into the popup and select text.

## Scope

- Included: trigger-to-popup hover lifecycle, active trigger styling, click behavior while hover is open, popover arrow styling, and academic tooltip focus cleanup after click.
- Excluded: changing portfolio metadata fetching, changing academic preview dialog rendering, or redesigning table columns.

## Acceptance criteria

- Description, portfolio, and message popovers stay open while the pointer moves from trigger to popup.
- Users can select popup text and click inside the popup without immediately closing it.
- Portfolio trigger keeps active hover color while its popup is open, including after trigger click.
- Popover arrows visually match the simpler tooltip arrow style.
- Academic tooltip does not stay visible from focus after clicking the academic icon.

---

## Follow-up bugs (after re-test 29 May)

The previous fix landed, but manual re-testing surfaced six more issues that this task now also covers:

1. **Trigger icon loses its active styling once the popup opens.** Hover color must persist while the popover / tooltip is open (Portfolio is the worst offender — ghost button's `aria-expanded:bg-muted` overrides the active style).
2. **Diamond arrow on popover is unwanted.** Remove the arrow from description / message / portfolio popovers.
3. **Portfolio popover content must itself be a link.** Clicking anywhere on the popover body (image / title / description) should open the portfolio URL in a new tab.
4. **Trivial description / message text should not show a popover.** If the text is `"N/A"`, `"-"`, `"—"`, empty, or short enough that it never truncates, render plain text with no hover state and no popup.
5. **Academic preview controls need more range + rotate + no whitespace.** Zoom must support 25%, 50%, 75%, 100%, 125%, 150%, 175%, 200% and add two rotate buttons (CCW / CW). Remove the extra white space below the file (caused by the `90dvh` layout sizing).
6. **Table needs a page-size selector and a fixed height.** Add page-size options (10 / 20 / 30 / 40 / 50 / 80 / 100), persisted via URL state. Table card should keep a stable height (calc-based) so few rows do not collapse the surface.

## Updated acceptance criteria

- All trigger icons keep their active color (`text-primary`, hover background) while their popover or tooltip is open.
- No `showArrow` diamond on the description / portfolio / message popovers.
- Clicking anywhere inside the portfolio popover (not just the trigger) opens the portfolio URL in a new tab via `noopener,noreferrer`.
- `DelayedTextPreview` short-circuits to plain text when the value is missing / placeholder (`-`, `N/A`, `—`) or fits within the cell without truncation; no popover is rendered in those cases.
- Academic preview supports the new zoom range (25 → 200) and rotates the file in 90° increments; the preview region fills the dialog without a trailing white band.
- Candidate table exposes a page-size selector (10/20/30/40/50/80/100) and the table surface keeps a fixed minimum height regardless of row count.

---

## Report

Status: Done

Summary:

Addressed the regressions from the second round of manual testing.

What changed:

- `PortfolioLinkPopover` trigger uses a custom span (no ghost button variant) so `aria-expanded` no longer steals its active background / text-primary state. The popover body is now an `<a>` linking to the portfolio URL (`target=_blank`, `noopener,noreferrer`).
- `HoverableTextPreview` only renders a popover when text actually overflows its cell; placeholder values (`-`, `N/A`, `—`, empty) bypass the popover entirely.
- All hover popovers drop `showArrow`.
- Academic preview adds zoom steps `[25, 50, 75, 100, 125, 150, 175, 200]`, two rotate buttons (CCW / CW), and removes the unnecessary `gap-4` from the dialog so the preview region fills the dialog without a trailing white band.
- Candidate table accepts a page-size selector (10 → 100, default 20) and reserves a fixed minimum height so a 1-row page looks the same as a 100-row page.

Verification:

- `npx tsc --noEmit`
- `npm run lint -- src/components/candidates src/components/table src/components/views src/lib/candidates src/app/(workspace)/candidates`
- `npm test -- src/components/candidates`
- Manual MCP Playwright spot-check on `/candidates` (page size selector, popover behavior, academic preview).

Remaining:

The hover popover only checks for trivial placeholder strings + measured overflow. Texts that are technically longer than the cell but only by a few pixels still trigger the popover; that is intentional so we err on the side of revealing the full string.
