const URL_PATTERN =
  /(?:https?:\/\/)?(?:www\.)?(?:github\.com|linkedin\.com|behance\.net|dribbble\.com|itch\.io|kaggle\.com|artstation\.com|youtube\.com|youtu\.be|drive\.google\.com|docs\.google\.com|notion\.so|surl\.li|play\.unity\.com|[a-z0-9-]+(?:\.[a-z0-9-]+)+)(?:\/[^\s,;)"]*)?/gi

export function normalizeCandidateUrl(value: string) {
  const trimmed = value.trim().replace(/["'.,;]+$/g, "")
  if (!trimmed) return ""
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

export function extractCandidateUrls(value?: string | null) {
  if (!value) return []
  const matches = value.match(URL_PATTERN) ?? []
  return Array.from(new Set(matches.map(normalizeCandidateUrl).filter(Boolean)))
}

export function candidateLinksFromApplicant(value: { portfolio?: string; portfolioLinks?: string[] }) {
  const explicitLinks = value.portfolioLinks?.map(normalizeCandidateUrl).filter(Boolean) ?? []
  if (explicitLinks.length > 0) return Array.from(new Set(explicitLinks))
  return extractCandidateUrls(value.portfolio)
}

export function isImagePreviewUrl(url: string) {
  return /\.(?:apng|avif|gif|jpe?g|png|webp)(?:[?#].*)?$/i.test(url)
}

export function isPdfPreviewUrl(url: string) {
  return /\.pdf(?:[?#].*)?$/i.test(url)
}
