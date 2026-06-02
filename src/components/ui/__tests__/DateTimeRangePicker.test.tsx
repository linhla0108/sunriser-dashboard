import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import type { DateRange } from "react-day-picker"

import { DateTimeRangePicker, type DateTimeRangeValue } from "@/components/ui/date-time-picker"

const rangeStart = new Date(2026, 5, 2)
const rangeEnd = new Date(2026, 5, 4)

vi.mock("@/components/ui/popover", () => ({
  Popover: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PopoverContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PopoverTrigger: ({ render }: { render: React.ReactNode }) => <>{render}</>,
}))

vi.mock("@/components/ui/calendar", () => ({
  Calendar: ({ onSelect }: { onSelect?: (range: DateRange | undefined) => void }) => (
    <div data-testid="range-calendar">
      <button type="button" onClick={() => onSelect?.({ from: rangeStart, to: rangeEnd })}>
        Select full range
      </button>
      <button type="button" onClick={() => onSelect?.({ from: rangeStart })}>
        Select start only
      </button>
      <button type="button" onClick={() => onSelect?.({ from: undefined, to: rangeEnd })}>
        Select end only
      </button>
    </div>
  ),
}))

function emptyValue(): DateTimeRangeValue {
  return {
    startsAt: { date: undefined, time: "" },
    endsAt: { date: undefined, time: "" },
  }
}

describe("DateTimeRangePicker", () => {
  it("summarizes empty, open-ended, and complete ranges", () => {
    const { rerender } = render(<DateTimeRangePicker value={emptyValue()} onChange={vi.fn()} placeholder="Set active window" />)

    expect(screen.getByRole("button", { name: /Set active window/i })).toBeInTheDocument()

    rerender(
      <DateTimeRangePicker
        value={{
          startsAt: { date: rangeStart, time: "09:00" },
          endsAt: { date: undefined, time: "" },
        }}
        onChange={vi.fn()}
      />
    )
    expect(screen.getByRole("button", { name: /Starts Jun 2, 09:00/i })).toBeInTheDocument()

    rerender(
      <DateTimeRangePicker
        value={{
          startsAt: { date: rangeStart, time: "09:00" },
          endsAt: { date: rangeEnd, time: "17:00" },
        }}
        onChange={vi.fn()}
      />
    )
    expect(screen.getByRole("button", { name: /Active Jun 2, 09:00 - Jun 4, 17:00/i })).toBeInTheDocument()
  })

  it("maps calendar range selection to start and end date parts", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <DateTimeRangePicker
        value={{
          startsAt: { date: undefined, time: "09:00" },
          endsAt: { date: undefined, time: "17:00" },
        }}
        onChange={onChange}
      />
    )

    await user.click(screen.getByRole("button", { name: "Select full range" }))

    expect(onChange).toHaveBeenCalledWith({
      startsAt: { date: rangeStart, time: "09:00" },
      endsAt: { date: rangeEnd, time: "17:00" },
    })
  })

  it("updates only the intended time side", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <DateTimeRangePicker
        value={{
          startsAt: { date: rangeStart, time: "" },
          endsAt: { date: rangeEnd, time: "17:00" },
        }}
        onChange={onChange}
      />
    )

    await user.click(screen.getByRole("button", { name: "Starts 09:00" }))
    expect(onChange).toHaveBeenLastCalledWith({
      startsAt: { date: rangeStart, time: "09:00" },
      endsAt: { date: rangeEnd, time: "17:00" },
    })

    fireEvent.change(screen.getByLabelText("Ends exact time"), { target: { value: "18:30" } })
    expect(onChange).toHaveBeenLastCalledWith({
      startsAt: { date: rangeStart, time: "" },
      endsAt: { date: rangeEnd, time: "18:30" },
    })
  })

  it("clears each side or the full active window", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const onClear = vi.fn()

    render(
      <DateTimeRangePicker
        value={{
          startsAt: { date: rangeStart, time: "09:00" },
          endsAt: { date: rangeEnd, time: "17:00" },
        }}
        onChange={onChange}
        onClear={onClear}
      />
    )

    await user.click(screen.getByRole("button", { name: "Clear starts" }))
    expect(onChange).toHaveBeenLastCalledWith({
      startsAt: { date: undefined, time: "" },
      endsAt: { date: rangeEnd, time: "17:00" },
    })

    await user.click(screen.getByRole("button", { name: "Clear active window" }))
    expect(onClear).toHaveBeenCalledTimes(1)
  })
})
