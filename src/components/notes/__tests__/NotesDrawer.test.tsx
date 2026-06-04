import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it } from "vitest"
import { TooltipProvider } from "@/components/ui/tooltip"
import { DrawerRegistryProvider } from "@/lib/drawer/DrawerRegistry"
import { NotesDrawer } from "../NotesDrawer"

function TestProviders({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delay={0}>
      <DrawerRegistryProvider>{children}</DrawerRegistryProvider>
    </TooltipProvider>
  )
}

describe("NotesDrawer", () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem("v2.notes.open", JSON.stringify(true))
  })

  it("creates and edits a note", async () => {
    render(<NotesDrawer />, { wrapper: TestProviders })

    await userEvent.click(screen.getByRole("button", { name: /new note/i }))
    const title = screen.getByDisplayValue("Untitled note")
    await userEvent.clear(title)
    await userEvent.type(title, "Interview notes")

    expect(screen.getByDisplayValue("Interview notes")).toBeInTheDocument()
  })

  it("renders docked drawers as inset rounded panels", () => {
    localStorage.setItem("v2.notes.mode", JSON.stringify("dock"))

    render(<NotesDrawer />, { wrapper: TestProviders })

    const drawer = screen.getByTestId("v2-notes-drawer")
    expect(drawer).toHaveClass("rounded-3xl")
    expect(drawer).toHaveStyle({
      right: "12px",
      top: "calc(0% + 12px)",
      height: "calc(100% - 24px)",
    })
    expect(screen.getByRole("button", { name: /drag notes drawer/i })).toHaveClass("absolute", "left-1/2", "top-2", "size-7", "shadow-none")
    const body = screen.getByTestId("v2-notes-drawer-body")
    expect(body).toHaveClass("bg-card/40", "min-h-0", "rounded-b-3xl")
    expect(body).not.toHaveClass("min-h-[20rem]")
  })

  it("renders clean multi-direction resize handles for docked notes", () => {
    localStorage.setItem("v2.notes.mode", JSON.stringify("dock"))

    render(<NotesDrawer />, { wrapper: TestProviders })

    const resizeHandles = screen.getAllByRole("separator", { name: /resize notes/i })
    expect(resizeHandles).toHaveLength(8)
    expect(screen.getByRole("separator", { name: /resize notes top-left/i })).toHaveClass("cursor-nwse-resize")
    expect(screen.getByRole("separator", { name: /resize notes left/i })).toHaveClass("cursor-ew-resize")
    expect(screen.getByRole("separator", { name: "Resize Notes bottom" })).toHaveClass("cursor-ns-resize")
    for (const handle of resizeHandles) {
      expect(handle).toHaveClass("border-0", "shadow-none", "outline-none", "ring-0", "focus-visible:outline-none", "focus-visible:ring-0")
    }
  })
})
