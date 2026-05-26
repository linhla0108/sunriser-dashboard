import { Clock } from "lucide-react"
import { extractCutoff } from "@/lib/schedule/cutoffExtract"
import type { TimelineEntry } from "@/lib/types"
import { cn } from "@/lib/utils"

const DAY_MS = 24 * 60 * 60 * 1000

function formatTime(date: Date): string {
  const hh = String(date.getHours()).padStart(2, "0")
  const mm = String(date.getMinutes()).padStart(2, "0")
  return `${hh}:${mm}`
}

function formatDate(date: Date): string {
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`
}

export function formatTimeRange(entry: TimelineEntry): string {
  const start = new Date(entry.startDate)
  if (!entry.endDate) return `${formatTime(start)}`
  const end = new Date(entry.endDate)
  const sameDay = start.toDateString() === end.toDateString()
  if (sameDay) return `${formatTime(start)} – ${formatTime(end)}`
  const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / DAY_MS))
  return `${formatDate(start)} ${formatTime(start)} → ${formatDate(end)} ${formatTime(end)} · ${days}d`
}

interface EntryTimeLabelProps {
  entry: TimelineEntry
  className?: string
}

export function EntryTimeLabel({ entry, className }: EntryTimeLabelProps) {
  const isMilestone = !entry.endDate
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-medium tracking-tight",
        isMilestone ? "text-amber-700" : "text-[#555555]",
        className
      )}
    >
      <span aria-hidden>{isMilestone ? "◆" : "▮"}</span>
      <span>{formatTimeRange(entry)}</span>
    </span>
  )
}

interface CutoffChipProps {
  note: string
  className?: string
}

export function CutoffChip({ note, className }: CutoffChipProps) {
  const cutoff = extractCutoff(note)
  if (!cutoff) return null
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-900",
        className
      )}
    >
      <Clock className="size-3" aria-hidden />
      Cutoff {cutoff.label}
    </span>
  )
}
