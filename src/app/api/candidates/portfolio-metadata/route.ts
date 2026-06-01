import { lookup } from "node:dns/promises"
import { isIP } from "node:net"
import { NextResponse, type NextRequest } from "next/server"
import { parsePortfolioMetadata, type PortfolioLinkMetadata } from "@/lib/candidates/portfolioMetadata"

const BLOCKED_HOST_PATTERNS = [/^localhost$/i, /\.local$/i, /\.internal$/i]
const MAX_HTML_BYTES = 256 * 1024
const RESPONSE_HEADERS = { "Cache-Control": "private, max-age=600" }

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

function buildEmptyMetadata(url: URL) {
  return parsePortfolioMetadata("", url)
}

function buildEmptyMetadataFromRawUrl(rawUrl: string | null): PortfolioLinkMetadata {
  if (rawUrl) {
    try {
      return buildEmptyMetadata(new URL(rawUrl))
    } catch {
      return {
        finalUrl: rawUrl,
        host: "",
        title: null,
        description: null,
        image: null,
      }
    }
  }

  return {
    finalUrl: "",
    host: "",
    title: null,
    description: null,
    image: null,
  }
}

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url")
  const sourceUrl = await parseAllowedUrl(rawUrl)
  if (!sourceUrl) {
    return NextResponse.json(buildEmptyMetadataFromRawUrl(rawUrl), {
      headers: RESPONSE_HEADERS,
    })
  }

  let upstream: Awaited<ReturnType<typeof fetch>>
  try {
    upstream = await fetch(sourceUrl, {
      method: "GET",
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": "sunriser-dashboard-metadata/1.0",
      },
      cache: "no-store",
      redirect: "follow",
    })
  } catch {
    return NextResponse.json(buildEmptyMetadata(sourceUrl), {
      headers: RESPONSE_HEADERS,
    })
  }

  if (!upstream.ok) {
    const contentType = upstream.headers.get("content-type")?.toLowerCase() ?? ""
    const finalUrl = new URL(upstream.url || sourceUrl.toString())

    if (!contentType.includes("text/html")) {
      return NextResponse.json(buildEmptyMetadata(finalUrl), {
        headers: RESPONSE_HEADERS,
      })
    }

    const html = (await upstream.text()).slice(0, MAX_HTML_BYTES)
    return NextResponse.json(parsePortfolioMetadata(html, finalUrl), {
      headers: RESPONSE_HEADERS,
    })
  }

  const finalUrl = new URL(upstream.url || sourceUrl.toString())
  const contentType = upstream.headers.get("content-type")?.toLowerCase() ?? ""
  if (contentType && !contentType.includes("text/html")) {
    return NextResponse.json(buildEmptyMetadata(finalUrl), {
      headers: RESPONSE_HEADERS,
    })
  }

  const html = (await upstream.text()).slice(0, MAX_HTML_BYTES)

  return NextResponse.json(parsePortfolioMetadata(html, finalUrl), {
    headers: RESPONSE_HEADERS,
  })
}
