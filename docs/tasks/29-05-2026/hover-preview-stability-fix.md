# Hover Preview Stability Fix

Tag: candidates/fix

## Goal

Stabilize candidate-table hover previews so they open, close, and click predictably across academic, description, portfolio, and message cells.

## Scope

- Included: hover popup pointer behavior, hover popup focus behavior, click-through behavior for academic and portfolio triggers, and focused regression coverage.
- Excluded: redesigning candidate-table layout, changing metadata parsing, or changing academic file preview rendering.

## Acceptance criteria

- Hovering description, message, or portfolio opens exactly one popup and leaving the trigger closes it without flicker or stale focus ring.
- Hovering/clicking academic keeps the click dialog behavior and does not leave a stuck hover/focus state.
- Clicking outside an open hover popup closes it or leaves it closed without blocking pointer movement.
- Scoped component tests, `npx tsc --noEmit`, scoped lint, and browser checks pass.

---

## Report

Status: Done

Summary:

The remaining hover instability came from Base UI portal positioners, not only popup content. `PopoverContent` and `TooltipContent` had non-interactive popup bodies, but their outer positioner wrappers still intercepted pointer movement. This could block mouse-out movement, keep hover state stale, and leave focus/ring state behind.

What changed:

- Popover and tooltip positioner wrappers now use `pointer-events-none`.
- Popover popup content is explicitly `pointer-events-auto` by default, so existing interactive popovers still receive clicks.
- Candidate hover-only popovers disable automatic initial and final focus.
- Hover close with `closeDelayMs <= 0` now closes immediately instead of waiting for a zero-delay timer.
- Added focused unit coverage and an e2e matrix for academic, description, portfolio, and message hover/click behavior.

Verification:

- `npm test -- src/components/candidates/__tests__/CandidatePreviewDialog.test.tsx src/components/candidates/__tests__/PortfolioLinkPopover.test.tsx`
- `npx tsc --noEmit`
- `npm run lint -- src/components/candidates/CandidatePreviewDialog.tsx src/components/candidates/PortfolioLinkPopover.tsx src/components/candidates/useHoverPopoverInteraction.ts src/components/ui/popover.tsx src/components/ui/tooltip.tsx src/components/candidates/__tests__/CandidatePreviewDialog.test.tsx src/components/candidates/__tests__/PortfolioLinkPopover.test.tsx tests/e2e/candidate-hover-preview-matrix.spec.ts`
- `npx playwright test tests/e2e/candidate-hover-preview-matrix.spec.ts`
- `npx playwright test tests/e2e/portfolio-hover-popover.spec.ts`
- `npx playwright test tests/e2e/candidates-table.spec.ts -g "selecting a row shows bulk count"`
- MCP Playwright manual checks on `/candidates` for description, portfolio, and academic hover exit.

Remaining:

The worktree already had unrelated pending changes before this task. This fix only addresses the hover pointer/focus loop.
