export interface CutoffMatch {
  label: string
  iso: string
}

const CUTOFF_PATTERN = /Cutoff\s*time\s*:\s*(\d{1,2})\/(\d{1,2})\/(\d{4})\s*[-–]\s*(\d{1,2}):(\d{2})/i

export function extractCutoff(note: string | undefined | null): CutoffMatch | null {
  if (!note) return null
  const match = note.match(CUTOFF_PATTERN)
  if (!match) return null
  const [, day, month, year, hour, minute] = match
  const dd = day.padStart(2, "0")
  const mm = month.padStart(2, "0")
  const hh = hour.padStart(2, "0")
  const date = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute))
  if (Number.isNaN(date.getTime())) return null
  return {
    label: `${dd}/${mm} ${hh}:${minute}`,
    iso: date.toISOString(),
  }
}
