-- Migration: candidates + sheets_sync_log tables
-- Date: 2026-05-27
-- Slice B / Task 2.1
--
-- candidates: stores imported Applicant payloads from Google Sheets.
-- sheets_sync_log: audit log for Pull / Push operations.

-- ============================================================================
-- candidates
-- ============================================================================

create table if not exists public.candidates (
  id          text primary key,
  data        jsonb not null,
  sheet_row   integer,
  source      text not null default 'sheet'
                check (source in ('sheet', 'dashboard')),
  updated_at  timestamptz not null default now(),
  updated_by  uuid references auth.users(id)
);

comment on table public.candidates
  is 'Imported candidate rows from Google Sheets. Synced manually via Pull/Push.';

alter table public.candidates enable row level security;

-- Any active authenticated user can read.
create policy candidates_read on public.candidates
  for select
  to authenticated
  using (true);

-- Writes happen only via service_role from server routes — no client-side write policy.

create index if not exists candidates_updated_at_idx on public.candidates (updated_at desc);
create index if not exists candidates_source_idx on public.candidates (source);

-- ============================================================================
-- sheets_sync_log
-- ============================================================================

create table if not exists public.sheets_sync_log (
  id           bigserial primary key,
  direction    text not null check (direction in ('pull', 'push')),
  status       text not null check (status in ('ok', 'error')),
  rows_count   integer,
  error        text,
  triggered_by uuid references auth.users(id),
  started_at   timestamptz not null default now(),
  finished_at  timestamptz
);

comment on table public.sheets_sync_log
  is 'Audit log for Google Sheets Pull and Push operations.';

alter table public.sheets_sync_log enable row level security;

-- Only admins can read sync log.
create policy sync_log_admin_read on public.sheets_sync_log
  for select
  to authenticated
  using (public.is_admin());

create index if not exists sync_log_started_at_idx on public.sheets_sync_log (started_at desc);
create index if not exists sync_log_direction_idx  on public.sheets_sync_log (direction, status);
