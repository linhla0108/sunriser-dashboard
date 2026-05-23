import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { TooltipProvider } from "@/components/ui/tooltip"
import type { Applicant } from "@/lib/types"
import { GalleryView } from "../GalleryView"
import { PipelineView } from "../PipelineView"

vi.mock("@dnd-kit/core", async importOriginal => {
  const actual = await importOriginal<typeof import("@dnd-kit/core")>()
  return { ...actual, DndContext: ({ children }: { children: React.ReactNode }) => <>{children}</> }
})

vi.mock("@dnd-kit/sortable", async importOriginal => {
  const actual = await importOriginal<typeof import("@dnd-kit/sortable")>()
  return {
    ...actual,
    SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useSortable: () => ({
      attributes: {},
      listeners: {},
      setNodeRef: vi.fn(),
      transform: null,
      transition: undefined,
      isDragging: false,
    }),
  }
})

const applicants: Applicant[] = [
  {
    id: "a1",
    name: "An Nguyen",
    dob: "2000-01-01",
    email: "an@example.com",
    phone: "0900000001",
    position1: "AI Engineering Intern",
    university: "University A",
    yearOfStudy: "Nam 3",
    major: "Computer Science",
    gpa: 8.8,
    hasExperience: true,
    fullTime: false,
    discoveryChannel: "Facebook",
    submittedAt: "2026-05-01",
    batch: 1,
    round1Result: "Passed",
  },
]

function TestProviders({ children }: { children: React.ReactNode }) {
  return <TooltipProvider delay={0}>{children}</TooltipProvider>
}

describe("V2 candidate views", () => {
  it("renders pipeline columns and candidate cards", () => {
    render(<PipelineView data={applicants} />, { wrapper: TestProviders })

    expect(screen.getByText("Pipeline")).toBeInTheDocument()
    expect(screen.getByText("Pass")).toBeInTheDocument()
    expect(screen.getByText("An Nguyen")).toBeInTheDocument()
  })

  it("highlights the search query in pipeline cards", () => {
    render(<PipelineView data={applicants} searchQuery="Nguyen" />, { wrapper: TestProviders })

    expect(screen.getByText("Nguyen").tagName).toBe("MARK")
  })

  it("renders gallery cards with pin actions", () => {
    render(<GalleryView data={applicants} />, { wrapper: TestProviders })

    expect(screen.getByText("An Nguyen")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /pin to compare/i })).toBeInTheDocument()
  })

  it("highlights the search query in gallery cards", () => {
    render(<GalleryView data={applicants} searchQuery="University" />, { wrapper: TestProviders })

    expect(screen.getByText("University").tagName).toBe("MARK")
  })
})
