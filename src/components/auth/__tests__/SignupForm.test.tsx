import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SignupForm } from "../SignupForm"

function TestProviders({ children }: { children: React.ReactNode }) {
  return <TooltipProvider delay={0}>{children}</TooltipProvider>
}

describe("SignupForm", () => {
  it("shows that account creation is disabled", async () => {
    render(<SignupForm />, { wrapper: TestProviders })

    expect(screen.getByRole("status")).toHaveTextContent("Account creation is disabled")
    expect(screen.queryByLabelText("Email")).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole("link", { name: /back to sign in/i }))
  })
})
