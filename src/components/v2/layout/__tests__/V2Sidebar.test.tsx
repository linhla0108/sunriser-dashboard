import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SidebarProvider } from "@/components/ui/sidebar"
import { V2Sidebar } from "../V2Sidebar"

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
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

describe("V2Sidebar", () => {
  it("renders all nav links", () => {
    render(<V2Sidebar />, { wrapper: TestProviders })

    expect(screen.getByRole("link", { name: /dashboard/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /candidates/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /settings/i })).toBeInTheDocument()
  })

  it("marks the active link with data-active", () => {
    render(<V2Sidebar />, { wrapper: TestProviders })

    const dashboardLink = screen.getByRole("link", { name: /dashboard/i })
    expect(dashboardLink).toHaveAttribute("data-active")
  })

  it("renders the sidebar trigger button", () => {
    render(<V2Sidebar />, { wrapper: TestProviders })

    expect(screen.getByRole("button", { name: /toggle sidebar/i })).toBeInTheDocument()
  })
})
