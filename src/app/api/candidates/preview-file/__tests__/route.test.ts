import { NextRequest } from "next/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { lookup } from "node:dns/promises"
import { GET, HEAD } from "../route"

vi.mock("node:dns/promises", async importOriginal => {
  const actual = await importOriginal<typeof import("node:dns/promises")>()
  return {
    ...actual,
    lookup: vi.fn(),
  }
})

const lookupMock = vi.mocked(lookup)

describe("/api/candidates/preview-file", () => {
  beforeEach(() => {
    lookupMock.mockReset()
    lookupMock.mockResolvedValue([{ address: "93.184.216.34", family: 4 }] as unknown as Awaited<ReturnType<typeof lookup>>)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("rejects blocked or private URLs", async () => {
    const request = new NextRequest("http://localhost/api/candidates/preview-file?url=https%3A%2F%2Flocalhost%2Ffile.pdf")

    const response = await GET(request)

    expect(response.status).toBe(400)
  })

  it("supports HEAD requests with normalized metadata", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { headers: { "content-type": "application/octet-stream", "content-length": "3" } }))
    )

    const sourceUrl = "https://example.com/transcript.pdf"
    const request = new NextRequest(`http://localhost/api/candidates/preview-file?url=${encodeURIComponent(sourceUrl)}`)

    const response = await HEAD(request)

    expect(response.status).toBe(200)
    expect(response.headers.get("content-disposition")).toContain('inline; filename="transcript.pdf"')
    expect(response.headers.get("content-type")).toBe("application/pdf")
    expect(response.headers.get("content-length")).toBe("3")
    expect(response.headers.get("cache-control")).toBe("private, max-age=600")
  })

  it("encodes unicode filenames safely in content disposition", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { headers: { "content-type": "application/pdf", "content-length": "3" } }))
    )

    const sourceUrl = "https://example.com/Bảng_điểm.pdf"
    const request = new NextRequest(`http://localhost/api/candidates/preview-file?url=${encodeURIComponent(sourceUrl)}`)

    const response = await HEAD(request)

    expect(response.status).toBe(200)
    expect(response.headers.get("content-disposition")).toContain("filename*=UTF-8''B%E1%BA%A3ng_%C4%91i%E1%BB%83m.pdf")
  })

  it("forwards range requests and preserves proxy headers", async () => {
    const fetchSpy = vi.fn(async (_input: URL | RequestInfo, init?: RequestInit) => {
      expect(new Headers(init?.headers).get("range")).toBe("bytes=0-1023")

      return new Response("partial", {
        status: 206,
        headers: {
          "accept-ranges": "bytes",
          "content-length": "7",
          "content-range": "bytes 0-6/42",
          "content-type": "application/pdf",
          etag: '"preview-etag"',
          "last-modified": "Thu, 28 May 2026 00:00:00 GMT",
        },
      })
    })

    vi.stubGlobal("fetch", fetchSpy)

    const sourceUrl = "https://example.com/transcript.pdf"
    const request = new NextRequest(`http://localhost/api/candidates/preview-file?url=${encodeURIComponent(sourceUrl)}`, {
      headers: { range: "bytes=0-1023" },
    })

    const response = await GET(request)

    expect(response.status).toBe(206)
    expect(response.headers.get("accept-ranges")).toBe("bytes")
    expect(response.headers.get("content-range")).toBe("bytes 0-6/42")
    expect(response.headers.get("etag")).toBe('"preview-etag"')
    expect(response.headers.get("last-modified")).toBe("Thu, 28 May 2026 00:00:00 GMT")
  })
})
