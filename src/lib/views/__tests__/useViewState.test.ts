import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it } from "vitest"
import { useViewState } from "../useViewState"

describe("useViewState", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("defaults to table view", () => {
    const { result } = renderHook(() => useViewState())

    expect(result.current.view).toBe("table")
  })

  it("persists the selected view", () => {
    const { result } = renderHook(() => useViewState())

    act(() => result.current.setView("pipeline"))

    expect(JSON.parse(localStorage.getItem("v2.view.current")!)).toBe("pipeline")
  })

  it("falls back to table for an invalid stored view", () => {
    localStorage.setItem("v2.view.current", JSON.stringify("timeline"))

    const { result } = renderHook(() => useViewState())

    expect(result.current.view).toBe("table")
  })
})
