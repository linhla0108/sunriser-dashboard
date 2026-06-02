import { describe, expect, it } from "vitest"
import { extractCutoff } from "../cutoffExtract"

describe("extractCutoff", () => {
  it("parses standard cutoff format", () => {
    const result = extractCutoff("Sheet 1.1. Batch 1 - 20260423 - 19:45 và Lever\nCutoff time: 23/04/2026 - 19:45")
    expect(result).not.toBeNull()
    expect(result?.label).toBe("23/04 19:45")
  })

  it("parses single-digit day/month", () => {
    const result = extractCutoff("Cutoff time: 1/5/2026 - 9:30")
    expect(result?.label).toBe("01/05 09:30")
  })

  it("returns null when note has no cutoff", () => {
    expect(extractCutoff("Just a plain note")).toBeNull()
    expect(extractCutoff("")).toBeNull()
    expect(extractCutoff(null)).toBeNull()
    expect(extractCutoff(undefined)).toBeNull()
  })

  it("handles en-dash separator", () => {
    const result = extractCutoff("Cutoff time: 08/05/2026 – 23:59")
    expect(result?.label).toBe("08/05 23:59")
  })
})
