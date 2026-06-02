import { render, screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import AnnouncementsPage from "../page"

const routerReplace = vi.fn()

vi.mock("next/navigation", () => ({
  usePathname: () => "/announcements",
  useRouter: () => ({ replace: routerReplace }),
  useSearchParams: () =>
    new URLSearchParams({
      announcement: "announcement-1",
    }),
}))

vi.mock("@/lib/announcements/AnnouncementProvider", () => ({
  useAnnouncements: () => ({
    announcements: [
      {
        id: "announcement-1",
        title: "Deep linked",
        body: "Modal body",
        priority: "high",
        pinned: false,
        startsAt: null,
        endsAt: "2026-06-01T17:00:00.000Z",
        authorUserId: "author-1",
        createdAt: "2026-06-01T08:00:00.000Z",
        updatedAt: "2026-06-01T08:00:00.000Z",
        deletedAt: null,
        readAt: null,
        attachments: [],
      },
    ],
    loading: false,
    error: null,
    canManageAnnouncements: false,
    markRead: vi.fn().mockResolvedValue(undefined),
  }),
}))

vi.mock("@/lib/announcements/client", () => ({
  getAnnouncementAttachmentUrl: vi.fn(),
}))

describe("Announcements page", () => {
  it("opens the shared detail modal when the announcement query param is present", async () => {
    render(<AnnouncementsPage />)

    const dialog = screen.getByRole("dialog")
    expect(dialog).toBeInTheDocument()
    expect(within(dialog).getByText("Modal body")).toBeInTheDocument()
  })
})
