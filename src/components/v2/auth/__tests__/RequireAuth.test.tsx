import { render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AuthProvider } from "@/lib/v2/auth/AuthProvider"
import { RequireAuth } from "../RequireAuth"

const push = vi.fn()

vi.mock("next/navigation", () => ({
  usePathname: () => "/v2/dashboard",
  useRouter: () => ({ push }),
}))

function TestProviders({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}

describe("RequireAuth", () => {
  beforeEach(() => {
    push.mockClear()
    localStorage.clear()
  })

  it("redirects to login when no session exists", async () => {
    render(
      <RequireAuth>
        <div>app</div>
      </RequireAuth>,
      { wrapper: TestProviders }
    )

    await waitFor(() => expect(push).toHaveBeenCalledWith("/v2/login?from=%2Fv2%2Fdashboard"))
    expect(screen.queryByText("app")).not.toBeInTheDocument()
  })

  it("renders children when a valid session exists", async () => {
    localStorage.setItem(
      "v2.auth.session",
      JSON.stringify({
        userId: "u_admin",
        role: "admin",
        expiresAt: new Date(Date.now() + 1000).toISOString(),
      })
    )

    render(
      <RequireAuth>
        <div>app</div>
      </RequireAuth>,
      { wrapper: TestProviders }
    )

    expect(await screen.findByText("app")).toBeInTheDocument()
  })
})
