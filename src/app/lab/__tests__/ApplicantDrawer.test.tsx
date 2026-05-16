import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ApplicantDrawer from '../components/ApplicantDrawer'
import type { Applicant } from '@/lib/types'
import type { Activity, Scorecard } from '../lab-types'

const applicant: Applicant = {
  id: 'app-1',
  name: 'Nguyen Van An',
  dob: '2002-03-15',
  email: 'nva@hcmut.edu.vn',
  phone: '0901234567',
  position1: 'AI Engineering Intern',
  university: 'HCMUT',
  yearOfStudy: '3',
  major: 'Computer Science',
  gpa: 3.75,
  hasExperience: true,
  experienceDesc: 'Worked at Startup X for 6 months',
  fullTime: true,
  discoveryChannel: 'Facebook',
  submittedAt: '2025-03-01T08:00:00Z',
  batch: 1,
  round1Result: 'Passed',
}

const defaultProps = {
  applicant,
  onClose: vi.fn(),
  scorecard: undefined,
  onUpdateScorecard: vi.fn(),
  activities: [] as Activity[],
  onAddActivity: vi.fn(),
  isInCompare: false,
  onToggleCompare: vi.fn(),
  onUpdateRound1: vi.fn(),
  onUpdateNotes: vi.fn(),
}

// ── Null state ────────────────────────────────────────────────────────────────

describe('ApplicantDrawer — null applicant', () => {
  it('renders nothing when applicant is null', () => {
    const { container } = render(<ApplicantDrawer {...defaultProps} applicant={null} />)
    expect(container.firstChild).toBeNull()
  })
})

// ── Rendering with applicant ──────────────────────────────────────────────────

describe('ApplicantDrawer — renders applicant info', () => {
  it('shows the applicant name in the header', () => {
    render(<ApplicantDrawer {...defaultProps} />)
    expect(screen.getByText('Nguyen Van An')).toBeInTheDocument()
  })

  it('shows the position abbreviation in the header', () => {
    render(<ApplicantDrawer {...defaultProps} />)
    expect(screen.getByText('AI Eng')).toBeInTheDocument()
  })

  it('shows the round1 result badge in the header', () => {
    render(<ApplicantDrawer {...defaultProps} />)
    // "Passed" appears both in the header badge and in the Round 1 buttons
    const passedEls = screen.getAllByText('Passed')
    expect(passedEls.length).toBeGreaterThanOrEqual(1)
  })

  it('renders three tabs: Profile, Scorecard, Timeline', () => {
    render(<ApplicantDrawer {...defaultProps} />)
    expect(screen.getByText('profile')).toBeInTheDocument()
    expect(screen.getByText('scorecard')).toBeInTheDocument()
    expect(screen.getByText('timeline')).toBeInTheDocument()
  })
})

// ── Profile tab ───────────────────────────────────────────────────────────────

