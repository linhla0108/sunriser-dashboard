import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { TooltipProvider } from "@/components/ui/tooltip"
import { OtpForm } from "../OtpForm"

function TestProviders({ children }: { children: React.ReactNode }) {
  return <TooltipProvider delay={0}>{children}</TooltipProvider>
}

describe("OtpForm", () => {
  it("submits a complete 6-digit code", async () => {
    const onSuccess = vi.fn()

    render(<OtpForm onSuccess={onSuccess} />, { wrapper: TestProviders })

    await userEvent.type(screen.getByLabelText("Digit 1"), "123456")
    await userEvent.click(screen.getByRole("button", { name: /verify/i }))

    expect(onSuccess).toHaveBeenCalledTimes(1)
  })

  it("shows validation for an incomplete code", async () => {
    render(<OtpForm />, { wrapper: TestProviders })

    await userEvent.type(screen.getByLabelText("Digit 1"), "12")
    await userEvent.click(screen.getByRole("button", { name: /verify/i }))

    expect(await screen.findByRole("alert")).toHaveTextContent("Enter the 6-digit code")
  })
})
