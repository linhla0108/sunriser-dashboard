import { renderHook, act } from "@testing-library/react"
import { describe, expect, it, beforeEach } from "vitest"
import { z } from "zod"
import { usePersistedState } from "../usePersistedState"

describe("usePersistedState", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("returns default when no value is stored", () => {
    const { result } = renderHook(() => usePersistedState("v2.test", 0))

    expect(result.current[0]).toBe(0)
  })

  it("persists to localStorage on update", () => {
    const { result } = renderHook(() => usePersistedState("v2.test", 0))

    act(() => result.current[1](5))

    expect(JSON.parse(localStorage.getItem("v2.test")!)).toBe(5)
  })

  it("reads from localStorage on init", () => {
    localStorage.setItem("v2.test", JSON.stringify(42))

    const { result } = renderHook(() => usePersistedState("v2.test", 0))

    expect(result.current[0]).toBe(42)
  })

  it("falls back to default on schema mismatch", () => {
    localStorage.setItem("v2.test", JSON.stringify("not a number"))

    const { result } = renderHook(() => usePersistedState("v2.test", 0, z.number()))

    expect(result.current[0]).toBe(0)
  })
})
