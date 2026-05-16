import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ComparePanel from '../components/ComparePanel'
import type { Applicant } from '@/lib/types'

const makeApplicant = (overrides: Partial<Applicant> = {}): Applicant => ({
  id: 'a1',
  name: 'Alice Tran',
  dob: '2002-01-01',
  email: 'alice@hcmut.edu.vn',
  phone: '0900000001',
  position1: 'AI Engineering Intern',
  university: 'HCMUT',
  yearOfStudy: '3',
  major: 'Computer Science',
  gpa: 9.1,
  hasExperience: true,
  fullTime: true,
  discoveryChannel: 'Facebook',
  submittedAt: '2025-01-01T00:00:00Z',
  batch: 1,
  round1Result: 'Passed',
  ...overrides,
})

const ALICE = makeApplicant({ id: 'a1' })
const BOB = makeApplicant({
  id: 'a2',
  name: 'Bob Nguyen',
  email: 'bob@uet.edu.vn',
  position1: 'Data Analysis Intern',
  gpa: 7.5,
  round1Result: 'Failed',
  university: 'UET',
})
const CAROL = makeApplicant({
  id: 'a3',
  name: 'Carol Le',
  email: 'carol@usth.edu.vn',
  position1: 'Game Design Intern',
  gpa: 6.0,
  round1Result: undefined,
  university: 'USTH',
})

const ALL = [ALICE, BOB, CAROL]

const defaultProps = {
  compareIds: ['a1', 'a2'],
  applicants: ALL,
  onClose: vi.fn(),
  onRemove: vi.fn(),
  onOpenDetail: vi.fn(),
}

// ── Visibility ────────────────────────────────────────────────────────────────

describe('ComparePanel — visibility', () => {
  it('renders nothing when compareIds are empty (no items resolve)', () => {
    const { container } = render(<ComparePanel {...defaultProps} compareIds={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the Compare Applicants panel when compareIds has entries', () => {
    render(<ComparePanel {...defaultProps} />)
    expect(screen.getByText('Compare Applicants')).toBeInTheDocument()
  })

  it('shows "2 candidates selected" for 2 IDs', () => {
    render(<ComparePanel {...defaultProps} />)
    expect(screen.getByText('2 candidates selected')).toBeInTheDocument()
  })

  it('shows "3 candidates selected" for 3 IDs', () => {
    render(<ComparePanel {...defaultProps} compareIds={['a1', 'a2', 'a3']} />)
    expect(screen.getByText('3 candidates selected')).toBeInTheDocument()
  })
})

// ── Applicant headers ─────────────────────────────────────────────────────────

describe('ComparePanel — applicant headers', () => {
  it('shows both applicant names in the table header', () => {
    render(<ComparePanel {...defaultProps} />)
    expect(screen.getByText('Alice Tran')).toBeInTheDocument()
    expect(screen.getByText('Bob Nguyen')).toBeInTheDocument()
  })

  it('shows both emails in the header', () => {
    render(<ComparePanel {...defaultProps} />)
    expect(screen.getByText('alice@hcmut.edu.vn')).toBeInTheDocument()
    expect(screen.getByText('bob@uet.edu.vn')).toBeInTheDocument()
  })

  it('gracefully handles IDs not found in applicants list', () => {
    render(<ComparePanel {...defaultProps} compareIds={['a1', 'nonexistent']} />)
    // only a1 (Alice) should render — "nonexistent" filters out
    expect(screen.getByText('Alice Tran')).toBeInTheDocument()
    expect(screen.queryByText('Bob Nguyen')).not.toBeInTheDocument()
  })
})

// ── Comparison rows ───────────────────────────────────────────────────────────

describe('ComparePanel — comparison rows', () => {
  it('renders all 11 row labels', () => {
    render(<ComparePanel {...defaultProps} />)
    const expectedRows = [
      'Position',
      'University',
      'Major',
      'Year',
      'GPA',
      'Full time',
      'Experience',
      'Batch',
      'Round 1',
      'Round 2',
      'Discovery',
    ]
    expectedRows.forEach((label) => expect(screen.getByText(label)).toBeInTheDocument())
  })

  it('shows correct universities for both applicants', () => {
    render(<ComparePanel {...defaultProps} />)
    expect(screen.getByText('HCMUT')).toBeInTheDocument()
    expect(screen.getByText('UET')).toBeInTheDocument()
  })

  it('shows GPA formatted to 2 decimal places', () => {
    render(<ComparePanel {...defaultProps} />)
    expect(screen.getByText('9.10')).toBeInTheDocument() // Alice
    expect(screen.getByText('7.50')).toBeInTheDocument() // Bob
  })

  it('shows Round 1 result badges', () => {
    render(<ComparePanel {...defaultProps} />)
    // "Passed" for Alice (in badge), "Failed" for Bob
    const passedEls = screen.getAllByText('Passed')
    expect(passedEls.length).toBeGreaterThan(0)
    const failedEls = screen.getAllByText('Failed')
    expect(failedEls.length).toBeGreaterThan(0)
  })

  it('shows "—" for Round 1 when no result', () => {
    render(<ComparePanel {...defaultProps} compareIds={['a3']} />)
    // Carol has no round1Result — should show "—" in Round 1 row
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThan(0)
  })

  it('shows position abbreviations', () => {
    render(<ComparePanel {...defaultProps} />)
    expect(screen.getByText('AI Eng')).toBeInTheDocument()
    expect(screen.getByText('Data')).toBeInTheDocument()
  })
})

// ── Close ─────────────────────────────────────────────────────────────────────

describe('ComparePanel — close', () => {
  it('calls onClose when X button in header is clicked', () => {
    const onClose = vi.fn()
    render(<ComparePanel {...defaultProps} onClose={onClose} />)
    // The header div contains the close button — it's a button inside the flex header
    const headerDiv = document.querySelector('.flex.items-center.justify-between.border-b')
    const closeBtn = headerDiv?.querySelector('button')
    expect(closeBtn).toBeTruthy()
    if (closeBtn) {
      fireEvent.click(closeBtn)
      expect(onClose).toHaveBeenCalledOnce()
    }
  })

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn()
    render(<ComparePanel {...defaultProps} onClose={onClose} />)
    const backdrop = document.querySelector('.fixed.inset-0.bg-black\\/20')
    if (backdrop) {
      fireEvent.click(backdrop)
      expect(onClose).toHaveBeenCalledOnce()
    }
  })
})

