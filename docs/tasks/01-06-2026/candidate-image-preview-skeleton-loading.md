# Candidate Image Preview Skeleton Loading

Tag: candidates/fix

## Goal

Show a skeleton state while candidate image previews load.

## Scope

- Included: academic image preview loading UI in the candidate preview dialog.
- Excluded: PDF, DOCX, proxy behavior, file detection, and candidate data contracts.

## Acceptance criteria

- Image preview loading uses the shared skeleton component instead of plain loading text.
- The loading state remains accessible to assistive technology.
- Existing candidate preview tests pass.

---

## Report

Status: Done

Candidate image previews now render an accessible skeleton while the proxied image blob loads and while the browser decodes the image. The skeleton is replaced only after the image load event fires, and the existing fallback still handles failures.

Remaining: none.
