import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { TooltipProvider } from "@/components/ui/tooltip"
import type { Applicant } from "@/lib/types"
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
    pic: "Quỳnh",
    round1Result: "Passed",
  },
  {
    id: "a2",
    name: "Binh Tran",
    dob: "2001-02-02",
    email: "binh@example.com",
    phone: "0900000002",
    position1: "Data Analysis Intern",
    university: "University B",
    yearOfStudy: "Nam 4",
    major: "Data Science",
    gpa: 7.9,
    hasExperience: false,
    fullTime: true,
    discoveryChannel: "LinkedIn",
    submittedAt: "2026-05-02",
    batch: 2,
    pic: "Nhiên",
    round1Result: "Waiting list",
  },
]

function TestProviders({ children }: { children: React.ReactNode }) {
  return <TooltipProvider delay={0}>{children}</TooltipProvider>
}

describe("TableView", () => {
  beforeEach(() => localStorage.clear())

  it("renders applicant table rows with a pin action per row", () => {
    render(<TableView data={applicants} />, { wrapper: TestProviders })

    expect(screen.getByText("An Nguyen")).toBeInTheDocument()
    expect(screen.getByText("Binh Tran")).toBeInTheDocument()
    expect(screen.getAllByRole("button", { name: /pin to compare/i })).toHaveLength(2)
  })

  it("toggles a row pin state without breaking table actions", async () => {
    render(<TableView data={applicants} />, { wrapper: TestProviders })

    const row = screen.getByText("An Nguyen").closest("tr")
    expect(row).not.toBeNull()

    await userEvent.click(within(row!).getByRole("button", { name: /pin to compare/i }))

    expect(within(row!).getByRole("button", { name: /unpin candidate/i })).toHaveAttribute("aria-pressed", "true")
  })

  it("emits updated table data when a round chip option changes", async () => {
    const onDataChange = vi.fn()

    render(<TableView data={applicants} onDataChange={onDataChange} />, { wrapper: TestProviders })

    const row = screen.getByText("An Nguyen").closest("tr")
    expect(row).not.toBeNull()

    await userEvent.click(within(row!).getByRole("button", { name: /passed/i }))
    await userEvent.click(screen.getByRole("button", { name: /failed/i }))

    expect(onDataChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: "a1",
          round1Result: "Failed",
        }),
      ])
    )
  })

  it("emits updated table data when batch and PIC chips change", async () => {
    const onDataChange = vi.fn()

    render(<TableView data={applicants} onDataChange={onDataChange} />, { wrapper: TestProviders })

    const row = screen.getByText("An Nguyen").closest("tr")
    expect(row).not.toBeNull()

    await userEvent.click(within(row!).getByRole("button", { name: /batch 1/i }))
    await userEvent.click(screen.getByRole("button", { name: /batch 3/i }))

    expect(onDataChange).toHaveBeenLastCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: "a1",
          batch: 3,
        }),
      ])
    )

    await userEvent.click(within(row!).getByRole("button", { name: /quỳnh/i }))
    await userEvent.click(screen.getByRole("button", { name: /huy/i }))

    expect(onDataChange).toHaveBeenLastCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: "a1",
          pic: "Huy",
        }),
      ])
    )
  })
})
