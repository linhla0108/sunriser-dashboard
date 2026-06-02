# Remove Portfolio Preview And Plan Hover Metadata

Tag: candidates/fix

## Goal

Remove the in-app preview dialog for the candidate `portfolio` field, keep portfolio access as direct external links, and define a follow-up plan for a small hover popover that shows basic website metadata on the portfolio icon.

## Scope

- Included: remove portfolio preview triggers from table and detail drawer, clean dead preview code that becomes unused, keep academic preview intact, and write a follow-up implementation plan for portfolio hover metadata
- Excluded: implementing the hover metadata popover itself, authenticated metadata fetch for private websites, screenshots, or any browser-within-browser behavior

## Acceptance criteria

- Portfolio no longer opens `CandidatePreviewDialog`.
- Table and detail drawer still expose portfolio URLs as external links when links exist.
- Academic file preview continues to work.
- Unused portfolio-preview code paths are removed.
- A concrete implementation plan exists for hover metadata on the portfolio icon.

## Assumptions

1. Portfolio should remain clickable from both the candidate table and detail drawer.
2. Removing the preview includes deleting dead portfolio preview infrastructure, not just hiding the trigger.
3. The future hover popover should be lightweight and metadata-driven, not a full embedded preview.

## Implementation plan

### Phase 1: Remove portfolio preview usage

- Replace portfolio preview dialog triggers in the table and applicant drawer with direct external-link actions.
- Preserve the current academic preview dialog.

### Phase 2: Clean dead code

- Remove portfolio-only preview branches, helper functions, tests, and route usage that become unreachable.
- Keep URL extraction helpers that are still needed to normalize and list portfolio links.

### Phase 3: Verification

- Run focused tests for candidate preview, candidate link parsing, and affected UI files.
- Run `npx tsc --noEmit` and scoped lint.

## Hover metadata follow-up plan

### Objective

When the user hovers the portfolio link icon, show a small popover with the destination host, title, short description, and thumbnail if available. Clicking the icon should still open the original link in a new tab.

### Architecture decisions

- Use hover popover, not dialog.
  Rationale: this is a lightweight information affordance, not a content viewer.
- Fetch metadata server-side from a restricted route.
  Rationale: avoids CORS issues and keeps referrer/cookie behavior controlled.
- Prefetch only on hover intent, not for every row at first render.
  Rationale: candidate tables can be large; eager metadata fetch would waste bandwidth and slow the page.

### Data shape

Return a small payload such as:

```ts
type PortfolioLinkMetadata = {
  finalUrl: string
  host: string
  title: string | null
  description: string | null
  image: string | null
}
```

### Can we fetch the image metadata first?

Yes, but only as part of the metadata fetch, not as a separate image probe per row by default.

- Recommended path: fetch HTML metadata once on hover, parse `og:image` / `twitter:image`, and let the popover image load only when the popover opens.
- Do not prefetch thumbnails for all visible rows on initial render.
- Add caching on the server route and in-memory client state so repeated hovers do not refetch the same URL immediately.

### Task breakdown for the follow-up

#### Task 1: Create lightweight metadata route

- Acceptance: a restricted route returns host/title/description/image for a public portfolio URL
- Verify: route tests for redirect handling, SSRF blocking, and missing metadata fallback

#### Task 2: Add hover-intent portfolio popover trigger

- Acceptance: hovering the portfolio icon for a short delay opens a compact popover
- Verify: component test for delayed open, close, and loading states

#### Task 3: Add fetch lifecycle and cache

- Acceptance: first hover fetches metadata, repeated hover reuses cached result during the session
- Verify: component test ensures one request per URL until cache expiry

#### Task 4: Polish content and fallback

- Acceptance: popover shows host even when title/description/image are missing; click still opens original URL
- Verify: component tests for full metadata and degraded fallback states

## Verification

- `npx tsc --noEmit`
- `npm run lint -- src/components/table/DraggableRow.tsx src/components/views/ApplicantDetailDrawer.tsx src/components/candidates/CandidatePreviewDialog.tsx src/lib/candidates/candidateLinks.ts`
- `npm test -- src/components/candidates/__tests__/CandidatePreviewDialog.test.tsx src/lib/candidates/__tests__/candidateLinks.test.ts`

---

## Report

Status: Done

Implemented:

- Removed the portfolio preview dialog from the candidate table and applicant detail drawer.
- Replaced portfolio preview access with direct external-link actions.
- Kept academic preview on `CandidatePreviewDialog`.
- Simplified `CandidatePreviewDialog` to academic-file-only behavior.
- Removed now-unused portfolio preview infrastructure:
  - `src/app/api/candidates/og-preview/route.ts`
  - `src/lib/candidates/ogParse.ts`
  - `src/lib/candidates/__tests__/ogParse.test.ts`
  - `src/components/candidates/LinkedInBadgePreview.tsx`
- Reduced `candidateLinks.ts` back to URL extraction and academic preview proxy helpers only.
- Rewrote focused tests to cover the reduced academic preview surface and portfolio URL extraction only.

Verification:

- `npm test -- src/components/candidates/__tests__/CandidatePreviewDialog.test.tsx src/lib/candidates/__tests__/candidateLinks.test.ts src/app/api/candidates/preview-file/__tests__/route.test.ts`
- `npx tsc --noEmit`
- `npm run lint -- src/components/table/DraggableRow.tsx src/components/views/ApplicantDetailDrawer.tsx src/components/candidates/CandidatePreviewDialog.tsx src/lib/candidates/candidateLinks.ts src/components/candidates/__tests__/CandidatePreviewDialog.test.tsx src/lib/candidates/__tests__/candidateLinks.test.ts`

Hover metadata answer:

- Yes, the future hover popover can fetch image metadata first, but the recommended implementation is to fetch all metadata once on hover intent, parse `og:image` / `twitter:image`, and only let the thumbnail request happen when the popover actually opens.
- Do not prefetch metadata or images for every visible portfolio row on initial render.

Remaining:

- The hover metadata popover is planned but not implemented in this task.
