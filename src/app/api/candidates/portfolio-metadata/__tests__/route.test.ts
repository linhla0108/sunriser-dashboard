import { lookup } from "node:dns/promises"
import { NextRequest } from "next/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { GET } from "../route"

vi.mock("node:dns/promises", async importOriginal => {
  const actual = await importOriginal<typeof import("node:dns/promises")>()
  return {
    ...actual,
    lookup: vi.fn(),
  }
})

const lookupMock = vi.mocked(lookup)

describe("/api/candidates/portfolio-metadata", () => {
  beforeEach(() => {
    lookupMock.mockReset()
    lookupMock.mockResolvedValue([{ address: "93.184.216.34", family: 4 }] as unknown as Awaited<ReturnType<typeof lookup>>)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("degrades gracefully for blocked or private URLs", async () => {
    const request = new NextRequest("http://localhost/api/candidates/portfolio-metadata?url=https%3A%2F%2Flocalhost%2Fportfolio")
    const response = await GET(request)
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toEqual({
      finalUrl: "https://localhost/portfolio",
      host: "localhost",
      title: null,
      description: null,
      image: null,
    })
  })

  it("returns parsed metadata for public html pages", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          `
            <html>
              <head>
                <title>Fallback title</title>
                <meta property="og:title" content="Candidate Portfolio" />
                <meta name="description" content="Portfolio site for internship application." />
                <meta property="og:image" content="/preview.png" />
              </head>
            </html>
          `,
          {
            headers: { "content-type": "text/html; charset=utf-8" },
          }
        )
      )
    )

    const request = new NextRequest("http://localhost/api/candidates/portfolio-metadata?url=https%3A%2F%2Fexample.com%2Fportfolio")
    const response = await GET(request)
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toEqual({
      finalUrl: "https://example.com/portfolio",
      host: "example.com",
      title: "Candidate Portfolio",
      description: "Portfolio site for internship application.",
      image: "https://example.com/preview.png",
    })
  })

  it("degrades gracefully for non-html responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("binary", { headers: { "content-type": "application/pdf" } }))
    )

    const request = new NextRequest("http://localhost/api/candidates/portfolio-metadata?url=https%3A%2F%2Fexample.com%2Fportfolio.pdf")
    const response = await GET(request)
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toEqual({
      finalUrl: "https://example.com/portfolio.pdf",
      host: "example.com",
      title: null,
      description: null,
      image: null,
    })
  })

  it("parses html even when upstream returns a nonstandard anti-bot status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 999,
        url: "https://www.linkedin.com/in/dpduy",
        headers: {
          get(name: string) {
            return name.toLowerCase() === "content-type" ? "text/html; charset=utf-8" : null
          },
        },
        text: async () => `
          <html>
            <head>
              <title>LinkedIn Candidate</title>
              <meta property="og:title" content="Duy Pham | LinkedIn" />
              <meta property="og:description" content="Professional profile" />
            </head>
          </html>
        `,
      }))
    )

    const request = new NextRequest("http://localhost/api/candidates/portfolio-metadata?url=https%3A%2F%2Flinkedin.com%2Fin%2Fdpduy")
    const response = await GET(request)
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toEqual({
      finalUrl: "https://www.linkedin.com/in/dpduy",
      host: "www.linkedin.com",
      title: "Duy Pham | LinkedIn",
      description: "Professional profile",
      image: null,
    })
  })
})
