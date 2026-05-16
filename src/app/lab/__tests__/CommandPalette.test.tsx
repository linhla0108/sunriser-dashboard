import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CommandPalette from '../components/CommandPalette'
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

const ALICE = make({ id: 'a1', name: 'Alice Tran' })
const BOB = make({ id: 'a2', name: 'Bob Nguyen', email: 'bob@uet.edu.vn', university: 'UET' })

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  applicants: [ALICE, BOB],
  onViewChange: vi.fn(),
  onExport: vi.fn(),
  onFilterBuilder: vi.fn(),
  onOpenDetail: vi.fn(),
  onClearFilters: vi.fn(),
}

// ── Visibility ──────────────────────────────────────────────────────────────

describe('CommandPalette — visibility', () => {
  it('renders nothing when open=false', () => {
    const { container } = render(<CommandPalette {...defaultProps} open={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the palette when open=true', () => {
    render(<CommandPalette {...defaultProps} />)
    expect(screen.getByPlaceholderText('Search actions or applicants...')).toBeInTheDocument()
  })
})

// ── Actions ─────────────────────────────────────────────────────────────────

describe('CommandPalette — actions', () => {
  it('renders 6 default actions when query is empty', () => {
    render(<CommandPalette {...defaultProps} />)
    expect(screen.getByText('Switch to Table view')).toBeInTheDocument()
    expect(screen.getByText('Switch to Pipeline view')).toBeInTheDocument()
    expect(screen.getByText('Switch to Gallery view')).toBeInTheDocument()
    expect(screen.getByText('Export data')).toBeInTheDocument()
    expect(screen.getByText('Open filter builder')).toBeInTheDocument()
    expect(screen.getByText('Clear all filters')).toBeInTheDocument()
  })

  it('filters commands by query', () => {
    render(<CommandPalette {...defaultProps} />)
    const input = screen.getByPlaceholderText('Search actions or applicants...')
    fireEvent.change(input, { target: { value: 'table' } })
    expect(screen.getByText('Switch to Table view')).toBeInTheDocument()
    expect(screen.queryByText('Export data')).not.toBeInTheDocument()
  })

  it('calls onViewChange and onClose when "Switch to Table view" is clicked', () => {
    const onViewChange = vi.fn()
    const onClose = vi.fn()
    render(<CommandPalette {...defaultProps} onViewChange={onViewChange} onClose={onClose} />)
    fireEvent.click(screen.getByText('Switch to Table view'))
    expect(onViewChange).toHaveBeenCalledWith('table')
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onExport and onClose when "Export data" is clicked', () => {
    const onExport = vi.fn()
    const onClose = vi.fn()
    render(<CommandPalette {...defaultProps} onExport={onExport} onClose={onClose} />)
    fireEvent.click(screen.getByText('Export data'))
    expect(onExport).toHaveBeenCalledOnce()
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClearFilters and onClose when "Clear all filters" is clicked', () => {
    const onClearFilters = vi.fn()
    const onClose = vi.fn()
    render(<CommandPalette {...defaultProps} onClearFilters={onClearFilters} onClose={onClose} />)
    fireEvent.click(screen.getByText('Clear all filters'))
    expect(onClearFilters).toHaveBeenCalledOnce()
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('shows no results message when query matches nothing', () => {
    render(<CommandPalette {...defaultProps} />)
    const input = screen.getByPlaceholderText('Search actions or applicants...')
    fireEvent.change(input, { target: { value: 'xxxxxxxxnothing' } })
    expect(screen.getByText(/No results for/)).toBeInTheDocument()
  })
})

// ── Applicant search ────────────────────────────────────────────────────────

describe('CommandPalette — applicant search', () => {
  it('shows no applicants section when query is less than 2 chars', () => {
    render(<CommandPalette {...defaultProps} />)
    const input = screen.getByPlaceholderText('Search actions or applicants...')
    fireEvent.change(input, { target: { value: 'a' } })
    // "Applicants" section header should not appear
    expect(screen.queryByText('Applicants')).not.toBeInTheDocument()
  })

  it('shows applicants section when query is ≥2 chars and matches', () => {
    render(<CommandPalette {...defaultProps} />)
    const input = screen.getByPlaceholderText('Search actions or applicants...')
    fireEvent.change(input, { target: { value: 'ali' } })
    expect(screen.getByText('Applicants')).toBeInTheDocument()
    expect(screen.getByText('Alice Tran')).toBeInTheDocument()
  })

  it('calls onOpenDetail and onClose when applicant result is clicked', () => {
    const onOpenDetail = vi.fn()
    const onClose = vi.fn()
    render(<CommandPalette {...defaultProps} onOpenDetail={onOpenDetail} onClose={onClose} />)
    const input = screen.getByPlaceholderText('Search actions or applicants...')
    fireEvent.change(input, { target: { value: 'ali' } })
    fireEvent.click(screen.getByText('Alice Tran'))
    expect(onOpenDetail).toHaveBeenCalledWith(expect.objectContaining({ id: 'a1' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when ESC is pressed', () => {
    const onClose = vi.fn()
    render(<CommandPalette {...defaultProps} onClose={onClose} />)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn()
    render(<CommandPalette {...defaultProps} onClose={onClose} />)
    const backdrop = document.querySelector('.fixed.inset-0.bg-black\\/30')
    if (backdrop) fireEvent.click(backdrop)
    expect(onClose).toHaveBeenCalledOnce()
  })
})
