import { act, renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { usePagination } from "../usePagination"

describe("usePagination", () => {
  it("computes totalPages correctly", () => {
    const { result } = renderHook(() => usePagination(646))
    expect(result.current.totalPages).toBe(44) // ceil(646/15) = 44
    expect(result.current.currentPage).toBe(1)
  })

  it("returns correct startIndex and endIndex for page 1", () => {
    const { result } = renderHook(() => usePagination(646))
    expect(result.current.startIndex).toBe(0)
    expect(result.current.endIndex).toBe(15)
  })

  it("returns correct indices for page 2", () => {
    const { result } = renderHook(() => usePagination(646))
    act(() => result.current.goNext())
    expect(result.current.currentPage).toBe(2)
    expect(result.current.startIndex).toBe(15)
    expect(result.current.endIndex).toBe(30)
  })

  it("endIndex does not exceed totalItems on last page", () => {
    const { result } = renderHook(() => usePagination(646))
    // Jump to last page (44) — 43 goNext calls from page 1
    for (let i = 0; i < 43; i++) {
      act(() => result.current.goNext())
    }
    expect(result.current.currentPage).toBe(44)
    expect(result.current.endIndex).toBe(646)
  })

  it("canGoPrev is false on page 1", () => {
    const { result } = renderHook(() => usePagination(646))
    expect(result.current.canGoPrev).toBe(false)
  })

  it("canGoNext is false on last page", () => {
    const { result } = renderHook(() => usePagination(15))
    expect(result.current.totalPages).toBe(1)
    expect(result.current.canGoNext).toBe(false)
  })

  it("canGoPrev becomes true after going next", () => {
    const { result } = renderHook(() => usePagination(646))
    act(() => result.current.goNext())
    expect(result.current.canGoPrev).toBe(true)
  })

  it("resets to page 1 when totalItems changes", () => {
    const { result, rerender } = renderHook(({ total }) => usePagination(total), {
      initialProps: { total: 646 },
    })
    act(() => result.current.goNext())
    expect(result.current.currentPage).toBe(2)

    rerender({ total: 30 })
    expect(result.current.currentPage).toBe(1)
  })

  it("handles zero items", () => {
    const { result } = renderHook(() => usePagination(0))
    expect(result.current.totalPages).toBe(0)
    expect(result.current.canGoNext).toBe(false)
    expect(result.current.canGoPrev).toBe(false)
  })

  it("accepts a custom pageSize", () => {
    const { result } = renderHook(() => usePagination(100, 25))
    expect(result.current.totalPages).toBe(4)
    expect(result.current.endIndex).toBe(25)
  })
})
