import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { FileText } from "lucide-react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { CandidatePreviewDialog, DelayedTextPreview } from "@/components/candidates/CandidatePreviewDialog"
import { TooltipProvider } from "@/components/ui/tooltip"

vi.mock("react-pdf", () => ({
  pdfjs: { GlobalWorkerOptions: {} },
  Document: ({ children, file, onLoadSuccess }: { children: React.ReactNode; file: string; onLoadSuccess?: (payload: { numPages: number }) => void }) => {
    queueMicrotask(() => onLoadSuccess?.({ numPages: 2 }))
    return <div data-testid="pdf-document" data-file={file}>{children}</div>
  },
  Page: ({ pageNumber }: { pageNumber: number }) => <div>PDF page {pageNumber}</div>,
}))

vi.mock("docx-preview", () => ({
  renderAsync: vi.fn(async () => {}),
}))

function Providers({ children }: { children: React.ReactNode }) {
  return <TooltipProvider delay={0}>{children}</TooltipProvider>
}

describe("CandidatePreviewDialog", () => {
  const openSpy = vi.fn()

  beforeEach(() => {
    vi.stubGlobal("open", openSpy)
    vi.stubGlobal("ResizeObserver", class {
      observe() {}
      disconnect() {}
    })
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      writable: true,
      value: vi.fn(() => "blob:preview-image"),
    })
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      writable: true,
      value: vi.fn(),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    openSpy.mockReset()
  })

  it("renders image academic files through the binary preview pipeline", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(null, {
          headers: {
            "content-length": "3",
            "content-type": "image/jpeg",
          },
        })
      )
      .mockResolvedValueOnce(new Response(new Blob(["img"], { type: "image/jpeg" })))

    vi.stubGlobal("fetch", fetchSpy)

    render(
      <CandidatePreviewDialog
        title="Academic file"
        triggerLabel="Preview academic file"
        icon={FileText}
        targets={[
          {
            label: "Academic file",
            url: "https://api.typeform.com/responses/files/example/transcript.jpg",
          },
        ]}
      />,
      { wrapper: Providers }
    )

    await userEvent.click(screen.getByRole("button", { name: /preview academic file/i }))

    const image = await screen.findByRole("img", { name: /academic file/i })
    expect(image.getAttribute("src")).toBe("blob:preview-image")
    await waitFor(() => expect(screen.queryByText("Loading file preview...")).not.toBeInTheDocument())
  })

  it("supports zoom controls for image previews", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(null, {
          headers: {
            "content-length": "3",
            "content-type": "image/jpeg",
          },
        })
      )
      .mockResolvedValueOnce(new Response(new Blob(["img"], { type: "image/jpeg" })))

    vi.stubGlobal("fetch", fetchSpy)

    render(
      <CandidatePreviewDialog
        title="Academic file"
        triggerLabel="Preview academic file"
        icon={FileText}
        targets={[
          {
            label: "Academic file",
            url: "https://api.typeform.com/responses/files/example/transcript.jpg",
          },
        ]}
      />,
      { wrapper: Providers }
    )

    await userEvent.click(screen.getByRole("button", { name: /preview academic file/i }))

    expect(await screen.findByRole("button", { name: /reset preview zoom to 100 percent/i })).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: /zoom in preview/i }))
    expect(screen.getByRole("button", { name: /currently 125 percent/i })).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: /zoom out preview/i }))
    expect(screen.getByRole("button", { name: /currently 100 percent/i })).toBeInTheDocument()
  })

  it("uses the larger modal sizing classes", async () => {
    render(
      <CandidatePreviewDialog
        title="Academic file"
        triggerLabel="Preview academic file"
        icon={FileText}
        targets={[
          {
            label: "Academic file",
            url: "https://api.typeform.com/responses/files/example/transcript.pdf",
          },
        ]}
      />,
      { wrapper: Providers }
    )

    await userEvent.click(screen.getByRole("button", { name: /preview academic file/i }))

    const dialogContent = document.querySelector('[data-slot="dialog-content"]')
    expect(dialogContent).toHaveClass("h-[90dvh]", "sm:w-[90vw]", "sm:max-w-[90vw]")
  })

  it("renders PDF academic files with the custom PDF viewer", async () => {
    const fetchSpy = vi.fn().mockResolvedValueOnce(
      new Response(null, {
        headers: {
          "content-length": "42",
          "content-type": "application/pdf",
        },
      })
    )
    vi.stubGlobal("fetch", fetchSpy)

    render(
      <CandidatePreviewDialog
        title="Academic file"
        triggerLabel="Preview academic file"
        icon={FileText}
        targets={[
          {
            label: "Academic file",
            url: "https://api.typeform.com/responses/files/example/transcript.pdf",
          },
        ]}
      />,
      { wrapper: Providers }
    )

    await userEvent.click(screen.getByRole("button", { name: /preview academic file/i }))

    expect(await screen.findByTestId("pdf-document")).toHaveAttribute("data-file", expect.stringContaining("/api/candidates/preview-file?url="))
    expect(await screen.findByText("PDF page 1")).toBeInTheDocument()
    expect(screen.getByText("2 pages")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: /zoom in preview/i }))
    expect(screen.getByRole("button", { name: /currently 125 percent/i })).toBeInTheDocument()
  })

  it("renders DOCX academic files through the docx preview renderer", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(null, {
          headers: {
            "content-length": "42",
            "content-type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          },
        })
      )
      .mockResolvedValueOnce(new Response(new Blob(["docx"], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" })))
    vi.stubGlobal("fetch", fetchSpy)

    render(
      <CandidatePreviewDialog
        title="Academic file"
        triggerLabel="Preview academic file"
        icon={FileText}
        targets={[
          {
            label: "Academic file",
            url: "https://api.typeform.com/responses/files/example/transcript.docx",
          },
        ]}
      />,
      { wrapper: Providers }
    )

    await userEvent.click(screen.getByRole("button", { name: /preview academic file/i }))

    await waitFor(() => {
      const previewHost = document.querySelector('.docx-preview-host[aria-label="Academic file"]')
      expect(previewHost).toBeInTheDocument()
    })
    expect(screen.getByRole("button", { name: /currently 100 percent/i })).toBeInTheDocument()
  })

  it("shows an open/download fallback for unsupported archive academic file types", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(
        new Response(null, {
          headers: {
            "content-type": "application/zip",
          },
        })
      )
    )

    render(
      <CandidatePreviewDialog
        title="Academic file"
        triggerLabel="Preview academic file"
        icon={FileText}
        targets={[
          {
            label: "Academic file",
            url: "https://api.typeform.com/responses/files/example/transcript.zip",
          },
        ]}
      />,
      { wrapper: Providers }
    )

    await userEvent.click(screen.getByRole("button", { name: /preview academic file/i }))

    expect(await screen.findByText("This academic file cannot be previewed inline")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: /open or download file/i }))
    expect(openSpy).toHaveBeenCalledWith(
      "https://api.typeform.com/responses/files/example/transcript.zip",
      "_blank",
      "noopener,noreferrer"
    )
  })
})

