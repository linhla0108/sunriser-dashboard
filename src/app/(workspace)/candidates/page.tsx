"use client"

import { useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ChartView } from "@/components/views/ChartView"
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
import { useUploadSession } from "@/lib/upload/UploadSessionContext"
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
  const { uploadSession } = useUploadSession()
  const sourceId = uploadSession?.id ?? "mock"
  const [editedApplicants, setEditedApplicants] = useState<{ sourceId: string; applicants: Applicant[] }>({
    sourceId: "mock",
    applicants: mockApplicants,
  })
  const applicants = editedApplicants.sourceId === sourceId ? editedApplicants.applicants : (uploadSession?.applicants ?? mockApplicants)
  const [detailApplicant, setDetailApplicant] = useState<Applicant | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  function handleToggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleClearSelection() {
    setSelectedIds(new Set())
  }

  function handleBulkBatch(batch: number) {
    setEditedApplicants(prev => ({
      sourceId: prev.sourceId,
      applicants: prev.applicants.map(a => (selectedIds.has(a.id) ? { ...a, batch } : a)),
    }))
  }

  function handleBulkPic(pic: string) {
    setEditedApplicants(prev => ({
      sourceId: prev.sourceId,
      applicants: prev.applicants.map(a => (selectedIds.has(a.id) ? { ...a, pic } : a)),
    }))
  }

  function handleBulkDelete() {
    setEditedApplicants(prev => ({
      sourceId: prev.sourceId,
      applicants: prev.applicants.filter(a => !selectedIds.has(a.id)),
    }))
    setSelectedIds(new Set())
  }

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
    setEditedApplicants({
      sourceId,
      applicants: mergeReordered(applicants, reordered),
    })
  }

  return (
    <>
      <div className="p-3 pb-36 sm:p-4 sm:pb-28 lg:p-6 lg:pb-28">
        {uploadSession ? (
          <div data-cid="uploaded-candidates-banner" className="mb-4 rounded-2xl border border-[#e2e2e2] bg-[#f9f9f9] p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#1b1b1b]">Using uploaded candidates from {uploadSession.dataset.fileName}</p>
                <p className="mt-1 text-xs text-[#767676]">
                  {uploadSession.dataset.rowCount.toLocaleString()} rows · {uploadSession.dataset.columnCount} columns · confirmed{" "}
                  {new Date(uploadSession.confirmedAt).toLocaleTimeString()}
                </p>
              </div>
              <div className="flex max-w-full flex-wrap gap-1.5">
                {uploadSession.dataset.columns.slice(0, 6).map(column => (
                  <span key={column} className="rounded-xl border border-[#e2e2e2] bg-white px-2.5 py-1 text-xs font-medium text-[#555555]">
                    {column}
                  </span>
                ))}
                {uploadSession.dataset.columns.length > 6 ? (
                  <span className="rounded-xl border border-[#e2e2e2] bg-white px-2.5 py-1 text-xs font-medium text-[#767676]">
                    +{uploadSession.dataset.columns.length - 6} more
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
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
          selectedCount={urlState.view === "table" ? selectedIds.size : 0}
          onBulkClear={handleClearSelection}
          onBulkBatch={handleBulkBatch}
          onBulkPic={handleBulkPic}
          onBulkDelete={handleBulkDelete}
        />
        {urlState.view === "table" ? (
          <>
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
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
            />
          </>
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
