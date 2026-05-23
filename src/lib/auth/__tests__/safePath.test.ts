import { describe, expect, it } from "vitest"
import { safeInternalPath } from "../safePath"

describe("safeInternalPath", () => {
  it("returns the input when it is an internal absolute path", () => {
    expect(safeInternalPath("/dashboard", "/dashboard")).toBe("/dashboard")
    expect(safeInternalPath("/candidates?id=42", "/dashboard")).toBe("/candidates?id=42")
  })

  it("falls back when input is missing", () => {
    expect(safeInternalPath(null, "/dashboard")).toBe("/dashboard")
    expect(safeInternalPath(undefined, "/dashboard")).toBe("/dashboard")
    expect(safeInternalPath("", "/dashboard")).toBe("/dashboard")
  })

  it("rejects absolute URLs", () => {
    expect(safeInternalPath("https://evil.com/x", "/dashboard")).toBe("/dashboard")
    expect(safeInternalPath("http://evil.com", "/dashboard")).toBe("/dashboard")
  })

  it("rejects protocol-relative URLs", () => {
    expect(safeInternalPath("//evil.com/path", "/dashboard")).toBe("/dashboard")
  })

  it("rejects backslash-prefixed paths that browsers normalize to //", () => {
    expect(safeInternalPath("/\\evil.com", "/dashboard")).toBe("/dashboard")
  })

  it("rejects paths that do not start with /", () => {
    expect(safeInternalPath("dashboard", "/dashboard")).toBe("/dashboard")
    expect(safeInternalPath("javascript:alert(1)", "/dashboard")).toBe("/dashboard")
  })
})
