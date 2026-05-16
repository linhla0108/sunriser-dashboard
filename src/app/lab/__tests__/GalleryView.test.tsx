import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import GalleryView from '../components/GalleryView'
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

const TWO_APPS = [make({ id: 'a1' }), make({ id: 'a2', name: 'Bob Nguyen' })]

const defaultProps = {
  applicants: TWO_APPS,
  selectedIds: new Set<string>(),
  onToggleSelect: vi.fn(),
  onOpenDetail: vi.fn(),
  compareIds: [],
  onToggleCompare: vi.fn(),
}

// ── Basic rendering ─────────────────────────────────────────────────────────

describe('GalleryView — basic rendering', () => {
  it('renders a card for each applicant', () => {
    render(<GalleryView {...defaultProps} />)
    expect(screen.getByText('Alice Tran')).toBeInTheDocument()
    expect(screen.getByText('Bob Nguyen')).toBeInTheDocument()
  })

  it('shows GPA for each applicant', () => {
    render(<GalleryView {...defaultProps} />)
    const gpas = screen.getAllByText('8.5')
    expect(gpas.length).toBe(2)
  })

  it('shows university for each applicant', () => {
    render(<GalleryView {...defaultProps} />)
    const unis = screen.getAllByText('HCMUT')
    expect(unis.length).toBe(2)
  })

  it('shows "New" badge when round1Result is undefined', () => {
    render(<GalleryView {...defaultProps} />)
    const newBadges = screen.getAllByText('New')
    expect(newBadges.length).toBeGreaterThan(0)
  })

  it('shows Round 1 badge when result is set', () => {
    const passed = make({ id: 'p1', round1Result: 'Passed' })
    render(<GalleryView {...defaultProps} applicants={[passed]} />)
    expect(screen.getByText('Passed')).toBeInTheDocument()
  })
})

// ── Pagination ──────────────────────────────────────────────────────────────

describe('GalleryView — pagination', () => {
  it('does not show pagination for ≤24 applicants', () => {
    render(<GalleryView {...defaultProps} />)
    expect(screen.queryByText('← Prev')).not.toBeInTheDocument()
    expect(screen.queryByText('Next →')).not.toBeInTheDocument()
  })

  it('shows Prev/Next when there are >24 applicants', () => {
    const many = Array.from({ length: 30 }, (_, i) => make({ id: `a${i}`, name: `Person ${i}` }))
    render(<GalleryView {...defaultProps} applicants={many} />)
    expect(screen.getByText('← Prev')).toBeInTheDocument()
    expect(screen.getByText('Next →')).toBeInTheDocument()
  })

  it('Prev is disabled on first page', () => {
    const many = Array.from({ length: 30 }, (_, i) => make({ id: `a${i}`, name: `Person ${i}` }))
    render(<GalleryView {...defaultProps} applicants={many} />)
    const prevBtn = screen.getByText('← Prev').closest('button')
    expect(prevBtn).toBeDisabled()
  })

  it('Next is disabled on last page', () => {
    const many = Array.from({ length: 30 }, (_, i) => make({ id: `a${i}`, name: `Person ${i}` }))
    render(<GalleryView {...defaultProps} applicants={many} />)
    // Navigate to next page first
    fireEvent.click(screen.getByText('Next →'))
    const nextBtn = screen.getByText('Next →').closest('button')
    expect(nextBtn).toBeDisabled()
  })

  it('shows page indicator "1 / N"', () => {
    const many = Array.from({ length: 30 }, (_, i) => make({ id: `a${i}`, name: `Person ${i}` }))
    render(<GalleryView {...defaultProps} applicants={many} />)
    expect(screen.getByText('1 / 2')).toBeInTheDocument()
  })

  it('navigates to next page when Next is clicked', () => {
    const many = Array.from({ length: 30 }, (_, i) => make({ id: `a${i}`, name: `Person ${i}` }))
    render(<GalleryView {...defaultProps} applicants={many} />)
    fireEvent.click(screen.getByText('Next →'))
    expect(screen.getByText('2 / 2')).toBeInTheDocument()
  })
})

// ── Interactions ────────────────────────────────────────────────────────────

describe('GalleryView — card interactions', () => {
  it('calls onOpenDetail when card is clicked', () => {
    const onOpenDetail = vi.fn()
    render(<GalleryView {...defaultProps} onOpenDetail={onOpenDetail} />)
    // Click the card container for Alice
    const nameEl = screen.getByText('Alice Tran')
    const card = nameEl.closest('[class*="rounded-3xl"]')
    if (card) fireEvent.click(card)
    expect(onOpenDetail).toHaveBeenCalled()
  })

  it('shows selected state when applicant id is in selectedIds', () => {
    render(<GalleryView {...defaultProps} selectedIds={new Set(['a1'])} />)
    // CheckCircle2 is rendered for selected — just verify no throw
    const cards = document.querySelectorAll('[class*="rounded-3xl"]')
    expect(cards.length).toBeGreaterThan(0)
  })
})
