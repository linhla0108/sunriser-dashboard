/**
 * Tests for AuthProvider behaviour when Supabase auth/profile resolution is
 * slow, silent, or unavailable.
 */
import { act, cleanup, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { AuthProvider } from "../AuthProvider"
import { useAuth } from "../useAuth"

const mockUser = {
  id: "u_network",
  email: "network@sunriser.com",
  app_metadata: { role: "member" },
  user_metadata: { full_name: "Network User" },
}

const authMock = vi.hoisted(() => ({
  mode: "initial-null" as "initial-null" | "initial-user" | "silent",
  profileError: false,
  getUser: vi.fn(),
  signOut: vi.fn(),
}))

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => {
            if (authMock.profileError) {
              return { data: null, error: new Error("Profile unavailable") }
            }
            return { data: null, error: null }
          },
        }),
      }),
    }),
    auth: {
      getUser: authMock.getUser,
      onAuthStateChange: vi.fn().mockImplementation(listener => {
        if (authMock.mode === "initial-null") {
          queueMicrotask(() => listener("INITIAL_SESSION", null))
        }
        if (authMock.mode === "initial-user") {
          queueMicrotask(() => listener("INITIAL_SESSION", { user: mockUser }))
        }
        return {
          data: { subscription: { unsubscribe: vi.fn() } },
        }
      }),
      signOut: authMock.signOut,
    },
  }),
}))

function LoadingProbe() {
  const { loading, user, can } = useAuth()
  return (
    <>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user">{user ? user.email : "null"}</span>
      <span data-testid="profile-error">{String(user?.profileError ?? false)}</span>
      <span data-testid="can-read">{String(can("read"))}</span>
    </>
  )
}

describe("AuthProvider network/error resilience", () => {
  beforeEach(() => {
    authMock.mode = "initial-null"
    authMock.profileError = false
    authMock.getUser.mockReset()
    authMock.getUser.mockRejectedValue(new Error("Network unavailable"))
    authMock.signOut.mockReset()
    authMock.signOut.mockResolvedValue({ error: null })
  })

  afterEach(() => {
    vi.useRealTimers()
    cleanup()
  })

  it("settles signed-out when INITIAL_SESSION has no session", async () => {
    render(
      <AuthProvider>
        <LoadingProbe />
      </AuthProvider>
    )

    expect(screen.getByTestId("loading").textContent).toBe("true")

    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"))

    expect(screen.getByTestId("user").textContent).toBe("null")
    expect(authMock.getUser).not.toHaveBeenCalled()
  })

  it("falls back to signed-out if the auth listener never emits", async () => {
    authMock.mode = "silent"
    vi.useFakeTimers()

    render(
      <AuthProvider>
        <LoadingProbe />
      </AuthProvider>
    )

    expect(screen.getByTestId("loading").textContent).toBe("true")

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5001)
    })

    expect(screen.getByTestId("loading").textContent).toBe("false")
    expect(screen.getByTestId("user").textContent).toBe("null")
    expect(authMock.getUser).not.toHaveBeenCalled()
  })

  it("shows a locked profile-error user when profile queries fail", async () => {
    authMock.mode = "initial-user"
    authMock.profileError = true
    window.sessionStorage.setItem("sunriser.auth.sessionOnly", "true")

    render(
      <AuthProvider>
        <LoadingProbe />
      </AuthProvider>
    )

    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"))

    expect(screen.getByTestId("user").textContent).toBe("network@sunriser.com")
    expect(screen.getByTestId("profile-error").textContent).toBe("true")
    expect(screen.getByTestId("can-read").textContent).toBe("false")
  })
})
