import type { AnnouncementAttachment, AnnouncementSummary } from "./types"
import { announcementAttachmentSchema, announcementSummarySchema } from "./validation"

export interface AnnouncementListRow {
  id: string
  title: string
  body: string
  priority: AnnouncementSummary["priority"]
  pinned: boolean
  due_at: string | null
  author_user_id: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface AnnouncementReadRow {
  announcement_id: string
  read_at: string
}

export interface AnnouncementAttachmentRow {
  id: string
  announcement_id: string
  storage_path: string
  original_filename: string
  mime_type: string
  size_bytes: number
  uploader_user_id: string
  created_at: string
}

function toAttachment(row: AnnouncementAttachmentRow): AnnouncementAttachment {
  return announcementAttachmentSchema.parse({
    id: row.id,
    announcementId: row.announcement_id,
    storagePath: row.storage_path,
    originalFilename: row.original_filename,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    uploadedByUserId: row.uploader_user_id,
    createdAt: row.created_at,
  })
}

function compareAnnouncements(a: AnnouncementSummary, b: AnnouncementSummary) {
  if (a.pinned !== b.pinned) return a.pinned ? -1 : 1

  const aUnread = a.readAt === null
  const bUnread = b.readAt === null
  if (aUnread !== bUnread) return aUnread ? -1 : 1

  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
}

export function buildAnnouncementSummaries(
  announcements: AnnouncementListRow[],
  reads: AnnouncementReadRow[],
  attachments: AnnouncementAttachmentRow[]
) {
  const readAtByAnnouncementId = new Map(reads.map(read => [read.announcement_id, read.read_at]))
  const attachmentsByAnnouncementId = new Map<string, AnnouncementAttachment[]>()

  for (const attachment of attachments) {
    const current = attachmentsByAnnouncementId.get(attachment.announcement_id) ?? []
    current.push(toAttachment(attachment))
    attachmentsByAnnouncementId.set(attachment.announcement_id, current)
  }

  return announcements
    .map(row =>
      announcementSummarySchema.parse({
        id: row.id,
        title: row.title,
        body: row.body,
        priority: row.priority,
        pinned: row.pinned,
        dueAt: row.due_at,
        authorUserId: row.author_user_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        deletedAt: row.deleted_at,
        readAt: readAtByAnnouncementId.get(row.id) ?? null,
        attachments: attachmentsByAnnouncementId.get(row.id) ?? [],
      })
    )
    .sort(compareAnnouncements)
}
