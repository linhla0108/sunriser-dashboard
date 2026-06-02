import { describe, expect, it } from "vitest"
import {
  MAX_ANNOUNCEMENT_ATTACHMENT_SIZE_BYTES,
  announcementUploadRequestSchema,
  createAnnouncementInputSchema,
  updateAnnouncementInputSchema,
} from "../validation"

describe("announcement validation", () => {
  it("trims create input title and body", () => {
    const result = createAnnouncementInputSchema.parse({
      title: "  Team update  ",
      body: "  Review the new process.  ",
      priority: "high",
    })

    expect(result.title).toBe("Team update")
    expect(result.body).toBe("Review the new process.")
    expect(result.pinned).toBe(false)
  })

  it("rejects invalid priority", () => {
    const result = createAnnouncementInputSchema.safeParse({
      title: "Policy",
      body: "Body",
      priority: "critical",
    })

    expect(result.success).toBe(false)
  })

  it("rejects invalid active window values", () => {
    const result = createAnnouncementInputSchema.safeParse({
      title: "Policy",
      body: "Body",
      priority: "normal",
      startsAt: "2026-05-27",
    })

    expect(result.success).toBe(false)
  })

  it("rejects end dates before start dates", () => {
    const result = createAnnouncementInputSchema.safeParse({
      title: "Policy",
      body: "Body",
      priority: "normal",
      startsAt: "2026-06-01T11:00:00.000Z",
      endsAt: "2026-06-01T10:00:00.000Z",
    })

    expect(result.success).toBe(false)
  })

  it("requires at least one mutable field on update", () => {
    const result = updateAnnouncementInputSchema.safeParse({
      id: "announcement-1",
    })

    expect(result.success).toBe(false)
  })

  it("rejects invalid upload mime types", () => {
    const result = announcementUploadRequestSchema.safeParse({
      announcementId: "announcement-1",
      originalFilename: "script.exe",
      mimeType: "application/x-msdownload",
      sizeBytes: 128,
    })

    expect(result.success).toBe(false)
  })

  it("rejects files larger than 10 MB", () => {
    const result = announcementUploadRequestSchema.safeParse({
      announcementId: "announcement-1",
      originalFilename: "plan.pdf",
      mimeType: "application/pdf",
      sizeBytes: MAX_ANNOUNCEMENT_ATTACHMENT_SIZE_BYTES + 1,
    })

    expect(result.success).toBe(false)
  })
})
