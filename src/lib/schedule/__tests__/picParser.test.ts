import { describe, expect, it } from "vitest"
import { parsePic } from "../picParser"

describe("parsePic", () => {
  it("parses multiple PICs with roles separated by newlines", () => {
    const result = parsePic("- Chị Nhiên: Game Design, UA, AI\n- Chị Yến: HR\n- Quỳnh: Unity, Data, QA")
    expect(result).toEqual([
      { name: "Chị Nhiên", roles: ["Game Design", "UA", "AI"] },
      { name: "Chị Yến", roles: ["HR"] },
      { name: "Quỳnh", roles: ["Unity", "Data", "QA"] },
    ])
  })

  it("parses inline format with ' - ' separator", () => {
    const result = parsePic("- Chị Nhiên - Quỳnh")
    expect(result).toEqual([
      { name: "Chị Nhiên", roles: [] },
      { name: "Quỳnh", roles: [] },
    ])
  })

  it("returns empty array for empty input", () => {
    expect(parsePic("")).toEqual([])
    expect(parsePic(null)).toEqual([])
    expect(parsePic(undefined)).toEqual([])
  })

  it("handles single PIC without dash", () => {
    expect(parsePic("Linh")).toEqual([{ name: "Linh", roles: [] }])
  })

  it("handles PIC without roles colon", () => {
    expect(parsePic("- Linh\n- Minh")).toEqual([
      { name: "Linh", roles: [] },
      { name: "Minh", roles: [] },
    ])
  })
})
