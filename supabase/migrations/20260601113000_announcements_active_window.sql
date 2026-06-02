-- Migration: announcements_active_window
-- Purpose: add explicit active-window timestamps for announcement scheduling UI.

alter table public.announcements
  add column if not exists starts_at timestamptz,
  add column if not exists ends_at timestamptz;

update public.announcements
set ends_at = coalesce(ends_at, due_at)
where due_at is not null;

alter table public.announcements
  drop constraint if exists announcements_active_window_order;

alter table public.announcements
  add constraint announcements_active_window_order
  check (starts_at is null or ends_at is null or starts_at <= ends_at);

comment on table public.announcements
  is 'System-wide announcements visible to active users. starts_at and ends_at describe the active window; due_at remains legacy for compatibility during migration; deleted_at is soft delete.';
