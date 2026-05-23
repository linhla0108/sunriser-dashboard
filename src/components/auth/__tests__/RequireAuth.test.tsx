import { render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AuthProvider } from "@/lib/auth/AuthProvider"
import { RequireAuth } from "../RequireAuth"

const push = vi.fn()

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({ push }),
}))

function TestProviders({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}

describe("RequireAuth", () => {
  beforeEach(() => {
    push.mockClear()
    localStorage.clear()
    sessionStorage.clear()
  })

  it("redirects to login when no session exists", async () => {
    render(
      <RequireAuth>
        <div>app</div>
      </RequireAuth>,
      { wrapper: TestProviders }
    )

    await waitFor(() => expect(push).toHaveBeenCalledWith("/login?from=%2Fdashboard"))
    expect(screen.getByRole("status")).toHaveTextContent("Checking access")
    expect(screen.queryByText("app")).not.toBeInTheDocument()
  })

  it("renders children when a valid session exists", async () => {
    localStorage.setItem(
      "sunriser.auth.session",
      JSON.stringify({
        userId: "u_admin",
        role: "admin",
        expiresAt: new Date(Date.now() + 1000).toISOString(),
      })
    )
    localStorage.setItem("sunriser.auth.rememberUntil", String(Date.now() + 1000))

    render(
      <RequireAuth>
        <div>app</div>
      </RequireAuth>,
      { wrapper: TestProviders }
    )

    expect(await screen.findByText("app")).toBeInTheDocument()
  })

  it("shows a loading screen while auth is resolving", () => {
    render(
      <RequireAuth>
        <div>app</div>
      </RequireAuth>,
      { wrapper: TestProviders }
    )

    expect(screen.getByRole("status")).toHaveTextContent("Preparing workspace")
    expect(screen.queryByText("app")).not.toBeInTheDocument()
  })
})
