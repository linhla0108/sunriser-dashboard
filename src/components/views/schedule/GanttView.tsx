"use client"

import { Fragment, useMemo, useState } from "react"
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { BatchChip, BATCH_BAR_STYLES } from "@/components/schedule/BatchChip"
import { Button } from "@/components/ui/button"
import { normalizeTimelineBatch, TIMELINE_BATCHES, type TimelineBatch, type TimelineEntry } from "@/lib/types"
import { cn } from "@/lib/utils"

const DAY_MS = 24 * 60 * 60 * 1000
const ZOOM_OPTIONS = [
  { key: "week", label: "Week", days: 7 },
  { key: "2week", label: "2-Week", days: 14 },
  { key: "month", label: "Month", days: 30 },
] as const

type ZoomKey = (typeof ZOOM_OPTIONS)[number]["key"]

function startOfDay(input: Date): Date {
  const d = new Date(input)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(input: Date, days: number): Date {
  const d = new Date(input)
  d.setDate(d.getDate() + days)
  return d
}

function fmtMonthDay(date: Date): string {
  return `${date.toLocaleDateString("en-US", { month: "short" })} ${String(date.getDate()).padStart(2, "0")}`
}

function pickDefaultAnchor(entries: TimelineEntry[]): Date {
  if (entries.length === 0) return startOfDay(new Date())
  const earliest = entries.reduce((min, e) => {
    const d = new Date(e.startDate).getTime()
    return d < min ? d : min
  }, Number.POSITIVE_INFINITY)
  return startOfDay(new Date(earliest))
}

interface GanttViewProps {
  entries: TimelineEntry[]
  onSelect: (entry: TimelineEntry) => void
}

export function GanttView({ entries, onSelect }: GanttViewProps) {
  const [zoom, setZoom] = useState<ZoomKey>("2week")
  const [anchor, setAnchor] = useState<Date>(() => pickDefaultAnchor(entries))
  const [collapsedBatches, setCollapsedBatches] = useState<Set<string>>(new Set())

  const days = ZOOM_OPTIONS.find(o => o.key === zoom)?.days ?? 14
  const windowStart = anchor
  const windowEnd = addDays(windowStart, days)
  const windowDuration = days * DAY_MS

  const today = startOfDay(new Date())

  const dayMarkers = useMemo(() => {
    return Array.from({ length: days + 1 }, (_, i) => addDays(windowStart, i))
  }, [windowStart, days])

  const swimlanes = useMemo(() => {
    const buckets = new Map<TimelineBatch, TimelineEntry[]>()
    TIMELINE_BATCHES.forEach(b => buckets.set(b, []))
    for (const entry of entries) {
      const batch = normalizeTimelineBatch(entry.batch)
      const entryStart = new Date(entry.startDate)
      const entryEnd = entry.endDate ? new Date(entry.endDate) : entryStart
      if (entryEnd.getTime() < windowStart.getTime()) continue
      if (entryStart.getTime() > windowEnd.getTime()) continue
      buckets.get(batch)!.push(entry)
    }
    return TIMELINE_BATCHES.map(batch => ({
      batch,
      entries: buckets.get(batch)!.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()),
    }))
  }, [entries, windowStart, windowEnd])

  const todayInWindow = today.getTime() >= windowStart.getTime() && today.getTime() <= windowEnd.getTime()
  const todayLeftPct = todayInWindow ? ((today.getTime() - windowStart.getTime()) / windowDuration) * 100 : 0

  function shiftAnchor(deltaDays: number) {
    setAnchor(prev => addDays(prev, deltaDays))
  }

  function toggleBatch(batch: string) {
    setCollapsedBatches(prev => {
      const next = new Set(prev)
      if (next.has(batch)) next.delete(batch)
      else next.add(batch)
      return next
    })
  }

  return (
    <div
      className="rounded-3xl border border-[#e8e8e8] bg-white"
      style={{ boxShadow: "rgba(4, 23, 43, 0.03) 0px 0px 0px 1px, rgba(0, 0, 0, 0.04) 0px 8px 16px -4px" }}
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-[#f0f0f0] px-4 py-3">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => shiftAnchor(-days)}
            aria-label="Previous window"
            className="h-8 w-8 rounded-full p-0"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setAnchor(today)} className="h-8 rounded-full px-3 text-xs font-semibold">
            Today
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => shiftAnchor(days)}
            aria-label="Next window"
            className="h-8 w-8 rounded-full p-0"
          >
            <ChevronRight className="size-4" />
          </Button>
          <span className="ml-2 text-xs font-semibold text-[#1b1b1b]">
            {fmtMonthDay(windowStart)} – {fmtMonthDay(addDays(windowEnd, -1))}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-1 rounded-full border border-[#e8e8e8] bg-[#f9f9f9] p-0.5">
          {ZOOM_OPTIONS.map(opt => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setZoom(opt.key)}
              className={cn(
                "rounded-full px-3 py-1 text-[11px] font-semibold transition-colors",
                zoom === opt.key ? "bg-white text-[#1b1b1b] shadow-sm" : "text-[#767676] hover:text-[#1b1b1b]"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          <TimeAxis dayMarkers={dayMarkers} days={days} />
          <div className="relative">
            {todayInWindow ? (
              <div
                className="pointer-events-none absolute top-0 bottom-0 z-10 w-px bg-red-400"
                style={{ left: `calc(180px + (100% - 180px) * ${todayLeftPct / 100})` }}
                aria-hidden
              >
                <span className="absolute -top-5 -translate-x-1/2 rounded-full bg-red-400 px-1.5 py-0.5 text-[10px] font-bold text-white">Today</span>
              </div>
            ) : null}
            {swimlanes.map(lane => (
              <SwimlaneRow
                key={lane.batch}
                batch={lane.batch}
                entries={lane.entries}
                collapsed={collapsedBatches.has(lane.batch)}
                onToggle={() => toggleBatch(lane.batch)}
                windowStart={windowStart}
                windowDuration={windowDuration}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

interface TimeAxisProps {
  dayMarkers: Date[]
  days: number
}

function TimeAxis({ dayMarkers, days }: TimeAxisProps) {
  const showLabel = days <= 14 ? 1 : days <= 21 ? 2 : 3
  return (
    <div className="sticky top-0 z-20 flex border-b border-[#f0f0f0] bg-white">
      <div className="w-[180px] shrink-0 border-r border-[#f0f0f0]" />
      <div className="relative flex flex-1">
        {dayMarkers.slice(0, -1).map((date, i) => {
          const isWeekend = date.getDay() === 0 || date.getDay() === 6
          const show = i % showLabel === 0
          return (
            <div
              key={date.toISOString()}
              className={cn(
                "flex-1 border-l border-[#f5f5f5] py-1.5 text-center text-[10px] font-semibold",
                isWeekend ? "bg-[#fafafa] text-[#999]" : "text-[#555]"
              )}
            >
              {show ? (
                <Fragment>
                  <div className="text-[9px] tracking-wide uppercase opacity-60">{date.toLocaleDateString("en-US", { weekday: "short" })}</div>
                  <div>{date.getDate()}</div>
                </Fragment>
              ) : (
                <div className="opacity-30">·</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface SwimlaneRowProps {
  batch: TimelineBatch
  entries: TimelineEntry[]
  collapsed: boolean
  onToggle: () => void
  windowStart: Date
  windowDuration: number
  onSelect: (entry: TimelineEntry) => void
}

function SwimlaneRow({ batch, entries, collapsed, onToggle, windowStart, windowDuration, onSelect }: SwimlaneRowProps) {
  const hasEntries = entries.length > 0
  return (
    <div className="border-b border-[#f0f0f0] last:border-b-0">
      <button type="button" onClick={onToggle} className="flex w-full items-center gap-2 px-4 py-2 text-left transition-colors hover:bg-[#fafafa]">
        {collapsed ? <ChevronRight className="size-3.5 text-[#999]" /> : <ChevronDown className="size-3.5 text-[#999]" />}
        <BatchChip batch={batch} size="md" />
        <span className="text-[11px] text-[#767676]">{entries.length} active</span>
      </button>
      {!collapsed && hasEntries ? (
        <div className="flex flex-col">
          {entries.map(entry => (
            <EntryRow key={entry.id} entry={entry} windowStart={windowStart} windowDuration={windowDuration} onSelect={() => onSelect(entry)} />
          ))}
        </div>
      ) : null}
      {!collapsed && !hasEntries ? <div className="flex items-center px-4 py-2 pl-12 text-[11px] text-[#999]">No entries in this window</div> : null}
    </div>
  )
}

interface EntryRowProps {
  entry: TimelineEntry
  windowStart: Date
  windowDuration: number
  onSelect: () => void
}

function EntryRow({ entry, windowStart, windowDuration, onSelect }: EntryRowProps) {
  const batch = normalizeTimelineBatch(entry.batch)
  const start = new Date(entry.startDate)
  const end = entry.endDate ? new Date(entry.endDate) : start
  const isMilestone = !entry.endDate

  const startOffset = (start.getTime() - windowStart.getTime()) / windowDuration
  const endOffset = (end.getTime() - windowStart.getTime()) / windowDuration

  const clampedStart = Math.max(0, startOffset)
  const clampedEnd = Math.min(1, endOffset)
  const leftPct = clampedStart * 100
  const widthPct = Math.max(0.5, (clampedEnd - clampedStart) * 100)

  return (
    <div className="group flex items-center border-t border-[#f8f8f8] hover:bg-[#fafafa]">
      <div className="w-[180px] shrink-0 truncate border-r border-[#f0f0f0] px-4 py-2 pl-9 text-[11px] font-medium text-[#1b1b1b]">{entry.todo}</div>
      <div className="relative h-9 flex-1">
        {isMilestone ? (
          <button
            type="button"
            onClick={onSelect}
            aria-label={entry.todo}
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${leftPct}%` }}
          >
            <span
              className={cn("block size-4 rotate-45 border-2 border-white shadow-sm transition-transform hover:scale-110", BATCH_BAR_STYLES[batch])}
            />
          </button>
        ) : (
          <button
            type="button"
            onClick={onSelect}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 rounded-md px-1.5 text-left transition-shadow hover:shadow-md focus:ring-2 focus:ring-[#FF5533]/40 focus:outline-none",
              BATCH_BAR_STYLES[batch],
              "text-white"
            )}
            style={{ left: `${leftPct}%`, width: `${widthPct}%`, minHeight: "20px" }}
          >
            <span className="block truncate text-[10px] font-semibold">{extractCutoffLabel(entry.note)}</span>
          </button>
        )}
      </div>
    </div>
  )
}

function extractCutoffLabel(note: string): string {
  const cutoffPattern = /Cutoff\s*time\s*:\s*(\d{1,2})\/(\d{1,2})/i
  const match = note.match(cutoffPattern)
  if (!match) return ""
  return `⏰ ${match[1].padStart(2, "0")}/${match[2].padStart(2, "0")}`
}
