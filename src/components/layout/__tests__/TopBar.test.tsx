import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { TooltipProvider } from "@/components/ui/tooltip"
import { TopBar } from "../TopBar"

const routerPush = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPush }),
}))

vi.mock("@/lib/auth/useAuth", () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    role: "admin",
    isAdmin: true,
    can: () => true,
    signIn: vi.fn(),
    signOut: vi.fn(),
  }),
}))

vi.mock("@/lib/announcements/AnnouncementProvider", () => ({
  useAnnouncements: () => ({
    unreadCount: 2,
  }),
}))

function TestProviders({ children }: { children: React.ReactNode }) {
  return <TooltipProvider delay={0}>{children}</TooltipProvider>
}

describe("TopBar", () => {
  beforeEach(() => {
    localStorage.clear()
    routerPush.mockClear()
  })

  it("renders title and primary actions without the account menu", () => {
    render(<TopBar />, { wrapper: TestProviders })

    expect(screen.getByRole("heading", { name: "Overview" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /open announcements/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /create report/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /export data/i })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /open account menu/i })).not.toBeInTheDocument()
  })

  it("calls action handlers from the toolbar buttons", async () => {
    const onOpenChat = vi.fn()
    const onOpenNotes = vi.fn()
    const onCreateReport = vi.fn()
    const onExportData = vi.fn()

    render(<TopBar onOpenChat={onOpenChat} onOpenNotes={onOpenNotes} onCreateReport={onCreateReport} onExportData={onExportData} />, {
      wrapper: TestProviders,
    })

    await userEvent.click(screen.getByRole("button", { name: /open announcements/i }))
    await userEvent.click(screen.getByRole("button", { name: /open ai drawer/i }))
    await userEvent.click(screen.getByRole("button", { name: /open notes/i }))
    await userEvent.click(screen.getByRole("button", { name: /create report/i }))
    await userEvent.click(screen.getByRole("button", { name: /export data/i }))

    expect(routerPush).toHaveBeenCalledWith("/announcements")
    expect(onOpenChat).toHaveBeenCalledTimes(1)
    expect(onOpenNotes).toHaveBeenCalledTimes(1)
    expect(onCreateReport).toHaveBeenCalledTimes(1)
    expect(onExportData).toHaveBeenCalledTimes(1)
  })
})
