import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { TooltipProvider } from "@/components/ui/tooltip"
import { OtpForm } from "../OtpForm"

function TestProviders({ children }: { children: React.ReactNode }) {
  return <TooltipProvider delay={0}>{children}</TooltipProvider>
}

describe("OtpForm", () => {
  it("shows confirmation guidance and returns to sign in", async () => {
    const onSuccess = vi.fn()

    render(<OtpForm onSuccess={onSuccess} />, { wrapper: TestProviders })

    expect(screen.getByRole("status")).toHaveTextContent("Supabase will send a confirmation link")
    await userEvent.click(screen.getByRole("button", { name: /back to sign in/i }))

    expect(onSuccess).toHaveBeenCalledTimes(1)
  })
})
