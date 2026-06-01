# Portfolio Hover Metadata Stability Fixes

Tag: candidates/fix

## Goal

Stabilize the portfolio hover metadata popover by handling upstream anti-bot responses safely, restoring valid popover trigger semantics, making capped viewport prefetch run reliably after the page settles, and exposing all candidate portfolio links in the row UI.

## Scope

- Included: `/api/candidates/portfolio-metadata` graceful degradation, `PortfolioLinkPopover` trigger semantics, arrow styling, viewport-prefetch timing and visibility detection, row-level multi-link portfolio visibility, targeted regression coverage
- Excluded: authenticated scraping, full website preview, screenshot generation, or bulk metadata prefetch beyond the capped visible-link budget

## Commands

- Typecheck: `npx tsc --noEmit`
- Unit tests: `npm test -- src/app/api/candidates/portfolio-metadata/__tests__/route.test.ts src/components/candidates/__tests__/PortfolioLinkPopover.test.tsx`
- Lint: `npm run lint -- src/app/api/candidates/portfolio-metadata/route.ts src/app/api/candidates/portfolio-metadata/__tests__/route.test.ts src/components/candidates/PortfolioLinkPopover.tsx src/components/candidates/__tests__/PortfolioLinkPopover.test.tsx src/components/table/DraggableRow.tsx src/components/views/ApplicantDetailDrawer.tsx`
- Browser verification: MCP Playwright against `http://localhost:3000/candidates`

## Project structure

- `src/app/api/candidates/portfolio-metadata/` → server route for metadata fetch
- `src/components/candidates/PortfolioLinkPopover.tsx` → portfolio hover trigger and popover content
- `src/components/table/DraggableRow.tsx` → candidate table portfolio cell
- `src/components/views/ApplicantDetailDrawer.tsx` → candidate drawer portfolio section
- `docs/tasks/29-05-2026/` → task plan and report

## Code style

```tsx
<PopoverTrigger nativeButton={false}>
  <span className={buttonVariants({ variant: "ghost", size: "icon-sm" })} aria-label={label}>
    <Link2 className="size-4" />
  </span>
</PopoverTrigger>
```

- Keep trigger semantics aligned with Base UI expectations.
- Prefer small extracted helpers for repeated portfolio-link rendering.
- Keep hover and prefetch behavior conservative and explicit.

## Testing strategy

- Unit tests cover route degradation and popover interaction logic.
- MCP Playwright covers browser-only regressions: console warning absence, arrow rendering visibility, hover popover behavior, and multi-link visibility in the table.
- No shell Playwright run for this task.

## Boundaries

- Always: keep external-link click behavior intact, preserve delayed hover fetch, keep docs updated with the same task
- Ask first: adding new dependencies, changing the data model shape, redesigning the candidate table layout
- Never: fetch every portfolio metadata payload on initial table render, reintroduce iframe portfolio preview, disable accessibility warnings instead of fixing the trigger semantics

## Success criteria

- Portfolio metadata requests do not crash the route when an upstream site returns a nonstandard error status such as LinkedIn `999`.
- The portfolio trigger no longer emits any `nativeButton` warning from `PopoverTrigger`.
- The portfolio popover arrow matches the shared shadcn/Base UI styling used by the app.
- Visible portfolio links can prefetch metadata after a short delay, with a capped budget and without firing for the whole table at once.
- A candidate with multiple portfolio URLs can expose every detected link from the table row without hiding them behind a raw `+N` count only.
- Hover open/close behavior remains stable.
- The implementation is documented and verified.

## Assumptions

1. Returning degraded metadata is better than surfacing upstream anti-bot statuses directly in the UI.
2. Base UI `PopoverTrigger` should own the native button semantics instead of combining `nativeButton={false}` with a rendered `<button>`.
3. Multi-link candidates should reveal all links in the row in a compact way rather than collapsing everything into a single first-link trigger plus text count.

---

## Report

Status: Done

Stabilized the portfolio hover metadata feature in four places:

- The metadata route now degrades gracefully when upstream sites return anti-bot or otherwise unusable responses. Nonstandard statuses such as LinkedIn `999`, blocked targets, and invalid preview URLs no longer bubble into the app response as hard failures. HTML error pages are parsed when useful; hard fetch failures and invalid targets fall back to empty metadata instead of crashing or spamming console errors.
- `PortfolioLinkPopover` now uses the Base UI trigger pattern it expects: `nativeButton={false}` with a non-button render target styled from the shared button variants. This removes the `nativeButton` warning without changing hover or click behavior.
- The shared popover arrow now sits outside the popup edge as a visible diamond pointer, which matches the shadcn-style popover affordance more closely.
- Multi-link candidates no longer collapse to one trigger plus a raw `+N` badge in the table. Each detected portfolio URL now renders as its own compact trigger in the table and drawer.
- Viewport-prefetch continues to use the delayed capped strategy and remains stable with the non-button trigger.
- Table hover previews now share one suppression-based hover lifecycle. Description, message, and portfolio popovers no longer immediately reopen when the pointer leaves. The academic-file tooltip is now non-interactive so it cannot grab the pointer on exit and create the same flicker.

Verification:

- `npm test -- src/app/api/candidates/portfolio-metadata/__tests__/route.test.ts src/components/candidates/__tests__/PortfolioLinkPopover.test.tsx`
- `npx tsc --noEmit`
- `npm run lint -- src/app/api/candidates/portfolio-metadata/route.ts src/app/api/candidates/portfolio-metadata/__tests__/route.test.ts src/components/candidates/PortfolioLinkPopover.tsx src/components/candidates/__tests__/PortfolioLinkPopover.test.tsx`
- `npx playwright test tests/e2e/portfolio-hover-popover.spec.ts --project=chromium`
- MCP Playwright against `http://localhost:3000/candidates` to confirm the new row-level multi-link triggers, the visible popover arrow, and the absence of new `nativeButton` console errors after reload
- `npx tsc --noEmit`
- `npm run lint -- src/components/candidates/CandidatePreviewDialog.tsx src/components/candidates/PortfolioLinkPopover.tsx src/components/candidates/useHoverPopoverInteraction.ts src/components/ui/tooltip.tsx`

Remaining:

- Some providers will still expose only sparse metadata because the app intentionally does not use authenticated scraping.
- Invalid or blocked source URLs from the dataset still degrade to metadata-unavailable states, which is intentional.
