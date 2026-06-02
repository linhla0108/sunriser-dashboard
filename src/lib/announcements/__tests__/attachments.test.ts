import { describe, expect, it } from "vitest"
import {
  formatAttachmentAcceptValue,
  isAcceptedAnnouncementAttachment,
  mergeAnnouncementAttachments,
  splitAnnouncementAttachments,
} from "../attachments"

describe("announcement attachments", () => {
  it("accepts supported file types", () => {
    const file = new File(["pdf"], "brief.pdf", { type: "application/pdf" })
    expect(isAcceptedAnnouncementAttachment(file)).toBe(true)
  })

  it("rejects unsupported file types", () => {
    const file = new File(["exe"], "script.exe", { type: "application/x-msdownload" })
    expect(isAcceptedAnnouncementAttachment(file)).toBe(false)
  })

  it("splits accepted and rejected files", () => {
    const accepted = new File(["img"], "photo.jpg", { type: "image/jpeg" })
    const rejected = new File(["zip"], "archive.zip", { type: "application/zip" })

    expect(splitAnnouncementAttachments([accepted, rejected])).toEqual({
      accepted: [accepted],
      rejected: [rejected],
    })
  })

  it("deduplicates queued files when merging", () => {
    const first = new File(["pdf"], "brief.pdf", { type: "application/pdf", lastModified: 1 })
    const duplicate = new File(["pdf"], "brief.pdf", { type: "application/pdf", lastModified: 1 })
    const second = new File(["img"], "photo.jpg", { type: "image/jpeg", lastModified: 2 })

    expect(mergeAnnouncementAttachments([first], [duplicate, second])).toEqual([first, second])
  })

  it("builds the input accept value from extensions and mime types", () => {
    expect(formatAttachmentAcceptValue()).toContain(".pdf")
    expect(formatAttachmentAcceptValue()).toContain("application/pdf")
  })
})
