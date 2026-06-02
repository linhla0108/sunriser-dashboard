# Portfolio Hover Metadata Popover

Tag: candidates/plan

## Goal

Add a lightweight hover popover on the portfolio icon that fetches website metadata only when the user hovers the icon, then shows host, title, description, and thumbnail when available.

## Scope

- Included: dedicated hover metadata plan, restricted metadata route, hover-intent client fetch, session cache, portfolio icon wiring in table and detail drawer
- Excluded: full in-app preview, authenticated metadata providers, eager prefetch for visible rows, screenshot capture, or iframe embedding

## Acceptance criteria

- Hovering a portfolio icon triggers metadata fetch only for that hovered link.
- Repeated hover on the same URL in the same session reuses cached metadata.
- Clicking the icon still opens the original portfolio URL in a new tab.
- The popover handles missing metadata gracefully.
- The implementation is documented and verified.

## Assumptions

1. Fetch-on-hover is the right performance tradeoff for candidate table density.
2. Showing metadata for the primary portfolio URL is sufficient for the compact icon popover.
3. The drawer can continue to list all detected portfolio URLs below the icon.

## Overview

This change restores only the small slice of metadata functionality needed for portfolio hover affordance. It does not restore the old portfolio preview system. The server route returns a small payload for one public URL. The client component waits for hover intent, fetches metadata once per URL, caches it in memory, and opens a compact popover.

## Architecture decisions

- Use a dedicated `PortfolioLinkPopover` component.
  Rationale: the behavior is now distinct from academic file preview and should not live in `CandidatePreviewDialog`.
- Fetch metadata from a dedicated route on hover intent.
  Rationale: avoids CORS issues and keeps network cost proportional to real user intent.
- Cache metadata in a module-level in-memory map on the client.
  Rationale: repeated hover in one session should not re-hit the route for the same URL.
- Reuse SSRF protections similar to the preview-file proxy.
  Rationale: the route still fetches arbitrary public URLs and needs the same safety boundary.

## Task list

### Phase 1: Foundation

#### Task 1: Add portfolio metadata route and parser

**Description:** Create a small server route that accepts one public HTTPS URL, blocks private/local targets, follows redirects, fetches HTML, and extracts title/description/image/host.

**Acceptance criteria:**

- [ ] Route returns metadata for public HTML pages.
- [ ] Route rejects blocked/private/local URLs.
- [ ] Route returns graceful null fields when metadata is missing.

**Verification:**

- [ ] `npm test -- src/app/api/candidates/portfolio-metadata/__tests__/route.test.ts`

**Dependencies:** None

**Estimated scope:** Medium

#### Task 2: Add shared metadata types

**Description:** Define a small typed payload shared by the route and the client component.

**Acceptance criteria:**

- [ ] The route and client consume the same response shape.
- [ ] The type is small and specific to hover metadata needs.

**Verification:**

- [ ] Included in Task 1 route tests and `npx tsc --noEmit`

**Dependencies:** Task 1

**Estimated scope:** Small

### Checkpoint: Foundation

- [ ] Route tests pass
- [ ] Metadata payload shape is stable

### Phase 2: Client hover behavior

#### Task 3: Build `PortfolioLinkPopover`

**Description:** Create a portfolio icon component that opens the URL on click and shows a delayed hover popover with metadata loading, success, and degraded fallback states.

**Acceptance criteria:**

- [ ] Hover delay prevents fetch on incidental pointer passes.
- [ ] First hover fetches metadata for one URL.
- [ ] Click still opens the original link in a new tab.

**Verification:**

- [ ] `npm test -- src/components/candidates/__tests__/PortfolioLinkPopover.test.tsx`

**Dependencies:** Tasks 1-2

**Estimated scope:** Medium

#### Task 4: Add session cache

**Description:** Cache metadata per URL on the client so repeated hover on the same URL does not refetch during the current session.

**Acceptance criteria:**

- [ ] Repeated hover on one URL reuses cached result.
- [ ] Failed fetches degrade gracefully without breaking click behavior.

**Verification:**

- [ ] `npm test -- src/components/candidates/__tests__/PortfolioLinkPopover.test.tsx`

**Dependencies:** Task 3

**Estimated scope:** Small

### Checkpoint: Hover behavior

- [ ] Component tests pass
- [ ] Fetch only happens after hover intent
- [ ] Cache reuse is verified

