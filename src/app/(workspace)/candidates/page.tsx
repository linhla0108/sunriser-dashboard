"use client"

import { useState } from "react"
import { ChartView } from "@/components/v2/views/ChartView"
import { GalleryView } from "@/components/v2/views/GalleryView"
import { GalleryViewSkeleton } from "@/components/v2/views/GalleryView.skeleton"
import { PipelineView } from "@/components/v2/views/PipelineView"
import { PipelineViewSkeleton } from "@/components/v2/views/PipelineView.skeleton"
import { TableView } from "@/components/v2/views/TableView"
import { ThemedView } from "@/components/v2/views/ThemedView"
import { ApplicantDetailDrawer } from "@/components/v2/views/ApplicantDetailDrawer"
import { ViewPillNav } from "@/components/v2/layout/ViewPillNav"
import { CandidateFiltersBar } from "@/components/v2/candidates/CandidateFiltersBar"
import { useCandidateFilters } from "@/lib/v2/candidates/useCandidateFilters"
import { mockApplicants } from "@/lib/mockData"
import { useViewState } from "@/lib/v2/views/useViewState"
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
        {view === "table" ? <TableView data={filtered} onDataChange={handleReorder} onViewDetail={setDetailApplicant} /> : null}
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
      <ViewPillNav />
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
