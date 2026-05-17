import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ActionTooltip } from "../ActionTooltip"

describe("ActionTooltip", () => {
  it("renders label and shortcut on hover", async () => {
    render(
      <TooltipProvider delay={0}>
        <ActionTooltip label="Pin to compare" shortcut="P">
          <button type="button">btn</button>
        </ActionTooltip>
      </TooltipProvider>
    )

    await userEvent.hover(screen.getByText("btn"))

    expect(await screen.findByText("Pin to compare")).toBeInTheDocument()
    expect(screen.getByText("P")).toBeInTheDocument()
  })
})
