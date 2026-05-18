"use client"

import { ChartView } from "@/components/v2/views/ChartView"
import { GalleryView } from "@/components/v2/views/GalleryView"
import { GalleryViewSkeleton } from "@/components/v2/views/GalleryView.skeleton"
import { PipelineView } from "@/components/v2/views/PipelineView"
import { PipelineViewSkeleton } from "@/components/v2/views/PipelineView.skeleton"
import { TableView } from "@/components/v2/views/TableView"
import { ThemedView } from "@/components/v2/views/ThemedView"
import { ViewPillNav } from "@/components/v2/layout/ViewPillNav"
import { mockApplicants } from "@/lib/mockData"
import { useViewState } from "@/lib/v2/views/useViewState"

export default function CandidatesPage() {
  const { view } = useViewState()

  return (
    <>
      <div className="p-3 sm:p-4 lg:p-6">
        {view === "table" ? <TableView data={mockApplicants} /> : null}
        {view === "pipeline" ? (
          <ThemedView shadcnComponent={PipelineView} skeletonComponent={PipelineViewSkeleton} props={{ data: mockApplicants }} />
        ) : null}
        {view === "gallery" ? (
          <ThemedView shadcnComponent={GalleryView} skeletonComponent={GalleryViewSkeleton} props={{ data: mockApplicants }} />
        ) : null}
        {view === "chart" ? <ChartView data={mockApplicants} /> : null}
      </div>
      <ViewPillNav />
    </>
  )
}
