"use client"

import { useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ChartView } from "@/components/views/ChartView"
import { GalleryView } from "@/components/views/GalleryView"
import { GalleryViewSkeleton } from "@/components/views/GalleryView.skeleton"
import { PipelineView } from "@/components/views/PipelineView"
import { PipelineViewSkeleton } from "@/components/views/PipelineView.skeleton"
import { TableView } from "@/components/views/TableView"
import { ThemedView } from "@/components/views/ThemedView"
import { ApplicantDetailDrawer } from "@/components/views/ApplicantDetailDrawer"
import { ViewPillNav } from "@/components/layout/ViewPillNav"
import { CandidateFiltersBar } from "@/components/candidates/CandidateFiltersBar"
import {
  formatCandidateSort,
  parseCandidateUrlState,
  writeCandidateUrlState,
  type CandidatePipelineGroup,
  type CandidateUrlState,
} from "@/lib/candidates/candidateUrlState"
import { useCandidateFilters } from "@/lib/candidates/useCandidateFilters"
import { usePagination } from "@/lib/candidates/usePagination"
import { mockApplicants } from "@/lib/mockData"
import type { Applicant } from "@/lib/types"

function mergeReordered(full: Applicant[], reordered: Applicant[]): Applicant[] {
  const reorderedMap = new Map(reordered.map(a => [a.id, a]))
  const filteredIds = new Set(reordered.map(a => a.id))
  const updated = full.map(item => reorderedMap.get(item.id) ?? item)
  const slots = updated.reduce<number[]>((acc, item, i) => {
    if (filteredIds.has(item.id)) acc.push(i)
    return acc
  }, [])
  const result = [...updated]
  reordered.forEach((item, i) => {
    result[slots[i]] = item
  })
  return result
}

export default function CandidatesPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const urlState = parseCandidateUrlState(searchParams)
  const [applicants, setApplicants] = useState<Applicant[]>(mockApplicants)
  const [detailApplicant, setDetailApplicant] = useState<Applicant | null>(null)

  function updateUrlState(patch: Partial<CandidateUrlState>, options: { resetPage?: boolean } = {}) {
    const params = writeCandidateUrlState(new URLSearchParams(searchParams.toString()), {
      ...patch,
      ...(options.resetPage ? { page: 1 } : null),
    })
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  const {
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
  } = useCandidateFilters(applicants, {
    search: urlState.search,
    positionFilter: urlState.position,
    batchFilter: urlState.batch,
    resultFilter: urlState.result,
    onSearchChange: value => updateUrlState({ search: value }, { resetPage: true }),
    onPositionChange: value => updateUrlState({ position: value }, { resetPage: true }),
    onBatchChange: value => updateUrlState({ batch: value }, { resetPage: true }),
    onResultChange: value => updateUrlState({ result: value }, { resetPage: true }),
    onClearFilters: () => updateUrlState({ search: "", position: "", batch: "", result: "", page: 1 }),
  })

  const { currentPage, totalPages, startIndex, endIndex, canGoPrev, canGoNext, goPrev, goNext } = usePagination(filtered.length, 15, {
    page: urlState.page,
    onPageChange: page => updateUrlState({ page }),
  })

  const pagedData = filtered.slice(startIndex, endIndex)

  function handleReorder(reordered: Applicant[]) {
    setApplicants(prev => mergeReordered(prev, reordered))
  }

  return (
    <>
      <div className="p-3 sm:p-4 lg:p-6">
        <CandidateFiltersBar
          search={search}
          positionFilter={positionFilter}
          batchFilter={batchFilter}
          resultFilter={resultFilter}
          applicants={applicants}
          hasFilters={hasFilters}
          total={applicants.length}
          filteredCount={filtered.length}
          onSearchChange={setSearch}
          onPositionChange={setPositionFilter}
          onBatchChange={setBatchFilter}
          onResultChange={setResultFilter}
          onClearAll={clearFilters}
        />
        {urlState.view === "table" ? (
          <TableView
            key={formatCandidateSort(urlState.sort)}
            data={pagedData}
            onDataChange={handleReorder}
            onViewDetail={setDetailApplicant}
            indexOffset={startIndex}
            paginationInfo={{ start: startIndex, end: endIndex, total: filtered.length, currentPage, totalPages }}
            searchQuery={search}
            sortState={urlState.sort}
            onSortChange={sort => updateUrlState({ sort, page: 1 })}
          />
        ) : null}
        {urlState.view === "pipeline" ? (
          <ThemedView
            shadcnComponent={PipelineView}
            skeletonComponent={PipelineViewSkeleton}
            props={{
              data: filtered,
              onReorder: handleReorder,
              onViewDetail: setDetailApplicant,
              searchQuery: search,
              groupBy: urlState.group,
              onGroupByChange: (group: CandidatePipelineGroup) => updateUrlState({ group }),
            }}
          />
        ) : null}
        {urlState.view === "chart" ? <ChartView data={filtered} /> : null}
        {urlState.view === "gallery" ? (
          <ThemedView
            shadcnComponent={GalleryView}
            skeletonComponent={GalleryViewSkeleton}
            props={{ data: filtered, onReorder: handleReorder, onViewDetail: setDetailApplicant, searchQuery: search }}
          />
        ) : null}
      </div>
      <ViewPillNav view={urlState.view} onViewChange={view => updateUrlState({ view })} pagination={{ canGoPrev, canGoNext, goPrev, goNext }} />
      <ApplicantDetailDrawer
        applicant={detailApplicant}
        open={!!detailApplicant}
        onOpenChange={open => {
          if (!open) setDetailApplicant(null)
        }}
      />
    </>
  )
}
