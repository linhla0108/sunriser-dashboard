import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { TooltipProvider } from "@/components/ui/tooltip"
import type { Applicant } from "@/lib/types"
import DraggableRow from "@/components/table/DraggableRow"
import { TableView } from "../TableView"

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
    id: "t1",
    name: "Alice Pham",
    dob: "2001-03-15",
    email: "alice@example.com",
    phone: "0900000010",
    position1: "AI Engineering Intern",
    university: "Test University",
    yearOfStudy: "Nam 3",
    major: "Computer Science",
    gpa: 8.5,
    hasExperience: true,
    fullTime: false,
    discoveryChannel: "Facebook",
    submittedAt: "2026-05-01",
    batch: 1,
    round1Result: "Passed",
    pic: "HR Lead",
  },
  {
    id: "t2",
    name: "Bob Le",
    dob: "2000-07-22",
    email: "bob@example.com",
    phone: "0900000020",
    position1: "Data Analysis Intern",
    university: "Other University",
    yearOfStudy: "Nam 4",
    major: "Data Science",
    gpa: 7.9,
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

describe("T15 — Eye button smoke test", () => {
  it("calls onViewDetail with the correct applicant when Eye button is clicked", async () => {
    const onViewDetail = vi.fn()

    render(<TableView data={mockApplicants} onViewDetail={onViewDetail} />, { wrapper: TestProviders })

    const eyeButtons = screen.getAllByRole("button", { name: /view applicant/i })
    expect(eyeButtons.length).toBeGreaterThanOrEqual(2)

    await userEvent.click(eyeButtons[0])

    expect(onViewDetail).toHaveBeenCalledTimes(1)
    expect(onViewDetail).toHaveBeenCalledWith(expect.objectContaining({ id: "t1", name: "Alice Pham" }))
  })

  it("calls onViewDetail with the second applicant when their Eye button is clicked", async () => {
    const onViewDetail = vi.fn()

    render(<TableView data={mockApplicants} onViewDetail={onViewDetail} />, { wrapper: TestProviders })

    const eyeButtons = screen.getAllByRole("button", { name: /view applicant/i })

    await userEvent.click(eyeButtons[1])

    expect(onViewDetail).toHaveBeenCalledTimes(1)
    expect(onViewDetail).toHaveBeenCalledWith(expect.objectContaining({ id: "t2", name: "Bob Le" }))
  })
})

describe("T16 — DraggableRow smoke test", () => {
  it("renders applicant name, position, and grip button", () => {
    render(
      <TestProviders>
        <table>
          <tbody>
            <DraggableRow applicant={mockApplicants[0]} index={0} />
          </tbody>
        </table>
      </TestProviders>
    )

    expect(screen.getByText("Alice Pham")).toBeInTheDocument()
    expect(screen.getByText("AI Engineering")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /grab row to reorder/i })).toBeInTheDocument()
  })

  it("renders the Eye button and triggers onViewDetail", async () => {
    const onViewDetail = vi.fn()

    render(
      <TestProviders>
        <table>
          <tbody>
            <DraggableRow applicant={mockApplicants[0]} index={0} onViewDetail={onViewDetail} />
          </tbody>
        </table>
      </TestProviders>
    )

    const eyeBtn = screen.getByRole("button", { name: /view applicant/i })
    expect(eyeBtn).toBeInTheDocument()

    await userEvent.click(eyeBtn)
    expect(onViewDetail).toHaveBeenCalledWith(mockApplicants[0])
  })

  it("disables the Eye button when no onViewDetail is provided", () => {
    render(
      <TestProviders>
        <table>
          <tbody>
            <DraggableRow applicant={mockApplicants[0]} index={0} />
          </tbody>
        </table>
      </TestProviders>
    )

    expect(screen.getByRole("button", { name: /view applicant/i })).toBeDisabled()
  })
})
