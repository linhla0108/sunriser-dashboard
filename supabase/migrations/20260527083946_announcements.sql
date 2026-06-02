-- Migration: announcements
-- Date: 2026-05-27
-- Phases: 1.1 - 1.8
--
-- Adds announcement tables, helper functions, RLS policies, and Realtime
-- publication wiring for workspace announcements.

-- ============================================================================
-- Enum
-- ============================================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'announcement_priority') then
    create type public.announcement_priority as enum ('low', 'normal', 'high', 'urgent');
  end if;
end $$;

-- ============================================================================
-- Helper functions
-- ============================================================================

create or replace function public.is_active_user()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $func$
  select exists (
    select 1
    from public.user_access ua
    where ua.user_id = (select auth.uid())
      and ua.active = true
  );
$func$;

revoke all on function public.is_active_user() from public;
grant execute on function public.is_active_user() to authenticated;

create or replace function public.is_announcement_publisher()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $func$
  select coalesce(
    (select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'manager'),
    false
  );
$func$;

revoke all on function public.is_announcement_publisher() from public;
grant execute on function public.is_announcement_publisher() to authenticated;

create or replace function public.can_manage_announcement(target_author_user_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $func$
  select
    (select public.is_active_user())
    and (
      (select public.is_admin())
      or (
        (select auth.jwt() -> 'app_metadata' ->> 'role') = 'manager'
        and target_author_user_id = (select auth.uid())
      )
    );
$func$;

revoke all on function public.can_manage_announcement(uuid) from public;
grant execute on function public.can_manage_announcement(uuid) to authenticated;

-- ============================================================================
-- Tables
-- ============================================================================

create table if not exists public.announcements (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  body            text not null,
  priority        public.announcement_priority not null default 'normal',
  pinned          boolean not null default false,
  due_at          timestamptz,
  author_user_id  uuid not null references auth.users(id) on delete restrict,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz,
  constraint announcements_title_length check (char_length(btrim(title)) between 1 and 160),
  constraint announcements_body_length check (char_length(btrim(body)) between 1 and 5000)
);

comment on table public.announcements
  is 'System-wide announcements visible to active users. due_at is informational only; deleted_at is soft delete.';

create index if not exists announcements_visible_order_idx
  on public.announcements (pinned desc, created_at desc)
  where deleted_at is null;

create index if not exists announcements_author_idx
  on public.announcements (author_user_id, created_at desc);

create table if not exists public.announcement_attachments (
  id                 uuid primary key default gen_random_uuid(),
  announcement_id    uuid not null references public.announcements(id) on delete cascade,
  storage_path       text not null unique,
  original_filename  text not null,
  mime_type          text not null,
  size_bytes         integer not null,
  uploader_user_id   uuid not null references auth.users(id) on delete restrict,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint announcement_attachments_filename_length check (char_length(btrim(original_filename)) between 1 and 255),
  constraint announcement_attachments_size check (size_bytes between 1 and 10485760),
  constraint announcement_attachments_mime check (
    mime_type in (
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/png',
      'image/jpeg'
    )
  )
);

comment on table public.announcement_attachments
  is 'Private attachment metadata for announcements. Files live in the private announcement-attachments bucket.';

create index if not exists announcement_attachments_announcement_idx
  on public.announcement_attachments (announcement_id, created_at asc);

create table if not exists public.announcement_reads (
  announcement_id  uuid not null references public.announcements(id) on delete cascade,
  user_id          uuid not null references auth.users(id) on delete cascade,
  read_at          timestamptz not null default now(),
  primary key (announcement_id, user_id)
);

comment on table public.announcement_reads
  is 'Per-user read state for announcements. Author rows are created immediately on publish.';

create index if not exists announcement_reads_user_idx
  on public.announcement_reads (user_id, read_at desc);

-- ============================================================================
-- RLS
-- ============================================================================

alter table public.announcements enable row level security;
alter table public.announcements force row level security;
alter table public.announcement_attachments enable row level security;
alter table public.announcement_attachments force row level security;
alter table public.announcement_reads enable row level security;
alter table public.announcement_reads force row level security;

create policy announcements_select_active_users
  on public.announcements
  for select
  to authenticated
  using (
    (select public.is_active_user())
    and deleted_at is null
  );

create policy announcements_insert_publishers
  on public.announcements
  for insert
  to authenticated
  with check (
    (select public.is_announcement_publisher())
    and (select public.is_active_user())
    and author_user_id = (select auth.uid())
    and deleted_at is null
  );

create policy announcements_update_manageable
  on public.announcements
  for update
  to authenticated
  using (
    (select public.can_manage_announcement(author_user_id))
    and deleted_at is null
  )
  with check (
    (select public.can_manage_announcement(author_user_id))
  );

create policy announcement_attachments_select_visible
  on public.announcement_attachments
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.announcements a
      where a.id = announcement_id
        and a.deleted_at is null
        and (select public.is_active_user())
    )
  );

create policy announcement_attachments_insert_manageable
  on public.announcement_attachments
  for insert
  to authenticated
  with check (
    uploader_user_id = (select auth.uid())
    and exists (
      select 1
      from public.announcements a
      where a.id = announcement_id
        and a.deleted_at is null
        and (select public.can_manage_announcement(a.author_user_id))
    )
  );

create policy announcement_attachments_update_manageable
  on public.announcement_attachments
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.announcements a
      where a.id = announcement_id
        and a.deleted_at is null
        and (select public.can_manage_announcement(a.author_user_id))
    )
  )
  with check (
    uploader_user_id = (select auth.uid())
    and exists (
      select 1
      from public.announcements a
      where a.id = announcement_id
        and a.deleted_at is null
        and (select public.can_manage_announcement(a.author_user_id))
    )
  );

create policy announcement_attachments_delete_manageable
  on public.announcement_attachments
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.announcements a
      where a.id = announcement_id
        and a.deleted_at is null
        and (select public.can_manage_announcement(a.author_user_id))
    )
  );

create policy announcement_reads_select_own
  on public.announcement_reads
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.announcements a
      where a.id = announcement_id
        and a.deleted_at is null
        and (select public.is_active_user())
    )
  );

create policy announcement_reads_insert_own
  on public.announcement_reads
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.announcements a
      where a.id = announcement_id
        and a.deleted_at is null
        and (select public.is_active_user())
    )
  );

create policy announcement_reads_update_own
  on public.announcement_reads
  for update
  to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.announcements a
      where a.id = announcement_id
        and a.deleted_at is null
        and (select public.is_active_user())
    )
  )
  with check (
    user_id = (select auth.uid())
  );

-- ============================================================================
-- Triggers
-- ============================================================================

create trigger announcements_set_updated_at
  before update on public.announcements
  for each row execute function public.set_updated_at();

create trigger announcement_attachments_set_updated_at
  before update on public.announcement_attachments
  for each row execute function public.set_updated_at();

-- ============================================================================
-- Realtime
-- ============================================================================

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'announcements'
  ) then
    alter publication supabase_realtime add table public.announcements;
  end if;
end $$;
