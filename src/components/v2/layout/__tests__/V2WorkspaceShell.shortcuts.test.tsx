import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AuthProvider } from "@/lib/v2/auth/AuthProvider"
import { ThemeProvider } from "@/lib/v2/theme/ThemeProvider"
import { V2WorkspaceShell } from "../V2WorkspaceShell"

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({ push: vi.fn() }),
}))

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

function setupSession() {
  localStorage.setItem(
    "v2.auth.session",
    JSON.stringify({
      userId: "u_admin",
      role: "admin",
      expiresAt: "2099-01-01T00:00:00.000Z",
    })
  )
}

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delay={0}>
      <ThemeProvider>
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  )
}

describe("V2WorkspaceShell keyboard shortcuts", () => {
  beforeEach(() => {
    localStorage.clear()
    setupSession()
  })

  it("Ctrl+R opens the report modal", async () => {
    render(
      <V2WorkspaceShell>
        <div>page</div>
      </V2WorkspaceShell>,
      { wrapper: Providers }
    )

    await screen.findByText("page")
    expect(screen.queryByText("Generated report")).not.toBeInTheDocument()

    await userEvent.keyboard("{Control>}r{/Control}")

    await waitFor(() => expect(screen.getByText("Generated report")).toBeInTheDocument())
  })
})
