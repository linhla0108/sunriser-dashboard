import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { SearchHighlight } from "../SearchHighlight"

describe("SearchHighlight", () => {
  it("highlights case-insensitive matches while preserving text", () => {
    render(<SearchHighlight text="John Johnson" query="john" />)

    const matches = screen.getAllByText(/john/i)
    expect(matches).toHaveLength(2)
    expect(matches.every(match => match.tagName === "MARK")).toBe(true)
  })

  it("handles regex characters as literal search text", () => {
    render(<SearchHighlight text="C++ applicant (senior)" query="C++" />)

    expect(screen.getByText("C++").tagName).toBe("MARK")
  })

  it("renders plain text when query is empty", () => {
    render(<SearchHighlight text="No highlight" query=" " />)

    expect(screen.getByText("No highlight")).toBeInTheDocument()
    expect(document.querySelector("mark")).toBeNull()
  })
})
