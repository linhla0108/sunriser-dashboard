import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ApplicantDetailDrawer } from "@/components/views/ApplicantDetailDrawer"
import type { Applicant } from "@/lib/types"

const applicant: Applicant = {
  id: "candidate-1",
  name: "Linh Tran",
  dob: "2003-02-10",
  email: "linh@example.com",
  phone: "0901000001",
  position1: "Product Design Intern",
  university: "HCMUS",
  yearOfStudy: "Year 3",
  major: "Product Design",
  gpa: 3.6,
  hasExperience: true,
  experienceDesc: "Interned on a campus product team",
  fullTime: true,
  discoveryChannel: "LinkedIn",
  submittedAt: "2026-05-20",
  batch: 2,
  round1Result: "Passed",
  note: "Strong portfolio review",
}

function Providers({ children }: { children: React.ReactNode }) {
  return <TooltipProvider delay={0}>{children}</TooltipProvider>
}

describe("ApplicantDetailDrawer", () => {
  it("renders candidate detail inside a dialog", async () => {
    render(<ApplicantDetailDrawer applicant={applicant} open={true} onOpenChange={vi.fn()} />, { wrapper: Providers })

    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Linh Tran" })).toBeInTheDocument()
    expect(screen.getByText("Profile")).toBeInTheDocument()
    expect(screen.getByText("Contact")).toBeInTheDocument()
    expect(screen.getByText("Source")).toBeInTheDocument()

    await userEvent.click(screen.getByRole("tab", { name: "Notes" }))
    expect(screen.getByDisplayValue("Strong portfolio review")).toBeInTheDocument()

    const dialogContent = document.querySelector('[data-slot="dialog-content"]')
    expect(dialogContent).toHaveClass("grid-rows-[auto_auto_minmax(0,1fr)]", "sm:max-w-5xl")
  })

  it("calls onOpenChange when the close button is clicked", async () => {
    const onOpenChange = vi.fn()

    render(<ApplicantDetailDrawer applicant={applicant} open={true} onOpenChange={onOpenChange} />, { wrapper: Providers })

    await userEvent.click(screen.getByRole("button", { name: /close/i }))

    expect(onOpenChange).toHaveBeenCalled()
    expect(onOpenChange.mock.calls[0]?.[0]).toBe(false)
  })
})
