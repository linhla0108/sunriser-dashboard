import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it } from "vitest"
import { AuthProvider } from "../AuthProvider"
import { useAuth } from "../useAuth"

function AuthProbe() {
  const { role, signIn, signOut, user } = useAuth()

  return (
    <>
      <span data-testid="role">{role}</span>
      <span data-testid="name">{user?.name ?? "No user"}</span>
      <button type="button" onClick={() => void signIn("admin@sunriser.com", "admin123")}>
        sign in
      </button>
      <button type="button" onClick={signOut}>
        sign out
      </button>
    </>
  )
}

describe("AuthProvider", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("starts as public and signs in a mock user", async () => {
    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    )

    expect(screen.getByTestId("role").textContent).toBe("public")
    expect(screen.getByTestId("name").textContent).toBe("No user")

    await userEvent.click(screen.getByText("sign in"))

    expect(screen.getByTestId("role").textContent).toBe("admin")
    expect(screen.getByTestId("name").textContent).toBe("Linh Admin")
    expect(localStorage.getItem("v2.auth.session")).toContain("u_admin")
  })

  it("signs out and clears the active role", async () => {
    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    )

    await userEvent.click(screen.getByText("sign in"))
    await userEvent.click(screen.getByText("sign out"))

    expect(screen.getByTestId("role").textContent).toBe("public")
    expect(screen.getByTestId("name").textContent).toBe("No user")
  })
})
