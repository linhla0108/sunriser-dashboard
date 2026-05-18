import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it } from "vitest"
import { TooltipProvider } from "@/components/ui/tooltip"
import { DrawerRegistryProvider } from "@/lib/v2/drawer/DrawerRegistry"
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
})
