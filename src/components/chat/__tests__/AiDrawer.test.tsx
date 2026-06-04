import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it } from "vitest"
import { TooltipProvider } from "@/components/ui/tooltip"
import { DrawerRegistryProvider } from "@/lib/drawer/DrawerRegistry"
import { AiDrawer } from "../AiDrawer"

function TestProviders({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delay={0}>
      <DrawerRegistryProvider>{children}</DrawerRegistryProvider>
    </TooltipProvider>
  )
}

describe("AiDrawer", () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem("v2.chat.open", JSON.stringify(true))
  })

  it("sends a message and shows a mock assistant reply", async () => {
    render(<AiDrawer />, { wrapper: TestProviders })

    await userEvent.type(screen.getByPlaceholderText(/ask about candidates/i), "top candidates")
    await userEvent.click(screen.getByRole("button", { name: /send message/i }))

    expect(await screen.findByText(/Top candidates are strongest/i)).toBeInTheDocument()
  })

  it("renders a top-center grab handle for the floating drawer", () => {
    render(<AiDrawer />, { wrapper: TestProviders })

    const grabHandle = screen.getByRole("button", { name: /drag ai assistant drawer/i })
    expect(grabHandle).toHaveClass("absolute", "left-1/2", "top-2", "size-7", "shadow-none", "focus-visible:ring-0")
    expect(grabHandle).not.toHaveClass("focus-visible:ring-3")

    const resizeHandles = screen.getAllByRole("separator", { name: /resize ai assistant/i })
    expect(resizeHandles).toHaveLength(8)
    for (const handle of resizeHandles) {
      expect(handle).toHaveClass("border-0", "shadow-none", "outline-none", "ring-0", "focus-visible:ring-0")
    }

    const body = screen.getByTestId("v2-chat-drawer-body")
    expect(body).toHaveClass("bg-card/40", "min-h-0", "rounded-b-3xl")
    expect(body).not.toHaveClass("min-h-[20rem]")
  })
})
