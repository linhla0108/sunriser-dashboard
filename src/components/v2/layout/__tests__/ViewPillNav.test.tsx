import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it } from "vitest"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ViewPillNav } from "../ViewPillNav"

function TestProviders({ children }: { children: React.ReactNode }) {
  return <TooltipProvider delay={0}>{children}</TooltipProvider>
}

describe("ViewPillNav", () => {
  beforeEach(() => {
    localStorage.clear()
    Object.defineProperty(window, "scrollY", { configurable: true, writable: true, value: 0 })
  })

  it("switches views with icon buttons and persists the active view", async () => {
    render(<ViewPillNav />, { wrapper: TestProviders })

    await userEvent.click(screen.getByRole("button", { name: /pipeline view/i }))

    expect(screen.getByRole("button", { name: /pipeline view/i })).toHaveAttribute("aria-pressed", "true")
    expect(JSON.parse(localStorage.getItem("v2.view.current")!)).toBe("pipeline")
  })

  it("switches views with keyboard shortcuts 1-3", async () => {
    render(<ViewPillNav />, { wrapper: TestProviders })

    await userEvent.keyboard("3")

    expect(screen.getByRole("button", { name: /chart view/i })).toHaveAttribute("aria-pressed", "true")
  })

  it("hides while scrolling down and returns when scrolling up near the top", async () => {
    render(<ViewPillNav />, { wrapper: TestProviders })

    Object.defineProperty(window, "scrollY", { configurable: true, writable: true, value: 120 })
    fireEvent.scroll(window)

    await waitFor(() => expect(screen.getByTestId("v2-view-pill-nav")).toHaveClass("opacity-0"))

    Object.defineProperty(window, "scrollY", { configurable: true, writable: true, value: 20 })
    fireEvent.scroll(window)

    await waitFor(() => expect(screen.getByTestId("v2-view-pill-nav")).toHaveClass("opacity-100"))
  })
})
