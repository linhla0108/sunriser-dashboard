import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { HrStaffToolbar } from "../HrStaffToolbar"

describe("HrStaffToolbar", () => {
  it("does not render the add staff action", () => {
    render(<HrStaffToolbar search="" roleFilter="all" statusFilter="all" onSearch={vi.fn()} onRoleChange={vi.fn()} onStatusChange={vi.fn()} />)

    expect(screen.queryByRole("button", { name: /add staff/i })).not.toBeInTheDocument()
  })
})
