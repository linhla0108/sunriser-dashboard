import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, beforeEach } from "vitest"
import { usePinned } from "../usePinned"

describe("usePinned", () => {
  beforeEach(() => localStorage.clear())

  it("adds, removes, and clears pinned ids", () => {
    const { result } = renderHook(() => usePinned())

    act(() => {
      result.current.add("001")
      result.current.add("002")
    })

    expect(result.current.ids).toEqual(["001", "002"])
    expect(result.current.has("001")).toBe(true)

    act(() => result.current.remove("001"))
    expect(result.current.ids).toEqual(["002"])

    act(() => result.current.clear())
    expect(result.current.ids).toEqual([])
  })

  it("allows more than five pinned ids", () => {
    const { result } = renderHook(() => usePinned())

    act(() => {
      ;["1", "2", "3", "4", "5", "6", "7"].forEach(id => result.current.add(id))
    })

    expect(result.current.ids).toEqual(["1", "2", "3", "4", "5", "6", "7"])
  })
})
