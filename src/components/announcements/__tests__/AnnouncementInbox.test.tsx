import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { AnnouncementInbox } from "../AnnouncementInbox"
import type { AnnouncementSummary } from "@/lib/announcements/types"

const baseAnnouncement = {
  body: "Message body",
  priority: "normal",
  dueAt: null,
  authorUserId: "author-1",
  updatedAt: "2026-05-27T08:00:00.000Z",
  deletedAt: null,
  attachments: [],
} satisfies Omit<AnnouncementSummary, "id" | "title" | "pinned" | "createdAt" | "readAt">

describe("AnnouncementInbox", () => {
  it("renders pinned announcements ahead of the inbox list", () => {
    render(
      <AnnouncementInbox
        announcements={[
          {
            ...baseAnnouncement,
            id: "regular",
            title: "Regular",
            pinned: false,
            createdAt: "2026-05-27T09:00:00.000Z",
            readAt: null,
          },
          {
            ...baseAnnouncement,
            id: "pinned",
            title: "Pinned",
            pinned: true,
            createdAt: "2026-05-27T08:00:00.000Z",
            readAt: "2026-05-27T10:00:00.000Z",
          },
        ]}
        loading={false}
        error={null}
        canManageAnnouncements={false}
        onMarkRead={vi.fn()}
        onOpenAttachment={vi.fn()}
      />
    )

    const headings = screen.getAllByRole("heading", { level: 2 })
    expect(headings.map(node => node.textContent)).toEqual(["Pinned", "Regular"])
  })

  it("calls mark read for unread announcements", async () => {
    const onMarkRead = vi.fn()

    render(
      <AnnouncementInbox
        announcements={[
          {
            ...baseAnnouncement,
            id: "unread",
            title: "Unread",
            pinned: false,
            createdAt: "2026-05-27T09:00:00.000Z",
            readAt: null,
          },
        ]}
        loading={false}
        error={null}
        canManageAnnouncements={false}
        onMarkRead={onMarkRead}
        onOpenAttachment={vi.fn()}
      />
    )

    await userEvent.click(screen.getByRole("button", { name: /mark read/i }))

    expect(onMarkRead).toHaveBeenCalledWith("unread")
  })
})
