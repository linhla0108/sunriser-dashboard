import { act, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { TooltipProvider } from "@/components/ui/tooltip"
import { V2Sidebar } from "../V2Sidebar"

vi.mock("next/navigation", () => ({
  usePathname: () => "/v2/dashboard",
}))

function TestProviders({ children }: { children: React.ReactNode }) {
  return <TooltipProvider delay={0}>{children}</TooltipProvider>
}

describe("V2Sidebar", () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useRealTimers()
  })

  it("toggle button collapses sidebar and persists", async () => {
    render(<V2Sidebar />, { wrapper: TestProviders })

    await userEvent.click(screen.getByRole("button", { name: /collapse sidebar/i }))

    expect(JSON.parse(localStorage.getItem("v2.sidebar.collapsed")!)).toBe(true)
    expect(screen.getByRole("button", { name: /expand sidebar/i })).toBeInTheDocument()
  })

  it("hover expands a collapsed sidebar after the peek delay", async () => {
    vi.useFakeTimers()
    localStorage.setItem("v2.sidebar.collapsed", JSON.stringify(true))

    render(<V2Sidebar />, { wrapper: TestProviders })

    expect(screen.queryByText("Workspace V2")).not.toBeInTheDocument()

    fireEvent.mouseEnter(screen.getByTestId("v2-sidebar"))
    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(screen.getByText("Workspace V2")).toBeInTheDocument()
  })
})
