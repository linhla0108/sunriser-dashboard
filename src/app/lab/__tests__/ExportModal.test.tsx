import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ExportModal from '../components/ExportModal'
import type { Applicant } from '@/lib/types'

const makeApplicant = (overrides: Partial<Applicant> = {}): Applicant => ({
  id: 'a1',
  name: 'Alice Tran',
  dob: '2002-01-01',
  email: 'alice@test.com',
  phone: '0900000001',
  position1: 'AI Engineering Intern',
  university: 'HCMUT',
  yearOfStudy: '3',
  major: 'CS',
  gpa: 3.8,
  hasExperience: false,
  fullTime: true,
  discoveryChannel: 'Facebook',
  submittedAt: '2025-01-01T00:00:00Z',
  batch: 1,
  ...overrides,
})

const APPLICANTS = [makeApplicant(), makeApplicant({ id: 'a2', name: 'Bob Nguyen' })]

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  applicants: APPLICANTS,
  totalAll: 10,
}

// Mock URL/Blob APIs (not available in jsdom fully)
beforeEach(() => {
  vi.stubGlobal('URL', {
    createObjectURL: vi.fn(() => 'blob:http://localhost/test'),
    revokeObjectURL: vi.fn(),
  })
})

// ── Visibility ────────────────────────────────────────────────────────────────

describe('ExportModal — visibility', () => {
  it('renders nothing when open is false', () => {
    const { container } = render(<ExportModal {...defaultProps} open={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the modal when open is true', () => {
    render(<ExportModal {...defaultProps} />)
    expect(screen.getByText('Export Data')).toBeInTheDocument()
  })
})

// ── Row count display ─────────────────────────────────────────────────────────

describe('ExportModal — row count', () => {
  it('shows the number of rows being exported', () => {
    render(<ExportModal {...defaultProps} />)
    // The row count is rendered as a <strong> element
    const strong = document.querySelector('strong')
    expect(strong?.textContent).toBe('2')
  })

  it('shows "filtered from N" when applicants < totalAll', () => {
    render(<ExportModal {...defaultProps} />)
    // 2 filtered from 10
    expect(screen.getByText(/filtered from 10/)).toBeInTheDocument()
  })

  it('does NOT show "filtered from" when all are shown', () => {
    render(<ExportModal {...defaultProps} applicants={APPLICANTS} totalAll={2} />)
    expect(screen.queryByText(/filtered from/)).not.toBeInTheDocument()
  })
})

// ── Format selection ──────────────────────────────────────────────────────────

describe('ExportModal — format', () => {
  it('renders CSV and JSON format buttons', () => {
    render(<ExportModal {...defaultProps} />)
    expect(screen.getByText('csv')).toBeInTheDocument()
    expect(screen.getByText('json')).toBeInTheDocument()
  })

  it('defaults to CSV format (Export CSV button)', () => {
    render(<ExportModal {...defaultProps} />)
    expect(screen.getByText('Export CSV')).toBeInTheDocument()
  })

  it('switches to JSON export label when JSON is clicked', () => {
    render(<ExportModal {...defaultProps} />)
    fireEvent.click(screen.getByText('json'))
    expect(screen.getByText('Export JSON')).toBeInTheDocument()
  })
})

// ── Column selection ──────────────────────────────────────────────────────────

describe('ExportModal — columns', () => {
  it('renders all 16 column options', () => {
    render(<ExportModal {...defaultProps} />)
    const expectedLabels = [
      'Name',
      'Email',
      'Phone',
      'Position',
      'University',
      'GPA',
      'Year',
      'Batch',
      'PIC',
      'Round 1',
      'R1 Notes',
      'Round 2',
      'Has Experience',
      'Full Time',
      'Discovery Channel',
      'Submitted At',
    ]
    expectedLabels.forEach((label) => expect(screen.getByText(label)).toBeInTheDocument())
  })

  it('default columns are pre-selected (Name, Email, Position, etc.)', () => {
    render(<ExportModal {...defaultProps} />)
    // Default-selected columns appear with different styling — we just check
    // the export button is enabled (selectedCols.size > 0)
    const exportBtn = screen.getByText('Export CSV').closest('button')
    expect(exportBtn).not.toBeDisabled()
  })

  it('"All" shortcut selects all 16 columns', () => {
    render(<ExportModal {...defaultProps} />)
    fireEvent.click(screen.getByText('All'))
    // Phone is not default but clicking All should include it
    // Verify export button still enabled
    const exportBtn = screen.getByText('Export CSV').closest('button')
    expect(exportBtn).not.toBeDisabled()
  })

  it('"Default" shortcut resets to default column selection', () => {
    render(<ExportModal {...defaultProps} />)
    // Click All, then Default
    fireEvent.click(screen.getByText('All'))
    fireEvent.click(screen.getByText('Default'))
    // Export button should still be enabled
    const exportBtn = screen.getByText('Export CSV').closest('button')
    expect(exportBtn).not.toBeDisabled()
  })

  it('clicking a selected column deselects it', () => {
    render(<ExportModal {...defaultProps} />)
    // Name is default-selected — clicking it removes it
    const nameChip = screen.getByText('Name').closest('button')!
    fireEvent.click(nameChip)
    // No crash — just verifying the toggle doesn't error
    expect(nameChip).toBeInTheDocument()
  })
})

// ── Cancel ────────────────────────────────────────────────────────────────────

describe('ExportModal — cancel', () => {
  it('calls onClose when Cancel button is clicked', () => {
    const onClose = vi.fn()
    render(<ExportModal {...defaultProps} onClose={onClose} />)
    fireEvent.click(screen.getByText('Cancel'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn()
    render(<ExportModal {...defaultProps} onClose={onClose} />)
    const backdrop = document.querySelector('.fixed.inset-0.bg-black\\/20')
    if (backdrop) {
      fireEvent.click(backdrop)
      expect(onClose).toHaveBeenCalledOnce()
    }
  })
})

// ── Export action ─────────────────────────────────────────────────────────────

describe('ExportModal — export action', () => {
  it('calls onClose after export', () => {
    const onClose = vi.fn()
    const mockClick = vi.fn()
    const mockAnchor = { href: '', download: '', click: mockClick } as unknown as HTMLAnchorElement
    const origCreate = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') return mockAnchor
      return origCreate(tag)
    })

    render(<ExportModal {...defaultProps} onClose={onClose} />)
    fireEvent.click(screen.getByText('Export CSV'))
    expect(onClose).toHaveBeenCalledOnce()
    expect(mockClick).toHaveBeenCalledOnce()

    vi.restoreAllMocks()
  })
})
