import { describe, it, expect } from "vitest"
import { oauthErrorMessage, supabaseErrorToCode } from "../oauthErrors"

describe("oauthErrorMessage", () => {
  it("returns a string for access_denied", () => {
    expect(typeof oauthErrorMessage("access_denied")).toBe("string")
    expect(oauthErrorMessage("access_denied").length).toBeGreaterThan(0)
  })

  it("returns a string for callback_failed", () => {
    expect(typeof oauthErrorMessage("callback_failed")).toBe("string")
    expect(oauthErrorMessage("callback_failed").length).toBeGreaterThan(0)
  })

  // Privacy guard: messages must never contain an email address, domain hint,
  // or TLD that could reveal the allowlisted domain.
  it("access_denied message contains no @ symbol", () => {
    expect(oauthErrorMessage("access_denied")).not.toMatch(/@/)
  })

  it("callback_failed message contains no @ symbol", () => {
    expect(oauthErrorMessage("callback_failed")).not.toMatch(/@/)
  })

  it("neither message contains a bare TLD pattern that could hint at domain", () => {
    const domainPattern = /\b\w+\.(com|vn|co|org|net|io|app)\b/i
    expect(oauthErrorMessage("access_denied")).not.toMatch(domainPattern)
    expect(oauthErrorMessage("callback_failed")).not.toMatch(domainPattern)
  })
})

describe("supabaseErrorToCode", () => {
  it("maps access_denied string to access_denied code", () => {
    expect(supabaseErrorToCode({ message: "access_denied" })).toBe("access_denied")
  })

  it("maps hook error to access_denied", () => {
    expect(supabaseErrorToCode({ message: "hook rejected the signup" })).toBe("access_denied")
  })

  it("maps 403 to access_denied", () => {
    expect(supabaseErrorToCode({ message: "403 forbidden" })).toBe("access_denied")
  })

  it("maps unknown error to callback_failed", () => {
    expect(supabaseErrorToCode({ message: "network timeout" })).toBe("callback_failed")
  })

  it("maps null to callback_failed", () => {
    expect(supabaseErrorToCode(null)).toBe("callback_failed")
  })

  it("maps undefined to callback_failed", () => {
    expect(supabaseErrorToCode(undefined)).toBe("callback_failed")
  })
})
