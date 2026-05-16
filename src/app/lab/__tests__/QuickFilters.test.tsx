import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import QuickFilters from '../components/QuickFilters'

const defaultProps = {
  position: '',
  batch: '',
  round1: '',
  onPosition: vi.fn(),
  onBatch: vi.fn(),
  onRound1: vi.fn(),
  extraConditions: [],
  onRemoveCondition: vi.fn(),
}

// ── Batch chips ───────────────────────────────────────────────────────────────

describe('QuickFilters — batch chips', () => {
  it('renders Batch 1, 2, 3 chips', () => {
    render(<QuickFilters {...defaultProps} />)
    expect(screen.getByText('Batch 1')).toBeInTheDocument()
    expect(screen.getByText('Batch 2')).toBeInTheDocument()
    expect(screen.getByText('Batch 3')).toBeInTheDocument()
  })

  it('calls onBatch with "1" when Batch 1 chip is clicked (none active)', () => {
    const onBatch = vi.fn()
    render(<QuickFilters {...defaultProps} onBatch={onBatch} />)
    fireEvent.click(screen.getByText('Batch 1'))
    expect(onBatch).toHaveBeenCalledWith('1')
  })

  it('calls onBatch with "" (deselect) when the active batch is clicked again', () => {
    const onBatch = vi.fn()
    render(<QuickFilters {...defaultProps} batch="1" onBatch={onBatch} />)
    fireEvent.click(screen.getByText('Batch 1'))
    expect(onBatch).toHaveBeenCalledWith('')
  })
})

// ── Round1 chips ──────────────────────────────────────────────────────────────

describe('QuickFilters — Round1 result chips', () => {
  it('renders Passed, Failed, Waiting list chips', () => {
    render(<QuickFilters {...defaultProps} />)
    expect(screen.getByText('Passed')).toBeInTheDocument()
    expect(screen.getByText('Failed')).toBeInTheDocument()
    expect(screen.getByText('Waiting list')).toBeInTheDocument()
  })

  it('calls onRound1 with "Passed" when Passed chip is clicked', () => {
    const onRound1 = vi.fn()
    render(<QuickFilters {...defaultProps} onRound1={onRound1} />)
    fireEvent.click(screen.getByText('Passed'))
    expect(onRound1).toHaveBeenCalledWith('Passed')
  })

  it('deselects Passed when it is already active', () => {
    const onRound1 = vi.fn()
    render(<QuickFilters {...defaultProps} round1="Passed" onRound1={onRound1} />)
    fireEvent.click(screen.getByText('Passed'))
    expect(onRound1).toHaveBeenCalledWith('')
  })
})

// ── Clear all ─────────────────────────────────────────────────────────────────

describe('QuickFilters — clear all', () => {
  it('does NOT render Clear button when no filter is active', () => {
    render(<QuickFilters {...defaultProps} />)
    expect(screen.queryByText('Clear')).not.toBeInTheDocument()
  })

  it('renders Clear button when batch filter is active', () => {
    render(<QuickFilters {...defaultProps} batch="2" />)
    expect(screen.getByText('Clear')).toBeInTheDocument()
  })

  it('renders Clear button when round1 filter is active', () => {
    render(<QuickFilters {...defaultProps} round1="Failed" />)
    expect(screen.getByText('Clear')).toBeInTheDocument()
  })

  it('renders Clear button when position filter is active', () => {
    render(<QuickFilters {...defaultProps} position="AI Engineering Intern" />)
    expect(screen.getByText('Clear')).toBeInTheDocument()
  })

  it('renders Clear button when there are extra conditions', () => {
    const extraConditions = [
      { id: 'c1', field: 'gpa' as const, operator: 'gt' as const, value: '3.5' },
    ]
    render(<QuickFilters {...defaultProps} extraConditions={extraConditions} />)
    expect(screen.getByText('Clear')).toBeInTheDocument()
  })

  it('clicking Clear calls onPosition, onBatch, onRound1 with empty string', () => {
    const onPosition = vi.fn()
    const onBatch = vi.fn()
    const onRound1 = vi.fn()
    render(
      <QuickFilters
        {...defaultProps}
        batch="1"
        onPosition={onPosition}
        onBatch={onBatch}
        onRound1={onRound1}
      />
    )
    fireEvent.click(screen.getByText('Clear'))
    expect(onPosition).toHaveBeenCalledWith('')
    expect(onBatch).toHaveBeenCalledWith('')
    expect(onRound1).toHaveBeenCalledWith('')
  })
})

// ── Extra conditions ──────────────────────────────────────────────────────────

describe('QuickFilters — extra conditions (FilterBuilder)', () => {
  const cond = { id: 'x1', field: 'gpa' as const, operator: 'gt' as const, value: '3.5' }

  it('renders an extra condition chip with field, operator, value', () => {
    render(<QuickFilters {...defaultProps} extraConditions={[cond]} />)
    expect(screen.getByText(/gpa gt 3\.5/)).toBeInTheDocument()
  })

  it('calls onRemoveCondition with the condition id when X is clicked', () => {
    const onRemoveCondition = vi.fn()
    render(
      <QuickFilters
        {...defaultProps}
        extraConditions={[cond]}
        onRemoveCondition={onRemoveCondition}
      />
    )
    // The X button inside the condition chip
    const removeButtons = screen.getAllByRole('button')
    // Find the one inside the condition chip (it's the last button rendered per chip)
    const chipRemoveButton = removeButtons.find((btn) => btn.closest('span') !== null)
    expect(chipRemoveButton).toBeDefined()
    if (chipRemoveButton) fireEvent.click(chipRemoveButton)
    expect(onRemoveCondition).toHaveBeenCalledWith('x1')
  })
})
