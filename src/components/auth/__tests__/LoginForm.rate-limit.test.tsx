/**
 * Test that LoginForm shows a friendly message when Supabase returns 429.
 * Uses a scoped mock so setup.ts's global mock is fully replaced for this file.
 */
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi, beforeEach } from "vitest"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AuthProvider } from "@/lib/auth/AuthProvider"
import { ThemeProvider } from "@/lib/theme/ThemeProvider"
import { LoginForm } from "../LoginForm"

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: null, error: null }),
        }),
      }),
    }),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      onAuthStateChange: vi.fn().mockImplementation(() => {
        return { data: { subscription: { unsubscribe: vi.fn() } } }
      }),
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { user: null },
        error: { message: "Email rate limit exceeded", status: 429 },
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  }),
}))

function TestProviders({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delay={0}>
      <ThemeProvider>
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  )
}

describe("LoginForm — 429 rate limiting", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("shows a friendly rate-limit message instead of the raw SDK string", async () => {
    const onSuccess = vi.fn()

    render(<LoginForm onSuccess={onSuccess} />, { wrapper: TestProviders })

    await userEvent.type(screen.getByLabelText("Email"), "user@sunriser.com")
    await userEvent.type(screen.getByLabelText("Password"), "password")
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }))

    const alert = await screen.findByRole("alert")
    // Should NOT show raw SDK message
    expect(alert.textContent).not.toContain("Email rate limit exceeded")
    // Should show user-friendly message
    expect(alert.textContent).toMatch(/too many attempts/i)
    expect(onSuccess).not.toHaveBeenCalled()
  })
})
