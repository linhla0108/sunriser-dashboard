export interface PortfolioLinkMetadata {
  finalUrl: string
  host: string
  title: string | null
  description: string | null
  image: string | null
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 10)))
}

function collapseWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim()
}

function firstMatch(input: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = input.match(pattern)
    const value = match?.[1]
    if (value) return collapseWhitespace(decodeHtmlEntities(value))
  }
  return null
}

function resolveUrl(value: string | null, finalUrl: URL) {
  if (!value) return null
  try {
    return new URL(value, finalUrl).toString()
  } catch {
    return null
  }
}

export function parsePortfolioMetadata(html: string, finalUrl: URL): PortfolioLinkMetadata {
  const title =
    firstMatch(html, [
      /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"]+)["'][^>]*>/i,
      /<meta[^>]+content=["']([^"]+)["'][^>]+property=["']og:title["'][^>]*>/i,
      /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"]+)["'][^>]*>/i,
      /<meta[^>]+content=["']([^"]+)["'][^>]+name=["']twitter:title["'][^>]*>/i,
      /<title[^>]*>([^<]+)<\/title>/i,
    ]) ?? null

  const description =
    firstMatch(html, [
      /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"]+)["'][^>]*>/i,
      /<meta[^>]+content=["']([^"]+)["'][^>]+property=["']og:description["'][^>]*>/i,
      /<meta[^>]+name=["']twitter:description["'][^>]+content=["']([^"]+)["'][^>]*>/i,
      /<meta[^>]+content=["']([^"]+)["'][^>]+name=["']twitter:description["'][^>]*>/i,
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"]+)["'][^>]*>/i,
      /<meta[^>]+content=["']([^"]+)["'][^>]+name=["']description["'][^>]*>/i,
    ]) ?? null

  const image = resolveUrl(
    firstMatch(html, [
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"]+)["'][^>]*>/i,
      /<meta[^>]+content=["']([^"]+)["'][^>]+property=["']og:image["'][^>]*>/i,
      /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"]+)["'][^>]*>/i,
      /<meta[^>]+content=["']([^"]+)["'][^>]+name=["']twitter:image["'][^>]*>/i,
    ]),
    finalUrl
  )

  return {
    finalUrl: finalUrl.toString(),
    host: finalUrl.host,
    title,
    description,
    image,
  }
}
