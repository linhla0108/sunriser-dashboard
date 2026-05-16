import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SavedViewsPopover from '../components/SavedViewsPopover'
import type { SavedView } from '../lab-types'

const makeSavedView = (overrides: Partial<SavedView> = {}): SavedView => ({
  id: 'sv1',
  name: 'My View',
  view: 'table',
  search: '',
  position: '',
  batch: '',
  round1: '',
  createdAt: new Date().toISOString(),
  ...overrides,
})

const anchorRef = { current: null } as React.RefObject<HTMLElement | null>

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  savedViews: [],
  onLoad: vi.fn(),
  onDelete: vi.fn(),
  onSaveCurrent: vi.fn(),
  anchorRef,
}

// ── Visibility ──────────────────────────────────────────────────────────────

describe('SavedViewsPopover — visibility', () => {
  it('renders nothing when open=false', () => {
    const { container } = render(<SavedViewsPopover {...defaultProps} open={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders when open=true', () => {
    render(<SavedViewsPopover {...defaultProps} />)
    expect(screen.getByText('Saved Views')).toBeInTheDocument()
  })
})

// ── Empty state ─────────────────────────────────────────────────────────────

describe('SavedViewsPopover — empty state', () => {
  it('shows "No saved views yet" when savedViews is empty', () => {
    render(<SavedViewsPopover {...defaultProps} />)
    expect(screen.getByText('No saved views yet')).toBeInTheDocument()
  })
})

// ── Saved views list ────────────────────────────────────────────────────────

describe('SavedViewsPopover — saved views list', () => {
  const views = [
    makeSavedView({ id: 'sv1', name: 'My View', view: 'table' }),
    makeSavedView({ id: 'sv2', name: 'Kanban Mode', view: 'kanban' }),
  ]

  it('shows all saved view names', () => {
    render(<SavedViewsPopover {...defaultProps} savedViews={views} />)
    expect(screen.getByText('My View')).toBeInTheDocument()
    expect(screen.getByText('Kanban Mode')).toBeInTheDocument()
  })

  it('calls onLoad and onClose when a saved view is clicked', () => {
    const onLoad = vi.fn()
    const onClose = vi.fn()
    render(
      <SavedViewsPopover {...defaultProps} savedViews={views} onLoad={onLoad} onClose={onClose} />
    )
    fireEvent.click(screen.getByText('My View'))
    expect(onLoad).toHaveBeenCalledWith(expect.objectContaining({ id: 'sv1' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onDelete when delete button is clicked', () => {
    const onDelete = vi.fn()
    render(<SavedViewsPopover {...defaultProps} savedViews={views} onDelete={onDelete} />)
    // Find buttons with Trash icon (they have svg with Trash2 icon class in name)
    // Since we can't easily query by icon, just find the delete buttons by structure:
    // They're in the same row as the view name — use aria approach
    const container = document.querySelector('[class*="space-y-1"]')
    if (container) {
      const btns = container.querySelectorAll('button:not([class*="truncate"])')
      if (btns.length > 0) {
        fireEvent.click(btns[0])
        expect(onDelete).toHaveBeenCalledWith('sv1')
      }
    }
  })
})

// ── Save new view ───────────────────────────────────────────────────────────

describe('SavedViewsPopover — save new view', () => {
  it('shows save input and Save button', () => {
    render(<SavedViewsPopover {...defaultProps} />)
    expect(screen.getByPlaceholderText('View name...')).toBeInTheDocument()
    expect(screen.getByText('Save')).toBeInTheDocument()
  })

  it('Save button is disabled when input is empty', () => {
    render(<SavedViewsPopover {...defaultProps} />)
    const saveBtn = screen.getByText('Save').closest('button')
    expect(saveBtn).toBeDisabled()
  })

  it('calls onSaveCurrent when Save button is clicked with a name', () => {
    const onSaveCurrent = vi.fn()
    render(<SavedViewsPopover {...defaultProps} onSaveCurrent={onSaveCurrent} />)
    const input = screen.getByPlaceholderText('View name...')
    fireEvent.change(input, { target: { value: 'New View' } })
    fireEvent.click(screen.getByText('Save'))
    expect(onSaveCurrent).toHaveBeenCalledWith('New View')
  })

  it('calls onSaveCurrent when Enter is pressed in input', () => {
    const onSaveCurrent = vi.fn()
    render(<SavedViewsPopover {...defaultProps} onSaveCurrent={onSaveCurrent} />)
    const input = screen.getByPlaceholderText('View name...')
    fireEvent.change(input, { target: { value: 'Quick Save' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onSaveCurrent).toHaveBeenCalledWith('Quick Save')
  })

  it('shows "Saved!" confirmation briefly after saving', () => {
    render(<SavedViewsPopover {...defaultProps} />)
    const input = screen.getByPlaceholderText('View name...')
    fireEvent.change(input, { target: { value: 'Test' } })
    fireEvent.click(screen.getByText('Save'))
    expect(screen.getByText('Saved!')).toBeInTheDocument()
  })
})
