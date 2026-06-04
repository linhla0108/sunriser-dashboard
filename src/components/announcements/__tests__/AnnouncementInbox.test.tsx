import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { AnnouncementInbox } from "../AnnouncementInbox"
import type { AnnouncementSummary } from "@/lib/announcements/types"

const baseAnnouncement = {
  body: "Message body",
  priority: "normal",
  startsAt: null,
  endsAt: null,
  authorUserId: "author-1",
  updatedAt: "2026-05-27T08:00:00.000Z",
  deletedAt: null,
  attachments: [],
} satisfies Omit<AnnouncementSummary, "id" | "title" | "pinned" | "createdAt" | "readAt">

describe("AnnouncementInbox", () => {
  it("keeps the create action visible for publishers when the inbox is empty", () => {
    const onCreate = vi.fn()

    render(
      <AnnouncementInbox
        announcements={[]}
        loading={false}
        error={null}
        canManageAnnouncements={true}
        onMarkRead={vi.fn()}
        onCreate={onCreate}
        onOpenAttachment={vi.fn()}
      />
    )

    expect(screen.getByRole("button", { name: /create/i })).toBeInTheDocument()
    expect(screen.getByText("No announcements yet.")).toBeInTheDocument()
  })

  it("opens the create flow from the publisher action", async () => {
    const onCreate = vi.fn()

    render(
      <AnnouncementInbox
        announcements={[]}
        loading={false}
        error={null}
        canManageAnnouncements={true}
        onMarkRead={vi.fn()}
        onCreate={onCreate}
        onOpenAttachment={vi.fn()}
      />
    )

    await userEvent.click(screen.getByRole("button", { name: /create/i }))

    expect(onCreate).toHaveBeenCalledTimes(1)
  })

  it("does not render the create action for non-publishers", () => {
    render(
      <AnnouncementInbox
        announcements={[]}
        loading={false}
        error={null}
        canManageAnnouncements={false}
        onMarkRead={vi.fn()}
        onCreate={vi.fn()}
        onOpenAttachment={vi.fn()}
      />
    )

    expect(screen.queryByRole("button", { name: /create/i })).not.toBeInTheDocument()
  })

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
        onCreate={vi.fn()}
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
        onCreate={vi.fn()}
        onOpenAttachment={vi.fn()}
      />
    )

    await userEvent.click(screen.getByRole("button", { name: /mark read/i }))

    expect(onMarkRead).toHaveBeenCalledWith("unread")
  })
})
