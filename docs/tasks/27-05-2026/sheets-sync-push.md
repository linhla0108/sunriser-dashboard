# Dashboard → Google Sheets Push Sync

Tag: sheets/feature

## Goal

Allow admins and users with `edit` permission to click "Push to Sheet" to write the current dashboard candidates data back to the company Google Sheet.

## Scope

- Included: `sheets/push.ts`; `/api/sheets/push` route (with `?dryRun=true` support); Push button in `SheetsSyncBar`; confirm via sonner toast before writing.
- Excluded: partial-row push; conflict resolution beyond overwrite; scheduled push; per-user sheet.

## Acceptance criteria

- Push button visible for admin/edit users; disabled with tooltip for others.
- Click → confirm toast → POST `/api/sheets/push` → sheet rows overwritten → `sync_log` row `status='ok'` → success toast.
- `?dryRun=true` returns a diff preview without writing.
- `push.test.ts` verifies the `batchUpdate` payload shape; empty input produces no API call.
- Probe writes/deletes 1 cell in a scratch tab; real `Candidates` tab untouched during development.

---

## Report

Status: In Progress
