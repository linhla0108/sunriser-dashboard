import { describe, expect, it } from "vitest"
import { formatCandidateSort, parseCandidateUrlState, writeCandidateUrlState } from "../candidateUrlState"

describe("candidateUrlState", () => {
  it("parses shareable candidate URL params", () => {
    const state = parseCandidateUrlState(
      new URLSearchParams("search=John&position=AI+Engineering+Intern&batch=1&result=Passed&view=pipeline&page=2&sort=gpa.desc&group=batch")
    )

    expect(state).toMatchObject({
      search: "John",
      position: "AI Engineering Intern",
      batch: "1",
      result: "Passed",
      view: "pipeline",
      page: 2,
      sort: { key: "gpa", dir: "desc" },
      group: "batch",
    })
  })

  it("falls back from invalid params", () => {
    const state = parseCandidateUrlState(new URLSearchParams("view=unknown&page=-2&sort=bad.up&group=bad&result=Maybe"))

    expect(state.view).toBe("table")
    expect(state.page).toBe(1)
    expect(state.sort).toEqual({ key: "name", dir: "asc" })
    expect(state.group).toBe("round1")
    expect(state.result).toBe("")
  })

  it("omits defaults but keeps explicit cleared sort", () => {
    const params = writeCandidateUrlState(new URLSearchParams(), {
      search: "An",
      view: "table",
      sort: null,
      page: 1,
    })

    expect(params.toString()).toBe("search=An&sort=none")
    expect(formatCandidateSort(parseCandidateUrlState(params).sort)).toBe("none")
  })
})
