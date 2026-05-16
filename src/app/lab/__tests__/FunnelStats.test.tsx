import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FunnelStats from '../components/FunnelStats'
import type { Applicant } from '@/lib/types'

const makeApplicant = (overrides: Partial<Applicant> = {}): Applicant => ({
  id: Math.random().toString(36).slice(2),
  name: 'Test User',
  dob: '2002-01-01',
  email: 'test@test.com',
  phone: '0900000000',
  position1: 'AI Engineering Intern',
  university: 'HCMUT',
  yearOfStudy: '3',
  major: 'CS',
  gpa: 3.5,
  hasExperience: false,
  fullTime: true,
  discoveryChannel: 'Facebook',
  submittedAt: '2025-01-01T00:00:00Z',
  batch: 1,
  ...overrides,
})

const APPLICANTS: Applicant[] = [
  makeApplicant({ round1Result: 'Passed' }),
  makeApplicant({ round1Result: 'Passed' }),
  makeApplicant({ round1Result: 'Failed' }),
  makeApplicant({ round1Result: 'Waiting list' }),
  makeApplicant({ round1Result: undefined }), // not reviewed
]

// ── Compact summary ───────────────────────────────────────────────────────────

describe('FunnelStats — compact view (collapsed)', () => {
  it('renders the Pipeline label', () => {
    render(<FunnelStats applicants={APPLICANTS} />)
    expect(screen.getByText('Pipeline')).toBeInTheDocument()
  })

  it('shows "passed/total passed" summary text', () => {
    render(<FunnelStats applicants={APPLICANTS} />)
    // 2 Passed out of 5 total
    expect(screen.getByText('2/5 passed')).toBeInTheDocument()
  })

  it('does NOT show expanded breakdown by default', () => {
    render(<FunnelStats applicants={APPLICANTS} />)
    // Expanded labels only visible when expanded
    expect(screen.queryByText('Applied')).not.toBeInTheDocument()
  })
})

// ── Expand/collapse toggle ────────────────────────────────────────────────────

describe('FunnelStats — expand/collapse', () => {
  it('shows breakdown grid when the button is clicked', () => {
    render(<FunnelStats applicants={APPLICANTS} />)
    const toggleButton = screen.getByRole('button')
    fireEvent.click(toggleButton)
    expect(screen.getByText('Applied')).toBeInTheDocument()
    expect(screen.getByText('Reviewed')).toBeInTheDocument()
    expect(screen.getByText('Passed R1')).toBeInTheDocument()
    expect(screen.getByText('Waitlisted')).toBeInTheDocument()
    expect(screen.getByText('Failed R1')).toBeInTheDocument()
    expect(screen.getByText('Round 2')).toBeInTheDocument()
  })

  it('collapses breakdown when button is clicked again', () => {
    render(<FunnelStats applicants={APPLICANTS} />)
    const toggleButton = screen.getByRole('button')
    fireEvent.click(toggleButton) // expand
    fireEvent.click(toggleButton) // collapse
    expect(screen.queryByText('Applied')).not.toBeInTheDocument()
  })

  it('shows correct counts in expanded view', () => {
    render(<FunnelStats applicants={APPLICANTS} />)
    fireEvent.click(screen.getByRole('button'))

    // Applied = 5, Reviewed = 4 (those with a result), Passed = 2, Waitlisted = 1, Failed = 1, Round2 = 0
    const cells = screen.getAllByText(/^\d+$/) // all numeric text nodes
    const counts = cells.map((el) => parseInt(el.textContent || '0'))
    expect(counts).toContain(5) // Applied
    expect(counts).toContain(4) // Reviewed
    expect(counts).toContain(2) // Passed R1
    expect(counts).toContain(1) // Waitlisted & Failed
  })
})

// ── Edge case: empty applicants ───────────────────────────────────────────────

describe('FunnelStats — empty state', () => {
  it('shows 0/0 passed with no applicants', () => {
    render(<FunnelStats applicants={[]} />)
    expect(screen.getByText('0/0 passed')).toBeInTheDocument()
  })

  it('does not crash when expanded with zero applicants', () => {
    render(<FunnelStats applicants={[]} />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('Applied')).toBeInTheDocument()
  })
})
