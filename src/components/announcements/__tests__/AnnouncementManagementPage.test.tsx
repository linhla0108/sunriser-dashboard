import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AnnouncementManagementPage } from "../AnnouncementManagementPage"

const refresh = vi.fn()
const listManagedAnnouncements = vi.fn()
const fetchAnnouncementStats = vi.fn()
const listAdminUsers = vi.fn()

vi.mock("@/lib/auth/useAuth", () => ({
  useAuth: () => ({
    user: {
      id: "u_admin",
      role: "admin",
    },
  }),
}))

vi.mock("@/lib/announcements/AnnouncementProvider", () => ({
  useAnnouncements: () => ({
    refresh,
  }),
}))

vi.mock("@/lib/admin/adminApi", () => ({
  listAdminUsers: (...args: unknown[]) => listAdminUsers(...args),
}))

vi.mock("@/lib/announcements/client", () => ({
  createAnnouncement: vi.fn(),
  fetchAnnouncementStats: (...args: unknown[]) => fetchAnnouncementStats(...args),
  getAnnouncementAttachmentUrl: vi.fn(),
  listManagedAnnouncements: (...args: unknown[]) => listManagedAnnouncements(...args),
  softDeleteAnnouncement: vi.fn(),
  updateAnnouncement: vi.fn(),
  uploadAnnouncementAttachment: vi.fn(),
}))

vi.mock("@/components/ui/date-time-picker", () => ({
  DateTimeRangePicker: ({ id }: { id: string }) => <div data-testid={id} />,
}))

describe("AnnouncementManagementPage", () => {
  beforeEach(() => {
    refresh.mockReset()
    listManagedAnnouncements.mockReset()
    fetchAnnouncementStats.mockReset()
    listAdminUsers.mockReset()

    listManagedAnnouncements.mockResolvedValue([])
    fetchAnnouncementStats.mockResolvedValue([])
    listAdminUsers.mockResolvedValue([
      {
        user_id: "u_staff_1",
        email: "linh@sunriser.com",
        full_name: "Linh Admin",
        positions: ["HR Lead"],
        birthday: null,
        notes: null,
        active: true,
        role: "admin",
        permissions: ["read", "edit", "delete"],
      },
    ])
  })

  it("shows placeholders and inserts a selected mention into the body", async () => {
    render(<AnnouncementManagementPage />)

    await waitFor(() => expect(listManagedAnnouncements).toHaveBeenCalled())

    expect(screen.getByPlaceholderText("Quarterly hiring update, office closure, policy reminder...")).toBeInTheDocument()
    expect(screen.getByTestId("announcement-active-window")).toBeInTheDocument()
    expect(screen.queryByTestId("announcement-starts-at")).not.toBeInTheDocument()
    expect(screen.queryByTestId("announcement-ends-at")).not.toBeInTheDocument()

    const body = screen.getByPlaceholderText("Share the update, context, action items, and type @ to mention staff.")
    await userEvent.type(body, "Please review with @lin")

    await waitFor(() => expect(screen.getByText("Linh Admin")).toBeInTheDocument())

    await userEvent.click(screen.getByRole("button", { name: /Linh Admin/i }))

    expect(body).toHaveValue("Please review with @Linh Admin ")
  })
})
