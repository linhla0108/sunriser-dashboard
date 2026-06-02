import { describe, expect, it } from "vitest"
import { candidateLinksFromApplicant, extractCandidateUrls, normalizeCandidateUrl, proxiedCandidateFileUrl } from "@/lib/candidates/candidateLinks"

describe("normalizeCandidateUrl", () => {
  it("keeps explicit protocols", () => {
    expect(normalizeCandidateUrl("https://github.com/openai")).toBe("https://github.com/openai")
  })

  it("adds https to bare hosts and trims trailing punctuation", () => {
    expect(normalizeCandidateUrl("github.com/openai,")).toBe("https://github.com/openai")
  })
})

describe("extractCandidateUrls", () => {
  it("ignores ASCII fragments parsed out of accented Vietnamese text", () => {
    const text = "Em đang học năm.thực hành tại trường."
    expect(extractCandidateUrls(text)).toEqual([])
  })

  it("keeps multi-label hostnames with short TLDs", () => {
    expect(extractCandidateUrls("Portfolio: https://vnd.id.vn/profile")).toContain("https://vnd.id.vn/profile")
  })

  it("keeps bare custom subdomains", () => {
    expect(extractCandidateUrls("Site: 113mobile.somee.com")).toContain("https://113mobile.somee.com")
  })

  it("deduplicates repeated links", () => {
    expect(extractCandidateUrls("github.com/openai github.com/openai")).toEqual(["https://github.com/openai"])
  })
})

describe("candidateLinksFromApplicant", () => {
  it("prefers explicit portfolioLinks when present", () => {
    expect(
      candidateLinksFromApplicant({
        portfolio: "github.com/openai",
        portfolioLinks: ["https://notion.so/portfolio", "https://notion.so/portfolio"],
      })
    ).toEqual(["https://notion.so/portfolio"])
  })

  it("falls back to extracting links from portfolio text", () => {
    expect(candidateLinksFromApplicant({ portfolio: "github.com/openai" })).toEqual(["https://github.com/openai"])
  })
})

describe("proxiedCandidateFileUrl", () => {
  it("encodes the academic file URL for the preview proxy", () => {
    expect(proxiedCandidateFileUrl("https://example.com/file.pdf?x=1&y=2")).toBe(
      "/api/candidates/preview-file?url=https%3A%2F%2Fexample.com%2Ffile.pdf%3Fx%3D1%26y%3D2"
    )
  })
})
