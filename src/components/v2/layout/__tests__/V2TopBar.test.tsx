import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AuthProvider } from "@/lib/v2/auth/AuthProvider"
import { V2TopBar } from "../V2TopBar"

function TestProviders({ children }: { children: React.ReactNode }) {
  localStorage.setItem(
    "v2.auth.session",
    JSON.stringify({
      userId: "u_admin",
      role: "admin",
      expiresAt: "2099-01-01T00:00:00.000Z",
    })
  )

  return (
    <TooltipProvider delay={0}>
      <AuthProvider>{children}</AuthProvider>
    </TooltipProvider>
  )
}

describe("V2TopBar", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("renders title, primary actions, and account details", async () => {
    render(<V2TopBar />, { wrapper: TestProviders })

    expect(screen.getByRole("heading", { name: "Overview" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /create report/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /export data/i })).toBeInTheDocument()

    await userEvent.click(screen.getByRole("button", { name: /open account menu/i }))

    expect(await screen.findByText("Linh Admin")).toBeInTheDocument()
    expect(screen.getByText("admin@sunriser.com")).toBeInTheDocument()
    expect(screen.getByText("admin")).toBeInTheDocument()
  })

  it("calls action handlers from the toolbar buttons", async () => {
    const onOpenChat = vi.fn()
    const onOpenNotes = vi.fn()
    const onCreateReport = vi.fn()
    const onExportData = vi.fn()

    render(<V2TopBar onOpenChat={onOpenChat} onOpenNotes={onOpenNotes} onCreateReport={onCreateReport} onExportData={onExportData} />, {
      wrapper: TestProviders,
    })

    await userEvent.click(screen.getByRole("button", { name: /open ai drawer/i }))
    await userEvent.click(screen.getByRole("button", { name: /open notes/i }))
    await userEvent.click(screen.getByRole("button", { name: /create report/i }))
    await userEvent.click(screen.getByRole("button", { name: /export data/i }))

    expect(onOpenChat).toHaveBeenCalledTimes(1)
    expect(onOpenNotes).toHaveBeenCalledTimes(1)
    expect(onCreateReport).toHaveBeenCalledTimes(1)
    expect(onExportData).toHaveBeenCalledTimes(1)
  })
})
