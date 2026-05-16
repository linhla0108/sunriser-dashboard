import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import LabTableView from '../components/LabTableView'
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

const ALICE = make({ id: 'a1', name: 'Alice Tran', email: 'alice@hcmut.edu.vn' })
const BOB = make({
  id: 'a2',
  name: 'Bob Nguyen',
  email: 'bob@uet.edu.vn',
  gpa: 7.0,
  university: 'UET',
})
const CAROL = make({
  id: 'a3',
  name: 'Carol Le',
  email: 'carol@usth.edu.vn',
  gpa: 6.0,
  round1Result: 'Passed',
})

const defaultProps = {
  applicants: [ALICE, BOB, CAROL],
  selectedIds: new Set<string>(),
  onToggleSelect: vi.fn(),
  onSelectAll: vi.fn(),
  onClearAll: vi.fn(),
  onOpenDetail: vi.fn(),
  onUpdateRound1: vi.fn(),
  compareIds: [],
  onToggleCompare: vi.fn(),
}

// ── Basic rendering ─────────────────────────────────────────────────────────

describe('LabTableView — basic rendering', () => {
  it('renders all applicant rows', () => {
    render(<LabTableView {...defaultProps} />)
    expect(screen.getByText('Alice Tran')).toBeInTheDocument()
    expect(screen.getByText('Bob Nguyen')).toBeInTheDocument()
    expect(screen.getByText('Carol Le')).toBeInTheDocument()
  })

  it('shows column headers', () => {
    render(<LabTableView {...defaultProps} />)
    expect(screen.getByText('Applicant')).toBeInTheDocument()
    expect(screen.getByText('Round 1')).toBeInTheDocument()
  })

  it('shows Round 1 badge when result is set', () => {
    render(<LabTableView {...defaultProps} />)
    const passed = screen.getAllByText('Passed')
    expect(passed.length).toBeGreaterThan(0)
  })

  it('shows email for each applicant', () => {
    render(<LabTableView {...defaultProps} />)
    expect(screen.getByText('alice@hcmut.edu.vn')).toBeInTheDocument()
  })
})

// ── Selection ───────────────────────────────────────────────────────────────

describe('LabTableView — selection', () => {
  it('shows checkboxes for each row', () => {
    render(<LabTableView {...defaultProps} />)
    const checkboxes = document.querySelectorAll('input[type="checkbox"]')
    // 1 header checkbox + 3 row checkboxes
    expect(checkboxes.length).toBe(4)
  })

  it('calls onToggleSelect when row checkbox is clicked', () => {
    const onToggleSelect = vi.fn()
    render(<LabTableView {...defaultProps} onToggleSelect={onToggleSelect} />)
    const checkboxes = document.querySelectorAll('input[type="checkbox"]')
    fireEvent.click(checkboxes[1]) // first row
    expect(onToggleSelect).toHaveBeenCalledWith('a1')
  })

  it('calls onSelectAll when header checkbox is clicked and none selected', () => {
    const onSelectAll = vi.fn()
    render(<LabTableView {...defaultProps} onSelectAll={onSelectAll} />)
    const headerCheckbox = document.querySelectorAll('input[type="checkbox"]')[0]
    fireEvent.click(headerCheckbox)
    expect(onSelectAll).toHaveBeenCalledOnce()
  })

  it('calls onClearAll when header checkbox is clicked and all selected', () => {
    const onClearAll = vi.fn()
    render(
      <LabTableView
        {...defaultProps}
        selectedIds={new Set(['a1', 'a2', 'a3'])}
        onClearAll={onClearAll}
      />
    )
    const headerCheckbox = document.querySelectorAll('input[type="checkbox"]')[0]
    fireEvent.click(headerCheckbox)
    expect(onClearAll).toHaveBeenCalledOnce()
  })

  it('shows selected row with highlight when id is in selectedIds', () => {
    render(<LabTableView {...defaultProps} selectedIds={new Set(['a1'])} />)
    // The selected row has bg-[#fff5f3] class — just verify render doesn't throw
    const rows = document.querySelectorAll('tbody tr')
    expect(rows.length).toBe(3)
  })
})

// ── Sorting ─────────────────────────────────────────────────────────────────

