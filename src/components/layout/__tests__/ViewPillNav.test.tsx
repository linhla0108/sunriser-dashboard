import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
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

    await userEvent.click(await screen.findByRole("button", { name: /pipeline view/i }))

    expect(screen.getByRole("button", { name: /pipeline view/i })).toHaveAttribute("aria-pressed", "true")
    expect(JSON.parse(localStorage.getItem("v2.view.current")!)).toBe("pipeline")
  })

  it("switches views with keyboard shortcuts 1-3", async () => {
    render(<ViewPillNav />, { wrapper: TestProviders })

    await userEvent.keyboard("3")

    expect(screen.getByRole("button", { name: /chart view/i })).toHaveAttribute("aria-pressed", "true")
  })

  it("stays visible while scrolling", async () => {
    render(<ViewPillNav />, { wrapper: TestProviders })

    Object.defineProperty(window, "scrollY", { configurable: true, writable: true, value: 120 })
    fireEvent.scroll(window)

    expect(await screen.findByTestId("v2-view-pill-nav")).not.toHaveClass("opacity-0")
    expect(screen.getByTestId("v2-view-pill-nav")).not.toHaveClass("pointer-events-none")
  })

  it("portals the fixed nav to the document body", async () => {
    render(
      <div data-testid="animated-content">
        <ViewPillNav />
      </div>,
      { wrapper: TestProviders }
    )

    expect((await screen.findByTestId("v2-view-pill-nav")).parentElement).toBe(document.body)
  })

  it("navigates table pages with arrow shortcuts", async () => {
    const goPrev = vi.fn()
    const goNext = vi.fn()

    render(
      <ViewPillNav
        view="table"
        onViewChange={vi.fn()}
        pagination={{ canGoPrev: true, canGoNext: true, goPrev, goNext }}
      />,
      { wrapper: TestProviders }
    )

    await userEvent.keyboard("{ArrowLeft}{ArrowRight}")

    expect(goPrev).toHaveBeenCalledTimes(1)
    expect(goNext).toHaveBeenCalledTimes(1)
  })

  it("does not navigate pages when shortcuts are disabled or outside table view", async () => {
    const disabledPrev = vi.fn()
    const disabledNext = vi.fn()

    const { rerender } = render(
      <ViewPillNav
        view="table"
        onViewChange={vi.fn()}
        pagination={{ canGoPrev: false, canGoNext: false, goPrev: disabledPrev, goNext: disabledNext }}
      />,
      { wrapper: TestProviders }
    )

    await userEvent.keyboard("{ArrowLeft}{ArrowRight}")

    expect(disabledPrev).not.toHaveBeenCalled()
    expect(disabledNext).not.toHaveBeenCalled()

    const pipelinePrev = vi.fn()
    const pipelineNext = vi.fn()

    rerender(
      <ViewPillNav
        view="pipeline"
        onViewChange={vi.fn()}
        pagination={{ canGoPrev: true, canGoNext: true, goPrev: pipelinePrev, goNext: pipelineNext }}
      />
    )

    await userEvent.keyboard("{ArrowLeft}{ArrowRight}")

    expect(pipelinePrev).not.toHaveBeenCalled()
    expect(pipelineNext).not.toHaveBeenCalled()
  })

  it("does not intercept page shortcuts while typing in an input", async () => {
    const goPrev = vi.fn()
    const goNext = vi.fn()

    render(
      <>
        <input aria-label="Search candidates" />
        <ViewPillNav
          view="table"
          onViewChange={vi.fn()}
          pagination={{ canGoPrev: true, canGoNext: true, goPrev, goNext }}
        />
      </>,
      { wrapper: TestProviders }
    )

    await userEvent.click(screen.getByRole("textbox", { name: /search candidates/i }))
    await userEvent.keyboard("{ArrowLeft}{ArrowRight}")

    expect(goPrev).not.toHaveBeenCalled()
    expect(goNext).not.toHaveBeenCalled()
  })
})