### Phase 3: Integration

#### Task 5: Wire popover into the candidate table

**Description:** Replace the table portfolio icon button with the new hover popover component.

**Acceptance criteria:**

- [ ] The table icon opens the URL on click.
- [ ] Hover shows metadata for the first portfolio URL only.

**Verification:**

- [ ] Covered by component tests and `npx tsc --noEmit`

**Dependencies:** Task 4

**Estimated scope:** Small

#### Task 6: Wire popover into the applicant drawer

**Description:** Replace the drawer primary portfolio icon with the new hover popover while keeping the URL list below.

**Acceptance criteria:**

- [ ] Drawer icon uses the same hover popover behavior.
- [ ] Existing URL list remains visible and clickable.

**Verification:**

- [ ] Covered by component tests and `npx tsc --noEmit`

**Dependencies:** Task 4

**Estimated scope:** Small

### Checkpoint: Complete

- [ ] Route tests pass
- [ ] Component tests pass
- [ ] `npx tsc --noEmit` passes
- [ ] Scoped lint passes

## Risks and mitigations

| Risk                                                 | Impact | Mitigation                                                            |
| ---------------------------------------------------- | ------ | --------------------------------------------------------------------- |
| Candidate table hover churn causes too many requests | Medium | Use hover delay and one-request-per-URL cache                         |
| Some sites return little or no metadata              | Low    | Show host + fallback copy, keep click behavior primary                |
| Route can be abused for SSRF                         | High   | Reuse blocked-host/IP logic from preview-file route and require HTTPS |

## Verification

- `npm test -- src/app/api/candidates/portfolio-metadata/__tests__/route.test.ts src/components/candidates/__tests__/PortfolioLinkPopover.test.tsx`
- `npx tsc --noEmit`
- `npm run lint -- src/app/api/candidates/portfolio-metadata/route.ts src/components/candidates/PortfolioLinkPopover.tsx src/components/table/DraggableRow.tsx src/components/views/ApplicantDetailDrawer.tsx`

---

## Report

Status: Done

Implemented:

- Added a restricted metadata route at `src/app/api/candidates/portfolio-metadata/route.ts`.
- Added shared metadata typing and parser in `src/lib/candidates/portfolioMetadata.ts`.
- Added `PortfolioLinkPopover` in `src/components/candidates/PortfolioLinkPopover.tsx`.
- Wired the hover popover into the candidate table and applicant detail drawer portfolio icons.
- Kept click behavior as the primary action: icon click still opens the original portfolio URL in a new tab.
- Added hover-intent behavior so metadata fetch starts only after the user actually hovers the icon.
- Added module-level client cache so repeated hover on the same URL in the same session does not refetch immediately.

Behavior details:

- Hover delay is intentional and lightweight.
- Metadata fetch is one-request-per-hovered-URL, not one-request-per-row on initial render.
- The popover shows host, title, description, and image when available.
- Missing or failed metadata degrades to a compact fallback state without breaking click behavior.

Verification:

- `npm test -- src/app/api/candidates/portfolio-metadata/__tests__/route.test.ts src/components/candidates/__tests__/PortfolioLinkPopover.test.tsx src/components/candidates/__tests__/CandidatePreviewDialog.test.tsx src/lib/candidates/__tests__/candidateLinks.test.ts src/app/api/candidates/preview-file/__tests__/route.test.ts`
- `npx tsc --noEmit`
- `npm run lint -- src/app/api/candidates/portfolio-metadata/route.ts src/app/api/candidates/portfolio-metadata/__tests__/route.test.ts src/lib/candidates/portfolioMetadata.ts src/components/candidates/PortfolioLinkPopover.tsx src/components/candidates/__tests__/PortfolioLinkPopover.test.tsx src/components/table/DraggableRow.tsx src/components/views/ApplicantDetailDrawer.tsx src/components/candidates/CandidatePreviewDialog.tsx src/lib/candidates/candidateLinks.ts`

Answer to the fetch strategy question:

- Yes, metadata is now fetched only when the user hovers the icon.
- The image URL is discovered as part of the metadata fetch, and the real image only loads when the popover is rendered open.

Remaining:

- The compact hover popover currently describes only the primary portfolio URL for the icon.
- The drawer still lists all detected URLs separately below the icon, which is intentional for now.
