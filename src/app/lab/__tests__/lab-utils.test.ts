import { describe, it, expect } from 'vitest'
import {
  getInitials,
  getPosColor,
  getPosShort,
  formatDate,
  generateActivityId,
  POS_COLORS,
  ROUND1_BADGE,
  ALL_POSITIONS,
} from '../lab-utils'

// ── getInitials ─────────────────────────────────────────────────────────────

describe('getInitials', () => {
  it('returns two uppercase initials from a full name', () => {
    expect(getInitials('Nguyen Van An')).toBe('NV')
  })

  it('returns one initial for a single-word name', () => {
    expect(getInitials('Linh')).toBe('L')
  })

  it('uppercases lowercase names', () => {
    expect(getInitials('john doe')).toBe('JD')
  })

  it('handles names with extra spaces correctly (slice to 2)', () => {
    // split(' ') on 'A B C' → ['A','B','C'], slice(0,2) → ['A','B']
    expect(getInitials('A B C')).toBe('AB')
  })
})

// ── getPosColor ──────────────────────────────────────────────────────────────

describe('getPosColor', () => {
  it('returns known colors for a registered position', () => {
    const color = getPosColor('AI Engineering Intern')
    expect(color.bg).toBe('#55DB9C')
    expect(color.text).toBe('#1b1b1b')
    expect(color.light).toBe('#e6faf2')
  })

  it('returns neutral fallback for an unknown position', () => {
    const color = getPosColor('Unknown Position XYZ')
    expect(color.bg).toBe('#e5e5e5')
    expect(color.text).toBe('#555555')
    expect(color.light).toBe('#f5f5f5')
  })

  it('returns colors for every position in POS_COLORS', () => {
    Object.keys(POS_COLORS).forEach((pos) => {
      const color = getPosColor(pos)
      expect(color.bg).toBeTruthy()
      expect(color.text).toBeTruthy()
      expect(color.light).toBeTruthy()
    })
  })
})

// ── getPosShort ──────────────────────────────────────────────────────────────

describe('getPosShort', () => {
  it('returns abbreviation for known positions', () => {
    expect(getPosShort('AI Engineering Intern')).toBe('AI Eng')
    expect(getPosShort('Human Resources Intern')).toBe('HR')
    expect(getPosShort('Game Quality Assurance Intern')).toBe('Game QA')
  })

  it('returns the original string for unknown positions (fallback)', () => {
    expect(getPosShort('Some Custom Role')).toBe('Some Custom Role')
  })
})

// ── ROUND1_BADGE ─────────────────────────────────────────────────────────────

describe('ROUND1_BADGE', () => {
  it('has entries for all three results', () => {
    expect(ROUND1_BADGE['Passed']).toBeDefined()
    expect(ROUND1_BADGE['Failed']).toBeDefined()
    expect(ROUND1_BADGE['Waiting list']).toBeDefined()
  })

  it('each entry has bg, text, and border fields', () => {
    ;['Passed', 'Failed', 'Waiting list'].forEach((key) => {
      expect(ROUND1_BADGE[key].bg).toBeTruthy()
      expect(ROUND1_BADGE[key].text).toBeTruthy()
      expect(ROUND1_BADGE[key].border).toBeTruthy()
    })
  })
})

// ── ALL_POSITIONS ─────────────────────────────────────────────────────────────

describe('ALL_POSITIONS', () => {
  it('contains exactly 7 positions', () => {
    expect(ALL_POSITIONS).toHaveLength(7)
  })

  it('includes every expected position', () => {
    const expected = [
      'AI Engineering Intern',
      'Data Analysis Intern',
      'Game Design Intern',
      'Unity Development Intern',
      'Game User Acquisition Intern',
      'Human Resources Intern',
      'Game Quality Assurance Intern',
    ]
    expected.forEach((pos) => expect(ALL_POSITIONS).toContain(pos))
  })
})

// ── formatDate ───────────────────────────────────────────────────────────────

describe('formatDate', () => {
  it('formats an ISO string to vi-VN locale (dd/mm/yyyy)', () => {
    // 2025-01-15 → "15/01/2025" in vi-VN
    const result = formatDate('2025-01-15T00:00:00.000Z')
    // vi-VN locale: "15/01/2025" — allow for timezone variation by checking structure
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/)
  })

  it('handles different months correctly', () => {
    const result = formatDate('2024-12-25T12:00:00.000Z')
    expect(result).toMatch(/\d{2}\/\d{2}\/2024/)
  })
})

// ── generateActivityId ───────────────────────────────────────────────────────

describe('generateActivityId', () => {
  it('returns a non-empty string', () => {
    const id = generateActivityId()
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(0)
  })

  it('generates unique IDs on successive calls', () => {
    const ids = Array.from({ length: 100 }, () => generateActivityId())
    const unique = new Set(ids)
    // Should be unique (Math.random base-36 — collision exceedingly unlikely in 100)
    expect(unique.size).toBe(100)
  })
})
