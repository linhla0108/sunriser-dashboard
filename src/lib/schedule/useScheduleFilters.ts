"use client"

import { useMemo } from "react"
import type { TimelineEntry } from "@/lib/types"

interface UseScheduleFiltersOptions {
  search: string
  batch: string[]
}

export function useScheduleFilters(entries: TimelineEntry[], { search, batch }: UseScheduleFiltersOptions) {
  return useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    const batchSet = new Set(batch)

    return entries.filter(entry => {
      if (batchSet.size > 0) {
        const key = entry.batch.trim() === "" ? "General" : entry.batch
        if (!batchSet.has(key)) return false
      }
      if (normalizedSearch.length > 0) {
        const haystack = `${entry.todo} ${entry.pic} ${entry.note}`.toLowerCase()
        if (!haystack.includes(normalizedSearch)) return false
      }
      return true
    })
  }, [entries, search, batch])
}