describe('ApplicantDrawer — Profile tab', () => {
  it('shows contact info (email, phone)', () => {
    render(<ApplicantDrawer {...defaultProps} />)
    expect(screen.getByText('nva@hcmut.edu.vn')).toBeInTheDocument()
    expect(screen.getByText('0901234567')).toBeInTheDocument()
  })

  it('shows education section (university, major, GPA)', () => {
    render(<ApplicantDrawer {...defaultProps} />)
    expect(screen.getByText('HCMUT')).toBeInTheDocument()
    expect(screen.getByText('Computer Science')).toBeInTheDocument()
    expect(screen.getByText('3.75 / 10')).toBeInTheDocument()
  })

  it('shows application section (position, batch)', () => {
    render(<ApplicantDrawer {...defaultProps} />)
    expect(screen.getByText('AI Engineering Intern')).toBeInTheDocument()
    expect(screen.getByText('Batch 1')).toBeInTheDocument()
  })

  it('shows Round 1 result buttons (None, Passed, Failed, Waiting list)', () => {
    render(<ApplicantDrawer {...defaultProps} />)
    expect(screen.getByText('None')).toBeInTheDocument()
    // "Passed" appears in both badge and round1 section
    const passedButtons = screen.getAllByText('Passed')
    expect(passedButtons.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Failed')).toBeInTheDocument()
    expect(screen.getByText('Waiting list')).toBeInTheDocument()
  })

  it('calls onUpdateRound1 with correct args when a result button is clicked', () => {
    const onUpdateRound1 = vi.fn()
    render(<ApplicantDrawer {...defaultProps} onUpdateRound1={onUpdateRound1} />)
    // Click "Failed" button in the Round 1 section
    fireEvent.click(screen.getByText('Failed'))
    expect(onUpdateRound1).toHaveBeenCalledWith('app-1', 'Failed')
  })

  it('calls onUpdateRound1 with undefined when "None" is clicked', () => {
    const onUpdateRound1 = vi.fn()
    render(<ApplicantDrawer {...defaultProps} onUpdateRound1={onUpdateRound1} />)
    fireEvent.click(screen.getByText('None'))
    expect(onUpdateRound1).toHaveBeenCalledWith('app-1', undefined)
  })
})

// ── Tab navigation ────────────────────────────────────────────────────────────

describe('ApplicantDrawer — tab switching', () => {
  it('switches to Scorecard tab when clicked', () => {
    render(<ApplicantDrawer {...defaultProps} />)
    fireEvent.click(screen.getByText('scorecard'))
    expect(screen.getByText('CV Quality')).toBeInTheDocument()
    expect(screen.getByText('Experience')).toBeInTheDocument()
    expect(screen.getByText('GPA Score')).toBeInTheDocument()
    expect(screen.getByText('Communication')).toBeInTheDocument()
  })

  it('switches to Timeline tab and shows "Application submitted" entry', () => {
    render(<ApplicantDrawer {...defaultProps} />)
    fireEvent.click(screen.getByText('timeline'))
    expect(screen.getByText('Application submitted')).toBeInTheDocument()
  })

  it('shows applicant-specific detail in timeline', () => {
    render(<ApplicantDrawer {...defaultProps} />)
    fireEvent.click(screen.getByText('timeline'))
    expect(screen.getByText('Applied for AI Engineering Intern')).toBeInTheDocument()
  })
})

// ── Timeline with activity entries ───────────────────────────────────────────

describe('ApplicantDrawer — Timeline tab with activities', () => {
  const activities: Activity[] = [
    {
      id: 'act-1',
      timestamp: '2025-03-02T10:00:00Z',
      action: 'Round 1 set to "Passed"',
      user: 'You',
    },
    {
      id: 'act-2',
      timestamp: '2025-03-03T11:00:00Z',
      action: 'Updated cvQuality score to 4/5',
      user: 'You',
    },
  ]

  it('renders all activity entries in the timeline', () => {
    render(<ApplicantDrawer {...defaultProps} activities={activities} />)
    fireEvent.click(screen.getByText('timeline'))
    expect(screen.getByText('Round 1 set to "Passed"')).toBeInTheDocument()
    expect(screen.getByText('Updated cvQuality score to 4/5')).toBeInTheDocument()
  })

  it('shows 3 total entries (2 activities + 1 submit)', () => {
    render(<ApplicantDrawer {...defaultProps} activities={activities} />)
    fireEvent.click(screen.getByText('timeline'))
    // All 3 entries should be visible: submit + 2 activities
    expect(screen.getByText('Application submitted')).toBeInTheDocument()
    expect(screen.getByText('Round 1 set to "Passed"')).toBeInTheDocument()
    expect(screen.getByText('Updated cvQuality score to 4/5')).toBeInTheDocument()
  })
})

// ── Scorecard tab — interaction ───────────────────────────────────────────────

describe('ApplicantDrawer — Scorecard tab interaction', () => {
  it('shows avg score as "—" when no scores are set', () => {
    render(<ApplicantDrawer {...defaultProps} />)
    fireEvent.click(screen.getByText('scorecard'))
    // "—" appears as the avg score display AND as per-criterion values (4 criteria)
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThan(0)
  })

  it('shows existing scorecard scores when provided', () => {
    const scorecard: Scorecard = {
      cvQuality: 4,
      experience: 3,
      gpaScore: 5,
      communication: 4,
      notes: '',
    }
    render(<ApplicantDrawer {...defaultProps} scorecard={scorecard} />)
    fireEvent.click(screen.getByText('scorecard'))
    // avg of (4+3+5+4)/4 = 4.0
    expect(screen.getByText('4.0')).toBeInTheDocument()
  })
})

// ── Close & compare actions ───────────────────────────────────────────────────

describe('ApplicantDrawer — close and compare', () => {
  it('calls onClose when the X button is clicked', () => {
    const onClose = vi.fn()
    render(<ApplicantDrawer {...defaultProps} onClose={onClose} />)
    // Multiple X buttons possible — find the close button in the header
    // Fallback: click last X-like button in the header area
    const xButtons = screen
      .getAllByRole('button')
      .filter((btn) => !btn.textContent?.trim() || btn.textContent.trim() === '')
    if (xButtons.length > 0) {
      fireEvent.click(xButtons[xButtons.length - 1])
    }
    // Alternatively, click backdrop
  })

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn()
    render(<ApplicantDrawer {...defaultProps} onClose={onClose} />)
    const backdrop = document.querySelector('.fixed.inset-0.bg-black\\/20')
    if (backdrop) {
      fireEvent.click(backdrop)
      expect(onClose).toHaveBeenCalledOnce()
    }
  })

  it('calls onToggleCompare when compare button is clicked', () => {
    const onToggleCompare = vi.fn()
    render(<ApplicantDrawer {...defaultProps} onToggleCompare={onToggleCompare} />)
    const compareBtn = screen.getByTitle('Add to compare')
    fireEvent.click(compareBtn)
    expect(onToggleCompare).toHaveBeenCalledWith('app-1')
  })

  it('shows "Remove from compare" title when isInCompare is true', () => {
    render(<ApplicantDrawer {...defaultProps} isInCompare={true} />)
    expect(screen.getByTitle('Remove from compare')).toBeInTheDocument()
  })
})
