import { describe, expect, it } from "vitest"
import {
  getCandidateBinaryPreviewMode,
  getCandidateFileName,
  normalizePreviewContentType,
} from "@/lib/candidates/filePreview"

describe("file preview helpers", () => {
  it("normalizes generic binary responses from URL extensions", () => {
    expect(normalizePreviewContentType("application/octet-stream", "https://example.com/transcript.pdf")).toBe("application/pdf")
    expect(normalizePreviewContentType(null, "https://example.com/transcript.docx")).toBe(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
  })

  it("classifies PDF, image, docx, and archive modes", () => {
    expect(getCandidateBinaryPreviewMode({ contentType: "application/pdf", url: "https://example.com/a.pdf" })).toBe("pdf")
    expect(getCandidateBinaryPreviewMode({ contentType: "image/jpeg", url: "https://example.com/a.jpg" })).toBe("image")
    expect(
      getCandidateBinaryPreviewMode({
        contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        url: "https://example.com/a.docx",
      })
    ).toBe("docx")
    expect(getCandidateBinaryPreviewMode({ contentType: "application/zip", url: "https://example.com/a.zip" })).toBe("unsupported")
  })

  it("extracts a stable filename from the preview URL", () => {
    expect(getCandidateFileName("https://example.com/files/B%E1%BA%A3ng_%C4%91i%E1%BB%83m.pdf")).toBe("Bảng_điểm.pdf")
  })
})