describe("DelayedTextPreview", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal("ResizeObserver", class {
      observe() {}
      disconnect() {}
    })
    // jsdom reports 0 for layout; simulate text overflow so the popover branch renders.
    Object.defineProperty(HTMLElement.prototype, "scrollWidth", {
      configurable: true,
      get() {
        return 600
      },
    })
    Object.defineProperty(HTMLElement.prototype, "clientWidth", {
      configurable: true,
      get() {
        return 240
      },
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    Reflect.deleteProperty(HTMLElement.prototype, "scrollWidth")
    Reflect.deleteProperty(HTMLElement.prototype, "clientWidth")
  })

  it("renders plain text without a popover for placeholder values", () => {
    render(<DelayedTextPreview text="N/A" />, { wrapper: Providers })

    expect(screen.getByText("N/A")).toBeInTheDocument()
    expect(document.querySelector('[data-slot="popover-content"]')).not.toBeInTheDocument()
  })

  it("opens after delay and stays open while the popup is hovered", () => {
    const text =
      "A much longer preview body that should stay available while the pointer moves into the popup so text can be selected."

    render(<DelayedTextPreview text={text} />, {
      wrapper: Providers,
    })

    const trigger = screen.getByText(/A much longer preview body/)

    fireEvent.mouseEnter(trigger)
    act(() => {
      vi.advanceTimersByTime(500)
    })

    const popoverContent = document.querySelector('[data-slot="popover-content"]')
    expect(popoverContent).toBeInTheDocument()
    expect(popoverContent).toHaveTextContent(text)
    expect(popoverContent).toHaveClass("select-text")

    fireEvent.mouseLeave(trigger)
    fireEvent.mouseEnter(popoverContent as Element)
    act(() => {
      vi.advanceTimersByTime(180)
    })

    expect(document.querySelector('[data-slot="popover-content"]')).toBeInTheDocument()

    fireEvent.mouseLeave(popoverContent as Element)
    act(() => {
      vi.advanceTimersByTime(220)
    })

    expect(document.querySelector('[data-slot="popover-content"]')).not.toBeInTheDocument()
  })
})
