import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import BulkToolbar from '../components/BulkToolbar'

const defaultProps = {
  selectedCount: 0,
  onClear: vi.fn(),
  onSetRound1: vi.fn(),
  onAssignPic: vi.fn(),
  onExportSelected: vi.fn(),
}

// ── Visibility ────────────────────────────────────────────────────────────────

describe('BulkToolbar — visibility', () => {
  it('renders nothing when selectedCount is 0', () => {
    const { container } = render(<BulkToolbar {...defaultProps} selectedCount={0} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the toolbar when selectedCount > 0', () => {
    render(<BulkToolbar {...defaultProps} selectedCount={3} />)
    expect(screen.getByText('3 selected')).toBeInTheDocument()
  })

  it('shows the correct count in the label', () => {
    render(<BulkToolbar {...defaultProps} selectedCount={42} />)
    expect(screen.getByText('42 selected')).toBeInTheDocument()
  })
})

// ── Clear button ──────────────────────────────────────────────────────────────

describe('BulkToolbar — clear', () => {
  it('calls onClear when the X button is clicked', () => {
    const onClear = vi.fn()
    render(<BulkToolbar {...defaultProps} selectedCount={5} onClear={onClear} />)
    // The clear button is the last button (X icon)
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[buttons.length - 1])
    expect(onClear).toHaveBeenCalledOnce()
  })
})

// ── Set Round 1 dropdown ──────────────────────────────────────────────────────

describe('BulkToolbar — Set Round 1', () => {
  it('shows Round 1 options dropdown when button is clicked', () => {
    render(<BulkToolbar {...defaultProps} selectedCount={2} />)
    fireEvent.click(screen.getByText(/Set Round 1/))
    expect(screen.getByText('Passed')).toBeInTheDocument()
    expect(screen.getByText('Failed')).toBeInTheDocument()
    expect(screen.getByText('Waiting list')).toBeInTheDocument()
  })

  it('calls onSetRound1 with "Passed" when that option is selected', () => {
    const onSetRound1 = vi.fn()
    render(<BulkToolbar {...defaultProps} selectedCount={2} onSetRound1={onSetRound1} />)
    fireEvent.click(screen.getByText(/Set Round 1/))
    fireEvent.click(screen.getByText('Passed'))
    expect(onSetRound1).toHaveBeenCalledWith('Passed')
  })

  it('calls onSetRound1 with "Failed"', () => {
    const onSetRound1 = vi.fn()
    render(<BulkToolbar {...defaultProps} selectedCount={2} onSetRound1={onSetRound1} />)
    fireEvent.click(screen.getByText(/Set Round 1/))
    fireEvent.click(screen.getByText('Failed'))
    expect(onSetRound1).toHaveBeenCalledWith('Failed')
  })

  it('closes the Round 1 dropdown after selection', () => {
    render(<BulkToolbar {...defaultProps} selectedCount={2} />)
    fireEvent.click(screen.getByText(/Set Round 1/))
    fireEvent.click(screen.getByText('Passed'))
    // After selection the dropdown should be gone
    expect(screen.queryByText('Waiting list')).not.toBeInTheDocument()
  })

  it('Round 1 and PIC dropdowns are mutually exclusive', () => {
    render(<BulkToolbar {...defaultProps} selectedCount={2} />)
    fireEvent.click(screen.getByText(/Set Round 1/))
    expect(screen.getByText('Passed')).toBeInTheDocument()
    fireEvent.click(screen.getByText(/Assign PIC/))
    // Round 1 dropdown should close; PIC dropdown should open
    expect(screen.queryByText('Passed')).not.toBeInTheDocument()
    expect(screen.getByText('Quỳnh')).toBeInTheDocument()
  })
})

// ── Assign PIC dropdown ───────────────────────────────────────────────────────

describe('BulkToolbar — Assign PIC', () => {
  it('shows PIC options when button is clicked', () => {
    render(<BulkToolbar {...defaultProps} selectedCount={2} />)
    fireEvent.click(screen.getByText(/Assign PIC/))
    expect(screen.getByText('Quỳnh')).toBeInTheDocument()
    expect(screen.getByText('Nhiên')).toBeInTheDocument()
    expect(screen.getByText('Yến')).toBeInTheDocument()
  })

  it('calls onAssignPic with the selected name', () => {
    const onAssignPic = vi.fn()
    render(<BulkToolbar {...defaultProps} selectedCount={2} onAssignPic={onAssignPic} />)
    fireEvent.click(screen.getByText(/Assign PIC/))
    fireEvent.click(screen.getByText('Quỳnh'))
    expect(onAssignPic).toHaveBeenCalledWith('Quỳnh')
  })

  it('closes the PIC dropdown after selection', () => {
    render(<BulkToolbar {...defaultProps} selectedCount={2} />)
    fireEvent.click(screen.getByText(/Assign PIC/))
    fireEvent.click(screen.getByText('Quỳnh'))
    expect(screen.queryByText('Nhiên')).not.toBeInTheDocument()
  })
})

// ── Export button ─────────────────────────────────────────────────────────────

describe('BulkToolbar — Export', () => {
  it('calls onExportSelected when Export button is clicked', () => {
    const onExportSelected = vi.fn()
    render(<BulkToolbar {...defaultProps} selectedCount={3} onExportSelected={onExportSelected} />)
    fireEvent.click(screen.getByText('Export'))
    expect(onExportSelected).toHaveBeenCalledOnce()
  })
})
