import { describe, expect, it } from "vitest"
import { filterMentionCandidates, getMentionMatch, insertMention, type MentionCandidate } from "../mentions"

const candidates: MentionCandidate[] = [
  { id: "1", name: "Linh Admin", email: "linh@sunriser.com", positions: ["HR Lead"] },
  { id: "2", name: "An Tran", email: "an@sunriser.com", positions: ["Recruiter"] },
]

describe("announcement mentions", () => {
  it("detects a mention query at the caret", () => {
    expect(getMentionMatch("Please review with @lin", 24)).toEqual({
      query: "lin",
      start: 19,
      end: 24,
    })
  })

  it("returns null when the caret is not inside a mention token", () => {
    expect(getMentionMatch("Please review this", 18)).toBeNull()
  })

  it("filters candidates by name, email, or position", () => {
    expect(filterMentionCandidates(candidates, "recruit")).toEqual([candidates[1]])
    expect(filterMentionCandidates(candidates, "linh@")).toEqual([candidates[0]])
  })

  it("replaces the active mention token with the chosen name", () => {
    const match = getMentionMatch("Please review with @lin", 24)
    expect(match).not.toBeNull()

    expect(insertMention("Please review with @lin", match!, "Linh Admin")).toEqual({
      nextValue: "Please review with @Linh Admin ",
      nextCaret: 31,
    })
  })
})
