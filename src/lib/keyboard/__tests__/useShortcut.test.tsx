import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { useShortcut } from "../useShortcut"

function Probe({
  combo,
  onFire,
}: {
  combo: { key: string; mod?: boolean; meta?: boolean; ctrl?: boolean; ignoreEditable?: boolean }
  onFire: () => void
}) {
  useShortcut(combo, onFire)
  return <input aria-label="Editable target" />
}

describe("useShortcut", () => {
  it("fires when matching ctrl combo is pressed", () => {
    const handler = vi.fn()
    render(<Probe combo={{ key: "b", ctrl: true }} onFire={handler} />)
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "b", ctrlKey: true }))
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it("fires on meta/cmd key when meta is required", () => {
    const handler = vi.fn()
    render(<Probe combo={{ key: "b", meta: true }} onFire={handler} />)
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "b", metaKey: true }))
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it("does not fire on meta/cmd key when ctrl is required", () => {
    const handler = vi.fn()
    render(<Probe combo={{ key: "b", ctrl: true }} onFire={handler} />)
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "b", metaKey: true }))
    expect(handler).not.toHaveBeenCalled()
  })

  it("does not fire on bare letter when meta is required", () => {
    const handler = vi.fn()
    render(<Probe combo={{ key: "b", meta: true }} onFire={handler} />)
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "b" }))
    expect(handler).not.toHaveBeenCalled()
  })

  it("does not fire for browser-reserved command shortcuts", () => {
    const handler = vi.fn()
    render(<Probe combo={{ key: "r", mod: true }} onFire={handler} />)
    const event = new KeyboardEvent("keydown", { key: "r", ctrlKey: true, cancelable: true })

    window.dispatchEvent(event)

    expect(handler).not.toHaveBeenCalled()
    expect(event.defaultPrevented).toBe(false)
  })

  it("ignores editable targets by default", () => {
    const handler = vi.fn()
    render(<Probe combo={{ key: "b", ctrl: true }} onFire={handler} />)

    fireEvent.keyDown(screen.getByRole("textbox", { name: /editable target/i }), {
      key: "b",
      ctrlKey: true,
    })

    expect(handler).not.toHaveBeenCalled()
  })

  it("ignores unrelated keys", () => {
    const handler = vi.fn()
    render(<Probe combo={{ key: "b", meta: true }} onFire={handler} />)
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))
    expect(handler).not.toHaveBeenCalled()
  })
})
