import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SignupForm } from "../SignupForm"

function TestProviders({ children }: { children: React.ReactNode }) {
  return <TooltipProvider delay={0}>{children}</TooltipProvider>
}

describe("SignupForm", () => {
  it("submits valid signup details", async () => {
    const onSuccess = vi.fn()

    render(<SignupForm onSuccess={onSuccess} />, { wrapper: TestProviders })

    await userEvent.type(screen.getByLabelText("Name"), "Linh User")
    await userEvent.type(screen.getByLabelText("Email"), "linh@sunriser.com")
    await userEvent.type(screen.getByLabelText("Password"), "secret1")
    await userEvent.type(screen.getByLabelText("Confirm password"), "secret1")
    await userEvent.click(screen.getByRole("button", { name: /create account/i }))

    expect(onSuccess).toHaveBeenCalledTimes(1)
  })

  it("shows validation when passwords do not match", async () => {
    render(<SignupForm />, { wrapper: TestProviders })

    await userEvent.type(screen.getByLabelText("Name"), "Linh User")
    await userEvent.type(screen.getByLabelText("Email"), "linh@sunriser.com")
    await userEvent.type(screen.getByLabelText("Password"), "secret1")
    await userEvent.type(screen.getByLabelText("Confirm password"), "secret2")
    await userEvent.click(screen.getByRole("button", { name: /create account/i }))

    expect(await screen.findByRole("alert")).toHaveTextContent("Passwords do not match")
  })
})
