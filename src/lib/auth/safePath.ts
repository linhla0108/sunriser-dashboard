/**
 * Validate that a redirect target is an internal path.
 *
 * Rejects:
 * - Absolute URLs (`https://evil.com/...`)
 * - Protocol-relative URLs (`//evil.com/...`)
 * - Anything that does not start with `/`
 * - Backslash tricks that some browsers normalize to `/` (`/\evil.com`)
 *
 * Returns `fallback` when input is unsafe or missing.
 */
export function safeInternalPath(input: string | null | undefined, fallback: string): string {
  if (!input) return fallback
  if (typeof input !== "string") return fallback
  if (!input.startsWith("/")) return fallback
  if (input.startsWith("//")) return fallback
  if (input.startsWith("/\\")) return fallback
  // Block any embedded protocol (e.g. "/redirect?to=https://...") is fine in query,
  // but we only inspect the leading segment here. The check above already blocks
  // protocol-relative and absolute schemes from the start of the string.
  return input
}
