"use client"

import { useCallback, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ScheduleFiltersBar } from "@/components/schedule/ScheduleFiltersBar"
import { ScheduleViewPillNav } from "@/components/layout/ScheduleViewPillNav"
import { AgendaView } from "@/components/views/schedule/AgendaView"
import { GanttView } from "@/components/views/schedule/GanttView"
import { ScheduleEntryDrawer } from "@/components/views/schedule/ScheduleEntryDrawer"
import { mockTimeline } from "@/lib/mockTimeline"
import { parseScheduleUrlState, writeScheduleUrlState, type ScheduleUrlState } from "@/lib/schedule/scheduleUrlState"
import { useScheduleFilters } from "@/lib/schedule/useScheduleFilters"
import type { TimelineEntry } from "@/lib/types"

function makeEmptyEntry(): TimelineEntry {
  const now = new Date()
  now.setSeconds(0, 0)
  return {
    id: `t-${Date.now()}`,
    startDate: now.toISOString(),
    batch: "",
    todo: "",
    pic: "",
    note: "",
  }
}

export default function SchedulePage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const urlState = parseScheduleUrlState(searchParams)

  const [entries, setEntries] = useState<TimelineEntry[]>(mockTimeline)
  const [drawerEntry, setDrawerEntry] = useState<TimelineEntry | null>(null)
  const [drawerMode, setDrawerMode] = useState<"view" | "edit" | "create">("view")
  const [drawerOpen, setDrawerOpen] = useState(false)

  const filtered = useScheduleFilters(entries, { search: urlState.search, batch: urlState.batch })
  const hasFilters = urlState.search.length > 0 || urlState.batch.length > 0

  const updateUrlState = useCallback(
    (patch: Partial<ScheduleUrlState>) => {
      const params = writeScheduleUrlState(new URLSearchParams(searchParams.toString()), patch)
      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    },
    [searchParams, router, pathname]
  )

  function handleSearchChange(value: string) {
    updateUrlState({ search: value })
  }

  function handleBatchToggle(batch: string) {
    const next = new Set(urlState.batch)
    if (next.has(batch)) next.delete(batch)
    else next.add(batch)
    updateUrlState({ batch: [...next] })
  }

  function handleClearAll() {
    updateUrlState({ search: "", batch: [] })
  }

  function handleSelect(entry: TimelineEntry) {
    setDrawerEntry(entry)
    setDrawerMode("view")
    setDrawerOpen(true)
  }

  function handleAddEntry() {
    setDrawerEntry(makeEmptyEntry())
    setDrawerMode("create")
    setDrawerOpen(true)
  }

  function handleSave(saved: TimelineEntry) {
    setEntries(prev => {
      const exists = prev.some(e => e.id === saved.id)
      if (exists) return prev.map(e => (e.id === saved.id ? saved : e))
      return [...prev, saved]
    })
  }

  function handleDelete(id: string) {
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  return (
    <>
      <div className="p-3 pb-36 sm:p-4 sm:pb-28 lg:p-6 lg:pb-28">
        <ScheduleFiltersBar
          search={urlState.search}
          batch={urlState.batch}
          hasFilters={hasFilters}
          total={entries.length}
          filteredCount={filtered.length}
          onSearchChange={handleSearchChange}
          onBatchToggle={handleBatchToggle}
          onClearAll={handleClearAll}
          onAddEntry={handleAddEntry}
        />
        <div className="hidden sm:block">
          {urlState.view === "gantt" ? (
            <GanttView entries={filtered} onSelect={handleSelect} />
          ) : (
            <AgendaView entries={filtered} onSelect={handleSelect} />
          )}
        </div>
        <div className="sm:hidden">
          <AgendaView entries={filtered} onSelect={handleSelect} />
        </div>
      </div>
      <div className="hidden sm:block">
        <ScheduleViewPillNav view={urlState.view} onViewChange={view => updateUrlState({ view })} />
      </div>
      <ScheduleEntryDrawer
        entry={drawerEntry}
        mode={drawerMode}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </>
  )
}
