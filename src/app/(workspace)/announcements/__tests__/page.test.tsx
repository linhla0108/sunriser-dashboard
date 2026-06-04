import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import AnnouncementsPage from "../page"

const routerReplace = vi.fn()
const refresh = vi.fn()
const markRead = vi.fn().mockResolvedValue(undefined)
const createAnnouncement = vi.fn()
const uploadAnnouncementAttachment = vi.fn()
let canManageAnnouncements = false
let selectedAnnouncementId: string | null = "announcement-1"

vi.mock("next/navigation", () => ({
  usePathname: () => "/announcements",
  useRouter: () => ({ replace: routerReplace }),
  useSearchParams: () => new URLSearchParams(selectedAnnouncementId ? { announcement: selectedAnnouncementId } : {}),
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
    canManageAnnouncements,
    refresh,
    markRead,
  }),
}))

vi.mock("@/lib/announcements/client", () => ({
  createAnnouncement: (...args: unknown[]) => createAnnouncement(...args),
  getAnnouncementAttachmentUrl: vi.fn(),
  uploadAnnouncementAttachment: (...args: unknown[]) => uploadAnnouncementAttachment(...args),
}))

vi.mock("@/lib/admin/adminApi", () => ({
  listAdminUsers: vi.fn().mockResolvedValue([
    {
      user_id: "u_staff_1",
      email: "linh@sunriser.com",
      full_name: "Linh Admin",
      positions: ["HR Lead"],
      active: true,
    },
  ]),
}))

vi.mock("@/lib/auth/useAuth", () => ({
  useAuth: () => ({
    user: {
      id: "u_admin",
      role: "admin",
      access: {
        active: true,
      },
    },
  }),
}))

describe("Announcements page", () => {
  beforeEach(() => {
    canManageAnnouncements = false
    selectedAnnouncementId = "announcement-1"
    refresh.mockReset()
    markRead.mockClear()
    createAnnouncement.mockReset()
    uploadAnnouncementAttachment.mockReset()
    createAnnouncement.mockResolvedValue({ id: "new-announcement" })
  })

  it("opens the shared detail modal when the announcement query param is present", async () => {
    render(<AnnouncementsPage />)

    const dialog = screen.getByRole("dialog")
    expect(dialog).toBeInTheDocument()
    expect(within(dialog).getByText("Modal body")).toBeInTheDocument()
  })

  it("creates an announcement from the inbox modal", async () => {
    canManageAnnouncements = true
    selectedAnnouncementId = null

    render(<AnnouncementsPage />)

    await userEvent.click(screen.getByRole("button", { name: /create/i }))

    const dialog = screen.getAllByRole("dialog").find(node => within(node).queryByRole("heading", { name: "New announcement" }))
    expect(dialog).toBeTruthy()

    const attachment = new File(["Brief"], "brief.pdf", { type: "application/pdf" })
    await userEvent.type(screen.getByLabelText("Title"), "Campaign update")
    await userEvent.type(screen.getByLabelText("Body"), "Please review with @lin")
    await waitFor(() => expect(screen.getByText("Linh Admin")).toBeInTheDocument())
    await userEvent.click(screen.getByRole("button", { name: /Linh Admin/i }))
    await userEvent.upload(screen.getByLabelText("Attachments"), attachment)
    await userEvent.click(screen.getByRole("button", { name: /publish announcement/i }))

    await waitFor(() =>
      expect(createAnnouncement).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Campaign update",
          body: "Please review with @Linh Admin ",
          priority: "normal",
          pinned: false,
        }),
        "u_admin"
      )
    )
    expect(uploadAnnouncementAttachment).toHaveBeenCalledWith("new-announcement", attachment)
    expect(refresh).toHaveBeenCalledTimes(1)
  })
})
