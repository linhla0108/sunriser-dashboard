import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { TooltipProvider } from "@/components/ui/tooltip"
import type { Applicant } from "@/lib/types"
import { PipelineView } from "../PipelineView"

vi.mock("@dnd-kit/core", async importOriginal => {
  const actual = await importOriginal<typeof import("@dnd-kit/core")>()
  return {
    ...actual,
    DndContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  }
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

const mockApplicants: Applicant[] = [
  {
    id: "p1",
    name: "Chi Nguyen",
    dob: "2001-01-10",
    email: "chi@example.com",
    phone: "0900000030",
    position1: "AI Engineering Intern",
    university: "University A",
    yearOfStudy: "Nam 3",
    major: "Computer Science",
    gpa: 9.0,
    hasExperience: true,
    fullTime: false,
    discoveryChannel: "Facebook",
    submittedAt: "2026-05-01",
    batch: 1,
    round1Result: "Passed",
  },
  {
    id: "p2",
    name: "Duc Tran",
    dob: "2000-06-20",
    email: "duc@example.com",
    phone: "0900000040",
    position1: "Data Analysis Intern",
    university: "University B",
    yearOfStudy: "Nam 4",
    major: "Data Science",
    gpa: 7.5,
    hasExperience: false,
    fullTime: true,
    discoveryChannel: "LinkedIn",
    submittedAt: "2026-05-02",
    batch: 2,
    round1Result: "Waiting list",
  },
]

function TestProviders({ children }: { children: React.ReactNode }) {
  return <TooltipProvider delay={0}>{children}</TooltipProvider>
}

describe("T17 — PipelineView smoke test", () => {
  it("renders the Pipeline heading", () => {
    render(<PipelineView data={mockApplicants} />, { wrapper: TestProviders })

    expect(screen.getByText("Pipeline")).toBeInTheDocument()
  })

  it("renders candidate names inside pipeline cards", () => {
    render(<PipelineView data={mockApplicants} />, { wrapper: TestProviders })

    expect(screen.getByText("Chi Nguyen")).toBeInTheDocument()
    expect(screen.getByText("Duc Tran")).toBeInTheDocument()
  })

  it("renders pipeline columns for different round1 results", () => {
    render(<PipelineView data={mockApplicants} />, { wrapper: TestProviders })

    expect(screen.getByText("Pass")).toBeInTheDocument()
    expect(screen.getByText("Waiting")).toBeInTheDocument()
  })

  it("renders View buttons on pipeline cards", () => {
    render(<PipelineView data={mockApplicants} />, { wrapper: TestProviders })

    const viewButtons = screen.getAllByRole("button", { name: /^view$/i })
    expect(viewButtons.length).toBeGreaterThanOrEqual(2)
  })

  it("calls onViewDetail when a View button is clicked", async () => {
    const onViewDetail = vi.fn()

    render(<PipelineView data={mockApplicants} onViewDetail={onViewDetail} />, { wrapper: TestProviders })

    const viewButtons = screen.getAllByRole("button", { name: /^view$/i })
    await userEvent.click(viewButtons[0])

    expect(onViewDetail).toHaveBeenCalledTimes(1)
    expect(onViewDetail).toHaveBeenCalledWith(expect.objectContaining({ name: "Chi Nguyen" }))
  })
})
