import { z } from "zod"
import type {
  AnnouncementAttachment,
  AnnouncementPriority,
  AnnouncementStats,
  AnnouncementSummary,
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
} from "./types"

export const ANNOUNCEMENT_PRIORITY_VALUES = ["low", "normal", "high", "urgent"] as const
export const ANNOUNCEMENT_ATTACHMENT_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/png",
  "image/jpeg",
] as const
export const MAX_ANNOUNCEMENT_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024

const isoDateTimeSchema = z.string().datetime({ offset: true })

function trimString(value: unknown) {
  return typeof value === "string" ? value.trim() : value
}

export const announcementPrioritySchema = z.enum(ANNOUNCEMENT_PRIORITY_VALUES)

export const announcementAttachmentSchema: z.ZodType<AnnouncementAttachment> = z.object({
  id: z.string().min(1),
  announcementId: z.string().min(1),
  storagePath: z.string().min(1),
  originalFilename: z.preprocess(trimString, z.string().min(1).max(255)),
  mimeType: z.enum(ANNOUNCEMENT_ATTACHMENT_MIME_TYPES),
  sizeBytes: z.number().int().positive().max(MAX_ANNOUNCEMENT_ATTACHMENT_SIZE_BYTES),
  uploadedByUserId: z.string().min(1),
  createdAt: isoDateTimeSchema,
})

export const announcementSummarySchema: z.ZodType<AnnouncementSummary> = z.object({
  id: z.string().min(1),
  title: z.preprocess(trimString, z.string().min(1).max(160)),
  body: z.preprocess(trimString, z.string().min(1).max(5000)),
  priority: announcementPrioritySchema,
  pinned: z.boolean(),
  startsAt: isoDateTimeSchema.nullable(),
  endsAt: isoDateTimeSchema.nullable(),
  authorUserId: z.string().min(1),
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
  deletedAt: isoDateTimeSchema.nullable(),
  readAt: isoDateTimeSchema.nullable(),
  attachments: z.array(announcementAttachmentSchema),
})

export const createAnnouncementInputSchema: z.ZodType<CreateAnnouncementInput> = z
  .object({
    title: z.preprocess(trimString, z.string().min(1).max(160)),
    body: z.preprocess(trimString, z.string().min(1).max(5000)),
    priority: announcementPrioritySchema,
    pinned: z.boolean().optional().default(false),
    startsAt: isoDateTimeSchema.nullable().optional(),
    endsAt: isoDateTimeSchema.nullable().optional(),
  })
  .refine(
    value =>
      value.startsAt === undefined ||
      value.endsAt === undefined ||
      value.startsAt === null ||
      value.endsAt === null ||
      value.startsAt <= value.endsAt,
    {
      message: "Announcement start must be before or equal to the end.",
      path: ["endsAt"],
    }
  )

export const updateAnnouncementInputSchema: z.ZodType<UpdateAnnouncementInput> = z
  .object({
    id: z.string().min(1),
    title: z.preprocess(trimString, z.string().min(1).max(160)).optional(),
    body: z.preprocess(trimString, z.string().min(1).max(5000)).optional(),
    priority: announcementPrioritySchema.optional(),
    pinned: z.boolean().optional(),
    startsAt: isoDateTimeSchema.nullable().optional(),
    endsAt: isoDateTimeSchema.nullable().optional(),
    deletedAt: isoDateTimeSchema.nullable().optional(),
  })
  .refine(
    value =>
      value.title !== undefined ||
      value.body !== undefined ||
      value.priority !== undefined ||
      value.pinned !== undefined ||
      value.startsAt !== undefined ||
      value.endsAt !== undefined ||
      value.deletedAt !== undefined,
    {
      message: "At least one announcement field must be updated.",
      path: ["id"],
    }
  )
  .refine(
    value =>
      value.startsAt === undefined ||
      value.endsAt === undefined ||
      value.startsAt === null ||
      value.endsAt === null ||
      value.startsAt <= value.endsAt,
    {
      message: "Announcement start must be before or equal to the end.",
      path: ["endsAt"],
    }
  )

export const announcementStatsSchema: z.ZodType<AnnouncementStats> = z.object({
  announcementId: z.string().min(1),
  readCount: z.number().int().nonnegative(),
})

export const announcementUploadRequestSchema = z.object({
  announcementId: z.string().min(1),
  originalFilename: z.preprocess(trimString, z.string().min(1).max(255)),
  mimeType: z.enum(ANNOUNCEMENT_ATTACHMENT_MIME_TYPES),
  sizeBytes: z.number().int().positive().max(MAX_ANNOUNCEMENT_ATTACHMENT_SIZE_BYTES),
})

export type AnnouncementUploadRequest = z.infer<typeof announcementUploadRequestSchema>
export type AnnouncementPriorityValue = AnnouncementPriority
