import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AuthProvider } from "@/lib/auth/AuthProvider"
import { ThemeProvider } from "@/lib/theme/ThemeProvider"
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
    sessionStorage.clear()
  })

  it("signs in as admin", async () => {
    const onSuccess = vi.fn()

    render(<LoginForm onSuccess={onSuccess} />, { wrapper: TestProviders })

    await userEvent.type(screen.getByLabelText("Email"), "admin@sunriser.com")
    await userEvent.type(screen.getByLabelText("Password"), "admin123")
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }))

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1))
    expect(Number(localStorage.getItem("v2.auth.rememberUntil"))).toBeGreaterThan(Date.now())
  })

  it("can sign in without remembering this browser", async () => {
    const onSuccess = vi.fn()

    render(<LoginForm onSuccess={onSuccess} />, { wrapper: TestProviders })

    await userEvent.click(screen.getByRole("checkbox", { name: /remember me/i }))
    await userEvent.type(screen.getByLabelText("Email"), "member@sunriser.com")
    await userEvent.type(screen.getByLabelText("Password"), "member123")
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }))

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1))
    expect(localStorage.getItem("v2.auth.rememberUntil")).toBeNull()
    expect(sessionStorage.getItem("v2.auth.sessionOnly")).toBe("true")
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
