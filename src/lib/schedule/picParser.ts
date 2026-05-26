export interface PicChip {
  name: string
  roles: string[]
}

export function parsePic(raw: string | undefined | null): PicChip[] {
  if (!raw) return []
  const cleaned = raw.replace(/\r/g, "")
  const segments = cleaned
    .split(/(?:\n|\s-\s|^-\s)/)
    .map(segment => segment.trim())
    .filter(segment => segment.length > 0)

  if (segments.length === 0) return []

  return segments.map(segment => {
    const stripped = segment.replace(/^-\s*/, "").trim()
    const colonIdx = stripped.indexOf(":")
    if (colonIdx === -1) {
      return { name: stripped, roles: [] }
    }
    const name = stripped.slice(0, colonIdx).trim()
    const rolesText = stripped.slice(colonIdx + 1).trim()
    const roles = rolesText
      .split(/[,;]+/)
      .map(role => role.trim())
      .filter(role => role.length > 0)
    return { name, roles }
  })
}
