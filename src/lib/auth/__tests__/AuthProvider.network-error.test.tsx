/**
 * Tests for AuthProvider behaviour when the Supabase network is unreachable.
 *
 * These mocks override the global setup.ts mock entirely for this file so we
 * can simulate getUser() rejecting and onAuthStateChange never firing.
 */
import { render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { AuthProvider } from "../AuthProvider"
import { useAuth } from "../useAuth"

// ── helpers ────────────────────────────────────────────────────────────────

function LoadingProbe() {
  const { loading, user } = useAuth()
  return (
    <>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user">{user ? user.email : "null"}</span>
    </>
  )
}

// ── scenario 1: getUser() throws, onAuthStateChange never fires ──────────

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
      // Hard network failure
      getUser: vi.fn().mockRejectedValue(new Error("Network unavailable")),
      // Listener registered but callback intentionally never called
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  }),
}))

describe("AuthProvider — getUser() rejection, onAuthStateChange silent", () => {
  it("resolves loading to false without crashing", async () => {
    render(
      <AuthProvider>
        <LoadingProbe />
      </AuthProvider>
    )

    // Starts loading
    expect(screen.getByTestId("loading").textContent).toBe("true")

    // catch() releases the lock — loading must eventually settle
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"), {
      timeout: 2000,
    })

    // No user set since neither resolver found one
    expect(screen.getByTestId("user").textContent).toBe("null")
  })

  it("does not throw or leave the app in an error state", async () => {
    // If the component renders without throwing, the test passes.
    expect(() =>
      render(
        <AuthProvider>
          <LoadingProbe />
        </AuthProvider>
      )
    ).not.toThrow()

    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"))
  })
})
