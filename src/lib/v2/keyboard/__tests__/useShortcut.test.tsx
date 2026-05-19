import { render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { useShortcut } from "../useShortcut"

function Probe({ combo, onFire }: { combo: { key: string; meta?: boolean; ctrl?: boolean }; onFire: () => void }) {
  useShortcut(combo, onFire)
  return null
}

describe("useShortcut", () => {
  it("fires when matching ctrl combo is pressed", () => {
    const handler = vi.fn()
    render(<Probe combo={{ key: "j", meta: true }} onFire={handler} />)
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "j", ctrlKey: true }))
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it("does not fire on meta/cmd key when ctrl is required", () => {
    const handler = vi.fn()
    render(<Probe combo={{ key: "n", meta: true }} onFire={handler} />)
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "n", metaKey: true }))
    expect(handler).not.toHaveBeenCalled()
  })

  it("does not fire on bare letter when meta is required", () => {
    const handler = vi.fn()
    render(<Probe combo={{ key: "r", meta: true }} onFire={handler} />)
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "r" }))
    expect(handler).not.toHaveBeenCalled()
  })

  it("ignores unrelated keys", () => {
    const handler = vi.fn()
    render(<Probe combo={{ key: "j", meta: true }} onFire={handler} />)
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))
    expect(handler).not.toHaveBeenCalled()
  })
})
