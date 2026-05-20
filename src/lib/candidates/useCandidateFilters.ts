import { useMemo, useState } from "react"
import type { Applicant } from "@/lib/types"

export interface CandidateFilters {
  search: string
  positionFilter: string
  batchFilter: string
  resultFilter: string
}

interface CandidateFilterOptions extends Partial<CandidateFilters> {
  onSearchChange?: (value: string) => void
  onPositionChange?: (value: string) => void
  onBatchChange?: (value: string) => void
  onResultChange?: (value: string) => void
  onClearFilters?: () => void
}

export function useCandidateFilters(data: Applicant[], options: CandidateFilterOptions = {}) {
  const [internalSearch, setInternalSearch] = useState("")
  const [internalPositionFilter, setInternalPositionFilter] = useState("")
  const [internalBatchFilter, setInternalBatchFilter] = useState("")
  const [internalResultFilter, setInternalResultFilter] = useState("")

  const search = options.search ?? internalSearch
  const positionFilter = options.positionFilter ?? internalPositionFilter
  const batchFilter = options.batchFilter ?? internalBatchFilter
  const resultFilter = options.resultFilter ?? internalResultFilter

  const filtered = useMemo(() => {
    let result = data

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        a =>
          a.name.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          a.position1.toLowerCase().includes(q) ||
          a.university.toLowerCase().includes(q)
      )
    }

    if (positionFilter) result = result.filter(a => a.position1 === positionFilter)
    if (batchFilter) result = result.filter(a => a.batch === Number(batchFilter))
    if (resultFilter) result = result.filter(a => a.round1Result === resultFilter)

    return result
  }, [data, search, positionFilter, batchFilter, resultFilter])

  const hasFilters = !!(search || positionFilter || batchFilter || resultFilter)

  const setSearch = options.onSearchChange ?? setInternalSearch
  const setPositionFilter = options.onPositionChange ?? setInternalPositionFilter
  const setBatchFilter = options.onBatchChange ?? setInternalBatchFilter
  const setResultFilter = options.onResultChange ?? setInternalResultFilter

  function clearFilters() {
    if (options.onClearFilters) {
      options.onClearFilters()
    } else {
      setInternalSearch("")
      setInternalPositionFilter("")
      setInternalBatchFilter("")
      setInternalResultFilter("")
    }
  }

  return {
    search,
    setSearch,
    positionFilter,
    setPositionFilter,
    batchFilter,
    setBatchFilter,
    resultFilter,
    setResultFilter,
    hasFilters,
    clearFilters,
    filtered,
  }
}
