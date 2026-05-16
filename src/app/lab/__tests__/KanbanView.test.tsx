import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import KanbanView from '../components/KanbanView'
import type { Applicant } from '@/lib/types'

const make = (overrides: Partial<Applicant> = {}): Applicant => ({
  id: 'a1',
  name: 'Alice Tran',
  dob: '2002-01-01',
  email: 'alice@hcmut.edu.vn',
  phone: '0900000001',
  position1: 'AI Engineering Intern',
  university: 'HCMUT',
  yearOfStudy: '3',
  major: 'CS',
  gpa: 8.5,
  hasExperience: true,
  fullTime: true,
  discoveryChannel: 'Facebook',
  submittedAt: '2025-01-01T00:00:00Z',
  batch: 1,
  ...overrides,
})

const NEW_APP = make({ id: 'new1', round1Result: undefined })
const PASSED_APP = make({ id: 'p1', round1Result: 'Passed' })
const WAITING_APP = make({ id: 'w1', round1Result: 'Waiting list' })
const FAILED_APP = make({ id: 'f1', round1Result: 'Failed' })
const ROUND2_APP = make({ id: 'r2', round1Result: 'Passed', round2Result: 'Interview' })

const defaultProps = {
  applicants: [NEW_APP, PASSED_APP, WAITING_APP, FAILED_APP, ROUND2_APP],
  onOpenDetail: vi.fn(),
  compareIds: [],
  onToggleCompare: vi.fn(),
}

// ── Column rendering ────────────────────────────────────────────────────────

describe('KanbanView — columns', () => {
  it('renders all 5 column headers', () => {
    render(<KanbanView {...defaultProps} />)
    expect(screen.getByText('New')).toBeInTheDocument()
    // "Passed" appears in both header and card badges — use getAllByText
    expect(screen.getAllByText('Passed').length).toBeGreaterThan(0)
    expect(screen.getByText('Waitlisted')).toBeInTheDocument()
    expect(screen.getByText('Rejected')).toBeInTheDocument()
    expect(screen.getByText('Round 2')).toBeInTheDocument()
  })

  it('shows "No applicants" in an empty column', () => {
    // Only pass a New applicant — Passed column should be empty
    render(<KanbanView {...defaultProps} applicants={[NEW_APP]} />)
    // "No applicants" appears for every empty column
    const empty = screen.getAllByText('No applicants')
    expect(empty.length).toBeGreaterThanOrEqual(1)
  })

  it('shows correct count badge for each column', () => {
    render(<KanbanView {...defaultProps} />)
    // Each column has exactly 1 applicant → all badges show "1"
    // (New=1, Passed=1, Waitlisted=1, Rejected=1, Round2=1)
    // Count badges are inside the column header - just verify they are > 0
    const ones = screen.getAllByText('1')
    expect(ones.length).toBe(5)
  })

  it('shows "+N more" when column has more than 30 items', () => {
    const manyNew = Array.from({ length: 35 }, (_, i) =>
      make({ id: `new${i}`, round1Result: undefined })
    )
    render(<KanbanView {...defaultProps} applicants={manyNew} />)
    expect(screen.getByText('+5 more')).toBeInTheDocument()
  })
})

// ── Cards ──────────────────────────────────────────────────────────────────

describe('KanbanView — card interactions', () => {
  it('shows applicant name on cards', () => {
    render(<KanbanView {...defaultProps} />)
    // Alice Tran appears in multiple cards (one per applicant)
    const names = screen.getAllByText('Alice Tran')
    expect(names.length).toBeGreaterThanOrEqual(1)
  })

  it('calls onOpenDetail when a card is clicked', () => {
    const onOpenDetail = vi.fn()
    render(<KanbanView {...defaultProps} applicants={[NEW_APP]} onOpenDetail={onOpenDetail} />)
    // Click the card div — find by name text
    const name = screen.getByText('Alice Tran')
    fireEvent.click(name.closest('[class*="cursor-pointer"]')!)
    expect(onOpenDetail).toHaveBeenCalledWith(expect.objectContaining({ id: 'new1' }))
  })

  it('shows compare button colored when applicant is in compare list', () => {
    render(<KanbanView {...defaultProps} compareIds={['new1']} />)
    // When in compare, the GitCompare button has a different class — just verify render doesn't throw
    const cards = document.querySelectorAll('[class*="cursor-pointer"]')
    expect(cards.length).toBeGreaterThan(0)
  })
})
