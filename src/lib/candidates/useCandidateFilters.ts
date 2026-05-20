import { useMemo, useState } from "react"
import type { Applicant } from "@/lib/types"

export interface CandidateFilters {
  search: string
  positionFilter: string
  batchFilter: string
  resultFilter: string
}

export function useCandidateFilters(data: Applicant[]) {
  const [search, setSearch] = useState("")
  const [positionFilter, setPositionFilter] = useState("")
  const [batchFilter, setBatchFilter] = useState("")
  const [resultFilter, setResultFilter] = useState("")

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

  function clearFilters() {
    setSearch("")
    setPositionFilter("")
    setBatchFilter("")
    setResultFilter("")
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
