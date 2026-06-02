import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { HrStaffTable } from "../HrStaffTable"
import { mockHrStaff } from "@/lib/hr/mockHrStaff"
import { TooltipProvider } from "@/components/ui/tooltip"

function renderTable() {
  return render(
    <TooltipProvider delay={0}>
      <HrStaffTable staff={[mockHrStaff[0]]} onEdit={vi.fn()} onDelete={vi.fn()} onSetStatus={vi.fn()} />
    </TooltipProvider>
  )
}

describe("HrStaffTable", () => {
  it("updates status via the switch", async () => {
    const user = userEvent.setup()
    const onSetStatus = vi.fn()

    render(
      <TooltipProvider delay={0}>
        <HrStaffTable staff={[mockHrStaff[0]]} onEdit={vi.fn()} onDelete={vi.fn()} onSetStatus={onSetStatus} />
      </TooltipProvider>
    )

    await user.click(screen.getByRole("switch", { name: /toggle nguyễn phương quỳnh status/i }))

    expect(onSetStatus).toHaveBeenCalledWith("hr_001", "inactive")
  })

  it("keeps edit and delete actions and removes the old power action", () => {
    renderTable()

    expect(screen.getByRole("button", { name: /edit nguyễn phương quỳnh/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /delete nguyễn phương quỳnh/i })).toBeInTheDocument()
    expect(screen.queryByTitle(/activate|deactivate/i)).not.toBeInTheDocument()
  })
})
