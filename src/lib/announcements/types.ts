export type AnnouncementPriority = "low" | "normal" | "high" | "urgent"

export interface AnnouncementAttachment {
  id: string
  announcementId: string
  storagePath: string
  originalFilename: string
  mimeType: string
  sizeBytes: number
  uploadedByUserId: string
  createdAt: string
}

export interface AnnouncementSummary {
  id: string
  title: string
  body: string
  priority: AnnouncementPriority
  pinned: boolean
  startsAt: string | null
  endsAt: string | null
  authorUserId: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  readAt: string | null
  attachments: AnnouncementAttachment[]
}

export interface CreateAnnouncementInput {
  title: string
  body: string
  priority: AnnouncementPriority
  pinned?: boolean
  startsAt?: string | null
  endsAt?: string | null
}

export interface UpdateAnnouncementInput {
  id: string
  title?: string
  body?: string
  priority?: AnnouncementPriority
  pinned?: boolean
  startsAt?: string | null
  endsAt?: string | null
  deletedAt?: string | null
}

export interface AnnouncementStats {
  announcementId: string
  readCount: number
}
