import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import type { Applicant } from "@/lib/types"
import ApplicantTable, { reorderApplicantsWithinList } from "../ApplicantTable"

vi.mock("@dnd-kit/core", async importOriginal => {
  const actual = await importOriginal<typeof import("@dnd-kit/core")>()
  return {
    ...actual,
    DndContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    DragOverlay: ({ children }: { children: React.ReactNode }) => <>{children}</>,
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
    name: "Charlie",
    dob: "2000-01-01",
    email: "c@example.com",
    phone: "0900000001",
    position1: "Game Design Intern",
    university: "VNU",
    yearOfStudy: "Năm 3",
    major: "CS",
    gpa: 8.0,
    hasExperience: false,
    fullTime: false,
    discoveryChannel: "Facebook",
    submittedAt: "2026-05-01",
    batch: 2,
    pic: "Quỳnh",
    round1Result: "Passed",
    round2Result: "Passed",
  },
  {
    id: "a2",
    name: "Alice",
    dob: "2001-01-01",
    email: "a@example.com",
    phone: "0900000002",
    position1: "AI Engineering Intern",
    university: "HUST",
    yearOfStudy: "Năm 2",
    major: "AI",
    gpa: 9.0,
    hasExperience: true,
    fullTime: true,
    discoveryChannel: "LinkedIn",
    submittedAt: "2026-05-02",
    batch: 1,
    pic: "Nhiên",
    round1Result: "Failed",
    round2Result: undefined,
  },
  {
    id: "a3",
    name: "Bob",
    dob: "2002-01-01",
    email: "b@example.com",
    phone: "0900000003",
    position1: "Data Analysis Intern",
    university: "UEL",
    yearOfStudy: "Năm 4",
    major: "Data",
    gpa: 7.5,
    hasExperience: false,
    fullTime: false,
    discoveryChannel: "Referral",
    submittedAt: "2026-05-03",
    batch: 3,
    pic: undefined,
    round1Result: undefined,
    round2Result: undefined,
  },
]

describe("ApplicantTable — 3-state column sort", () => {
  it("reorders applicants within a constrained list", () => {
    const reordered = reorderApplicantsWithinList(applicants, "a1", "a3")
    expect(reordered.map(a => a.id)).toEqual(["a2", "a3", "a1"])
    expect(reorderApplicantsWithinList(applicants, "missing", "a3")).toBe(applicants)
  })

  it("renders all 9 sortable column buttons (excluding # and Actions)", () => {
    render(<ApplicantTable data={applicants} />)
    const headerRow = screen.getAllByRole("row")[0]
    const buttons = within(headerRow).getAllByRole("button")
    // Strip icons — get just the text portion of each button label
    const labels = buttons.map(b => b.textContent?.replace(/\s+/g, " ").trim())
    const sortCols = ["Name", "Position", "University", "GPA", "Year", "Batch", "PIC", "Round 1", "Round 2"]
    for (const col of sortCols) {
      expect(labels.some(l => l?.startsWith(col))).toBe(true)
    }
    expect(labels.some(l => l?.startsWith("Actions"))).toBe(false)
  })

  it("starts with Name sorted asc (default initial state)", () => {
    render(<ApplicantTable data={applicants} />)
    const names = screen
      .getAllByRole("row")
      .slice(1)
      .map(r => within(r).getAllByRole("cell")[1].textContent?.trim() ?? "")
    // Alice < Bob < Charlie alphabetically
    expect(names[0]).toContain("Alice")
    expect(names[1]).toContain("Bob")
    expect(names[2]).toContain("Charlie")
  })

  it("cycles Name: asc → desc → default (original order)", async () => {
    render(<ApplicantTable data={applicants} />)
    const headerRow0 = screen.getAllByRole("row")[0]
    const nameBtn = within(headerRow0)
      .getAllByRole("button")
      .find(b => b.textContent?.trim().startsWith("Name"))!

    // Currently asc (initial). Click → desc
    await userEvent.click(nameBtn)
    const namesDesc = screen
      .getAllByRole("row")
      .slice(1)
      .map(r => within(r).getAllByRole("cell")[1].textContent?.trim() ?? "")
    expect(namesDesc[0]).toContain("Charlie")
    expect(namesDesc[2]).toContain("Alice")

    // Click → clear (original prop order: Charlie, Alice, Bob)
    await userEvent.click(nameBtn)
    const namesDefault = screen
      .getAllByRole("row")
      .slice(1)
      .map(r => within(r).getAllByRole("cell")[1].textContent?.trim() ?? "")
    expect(namesDefault[0]).toContain("Charlie")
    expect(namesDefault[1]).toContain("Alice")
    expect(namesDefault[2]).toContain("Bob")
  })

  it("sorts GPA asc → desc → default", async () => {
    render(<ApplicantTable data={applicants} />)
    const headerRow0 = screen.getAllByRole("row")[0]
    const gpaBtn = within(headerRow0)
      .getAllByRole("button")
      .find(b => b.textContent?.trim().startsWith("GPA"))!

    // Click GPA (new col) → asc: Bob(7.5) Alice(8.0 wrong — Charlie=8.0, Alice=9.0) wait...
    // Bob=7.5, Charlie=8.0, Alice=9.0
    await userEvent.click(gpaBtn)
    const gpaCells = screen
      .getAllByRole("row")
      .slice(1)
      .map(r => {
        const cells = within(r).getAllByRole("cell")
        return cells[1].textContent?.trim() ?? ""
      })
    expect(gpaCells[0]).toContain("Bob")
    expect(gpaCells[2]).toContain("Alice")

    // Click → desc: Alice, Charlie, Bob
    await userEvent.click(gpaBtn)
    const gpaDesc = screen
      .getAllByRole("row")
      .slice(1)
      .map(r => within(r).getAllByRole("cell")[1].textContent?.trim() ?? "")
    expect(gpaDesc[0]).toContain("Alice")
    expect(gpaDesc[2]).toContain("Bob")

    // Click → default
    await userEvent.click(gpaBtn)
    const gpaDefault = screen
      .getAllByRole("row")
      .slice(1)
      .map(r => within(r).getAllByRole("cell")[1].textContent?.trim() ?? "")
    expect(gpaDefault[0]).toContain("Charlie")
    expect(gpaDefault[1]).toContain("Alice")
    expect(gpaDefault[2]).toContain("Bob")
  })

  it("switching to a new column resets previous column to neutral and starts asc", async () => {
    render(<ApplicantTable data={applicants} />)
    // Name is asc by default. Click Batch header sort button (new col) → asc
    const headerRow = screen.getAllByRole("row")[0]
    const batchBtn = within(headerRow)
      .getAllByRole("button")
      .find(b => b.textContent?.trim().startsWith("Batch"))!
    await userEvent.click(batchBtn)
    // Batch asc: a2(batch 1)=Alice, a1(batch 2)=Charlie, a3(batch 3)=Bob
    const names = screen
      .getAllByRole("row")
      .slice(1)
      .map(r => within(r).getAllByRole("cell")[1].textContent?.trim() ?? "")
    expect(names[0]).toContain("Alice")
  })

  it("undefined round1/round2 values sort to the bottom in both asc and desc", async () => {
    render(<ApplicantTable data={applicants} />)
    const headerRow = screen.getAllByRole("row")[0]
    const round1Btn = within(headerRow)
      .getAllByRole("button")
      .find(b => b.textContent?.trim().startsWith("Round 1"))!

    // asc: Failed, Passed, undefined(Bob)
    await userEvent.click(round1Btn)
    const r1Names = screen
      .getAllByRole("row")
      .slice(1)
      .map(r => within(r).getAllByRole("cell")[1].textContent?.trim() ?? "")
    expect(r1Names[2]).toContain("Bob") // Bob has no round1Result

    // desc: Passed, Failed, undefined(Bob)
    await userEvent.click(round1Btn)
    const r1NamesDesc = screen
      .getAllByRole("row")
      .slice(1)
      .map(r => within(r).getAllByRole("cell")[1].textContent?.trim() ?? "")
    expect(r1NamesDesc[2]).toContain("Bob") // still last
  })

  it("undefined pic values sort to the bottom in both asc and desc", async () => {
    render(<ApplicantTable data={applicants} />)
    const headerRow = screen.getAllByRole("row")[0]
    const picBtn = within(headerRow)
      .getAllByRole("button")
      .find(b => b.textContent?.trim().startsWith("PIC"))!

    // asc: Nhiên(Alice), Quỳnh(Charlie), undefined(Bob)
    await userEvent.click(picBtn)
    const picNames = screen
      .getAllByRole("row")
      .slice(1)
      .map(r => within(r).getAllByRole("cell")[1].textContent?.trim() ?? "")
    expect(picNames[2]).toContain("Bob")

    // desc: Quỳnh(Charlie), Nhiên(Alice), undefined(Bob)
    await userEvent.click(picBtn)
    const picNamesDesc = screen
      .getAllByRole("row")
      .slice(1)
      .map(r => within(r).getAllByRole("cell")[1].textContent?.trim() ?? "")
    expect(picNamesDesc[2]).toContain("Bob")
  })

  it("renders selected rows in a collapsible section above filtered rows", async () => {
    render(
      <ApplicantTable
        data={[applicants[1]]}
        selectedData={[applicants[0]]}
        selectedIds={new Set(["a1"])}
        selectedSectionOpen={true}
        onSelectedSectionOpenChange={vi.fn()}
      />
    )

    expect(screen.getByText("Selected candidates: 1")).toBeInTheDocument()
    expect(screen.getByText("Filtered results · 1")).toBeInTheDocument()

    const rowTexts = screen.getAllByRole("row").map(row => row.textContent ?? "")
    const selectedRowIndex = rowTexts.findIndex(text => text.includes("Charlie"))
    const dividerIndex = rowTexts.findIndex(text => text.includes("Filtered results · 1"))
    const filteredRowIndex = rowTexts.findIndex(text => text.includes("Alice"))

    expect(selectedRowIndex).toBeGreaterThan(-1)
    expect(dividerIndex).toBeGreaterThan(selectedRowIndex)
    expect(filteredRowIndex).toBeGreaterThan(dividerIndex)
  })

  it("collapses selected rows while keeping the selected section header", async () => {
    const onSelectedSectionOpenChange = vi.fn()
    render(
      <ApplicantTable
        data={[applicants[1]]}
        selectedData={[applicants[0]]}
        selectedIds={new Set(["a1"])}
        selectedSectionOpen={false}
        onSelectedSectionOpenChange={onSelectedSectionOpenChange}
      />
    )

    expect(screen.getByText("Selected candidates: 1")).toBeInTheDocument()
    expect(screen.queryByText("Charlie")).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole("button", { name: /expand selected candidates/i }))
    expect(onSelectedSectionOpenChange).toHaveBeenCalledWith(true)
  })
})
