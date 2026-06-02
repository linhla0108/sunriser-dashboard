import { render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { RequirePublisher } from "../RequirePublisher"

const replace = vi.fn()
const mockUseAuth = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}))

vi.mock("@/lib/auth/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}))

describe("RequirePublisher", () => {
  beforeEach(() => {
    replace.mockClear()
  })

  it("renders children for managers", () => {
    mockUseAuth.mockReturnValue({
      loading: false,
      user: { role: "manager" },
    })

    render(
      <RequirePublisher>
        <div>publish</div>
      </RequirePublisher>
    )

    expect(screen.getByText("publish")).toBeInTheDocument()
  })

  it("redirects members to the inbox page", async () => {
    mockUseAuth.mockReturnValue({
      loading: false,
      user: { role: "member" },
    })

    render(
      <RequirePublisher>
        <div>publish</div>
      </RequirePublisher>
    )

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/announcements"))
  })
})
