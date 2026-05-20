"use client"

import { useState } from "react"
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
import { useCandidateFilters } from "@/lib/candidates/useCandidateFilters"
import { usePagination } from "@/lib/candidates/usePagination"
import { mockApplicants } from "@/lib/mockData"
import { useViewState } from "@/lib/views/useViewState"
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
  const { view } = useViewState()
  const [applicants, setApplicants] = useState<Applicant[]>(mockApplicants)
  const [detailApplicant, setDetailApplicant] = useState<Applicant | null>(null)

  const {
    search, setSearch,
    positionFilter, setPositionFilter,
    batchFilter, setBatchFilter,
    resultFilter, setResultFilter,
    hasFilters,
    clearFilters,
    filtered,
  } = useCandidateFilters(applicants)

  const { currentPage, totalPages, startIndex, endIndex, canGoPrev, canGoNext, goPrev, goNext } =
    usePagination(filtered.length)

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
          hasFilters={hasFilters}
          total={applicants.length}
          filteredCount={filtered.length}
          onSearchChange={setSearch}
          onPositionChange={setPositionFilter}
          onBatchChange={setBatchFilter}
          onResultChange={setResultFilter}
          onClearAll={clearFilters}
        />
        {view === "table" ? (
          <TableView
            data={pagedData}
            onDataChange={handleReorder}
            onViewDetail={setDetailApplicant}
            indexOffset={startIndex}
            paginationInfo={{ start: startIndex, end: endIndex, total: filtered.length, currentPage, totalPages }}
          />
        ) : null}
        {view === "pipeline" ? (
          <ThemedView
            shadcnComponent={PipelineView}
            skeletonComponent={PipelineViewSkeleton}
            props={{ data: filtered, onReorder: handleReorder, onViewDetail: setDetailApplicant }}
          />
        ) : null}
        {view === "chart" ? <ChartView data={filtered} /> : null}
        {view === "gallery" ? (
          <ThemedView
            shadcnComponent={GalleryView}
            skeletonComponent={GalleryViewSkeleton}
            props={{ data: filtered, onReorder: handleReorder, onViewDetail: setDetailApplicant }}
          />
        ) : null}
      </div>
      <ViewPillNav pagination={{ canGoPrev, canGoNext, goPrev, goNext }} />
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
