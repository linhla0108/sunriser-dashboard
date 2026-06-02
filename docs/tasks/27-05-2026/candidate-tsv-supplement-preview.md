# Candidate TSV Supplement And Secure Preview

Tag: candidates/table+drawer+mock-data

## Goal

Update the candidate mock dataset and candidate UI so the table/drawer can show the missing Typeform fields from the attached TSV:

- Academic transcript file
- Experience description
- Portfolio/project links
- Internship commitment fields
- Discovery/referrer fields
- Message to SUN.STUDIO
- Screening note and editable internal note

GPA must stay unchanged from the existing mock candidates.

## Data Source

Source file used for this task:

`/Users/home/Downloads/Bảng tính không có tiêu đề - Trang tính1 (1).tsv`

The TSV has 646 response rows, but the current `src/lib/mockData.ts` only has 40 concrete candidate identities. The implemented mapping uses the first 40 TSV rows as supplemental Typeform data for the existing 40 mock applicants by id order. This preserves the existing mock identity fields and assessment fields while adding the missing Typeform fields.

The supplemental rows live in:

`src/lib/candidateTypeformSupplement.ts`

The merge happens in:

`src/lib/mockData.ts`

Important merge rules:

- Keep existing `gpa`.
- Keep existing `submittedAt`, `batch`, `pic`, `round1Result`, `round1Notes`, and `round2Result`.
- Add Typeform-specific fields such as `academicFile`, `portfolioLinks`, `sunStudioMessage`, and `screeningNote`.
- Default `note` to an empty string.

## UI Behavior

Candidate table now includes these columns:

- `Academic`: icon button opens a preview modal.
- `Description`: max 100 characters; hover/focus for 0.5s opens a compact text popover.
- `Portfolio`: icon button opens a preview modal. Multiple detected URLs are shown as selectable tabs/buttons inside the modal.
- `Message`: max 100 characters; hover/focus for 0.5s opens a compact text popover.

Candidate detail drawer now includes:

- Wider drawer width for the expanded application details.
- Academic file preview.
- Experience description.
- Portfolio preview and original portfolio text.
- Internship commitment and post-internship availability.
- Message to SUN.STUDIO.
- Contact/discovery/referrer/token fields.
- Screening note.
- Editable internal `note` textarea.

## Preview Security

Preview behavior is intentionally in-app first so users do not have to directly open or download candidate files.

Implemented constraints:

- Images use `referrerPolicy="no-referrer"`.
- Web/PDF previews use iframe with `referrerPolicy="no-referrer"`.
- Non-PDF web previews use a sandboxed iframe.
- Links are detected and normalized before appearing as portfolio preview targets.

This reduces accidental referrer leakage and keeps review flow inside the dashboard. It does not make third-party documents private; a server-side proxy would be required for stronger isolation.

## Upload Mapping

`src/lib/upload/parseUploadFile.ts` was extended to recognize the same Typeform-style fields during uploads:

- Academic file/transcript
- Portfolio/project links
- Internship commitment
- Post-internship full-time availability
- Internal referrer
- Message to SUN.STUDIO
- Token

Detected portfolio URLs are stored in `portfolioLinks`.

## Files Changed

- `src/lib/types.ts`
- `src/lib/candidateTypeformSupplement.ts`
- `src/lib/candidates/candidateLinks.ts`
- `src/lib/mockData.ts`
- `src/lib/upload/parseUploadFile.ts`
- `src/components/candidates/CandidatePreviewDialog.tsx`
- `src/components/table/ApplicantTable.tsx`
- `src/components/table/DraggableRow.tsx`
- `src/components/views/ApplicantDetailDrawer.tsx`
- `src/app/(workspace)/candidates/page.tsx`

## Verification

Passed:

- `npx tsc --noEmit`
- `npm run test`
- Scoped ESLint on changed files
- Browser smoke against the existing local dev server at `http://localhost:3000`

Known note:

- Full `npm run lint` still reports pre-existing issues outside this task in admin/dashboard-related files.
