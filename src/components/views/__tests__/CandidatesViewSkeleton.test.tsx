import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { CandidatesPageSkeleton } from "../CandidatesViewSkeleton"
import { GalleryViewSkeleton } from "../GalleryView.skeleton"
import { PipelineViewSkeleton } from "../PipelineView.skeleton"

describe("candidate loading skeletons", () => {
  it("renders the candidates page skeleton", () => {
    render(<CandidatesPageSkeleton />)

    expect(screen.getByTestId("candidates-loading-skeleton")).toBeInTheDocument()
  })

  it("renders real pipeline and gallery skeleton components", () => {
    render(
      <>
        <PipelineViewSkeleton />
        <GalleryViewSkeleton />
      </>
    )

    expect(screen.getByTestId("pipeline-loading-skeleton")).toBeInTheDocument()
    expect(screen.getByTestId("gallery-loading-skeleton")).toBeInTheDocument()
  })
})
