import { lookup } from "node:dns/promises"
import { isIP } from "node:net"
import { NextResponse, type NextRequest } from "next/server"
import { getCandidateFileName, normalizePreviewContentType } from "@/lib/candidates/filePreview"

const MAX_PREVIEW_BYTES = 20 * 1024 * 1024

const BLOCKED_HOST_PATTERNS = [/^localhost$/i, /\.local$/i, /\.internal$/i]

function isBlockedIpv4(address: string) {
  const octets = address.split(".").map(part => Number.parseInt(part, 10))
  if (octets.length !== 4 || octets.some(Number.isNaN)) return true

  const [first, second] = octets
  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  )
}

function isBlockedIpv6(address: string) {
  const normalized = address.toLowerCase()
  return normalized === "::1" || normalized.startsWith("fe80:") || normalized.startsWith("fc") || normalized.startsWith("fd")
}

async function isPublicHostname(hostname: string) {
  const lower = hostname.toLowerCase()
  if (BLOCKED_HOST_PATTERNS.some(pattern => pattern.test(lower))) return false

  const ipVersion = isIP(hostname)
  if (ipVersion === 4) return !isBlockedIpv4(hostname)
  if (ipVersion === 6) return !isBlockedIpv6(hostname)

  try {
    const addresses = await lookup(hostname, { all: true, verbatim: true })
    if (addresses.length === 0) return false

    return addresses.every(result => {
      if (result.family === 4) return !isBlockedIpv4(result.address)
      if (result.family === 6) return !isBlockedIpv6(result.address)
      return false
    })
  } catch {
    return false
  }
}

async function parseAllowedUrl(rawUrl: string | null) {
  if (!rawUrl) return null

  try {
    const url = new URL(rawUrl)
    if (url.protocol !== "https:") return null
    if (!(await isPublicHostname(url.hostname))) return null
    return url
  } catch {
    return null
  }
}

function inlineDisposition(url: URL) {
  const filename = getCandidateFileName(url.toString())
  const safeAscii = filename
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]+/g, "_")
    .replace(/"/g, "")
  const encoded = encodeURIComponent(filename)
  return `inline; filename="${safeAscii || "candidate-file"}"; filename*=UTF-8''${encoded}`
}

function contentLengthOf(value: string | null) {
  const parsed = Number.parseInt(value ?? "", 10)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
}

function buildProxyHeaders(upstream: Response, finalUrl: URL) {
  const headers = new Headers()
  const contentType = normalizePreviewContentType(upstream.headers.get("content-type"), finalUrl.toString())
  const contentLength = upstream.headers.get("content-length")
  const acceptRanges = upstream.headers.get("accept-ranges")
  const etag = upstream.headers.get("etag")
  const lastModified = upstream.headers.get("last-modified")
  const contentRange = upstream.headers.get("content-range")

  headers.set("Cache-Control", "private, max-age=600")
  headers.set("Content-Disposition", inlineDisposition(finalUrl))
  headers.set("Content-Type", contentType ?? "application/octet-stream")
  headers.set("X-Content-Type-Options", "nosniff")

  if (contentLength) headers.set("Content-Length", contentLength)
  if (acceptRanges) headers.set("Accept-Ranges", acceptRanges)
  if (etag) headers.set("ETag", etag)
  if (lastModified) headers.set("Last-Modified", lastModified)
  if (contentRange) headers.set("Content-Range", contentRange)

  return headers
}

function createSizeLimitedStream(body: ReadableStream<Uint8Array>, maxBytes: number) {
  const reader = body.getReader()
  let received = 0

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { done, value } = await reader.read()
      if (done) {
        controller.close()
        return
      }

      received += value.byteLength
      if (received > maxBytes) {
        controller.error(new Error("preview_file_too_large"))
        await reader.cancel("preview_file_too_large")
        return
      }

      controller.enqueue(value)
    },
    async cancel(reason) {
      await reader.cancel(reason)
    },
  })
}

async function proxyFile(request: NextRequest, method: "GET" | "HEAD") {
  const sourceUrl = await parseAllowedUrl(request.nextUrl.searchParams.get("url"))
  if (!sourceUrl) {
    return NextResponse.json({ error: "invalid_preview_url" }, { status: 400 })
  }
  const targetUrl = sourceUrl

  const upstreamHeaders = new Headers()
  const range = request.headers.get("range")
  if (range && method === "GET") upstreamHeaders.set("Range", range)
  async function fetchUpstream(fetchMethod: "GET" | "HEAD", extraHeaders?: HeadersInit) {
    return fetch(targetUrl, {
      method: fetchMethod,
      headers: extraHeaders,
      cache: "no-store",
      redirect: "follow",
    })
  }

  let upstream = await fetchUpstream(method, upstreamHeaders)

  // Some public file hosts, including Typeform file URLs, reject HEAD even though GET works.
  // Fall back to a body-less GET for metadata discovery so academic previews still resolve.
  if (method === "HEAD" && !upstream.ok) {
    upstream = await fetchUpstream("GET")
  }

  if (!upstream.ok && upstream.status !== 206) {
    return NextResponse.json({ error: "preview_fetch_failed" }, { status: upstream.status || 502 })
  }

  const finalUrl = new URL(upstream.url || targetUrl.toString())
  const responseHeaders = buildProxyHeaders(upstream, finalUrl)

  if (method === "HEAD") {
    return new NextResponse(null, {
      status: upstream.status === 206 ? 206 : 200,
      headers: responseHeaders,
    })
  }

  if (!upstream.body) {
    return NextResponse.json({ error: "preview_fetch_failed" }, { status: 502 })
  }

  const contentLength = contentLengthOf(upstream.headers.get("content-length"))
  if (!range && contentLength !== null && contentLength > MAX_PREVIEW_BYTES) {
    return NextResponse.json({ error: "preview_file_too_large" }, { status: 413 })
  }

  const body = !range ? createSizeLimitedStream(upstream.body, MAX_PREVIEW_BYTES) : upstream.body

  return new NextResponse(body, {
    status: upstream.status === 206 ? 206 : 200,
    headers: responseHeaders,
  })
}

export function GET(request: NextRequest) {
  return proxyFile(request, "GET")
}

export function HEAD(request: NextRequest) {
  return proxyFile(request, "HEAD")
}
