import { createClient } from "@/lib/supabase/client"
import type { AppRole } from "@/lib/auth/types"
import type { AnnouncementStats, AnnouncementSummary, CreateAnnouncementInput, UpdateAnnouncementInput } from "./types"
import { buildAnnouncementSummaries, type AnnouncementAttachmentRow, type AnnouncementListRow, type AnnouncementReadRow } from "./list"
import { createAnnouncementInputSchema, updateAnnouncementInputSchema } from "./validation"

const ATTACHMENTS_BUCKET = "announcement-attachments"

async function listAnnouncementReads(supabase: ReturnType<typeof createClient>, userId: string) {
  const { data, error } = await supabase.from("announcement_reads").select("announcement_id, read_at").eq("user_id", userId)
  if (error) throw new Error(error.message)
  return (data ?? []) as AnnouncementReadRow[]
}

async function listAnnouncementAttachments(supabase: ReturnType<typeof createClient>, announcementIds: string[]) {
  if (announcementIds.length === 0) return [] as AnnouncementAttachmentRow[]
  const { data, error } = await supabase
    .from("announcement_attachments")
    .select("id, announcement_id, storage_path, original_filename, mime_type, size_bytes, uploader_user_id, created_at")
    .in("announcement_id", announcementIds)
    .order("created_at", { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []) as AnnouncementAttachmentRow[]
}

export async function listVisibleAnnouncements(userId: string): Promise<AnnouncementSummary[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("announcements")
    .select("id, title, body, priority, pinned, due_at, author_user_id, created_at, updated_at, deleted_at")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)

  const rows = (data ?? []) as AnnouncementListRow[]
  const [reads, attachments] = await Promise.all([
    listAnnouncementReads(supabase, userId),
    listAnnouncementAttachments(
      supabase,
      rows.map(row => row.id)
    ),
  ])

  return buildAnnouncementSummaries(rows, reads, attachments)
}

export async function listManagedAnnouncements(role: AppRole, userId: string): Promise<AnnouncementSummary[]> {
  const supabase = createClient()
  let query = supabase
    .from("announcements")
    .select("id, title, body, priority, pinned, due_at, author_user_id, created_at, updated_at, deleted_at")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })

  if (role !== "admin") query = query.eq("author_user_id", userId)

  const { data, error } = await query
  if (error) throw new Error(error.message)

  return buildAnnouncementSummaries(
    (data ?? []) as AnnouncementListRow[],
    [],
    await listAnnouncementAttachments(
      supabase,
      ((data ?? []) as AnnouncementListRow[]).map(row => row.id)
    )
  )
}

export async function markAnnouncementRead(announcementId: string, userId: string) {
  const supabase = createClient()
  const readAt = new Date().toISOString()
  const { error } = await supabase.from("announcement_reads").upsert(
    {
      announcement_id: announcementId,
      user_id: userId,
      read_at: readAt,
    },
    { onConflict: "announcement_id,user_id" }
  )

  if (error) throw new Error(error.message)
  return readAt
}

export async function createAnnouncement(input: CreateAnnouncementInput, userId: string) {
  const supabase = createClient()
  const parsed = createAnnouncementInputSchema.parse(input)

  const { data, error } = await supabase
    .from("announcements")
    .insert({
      title: parsed.title,
      body: parsed.body,
      priority: parsed.priority,
      pinned: parsed.pinned ?? false,
      due_at: parsed.dueAt ?? null,
      author_user_id: userId,
    })
    .select("id, title, body, priority, pinned, due_at, author_user_id, created_at, updated_at, deleted_at")
    .single()

  if (error) throw new Error(error.message)

  const readAt = await markAnnouncementRead(data.id, userId)
  return buildAnnouncementSummaries([data as AnnouncementListRow], [{ announcement_id: data.id, read_at: readAt }], [])[0]
}

export async function updateAnnouncement(input: UpdateAnnouncementInput) {
  const supabase = createClient()
  const parsed = updateAnnouncementInputSchema.parse(input)
  const patch: Record<string, unknown> = {}

  if (parsed.title !== undefined) patch.title = parsed.title
  if (parsed.body !== undefined) patch.body = parsed.body
  if (parsed.priority !== undefined) patch.priority = parsed.priority
  if (parsed.pinned !== undefined) patch.pinned = parsed.pinned
  if (parsed.dueAt !== undefined) patch.due_at = parsed.dueAt
  if (parsed.deletedAt !== undefined) patch.deleted_at = parsed.deletedAt

  const { data, error } = await supabase
    .from("announcements")
    .update(patch)
    .eq("id", parsed.id)
    .select("id, title, body, priority, pinned, due_at, author_user_id, created_at, updated_at, deleted_at")
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) throw new Error("Announcement not found or permission denied")

  return buildAnnouncementSummaries([data as AnnouncementListRow], [], await listAnnouncementAttachments(supabase, [parsed.id]))[0]
}

export async function softDeleteAnnouncement(id: string) {
  return updateAnnouncement({ id, deletedAt: new Date().toISOString() })
}

export async function fetchAnnouncementStats() {
  const res = await fetch("/api/announcements/stats", { cache: "no-store" })
  const body = (await res.json().catch(() => ({}))) as { stats?: AnnouncementStats[]; error?: string }
  if (!res.ok) throw new Error(body.error ?? "Failed to load announcement stats")
  return body.stats ?? []
}

export async function uploadAnnouncementAttachment(announcementId: string, file: File) {
  const formData = new FormData()
  formData.append("announcementId", announcementId)
  formData.append("file", file)

  const res = await fetch("/api/announcements/attachments", {
    method: "POST",
    body: formData,
  })

  const body = (await res.json().catch(() => ({}))) as {
    attachment?: AnnouncementSummary["attachments"][number]
    error?: string
  }

  if (!res.ok) throw new Error(body.error ?? "Failed to upload attachment")
  if (!body.attachment) throw new Error("Attachment upload returned no metadata")

  return body.attachment
}

export async function getAnnouncementAttachmentUrl(attachmentId: string) {
  const res = await fetch(`/api/announcements/attachments/${attachmentId}`, { cache: "no-store" })
  const body = (await res.json().catch(() => ({}))) as { url?: string; error?: string }
  if (!res.ok) throw new Error(body.error ?? "Failed to create attachment URL")
  if (!body.url) throw new Error("No attachment URL returned")
  return body.url
}

export { ATTACHMENTS_BUCKET }
