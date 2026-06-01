# Google Sheets → Dashboard Pull Sync

Tag: sheets/feature

## Goal

Allow admins and users with `edit` permission to click "Pull from Sheet" in the candidates view to import the latest rows from the company Google Sheet into the Supabase `candidates` table.

## Scope

- Included: `candidates` + `sheets_sync_log` migrations; `sheets/client.ts`; `sheets/mapping.ts`; `sheets/pull.ts`; `/api/sheets/pull` and `/api/sheets/status` routes; `SheetsSyncBar` (Pull button); mount in `CandidateFiltersBar`.
- Excluded: automatic/realtime sync; per-user OAuth sheet access; conflict resolution (v1 is last-write/overwrite).

## Acceptance criteria

- "Pull from Sheet" button visible in `/candidates` for admin/edit users; disabled with tooltip for others.
- Click → POST `/api/sheets/pull` → sheet rows upserted into `candidates` table → `sheets_sync_log` row with `status='ok'` → sonner success toast.
- On error: `sync_log` row with `status='error'`; generic error toast; no raw Google/Supabase error leaked to client.
- `mapping.ts` round-trip test passes; missing required column raises typed error.
- Connection probe `scripts/probe-sheets-connection.ts` prints sheet title without error.

---

## Report

Status: In Progress
