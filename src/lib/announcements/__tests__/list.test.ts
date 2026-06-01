import { describe, expect, it } from "vitest"
import { buildAnnouncementSummaries } from "../list"

describe("buildAnnouncementSummaries", () => {
  it("sorts pinned first, then unread, then newest", () => {
    const result = buildAnnouncementSummaries(
      [
        {
          id: "read-newer",
          title: "Read newer",
          body: "Body",
          priority: "normal",
          pinned: false,
          due_at: null,
          author_user_id: "author-1",
          created_at: "2026-05-27T10:00:00.000Z",
          updated_at: "2026-05-27T10:00:00.000Z",
          deleted_at: null,
        },
        {
          id: "pinned-read",
          title: "Pinned read",
          body: "Body",
          priority: "urgent",
          pinned: true,
          due_at: null,
          author_user_id: "author-2",
          created_at: "2026-05-27T09:00:00.000Z",
          updated_at: "2026-05-27T09:00:00.000Z",
          deleted_at: null,
        },
        {
          id: "unread-older",
          title: "Unread older",
          body: "Body",
          priority: "low",
          pinned: false,
          due_at: null,
          author_user_id: "author-3",
          created_at: "2026-05-27T08:00:00.000Z",
          updated_at: "2026-05-27T08:00:00.000Z",
          deleted_at: null,
        },
      ],
      [
        { announcement_id: "read-newer", read_at: "2026-05-27T10:30:00.000Z" },
        { announcement_id: "pinned-read", read_at: "2026-05-27T09:30:00.000Z" },
      ],
      []
    )

    expect(result.map(item => item.id)).toEqual(["pinned-read", "unread-older", "read-newer"])
  })

  it("maps attachments and read state onto summaries", () => {
    const result = buildAnnouncementSummaries(
      [
        {
          id: "announcement-1",
          title: "  Launch note  ",
          body: "  Read this first.  ",
          priority: "high",
          pinned: false,
          due_at: "2026-05-28T00:00:00.000Z",
          author_user_id: "author-1",
          created_at: "2026-05-27T08:00:00.000Z",
          updated_at: "2026-05-27T08:10:00.000Z",
          deleted_at: null,
        },
      ],
      [{ announcement_id: "announcement-1", read_at: "2026-05-27T09:00:00.000Z" }],
      [
        {
          id: "attachment-1",
          announcement_id: "announcement-1",
          storage_path: "announcement-1/brief.pdf",
          original_filename: " brief.pdf ",
          mime_type: "application/pdf",
          size_bytes: 1024,
          uploader_user_id: "author-1",
          created_at: "2026-05-27T08:05:00.000Z",
        },
      ]
    )

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      id: "announcement-1",
      title: "Launch note",
      body: "Read this first.",
      dueAt: "2026-05-28T00:00:00.000Z",
      readAt: "2026-05-27T09:00:00.000Z",
    })
    expect(result[0].attachments).toEqual([
      expect.objectContaining({
        id: "attachment-1",
        originalFilename: "brief.pdf",
        mimeType: "application/pdf",
      }),
    ])
  })
})
