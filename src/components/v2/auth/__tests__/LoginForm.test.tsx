import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AuthProvider } from "@/lib/v2/auth/AuthProvider"
import { ThemeProvider } from "@/lib/v2/theme/ThemeProvider"
import { LoginForm } from "../LoginForm"

function TestProviders({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delay={0}>
      <ThemeProvider>
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  )
}

describe("LoginForm", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("quick login chip fills and submits as admin", async () => {
    const onSuccess = vi.fn()

    render(<LoginForm onSuccess={onSuccess} />, { wrapper: TestProviders })

    await userEvent.click(screen.getByText("Admin"))
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }))

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1))
    expect(localStorage.getItem("v2.auth.session")).toContain("u_admin")
  })

  it("shows an error for invalid credentials", async () => {
    const onSuccess = vi.fn()

    render(<LoginForm onSuccess={onSuccess} />, { wrapper: TestProviders })

    await userEvent.type(screen.getByLabelText("Email"), "wrong@sunriser.com")
    await userEvent.type(screen.getByLabelText("Password"), "nope")
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }))

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid credentials")
    expect(onSuccess).not.toHaveBeenCalled()
  })
})
