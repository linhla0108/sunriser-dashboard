"use client"

import { useMemo, useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { BatchChip } from "@/components/schedule/BatchChip"
import { CutoffChip, EntryTimeLabel } from "@/components/schedule/EntryTimeLabel"
import { PicChips } from "@/components/schedule/PicChips"
import { ScheduleEntryContextMenu } from "@/components/schedule/ScheduleEntryContextMenu"
import type { TimelineEntry } from "@/lib/types"
import { cn } from "@/lib/utils"

const DAY_MS = 24 * 60 * 60 * 1000

interface DayGroup {
  key: string
  date: Date
  entries: TimelineEntry[]
}

function startOfDay(input: Date): Date {
  const d = new Date(input)
  d.setHours(0, 0, 0, 0)
  return d
}

function groupByDay(entries: TimelineEntry[]): DayGroup[] {
  const groups = new Map<string, DayGroup>()
  for (const entry of entries) {
    const day = startOfDay(new Date(entry.startDate))
    const key = day.toISOString().slice(0, 10)
    const existing = groups.get(key)
    if (existing) {
      existing.entries.push(entry)
    } else {
      groups.set(key, { key, date: day, entries: [entry] })
    }
  }
  return [...groups.values()].sort((a, b) => a.date.getTime() - b.date.getTime())
}

function formatDayHeader(date: Date): string {
  const today = startOfDay(new Date())
  const diff = Math.round((date.getTime() - today.getTime()) / DAY_MS)
  if (diff === 0) return "Today"
  if (diff === 1) return "Tomorrow"
  if (diff === -1) return "Yesterday"
  const weekday = date.toLocaleDateString("en-US", { weekday: "short" })
  const day = String(date.getDate()).padStart(2, "0")
  const month = date.toLocaleDateString("en-US", { month: "short" })
  return `${weekday} · ${month} ${day}`
}

interface AgendaViewProps {
  entries: TimelineEntry[]
  onSelect: (entry: TimelineEntry) => void
  onEdit: (entry: TimelineEntry) => void
  onDelete: (id: string) => void
}

export function AgendaView({ entries, onSelect, onEdit, onDelete }: AgendaViewProps) {
  const groups = useMemo(() => groupByDay(entries), [entries])

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#e2e2e2] bg-white py-16 text-center">
        <p className="text-sm font-semibold text-[#1b1b1b]">No entries match these filters</p>
        <p className="mt-1 text-xs text-[#767676]">Try clearing batch filters or search.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.map(group => (
        <section key={group.key} className="flex flex-col gap-2">
          <header className="sticky top-0 z-10 -mx-1 flex items-baseline gap-2 bg-gradient-to-b from-[#FCFCFC] via-[#FCFCFC] to-transparent px-1 pt-1 pb-2">
            <h2 className="text-[11px] font-bold tracking-[0.08em] text-[#1b1b1b] uppercase">{formatDayHeader(group.date)}</h2>
            <span className="text-[11px] text-[#767676]">
              {group.entries.length} {group.entries.length === 1 ? "entry" : "entries"}
            </span>
          </header>
          <ul className="flex flex-col gap-2.5">
            {group.entries.map(entry => (
              <AgendaCard
                key={entry.id}
                entry={entry}
                onSelect={() => onSelect(entry)}
                onEdit={() => onEdit(entry)}
                onDelete={() => onDelete(entry.id)}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

interface AgendaCardProps {
  entry: TimelineEntry
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
}

function AgendaCard({ entry, onSelect, onEdit, onDelete }: AgendaCardProps) {
  const [noteOpen, setNoteOpen] = useState(false)
  const trimmedNote = entry.note.trim()

  return (
    <li>
      <ScheduleEntryContextMenu entry={entry} onView={() => onSelect()} onEdit={() => onEdit()} onDelete={() => onDelete()}>
        <article
          className="group rounded-3xl border border-[#e8e8e8] bg-white p-4 transition-shadow hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
          style={{ boxShadow: "rgba(4, 23, 43, 0.03) 0px 0px 0px 1px, rgba(0, 0, 0, 0.04) 0px 8px 16px -4px" }}
        >
          <button type="button" onClick={onSelect} className="block w-full text-left">
            <div className="flex flex-wrap items-center gap-2">
              <BatchChip batch={entry.batch} />
              <EntryTimeLabel entry={entry} />
              {trimmedNote ? <CutoffChip note={trimmedNote} /> : null}
            </div>
            <h3 className="mt-2 text-sm font-semibold text-[#1b1b1b] group-hover:text-[#FF5533]">{entry.todo}</h3>
            {entry.pic.trim() ? (
              <div className="mt-2.5">
                <PicChips raw={entry.pic} variant="stacked" />
              </div>
            ) : null}
          </button>
          {trimmedNote ? (
            <div className="mt-3 border-t border-[#f0f0f0] pt-2.5">
              <button
                type="button"
                onClick={() => setNoteOpen(v => !v)}
                className="flex w-full items-center gap-1.5 text-[11px] font-semibold tracking-wide text-[#767676] uppercase transition-colors hover:text-[#1b1b1b]"
                aria-expanded={noteOpen}
              >
                {noteOpen ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
                Note
              </button>
              {noteOpen ? <p className={cn("mt-2 text-xs leading-relaxed whitespace-pre-line text-[#555555]")}>{trimmedNote}</p> : null}
            </div>
          ) : null}
        </article>
      </ScheduleEntryContextMenu>
    </li>
  )
}
