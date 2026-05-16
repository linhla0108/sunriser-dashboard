import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FilterBuilder from '../components/FilterBuilder'
import type { FilterCondition } from '../lab-types'

const defaultProps = {
  open: true,
  conditions: [],
  onClose: vi.fn(),
  onApply: vi.fn(),
}

// ── Visibility ──────────────────────────────────────────────────────────────

describe('FilterBuilder — visibility', () => {
  it('renders nothing when open=false', () => {
    const { container } = render(<FilterBuilder {...defaultProps} open={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders when open=true', () => {
    render(<FilterBuilder {...defaultProps} />)
    expect(screen.getByText('Filter Builder')).toBeInTheDocument()
    expect(screen.getByText('Build custom filter conditions')).toBeInTheDocument()
  })
})

// ── Condition rows ──────────────────────────────────────────────────────────

describe('FilterBuilder — condition rows', () => {
  it('starts with one empty condition row when conditions is empty', () => {
    render(<FilterBuilder {...defaultProps} />)
    expect(screen.getByText('IF')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Value...')).toBeInTheDocument()
  })

  it('initializes with provided conditions', () => {
    const conds: FilterCondition[] = [
      { id: 'c1', field: 'gpa', operator: 'gte', value: '8' },
      { id: 'c2', field: 'position1', operator: 'contains', value: 'AI' },
    ]
    render(<FilterBuilder {...defaultProps} conditions={conds} />)
    // Two rows: IF and AND
    expect(screen.getByText('IF')).toBeInTheDocument()
    expect(screen.getByText('AND')).toBeInTheDocument()
  })

  it('adds a new condition row when "Add condition" is clicked', () => {
    render(<FilterBuilder {...defaultProps} />)
    fireEvent.click(screen.getByText('Add condition'))
    // Now there should be IF and AND
    expect(screen.getByText('IF')).toBeInTheDocument()
    expect(screen.getByText('AND')).toBeInTheDocument()
    const values = screen.getAllByPlaceholderText('Value...')
    expect(values.length).toBe(2)
  })

  it('removes a condition row when X button is clicked', () => {
    const conds: FilterCondition[] = [
      { id: 'c1', field: 'gpa', operator: 'gte', value: '8' },
      { id: 'c2', field: 'position1', operator: 'contains', value: 'AI' },
    ]
    render(<FilterBuilder {...defaultProps} conditions={conds} />)
    // There's also the header X — remove buttons for conditions are inside the conditions area
    // Just verify there are remove buttons (one per condition + header)
    const allXBtns = document.querySelectorAll('button')
    // Click the first condition-row X button (after header X)
    // The header X is at index ~0; condition row X buttons come after
    let clicked = false
    allXBtns.forEach((btn) => {
      if (!clicked && btn.closest('[class*="space-y-3"]')) {
        // find the remove button (last in each row)
        const rowBtns = btn.closest('[class*="flex items-start gap-2"]')?.querySelectorAll('button')
        if (rowBtns && rowBtns.length > 0) {
          fireEvent.click(rowBtns[rowBtns.length - 1])
          clicked = true
        }
      }
    })
    // After removing one, only one condition remains
    const values = screen.getAllByPlaceholderText('Value...')
    expect(values.length).toBe(1)
  })
})

// ── Apply / Clear ───────────────────────────────────────────────────────────

describe('FilterBuilder — apply and clear', () => {
  it('calls onApply with non-empty conditions when "Apply filters" is clicked', () => {
    const onApply = vi.fn()
    const onClose = vi.fn()
    render(<FilterBuilder {...defaultProps} onApply={onApply} onClose={onClose} />)
    const valueInput = screen.getByPlaceholderText('Value...')
    fireEvent.change(valueInput, { target: { value: 'AI' } })
    fireEvent.click(screen.getByText('Apply filters'))
    expect(onApply).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ value: 'AI' })])
    )
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('filters out conditions with empty value when applying', () => {
    const onApply = vi.fn()
    render(<FilterBuilder {...defaultProps} onApply={onApply} />)
    // Don't fill in the value — empty condition is filtered out
    fireEvent.click(screen.getByText('Apply filters'))
    expect(onApply).toHaveBeenCalledWith([])
  })

  it('calls onApply([]) and onClose when "Clear all" is clicked', () => {
    const onApply = vi.fn()
    const onClose = vi.fn()
    render(<FilterBuilder {...defaultProps} onApply={onApply} onClose={onClose} />)
    fireEvent.click(screen.getByText('Clear all'))
    expect(onApply).toHaveBeenCalledWith([])
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when the header X button is clicked', () => {
    const onClose = vi.fn()
    render(<FilterBuilder {...defaultProps} onClose={onClose} />)
    const header = document.querySelector('.flex.flex-shrink-0.items-center.justify-between')
    const closeBtn = header?.querySelector('button')
    if (closeBtn) fireEvent.click(closeBtn)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn()
    render(<FilterBuilder {...defaultProps} onClose={onClose} />)
    const backdrop = document.querySelector('.fixed.inset-0.bg-black\\/20')
    if (backdrop) fireEvent.click(backdrop)
    expect(onClose).toHaveBeenCalledOnce()
  })
})

// ── Field options ───────────────────────────────────────────────────────────

describe('FilterBuilder — field options', () => {
  it('renders field select with 6 options', () => {
    render(<FilterBuilder {...defaultProps} />)
    const fieldSelect = document.querySelectorAll('select')[0]
    expect(fieldSelect).toBeTruthy()
    // 6 fields: Position, Batch, GPA, University, Round 1, Year of Study
    const options = fieldSelect?.querySelectorAll('option')
    expect(options?.length).toBe(6)
  })

  it('shows numeric operators when GPA field is selected', () => {
    render(<FilterBuilder {...defaultProps} />)
    const fieldSelects = document.querySelectorAll('select')
    // Change field to GPA
    fireEvent.change(fieldSelects[0], { target: { value: 'gpa' } })
    const opSelect = document.querySelectorAll('select')[1]
    const opOptions = Array.from(opSelect?.querySelectorAll('option') ?? [])
    const opValues = opOptions.map((o) => o.getAttribute('value'))
    expect(opValues).toContain('gt')
    expect(opValues).toContain('lt')
  })
})
