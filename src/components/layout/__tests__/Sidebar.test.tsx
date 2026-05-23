import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Sidebar } from "../Sidebar"

const signOutMock = vi.hoisted(() => vi.fn())

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}))

vi.mock("@/lib/auth/useAuth", () => ({
  useAuth: () => ({
    loading: false,
    role: "admin",
    signIn: vi.fn(),
    signOut: signOutMock,
    user: {
      id: "u_admin",
      email: "admin@sunriser.com",
      name: "Linh Admin",
      role: "admin",
    },
  }),
}))

// SidebarProvider uses useIsMobile which calls window.matchMedia
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

function TestProviders({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delay={0}>
      <SidebarProvider defaultOpen>{children}</SidebarProvider>
    </TooltipProvider>
  )
}

describe("Sidebar", () => {
  beforeEach(() => {
    signOutMock.mockClear()
  })

  it("renders all nav links", () => {
    render(<Sidebar />, { wrapper: TestProviders })

    expect(screen.getByText("Dashboard").closest("a")).toHaveAttribute("href", "/dashboard")
    expect(screen.getByText("Candidates").closest("a")).toHaveAttribute("href", "/candidates")
    expect(screen.getByTitle("Settings")).toHaveAttribute("href", "/settings")
  })

  it("marks the active link with data-active", () => {
    render(<Sidebar />, { wrapper: TestProviders })

    const dashboardLink = screen.getByText("Dashboard").closest("a")
    expect(dashboardLink).toHaveAttribute("data-active")
  })

  it("renders the sidebar trigger button", () => {
    render(<Sidebar />, { wrapper: TestProviders })

    expect(screen.getByText(/toggle sidebar/i)).toBeInTheDocument()
  })

  it("opens the account menu from the existing profile icon", async () => {
    render(<Sidebar />, { wrapper: TestProviders })

    fireEvent.click(screen.getByLabelText(/open account menu/i))

    expect(await screen.findByText("Linh Admin")).toBeInTheDocument()
    expect(screen.getByText("admin@sunriser.com")).toBeInTheDocument()
    expect(screen.getByText("admin")).toBeInTheDocument()

    fireEvent.click(screen.getByText("Sign out"))

    expect(signOutMock).toHaveBeenCalledTimes(1)
  })
})
