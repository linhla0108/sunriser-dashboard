import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it } from "vitest"
import { AuthProvider } from "../AuthProvider"
import { useAuth } from "../useAuth"

function PermissionProbe() {
  const { user, can, isAdmin, signIn } = useAuth()
  return (
    <>
      <span data-testid="user-id">{user?.id ?? "anon"}</span>
      <span data-testid="is-admin">{String(isAdmin)}</span>
      <span data-testid="can-read">{String(can("read"))}</span>
      <span data-testid="can-edit">{String(can("edit"))}</span>
      <span data-testid="can-delete">{String(can("delete"))}</span>
      <span data-testid="permissions">{(user?.access.permissions ?? []).join(",")}</span>
      <span data-testid="full-name">{user?.profile.fullName ?? ""}</span>
      <button type="button" onClick={() => void signIn("admin@sunriser.com", "admin123")}>
        sign in admin
      </button>
      <button type="button" onClick={() => void signIn("member@sunriser.com", "member123")}>
        sign in member
      </button>
    </>
  )
}

describe("AuthProvider can() + isAdmin + profile loading", () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it("returns false for everything when no user is signed in", () => {
    render(
      <AuthProvider>
        <PermissionProbe />
      </AuthProvider>
    )

    expect(screen.getByTestId("user-id").textContent).toBe("anon")
    expect(screen.getByTestId("is-admin").textContent).toBe("false")
    expect(screen.getByTestId("can-read").textContent).toBe("false")
    expect(screen.getByTestId("can-edit").textContent).toBe("false")
    expect(screen.getByTestId("can-delete").textContent).toBe("false")
  })

  it("loads admin profile with full permissions and isAdmin=true", async () => {
    render(
      <AuthProvider>
        <PermissionProbe />
      </AuthProvider>
    )

    await userEvent.click(screen.getByText("sign in admin"))

    await waitFor(() => expect(screen.getByTestId("user-id").textContent).toBe("u_admin"))
    expect(screen.getByTestId("is-admin").textContent).toBe("true")
    expect(screen.getByTestId("can-read").textContent).toBe("true")
    expect(screen.getByTestId("can-edit").textContent).toBe("true")
    expect(screen.getByTestId("can-delete").textContent).toBe("true")
    expect(screen.getByTestId("permissions").textContent).toBe("read,edit,delete")
    expect(screen.getByTestId("full-name").textContent).toBe("Linh Admin")
  })

  it("loads member profile with read-only permissions and isAdmin=false", async () => {
    render(
      <AuthProvider>
        <PermissionProbe />
      </AuthProvider>
    )

    await userEvent.click(screen.getByText("sign in member"))

    await waitFor(() => expect(screen.getByTestId("user-id").textContent).toBe("u_member"))
    expect(screen.getByTestId("is-admin").textContent).toBe("false")
    expect(screen.getByTestId("can-read").textContent).toBe("true")
    expect(screen.getByTestId("can-edit").textContent).toBe("false")
    expect(screen.getByTestId("can-delete").textContent).toBe("false")
  })
})
