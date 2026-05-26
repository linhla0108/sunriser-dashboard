"use client"

import { Plus, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TIMELINE_BATCHES, type TimelineBatch } from "@/lib/types"
import { cn } from "@/lib/utils"

const BATCH_STYLES: Record<TimelineBatch, string> = {
  "1": "bg-sky-100 text-sky-900 border-sky-300",
  "2": "bg-violet-100 text-violet-900 border-violet-300",
  "3": "bg-orange-100 text-orange-900 border-orange-300",
  HR: "bg-emerald-100 text-emerald-900 border-emerald-300",
  General: "bg-stone-100 text-stone-700 border-stone-300",
}

interface ScheduleFiltersBarProps {
  search: string
  batch: string[]
  hasFilters: boolean
  total: number
  filteredCount: number
  onSearchChange: (v: string) => void
  onBatchToggle: (b: string) => void
  onClearAll: () => void
  onAddEntry: () => void
}

export function ScheduleFiltersBar({
  search,
  batch,
  hasFilters,
  total,
  filteredCount,
  onSearchChange,
  onBatchToggle,
  onClearAll,
  onAddEntry,
}: ScheduleFiltersBarProps) {
  const batchSet = new Set(batch)

  return (
    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Search aria-hidden className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={event => onSearchChange(event.target.value)}
            placeholder="Search todo, PIC, note…"
            className="h-9 rounded-2xl border-[#e2e2e2] bg-white pl-9 text-sm"
            aria-label="Search timeline entries"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {TIMELINE_BATCHES.map(item => {
            const active = batchSet.has(item)
            return (
              <button
                key={item}
                type="button"
                onClick={() => onBatchToggle(item)}
                aria-pressed={active}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                  active ? BATCH_STYLES[item] : "border-[#e2e2e2] bg-white text-[#555555] hover:border-[#cccccc] hover:bg-[#f9f9f9]"
                )}
              >
                {item}
              </button>
            )
          })}
        </div>
        {hasFilters ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-muted-foreground hover:text-foreground h-8 gap-1 rounded-full text-xs"
          >
            <X className="size-3.5" />
            Clear
          </Button>
        ) : null}
        <span className="text-muted-foreground ml-1 text-xs">
          {filteredCount} / {total} entries
        </span>
      </div>
      <Button type="button" onClick={onAddEntry} className="bg-primary hover:bg-primary/90 h-9 gap-1.5 rounded-full px-4 text-sm font-semibold">
        <Plus className="size-4" />
        New entry
      </Button>
    </div>
  )
}