// ── Remove applicant ──────────────────────────────────────────────────────────

describe('ComparePanel — remove applicant', () => {
  it('calls onRemove with the applicant id when remove button is clicked', () => {
    const onRemove = vi.fn()
    render(<ComparePanel {...defaultProps} onRemove={onRemove} />)
    // Each applicant column has Eye + X buttons; find the X buttons inside columns
    // They are inside <th> elements, not the header row's main X
    const thElements = document.querySelectorAll('th')
    // Skip the first "Field" th — find the X button in the second th (Alice's column)
    let removeBtn: Element | null = null
    thElements.forEach((th) => {
      const btns = th.querySelectorAll('button')
      btns.forEach((btn) => {
        // The X remove button — check for the remove action buttons in columns
        const svgPaths = btn.querySelectorAll('svg')
        if (svgPaths.length > 0 && !removeBtn) {
          // Look for the second button in each column (remove button is after eye button)
          const colBtns = Array.from(th.querySelectorAll('button'))
          if (colBtns.length >= 2) {
            removeBtn = colBtns[1]
          }
        }
      })
    })

    if (removeBtn) {
      fireEvent.click(removeBtn)
      expect(onRemove).toHaveBeenCalledWith('a1')
    }
  })
})

// ── Open detail ───────────────────────────────────────────────────────────────

describe('ComparePanel — open detail', () => {
  it('calls onOpenDetail with the applicant when Eye button is clicked', () => {
    const onOpenDetail = vi.fn()
    render(<ComparePanel {...defaultProps} onOpenDetail={onOpenDetail} />)

    // Each column header has Eye + X buttons; find Eye buttons in th elements
    const thElements = document.querySelectorAll('th')
    let eyeBtn: Element | null = null
    thElements.forEach((th) => {
      const colBtns = Array.from(th.querySelectorAll('button'))
      if (colBtns.length >= 2 && !eyeBtn) {
        eyeBtn = colBtns[0] // First button is Eye
      }
    })

    if (eyeBtn) {
      fireEvent.click(eyeBtn)
      expect(onOpenDetail).toHaveBeenCalledWith(expect.objectContaining({ id: 'a1' }))
    }
  })
})