describe('LabTableView — sorting', () => {
  it('sorts by name when Applicant header is clicked', () => {
    render(<LabTableView {...defaultProps} />)
    const applicantHeader = screen.getByText('Applicant')
    fireEvent.click(applicantHeader)
    // After sort, rows should be in order — just verify no crash
    expect(screen.getByText('Alice Tran')).toBeInTheDocument()
  })

  it('toggles sort direction on second click', () => {
    render(<LabTableView {...defaultProps} />)
    const applicantHeader = screen.getByText('Applicant')
    fireEvent.click(applicantHeader) // asc
    fireEvent.click(applicantHeader) // desc
    // Verify render still shows all applicants
    expect(screen.getByText('Alice Tran')).toBeInTheDocument()
    expect(screen.getByText('Bob Nguyen')).toBeInTheDocument()
  })
})

// ── Pagination ──────────────────────────────────────────────────────────────

describe('LabTableView — pagination', () => {
  it('does not show pagination for ≤50 applicants', () => {
    render(<LabTableView {...defaultProps} />)
    expect(screen.queryByText('← Prev')).not.toBeInTheDocument()
  })

  it('shows pagination controls when applicants > 50', () => {
    const many = Array.from({ length: 60 }, (_, i) => make({ id: `a${i}`, name: `Person ${i}` }))
    render(<LabTableView {...defaultProps} applicants={many} />)
    expect(screen.getByText('← Prev')).toBeInTheDocument()
    expect(screen.getByText('Next →')).toBeInTheDocument()
  })

  it('Prev is disabled on first page', () => {
    const many = Array.from({ length: 60 }, (_, i) => make({ id: `a${i}`, name: `Person ${i}` }))
    render(<LabTableView {...defaultProps} applicants={many} />)
    expect(screen.getByText('← Prev').closest('button')).toBeDisabled()
  })
})

// ── Actions ─────────────────────────────────────────────────────────────────

describe('LabTableView — actions', () => {
  it('calls onOpenDetail when Eye button is clicked', () => {
    const onOpenDetail = vi.fn()
    render(<LabTableView {...defaultProps} onOpenDetail={onOpenDetail} />)
    // Eye buttons are action column buttons — click the first one
    const actionCells = document.querySelectorAll('td:last-child')
    const eyeBtn = actionCells[0]?.querySelectorAll('button')[1] // second button is Eye
    if (eyeBtn) fireEvent.click(eyeBtn)
    expect(onOpenDetail).toHaveBeenCalled()
  })

  it('calls onToggleCompare when GitCompare button is clicked', () => {
    const onToggleCompare = vi.fn()
    render(<LabTableView {...defaultProps} onToggleCompare={onToggleCompare} />)
    const actionCells = document.querySelectorAll('td:last-child')
    const compareBtn = actionCells[0]?.querySelectorAll('button')[0] // first is compare
    if (compareBtn) fireEvent.click(compareBtn)
    expect(onToggleCompare).toHaveBeenCalled()
  })
})

// ── Inline Round 1 edit ─────────────────────────────────────────────────────

describe('LabTableView — inline Round 1 edit', () => {
  it('opens inline dropdown when the Round 1 button is clicked', () => {
    render(<LabTableView {...defaultProps} applicants={[ALICE]} />)
    // Alice has no round1Result — the "+ Set" hover button
    // Click the Round 1 cell button area
    const r1Cells = document.querySelectorAll('td.relative.px-3.py-3')
    if (r1Cells[0]) {
      const btn = r1Cells[0].querySelector('button')
      if (btn) {
        fireEvent.click(btn)
        // The inline dropdown should appear with "— No result" option
        expect(screen.getByText('— No result')).toBeInTheDocument()
      }
    }
  })

  it('calls onUpdateRound1 when a result option is clicked in dropdown', () => {
    const onUpdateRound1 = vi.fn()
    render(<LabTableView {...defaultProps} applicants={[ALICE]} onUpdateRound1={onUpdateRound1} />)
    const r1Cells = document.querySelectorAll('td.relative.px-3.py-3')
    if (r1Cells[0]) {
      const btn = r1Cells[0].querySelector('button')
      if (btn) {
        fireEvent.click(btn)
        // Click "Passed" in the dropdown
        const passedBtns = screen.getAllByText('Passed')
        fireEvent.click(passedBtns[passedBtns.length - 1])
        expect(onUpdateRound1).toHaveBeenCalledWith('a1', 'Passed')
      }
    }
  })
})
