# Candidate Preview UX Fixes

Tag: candidates/fix

## Goal

Improve candidate preview reliability and readability in the candidates table and drawer.

## Scope

- Included: academic image preview fixes, blocked-site preview fallback, larger preview modal, hoverable text popover, preview icon tooltips
- Excluded: server-side proxying, new backend APIs, changing candidate data contracts

## Acceptance criteria

- Academic image and PDF URLs, including Typeform-hosted files, render inline in the preview modal.
- Academic Office/archive files show an open/download fallback instead of a blank preview.
- Public GitHub repository links show an in-app API-based preview with repo metadata and README text.
- Public GitHub profile links show an in-app API-based preview with profile metadata and recent public repositories.
- Supported portfolio providers use provider-specific embed URLs where available, including Google Drive file/folder previews and YouTube embeds.
- Portfolio targets that are known or detected to be non-embeddable show a clear in-app fallback with an external-open action instead of a blank iframe.
- Preview icon buttons show short, action-specific tooltips.
- The preview modal uses about 90% of viewport width and height with safe gutters on smaller screens.
- Table text previews for description/message stay open long enough for pointer travel, can be hovered directly, show an arrow, and use larger text than before.

---

## Report

Status: Done

Updated the candidate preview flow so academic image and PDF files render inline, unsupported academic file types show an open/download fallback, public GitHub repository/profile links render API-based previews, other blocked sites degrade to a clear fallback with an external-open action, and the preview dialog now uses roughly 90% of the viewport.

Follow-up fix: PDF iframe preview no longer applies an empty `sandbox` attribute, because that can block the browser PDF viewer and leave the modal stuck on loading. GitHub profile URLs such as `github.com/minhkhoa` now preview via the GitHub users API instead of falling back as blocked websites.

Second follow-up fix: Typeform academic files now load through `/api/candidates/preview-file`, which only accepts `https://api.typeform.com/responses/files/...` URLs and returns the upstream file with `Content-Disposition: inline`. This avoids browser downloads for previewable PDF/image files. Portfolio preview also transforms supported provider URLs to embed URLs, including Google Drive file `/preview`, Google Drive folder `embeddedfolderview`, and YouTube `youtube-nocookie.com/embed`.

The compact text preview now uses a hoverable popover with an arrow, delayed close, and larger body text. Preview icon buttons also show action-specific tooltips.

Verification:

- `npx tsc --noEmit`
- `npm run lint -- src/components/candidates/CandidatePreviewDialog.tsx src/components/candidates/__tests__/CandidatePreviewDialog.test.tsx src/components/ui/popover.tsx src/lib/candidates/candidateLinks.ts`
- `npm test -- src/components/candidates/__tests__/CandidatePreviewDialog.test.tsx`
- `npm test -- src/components/candidates/__tests__/CandidatePreviewDialog.test.tsx src/app/api/candidates/preview-file/__tests__/route.test.ts`

Remaining: no server-side proxy was added, so third-party sites that block embedding still require the external-open fallback. GitHub previews are limited to public repositories and unauthenticated GitHub API rate limits.
