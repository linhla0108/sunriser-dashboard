import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { TooltipProvider } from "@/components/ui/tooltip"
import { PortfolioLinkPopover } from "@/components/candidates/PortfolioLinkPopover"

function Providers({ children }: { children: React.ReactNode }) {
  return <TooltipProvider delay={0}>{children}</TooltipProvider>
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

describe("PortfolioLinkPopover", () => {
  const openSpy = vi.fn()

  beforeEach(() => {
    vi.useRealTimers()
    vi.stubGlobal("open", openSpy)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    openSpy.mockReset()
  })

  it("fetches metadata only after hover intent", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        finalUrl: "https://example.com/portfolio",
        host: "example.com",
        title: "Candidate Portfolio",
        description: "Short site summary.",
        image: null,
      }),
    })
    vi.stubGlobal("fetch", fetchSpy)

    render(<PortfolioLinkPopover url="https://example.com/portfolio" label="Open portfolio" />, { wrapper: Providers })

    const button = screen.getByRole("button", { name: /open portfolio/i })
    fireEvent.mouseEnter(button)
    expect(fetchSpy).not.toHaveBeenCalled()

    await act(async () => {
      await sleep(300)
    })

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    expect(await screen.findByText("Candidate Portfolio")).toBeInTheDocument()
  })

  it("reuses cached metadata on repeated hover for the same url", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        finalUrl: "https://cached.example/portfolio",
        host: "cached.example",
        title: "Cached Portfolio",
        description: "One fetch only.",
        image: null,
      }),
    })
    vi.stubGlobal("fetch", fetchSpy)

    render(<PortfolioLinkPopover url="https://cached.example/portfolio" label="Open cached portfolio" />, { wrapper: Providers })

    const button = screen.getByRole("button", { name: /open cached portfolio/i })

    fireEvent.mouseEnter(button)
    await act(async () => {
      await sleep(300)
    })
    expect(await screen.findByText("Cached Portfolio")).toBeInTheDocument()

    fireEvent.mouseLeave(button)
    await act(async () => {
      await sleep(220)
    })

    fireEvent.mouseEnter(button)
    await act(async () => {
      await sleep(300)
    })

    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })

  it("stays open while the pointer moves from trigger into the popup", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          finalUrl: "https://leave.example/portfolio",
          host: "leave.example",
          title: "Leave Portfolio",
          description: "Hover should not stick.",
          image: null,
        }),
      })
    )

    render(<PortfolioLinkPopover url="https://leave.example/portfolio" label="Open leave portfolio" />, { wrapper: Providers })

    const button = screen.getByRole("button", { name: /open leave portfolio/i })
    fireEvent.mouseEnter(button)
    await act(async () => {
      await sleep(300)
    })

    expect(await screen.findByText("Leave Portfolio")).toBeInTheDocument()
    const popover = document.querySelector('[data-cid="portfolio-link-popover"]')
    expect(popover).toHaveClass("select-text")

    fireEvent.mouseLeave(button)
    fireEvent.mouseEnter(popover as Element)

    await act(async () => {
      await sleep(220)
    })

    expect(screen.getByText("Leave Portfolio")).toBeInTheDocument()

    fireEvent.mouseLeave(popover as Element)

    await waitFor(() => {
      expect(screen.queryByText("Leave Portfolio")).not.toBeInTheDocument()
    })
  })

  it("still opens the original link on click", () => {
    vi.stubGlobal("fetch", vi.fn())

    render(<PortfolioLinkPopover url="https://example.com/portfolio" label="Open portfolio" />, { wrapper: Providers })

    fireEvent.click(screen.getByRole("button", { name: /open portfolio/i }))

    expect(openSpy).toHaveBeenCalledWith("https://example.com/portfolio", "_blank", "noopener,noreferrer")
  })

  it("shows fallback text when metadata fetch fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 502 }))

    render(<PortfolioLinkPopover url="https://broken.example/portfolio" label="Open broken portfolio" />, { wrapper: Providers })

    const button = screen.getByRole("button", { name: /open broken portfolio/i })
    fireEvent.mouseEnter(button)

    await act(async () => {
      await sleep(300)
    })

    await waitFor(() => {
      expect(screen.getByText("Metadata unavailable")).toBeInTheDocument()
    })
  })
})
