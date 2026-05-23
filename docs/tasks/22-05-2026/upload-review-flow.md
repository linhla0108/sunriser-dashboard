# Upload Review Flow
Tag: upload/feature

## Goal
Let users upload spreadsheet-like files, review parsed columns and values, add missing columns, confirm the dataset, and land on `/candidates` with the parsed data in app state.

## Scope
- Included: parse `.xlsx`, `.xls`, `.csv`, `.tsv`, and `.json` files with column names and row values preserved.
- Included: show an upload analysis popup with detected columns, row counts, sample values, missing candidate fields, and a re-analysis path for added columns.
- Included: confirm parsed data into shared client state and redirect to the real `/candidates` route.
- Included: keep the background DB save as a safe no-op until a database table or API exists.
- Excluded: real database persistence.
- Excluded: schema migrations or Supabase table design.

## Acceptance criteria
- Dropping a supported file opens the analysis popup after parsing.
- Parsed data keeps headers and row values for `.xlsx`, `.csv`, and `.tsv`.
- Users can add a missing column name, re-run analysis, and see it included.
- Confirming the upload stores parsed data in client state and routes to `/candidates`.
- The candidates page uses the confirmed upload data instead of mock candidates when a session exists.
- Parser behavior is covered by automated tests.
- The flow is verified in a browser with Playwright.

---

## Report
Status: Done | Commit: 442ec34

Implemented the upload review flow. The parser now preserves columns and row values for `.xlsx`, `.xls`, `.csv`, `.tsv`, and `.json`. The global drop popup shows detected columns, missing required candidate fields, a value preview, and a re-analysis control for adding missing column names. Confirming the upload stores the parsed session in workspace client state, maps rows into candidate records, starts a no-op background persistence action, and routes to `/candidates`. The Candidates page uses the confirmed upload session instead of mock data and shows an uploaded-data banner.

Verification passed:
- `npm run test -- src/lib/upload/__tests__/parseUploadFile.test.ts src/components/layout/__tests__/WorkspaceShell.shortcuts.test.tsx`
- `npx tsc --noEmit`
- `npx eslint src/components/upload/GlobalDropZone.tsx src/components/layout/WorkspaceShell.tsx 'src/app/(workspace)/candidates/page.tsx' src/lib/upload/parseUploadFile.ts src/lib/upload/UploadSessionContext.tsx src/lib/upload/persistUploadSessionDraft.ts src/lib/upload/__tests__/parseUploadFile.test.ts tests/e2e/upload-review-flow.spec.ts`
- `git diff --check`

Playwright status:
- Added `tests/e2e/upload-review-flow.spec.ts`.
- `E2E_EMAIL='admin@sunriser.com' E2E_PASSWORD='Sunriser2026!' npx playwright test tests/e2e/upload-review-flow.spec.ts --browser=chromium --reporter=line` passed.
- The first authenticated run exposed a real layering bug: the backdrop close button intercepted pointer events over the popup. Fixed by placing the backdrop at `z-0` and the popup at `z-10`.
- Evidence screenshot: `test-results/upload-review-flow.png`.

Remaining: none for this slice.
