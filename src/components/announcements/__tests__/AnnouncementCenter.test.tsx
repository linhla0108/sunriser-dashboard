import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AnnouncementCenter } from "../AnnouncementCenter"

const routerPush = vi.fn()
const markRead = vi.fn()
const getAnnouncementAttachmentUrl = vi.fn()
const writeText = vi.fn()
const useAnnouncementsMock = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPush }),
}))

vi.mock("@/lib/announcements/AnnouncementProvider", () => ({
  useAnnouncements: () => useAnnouncementsMock(),
}))

vi.mock("@/lib/announcements/client", () => ({
  getAnnouncementAttachmentUrl: (...args: unknown[]) => getAnnouncementAttachmentUrl(...args),
}))

function Providers({ children }: { children: React.ReactNode }) {
  return <TooltipProvider delay={0}>{children}</TooltipProvider>
}

describe("AnnouncementCenter", () => {
  beforeEach(() => {
    useAnnouncementsMock.mockReturnValue({
      announcements: [
        {
          id: "announcement-1",
          title: "Urgent update",
          body: "Full urgent body",
          priority: "urgent",
          pinned: true,
          startsAt: "2026-06-01T08:00:00.000Z",
          endsAt: "2026-06-01T17:00:00.000Z",
          authorUserId: "author-1",
          createdAt: "2026-06-01T08:00:00.000Z",
          updatedAt: "2026-06-01T08:00:00.000Z",
          deletedAt: null,
          readAt: null,
          attachments: [
            {
              id: "attachment-1",
              announcementId: "announcement-1",
              storagePath: "a/1.pdf",
              originalFilename: "brief.pdf",
              mimeType: "application/pdf",
              sizeBytes: 1024,
              uploadedByUserId: "author-1",
              createdAt: "2026-06-01T08:00:00.000Z",
            },
          ],
        },
        {
          id: "announcement-2",
          title: "Read note",
          body: "Already handled",
          priority: "normal",
          pinned: false,
          startsAt: null,
          endsAt: null,
          authorUserId: "author-2",
          createdAt: "2026-05-30T08:00:00.000Z",
          updatedAt: "2026-05-30T08:00:00.000Z",
          deletedAt: null,
          readAt: "2026-05-30T09:00:00.000Z",
          attachments: [],
        },
      ],
      unreadCount: 1,
      loading: false,
      error: null,
      markRead,
    })
    routerPush.mockClear()
    markRead.mockReset()
    getAnnouncementAttachmentUrl.mockReset()
    writeText.mockReset()
    getAnnouncementAttachmentUrl.mockResolvedValue("https://files.example/brief.pdf")
    Object.assign(navigator, {
      clipboard: {
        writeText,
      },
    })
    window.open = vi.fn()
  })

  it("filters the popup list by unread, pinned, and all tabs", async () => {
    render(<AnnouncementCenter />, { wrapper: Providers })

    await userEvent.click(screen.getByRole("button", { name: /open announcements/i }))
    expect(screen.getByTestId("announcement-center-item-announcement-1")).toBeInTheDocument()
    expect(screen.getByTestId("announcement-center-item-announcement-2")).toBeInTheDocument()

    await userEvent.click(screen.getByRole("button", { name: "Unread", pressed: false }))
    expect(screen.getByTestId("announcement-center-item-announcement-1")).toBeInTheDocument()
    expect(screen.queryByTestId("announcement-center-item-announcement-2")).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole("button", { name: "Pinned", pressed: false }))
    expect(screen.getByTestId("announcement-center-item-announcement-1")).toBeInTheDocument()
    expect(screen.queryByTestId("announcement-center-item-announcement-2")).not.toBeInTheDocument()
  })

  it("opens the detail modal and marks unread announcements as read", async () => {
    render(<AnnouncementCenter />, { wrapper: Providers })

    await userEvent.click(screen.getByRole("button", { name: /open announcements/i }))
    await userEvent.click(screen.getByTestId("announcement-center-item-announcement-1"))

    expect(await screen.findByText("Full urgent body")).toBeInTheDocument()
    await waitFor(() => expect(markRead).toHaveBeenCalledWith("announcement-1"))

    await userEvent.click(screen.getByRole("button", { name: /brief.pdf/i }))
    await waitFor(() => expect(getAnnouncementAttachmentUrl).toHaveBeenCalledWith("attachment-1"))
    expect(window.open).toHaveBeenCalledWith("https://files.example/brief.pdf", "_blank", "noopener,noreferrer")
  })

  it("supports context-menu link actions for popup items", async () => {
    render(<AnnouncementCenter />, { wrapper: Providers })

    await userEvent.click(screen.getByRole("button", { name: /open announcements/i }))
    fireEvent.contextMenu(screen.getByTestId("announcement-center-item-announcement-1"))

    await userEvent.click(await screen.findByRole("menuitem", { name: /copy link/i }))
    expect(writeText).toHaveBeenCalledWith("http://localhost:3000/announcements?announcement=announcement-1")

    fireEvent.contextMenu(screen.getByTestId("announcement-center-item-announcement-1"))
    await userEvent.click(await screen.findByRole("menuitem", { name: /open inbox page/i }))
    expect(routerPush).toHaveBeenCalledWith("/announcements?announcement=announcement-1")
  })

  it("shows the provider error instead of an empty state", async () => {
    useAnnouncementsMock.mockReturnValue({
      announcements: [],
      unreadCount: 0,
      loading: false,
      error: "column announcements.starts_at does not exist",
      markRead,
    })

    render(<AnnouncementCenter />, { wrapper: Providers })

    await userEvent.click(screen.getByRole("button", { name: /open announcements/i }))
    expect(screen.getByText("column announcements.starts_at does not exist")).toBeInTheDocument()
    expect(screen.queryByText("No announcements in this tab.")).not.toBeInTheDocument()
  })
})
