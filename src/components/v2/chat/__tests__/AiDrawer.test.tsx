import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it } from "vitest"
import { TooltipProvider } from "@/components/ui/tooltip"
import { DrawerRegistryProvider } from "@/lib/v2/drawer/DrawerRegistry"
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
})
