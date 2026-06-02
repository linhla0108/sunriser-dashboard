import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { SearchableSelect } from "@/components/ui/select"

const options = [
  { value: "all", label: "All positions" },
  { value: "ai", label: "AI Engineering" },
  { value: "data", label: "Data Analysis" },
  { value: "qa", label: "Game Quality Assurance", disabled: true },
]

describe("SearchableSelect", () => {
  it("filters options while keeping the selected value as a muted input hint", async () => {
    const onValueChange = vi.fn()

    render(<SearchableSelect aria-label="Position" value="ai" options={options} onValueChange={onValueChange} placeholder="Select position" />)

    await userEvent.click(screen.getByRole("button", { name: /ai engineering/i }))

    const input = screen.getByRole("combobox", { name: /search position/i })
    expect(input).toHaveAttribute("placeholder", "AI Engineering")

    await userEvent.type(input, "data")

    const listbox = screen.getByRole("listbox")
    expect(within(listbox).getByRole("option", { name: /data analysis/i })).toBeInTheDocument()
    expect(within(listbox).queryByRole("option", { name: /ai engineering/i })).not.toBeInTheDocument()
    expect(onValueChange).not.toHaveBeenCalled()

    await userEvent.click(within(listbox).getByRole("option", { name: /data analysis/i }))

    expect(onValueChange).toHaveBeenCalledWith("data")
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
  })

  it("keeps disabled unavailable options visible but unselectable", async () => {
    const onValueChange = vi.fn()

    render(<SearchableSelect aria-label="Position" value="all" options={options} onValueChange={onValueChange} />)

    await userEvent.click(screen.getByRole("button", { name: /all positions/i }))

    const unavailable = screen.getByRole("option", { name: /game quality assurance/i })
    expect(unavailable).toHaveAttribute("aria-disabled", "true")

    await userEvent.click(unavailable)

    expect(onValueChange).not.toHaveBeenCalled()
  })

  it("supports keyboard search and enter selection", async () => {
    const onValueChange = vi.fn()

    render(<SearchableSelect aria-label="Position" value="all" options={options} onValueChange={onValueChange} />)

    await userEvent.click(screen.getByRole("button", { name: /all positions/i }))
    await userEvent.keyboard("data{Enter}")

    expect(onValueChange).toHaveBeenCalledWith("data")
  })
})
