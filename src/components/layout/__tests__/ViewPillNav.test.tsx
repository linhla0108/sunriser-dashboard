import { fireEvent, render, screen, waitFor } from "@testing-library/react"
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
    vi.stubGlobal(
      "ResizeObserver",
      class ResizeObserver {
        observe = vi.fn()
        unobserve = vi.fn()
        disconnect = vi.fn()
      }
    )
  })

  it("switches views with icon buttons and persists the active view", async () => {
    render(<ViewPillNav />, { wrapper: TestProviders })

    await userEvent.click(await screen.findByRole("button", { name: /pipeline view/i }))

    expect(screen.getByRole("button", { name: /pipeline view/i })).toHaveAttribute("aria-pressed", "true")
    expect(JSON.parse(localStorage.getItem("v2.view.current")!)).toBe("pipeline")
  })

  it("does not switch views with global number keys", async () => {
    render(<ViewPillNav />, { wrapper: TestProviders })

    await userEvent.keyboard("3")

    expect(screen.getByRole("button", { name: /table view/i })).toHaveAttribute("aria-pressed", "true")
  })

  it("switches views with number keys when the view nav has focus", async () => {
    render(<ViewPillNav />, { wrapper: TestProviders })

    screen.getByRole("button", { name: /table view/i }).focus()
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

    expect((await screen.findByTestId("v2-view-pill-nav")).parentElement?.parentElement).toBe(document.body)
  })

  it("does not navigate table pages with global arrow keys", async () => {
    const goPrev = vi.fn()
    const goNext = vi.fn()

    render(<ViewPillNav view="table" onViewChange={vi.fn()} pagination={{ canGoPrev: true, canGoNext: true, goPrev, goNext }} />, {
      wrapper: TestProviders,
    })

    await userEvent.keyboard("{ArrowLeft}{ArrowRight}")

    expect(goPrev).not.toHaveBeenCalled()
    expect(goNext).not.toHaveBeenCalled()
  })

  it("navigates table pages with arrow keys when the pager has focus", async () => {
    const goPrev = vi.fn()
    const goNext = vi.fn()

    render(<ViewPillNav view="table" onViewChange={vi.fn()} pagination={{ canGoPrev: true, canGoNext: true, goPrev, goNext }} />, {
      wrapper: TestProviders,
    })

    screen.getByRole("button", { name: /previous page/i }).focus()
    await userEvent.keyboard("{ArrowLeft}{ArrowRight}")

    expect(goPrev).toHaveBeenCalledTimes(1)
    expect(goNext).toHaveBeenCalledTimes(1)
  })

  it("renders previous and next buttons in a separate floating pager pill", async () => {
    render(
      <ViewPillNav
        view="table"
        onViewChange={vi.fn()}
        pagination={{
          canGoPrev: true,
          canGoNext: true,
          goPrev: vi.fn(),
          goNext: vi.fn(),
        }}
      />,
      { wrapper: TestProviders }
    )

    expect(await screen.findByTestId("v2-view-pill-nav")).toBeInTheDocument()
    const paginationPill = screen.getByTestId("v2-table-pagination-pill")
    const viewPill = screen.getByTestId("v2-view-pill-nav")
    expect(paginationPill).not.toHaveTextContent("Page")
    expect(paginationPill).not.toHaveTextContent("Rows per page")
    expect(viewPill).toHaveClass("top-0", "p-1.5")
    expect(paginationPill).toHaveClass("top-0", "p-1.5")
    expect(screen.getByRole("button", { name: /table view/i })).toHaveClass("size-10")
    expect(screen.getByRole("button", { name: /previous page/i })).toHaveClass("size-10")
    expect(screen.getByRole("button", { name: /previous page/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /next page/i })).toBeInTheDocument()
  })

  it("centers the bottom pill group on the applicant table when it can be measured", async () => {
    const table = document.createElement("div")
    table.dataset.cid = "applicant-table"
    table.getBoundingClientRect = () =>
      ({
        left: 240,
        right: 1280,
        width: 1040,
        top: 0,
        bottom: 0,
        height: 0,
        x: 240,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect
    document.body.appendChild(table)

    render(<ViewPillNav view="table" onViewChange={vi.fn()} pagination={{ canGoPrev: true, canGoNext: true, goPrev: vi.fn(), goNext: vi.fn() }} />, {
      wrapper: TestProviders,
    })

    await waitFor(() => expect(screen.getByTestId("v2-pill-nav-root")).toHaveStyle({ "--v2-pill-center-x": "760px" }))
    expect(screen.getByTestId("v2-view-pill-nav")).toHaveStyle({ left: "var(--v2-pill-center-x)" })

    table.remove()
  })

  it("shows transient primary icon feedback as soon as pagination buttons are pressed", async () => {
    const goNext = vi.fn()

    render(<ViewPillNav view="table" onViewChange={vi.fn()} pagination={{ canGoPrev: true, canGoNext: true, goPrev: vi.fn(), goNext }} />, {
      wrapper: TestProviders,
    })

    const nextButton = screen.getByRole("button", { name: /next page/i })
    fireEvent.pointerDown(nextButton)

    expect(goNext).not.toHaveBeenCalled()
    expect(nextButton).toHaveAttribute("data-pagination-clicked", "true")
    expect(nextButton).toHaveClass("text-primary")

    await userEvent.click(nextButton)

    expect(goNext).toHaveBeenCalledTimes(1)
    expect(nextButton).toHaveAttribute("data-pagination-clicked", "true")
    expect(nextButton).toHaveClass("text-primary")
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
        <ViewPillNav view="table" onViewChange={vi.fn()} pagination={{ canGoPrev: true, canGoNext: true, goPrev, goNext }} />
      </>,
      { wrapper: TestProviders }
    )

    await userEvent.click(screen.getByRole("textbox", { name: /search candidates/i }))
    await userEvent.keyboard("{ArrowLeft}{ArrowRight}")

    expect(goPrev).not.toHaveBeenCalled()
    expect(goNext).not.toHaveBeenCalled()
  })
})
