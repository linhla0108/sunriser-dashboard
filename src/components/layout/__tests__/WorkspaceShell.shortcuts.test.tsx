import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AuthProvider } from "@/lib/auth/AuthProvider"
import { ThemeProvider } from "@/lib/theme/ThemeProvider"
import { WorkspaceShell } from "../WorkspaceShell"

const navigation = vi.hoisted(() => ({
  pathname: "/dashboard",
  push: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({ push: navigation.push }),
}))

vi.mock("@/components/auth/RequireAuth", () => ({
  RequireAuth: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock("@/components/pin/PinnedToolbar", () => ({
  PinnedToolbar: () => <div data-testid="pinned-toolbar">Pinned Toolbar</div>,
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

describe("WorkspaceShell keyboard shortcuts", () => {
  beforeEach(() => {
    localStorage.clear()
    navigation.pathname = "/dashboard"
    navigation.push.mockClear()
    setupSession()
  })

  it("Ctrl+R opens the report modal", async () => {
    render(
      <WorkspaceShell>
        <div>page</div>
      </WorkspaceShell>,
      { wrapper: Providers }
    )

    await screen.findByText("page")
    expect(screen.queryByText("Generated report")).not.toBeInTheDocument()

    await userEvent.keyboard("{Control>}r{/Control}")

    await waitFor(() => expect(screen.getByText("Generated report")).toBeInTheDocument())
  })

  it("shows the pinned toolbar only on the candidates route", async () => {
    const { rerender } = render(
      <WorkspaceShell>
        <div>page</div>
      </WorkspaceShell>,
      { wrapper: Providers }
    )

    await screen.findByText("page")
    expect(screen.queryByTestId("pinned-toolbar")).not.toBeInTheDocument()

    navigation.pathname = "/candidates"
    rerender(
      <WorkspaceShell>
        <div>page</div>
      </WorkspaceShell>
    )

    expect(screen.getByTestId("pinned-toolbar")).toBeInTheDocument()
  })
})
