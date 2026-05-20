import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ForgotForm } from "../ForgotForm"

function TestProviders({ children }: { children: React.ReactNode }) {
  return <TooltipProvider delay={0}>{children}</TooltipProvider>
}

describe("ForgotForm", () => {
  it("shows a sent message for a valid email", async () => {
    render(<ForgotForm />, { wrapper: TestProviders })

    await userEvent.type(screen.getByLabelText("Email"), "admin@sunriser.com")
    await userEvent.click(screen.getByRole("button", { name: /send reset link/i }))

    expect(await screen.findByRole("status")).toHaveTextContent("Reset instructions sent to admin@sunriser.com")
  })
})
