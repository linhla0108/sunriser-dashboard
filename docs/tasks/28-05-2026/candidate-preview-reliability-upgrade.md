# Candidate Preview Reliability Upgrade

Tag: candidates/feature

## Goal

Replace browser-native academic preview with a normalized proxy + custom viewer pipeline so PDF and image files render reliably inside the dashboard.

## Scope

- Included: generic HTTPS preview proxy with `HEAD`/`GET`, PDF viewer via `react-pdf`, blob-backed image preview, existing DOCX preview on the normalized proxy, unsupported archive fallback, zoom controls for academic image/PDF/DOCX previews
- Excluded: authenticated third-party viewers, archive content inspection, legacy Office preview for `.doc/.ppt/.xls`

## Acceptance criteria

- Academic PDF files render inline through the custom PDF viewer, not the browser iframe PDF viewer.
- Academic JPG/PNG/JPEG files render inline from proxied blobs.
- Academic DOCX files continue to render inline.
- ZIP/RAR and other unsupported binaries show an explicit open/download fallback.
- `/api/candidates/preview-file` accepts public HTTPS URLs, supports `HEAD`, forwards `Range`, and blocks private/local targets.
- `npx tsc --noEmit`, `npm run lint`, and `npm test` pass.

---

## Report

Status: Done

The academic preview flow now reads file metadata through `HEAD /api/candidates/preview-file`, classifies by normalized MIME plus extension fallback, and renders through dedicated PDF/image/DOCX viewers instead of relying on browser-native iframe behavior. Portfolio preview behavior stays intact, including GitHub and OG-card fallback paths.

Follow-up runtime fix: some Typeform file URLs reject upstream `HEAD` while allowing `GET`, so metadata discovery now falls back to `GET` when needed. Another runtime fix routes generic third-party hosts such as Notion and `surl.li` to OG-card fallback instead of iframe-first, because the iframe path produced blank shells in real browser verification.

The preview proxy now accepts public HTTPS files beyond Typeform, blocks local/private targets, normalizes inline preview headers, supports `HEAD`, preserves `Range`-related headers, safely encodes Unicode filenames in `Content-Disposition`, and keeps a size limit for full-body downloads.

Follow-up UX change: academic image, PDF, and DOCX previews now expose zoom controls with `75% / 100% / 125% / 150% / 200%` steps and a one-click reset to `100%`.

Browser verification summary after the fixes:

- 40 academic preview cases: `28 PDF`, `9 image`, `1 DOCX`, `2 explicit fallback` (`.rar/.zip`)
- 10 portfolio preview cases: `5 OG-card`, `3 GitHub API previews`, `1 direct iframe/embed`, `1 fallback`
- 3 live zoom checks passed: image, PDF, and DOCX each moved `100% -> 125% -> 100%`

Remaining: LinkedIn OG fetch still returns `502` in browser verification, so LinkedIn preview falls back to the open-in-new-tab state rather than a populated OG card.
