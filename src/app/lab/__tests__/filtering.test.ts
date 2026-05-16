/**
 * Tests for the filtering pipeline used in page.tsx's filteredApplicants useMemo.
 * We extract the logic into a pure function to test it in isolation.
 */
import { describe, it, expect } from 'vitest'
import type { Applicant } from '@/lib/types'
import type { FilterCondition } from '../lab-types'

// ── Pure filtering function (extracted from page.tsx useMemo) ─────────────────

function filterApplicants(
  applicants: Applicant[],
  opts: {
    search?: string
    positionFilter?: string
    batchFilter?: string
    round1Filter?: string
    filterConditions?: FilterCondition[]
  }
): Applicant[] {
  const {
    search = '',
    positionFilter = '',
    batchFilter = '',
    round1Filter = '',
    filterConditions = [],
  } = opts

  let list = applicants

  if (search) {
    const q = search.toLowerCase()
    list = list.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.university.toLowerCase().includes(q)
    )
  }
  if (positionFilter) list = list.filter((a) => a.position1 === positionFilter)
  if (batchFilter) list = list.filter((a) => String(a.batch) === batchFilter)
  if (round1Filter) list = list.filter((a) => a.round1Result === round1Filter)

  for (const cond of filterConditions) {
    list = list.filter((a) => {
      const rawVal = a[cond.field as keyof Applicant]
      const val = String(rawVal ?? '').toLowerCase()
      const cv = cond.value.toLowerCase()
      if (cond.operator === 'contains') return val.includes(cv)
      if (cond.operator === 'equals') return val === cv
      const num = parseFloat(val)
      const cv2 = parseFloat(cv)
      if (isNaN(num) || isNaN(cv2)) return true
      if (cond.operator === 'gt') return num > cv2
      if (cond.operator === 'lt') return num < cv2
      if (cond.operator === 'gte') return num >= cv2
      if (cond.operator === 'lte') return num <= cv2
      return true
    })
  }

  return list
}

// ── Test fixtures ─────────────────────────────────────────────────────────────

const makeApplicant = (overrides: Partial<Applicant> = {}): Applicant => ({
  id: Math.random().toString(36).slice(2),
  name: 'Nguyen Van A',
  dob: '2002-01-01',
  email: 'nva@example.com',
  phone: '0900000001',
  position1: 'AI Engineering Intern',
  university: 'HCMUT',
  yearOfStudy: '3',
  major: 'Computer Science',
  gpa: 3.5,
  hasExperience: false,
  fullTime: true,
  discoveryChannel: 'Facebook',
  submittedAt: '2025-01-01T00:00:00Z',
  batch: 1,
  ...overrides,
})

const APPLICANTS: Applicant[] = [
  makeApplicant({
    id: 'a1',
    name: 'Alice Tran',
    email: 'alice@hcmut.edu.vn',
    university: 'HCMUT',
    position1: 'AI Engineering Intern',
    batch: 1,
    round1Result: 'Passed',
    gpa: 3.8,
  }),
  makeApplicant({
    id: 'a2',
    name: 'Bob Nguyen',
    email: 'bob@uet.edu.vn',
    university: 'UET',
    position1: 'Data Analysis Intern',
    batch: 2,
    round1Result: 'Failed',
    gpa: 3.2,
  }),
  makeApplicant({
    id: 'a3',
    name: 'Carol Le',
    email: 'carol@usth.edu.vn',
    university: 'USTH',
    position1: 'Game Design Intern',
    batch: 3,
    round1Result: 'Waiting list',
    gpa: 3.5,
  }),
  makeApplicant({
    id: 'a4',
    name: 'David Pham',
    email: 'david@hcmut.edu.vn',
    university: 'HCMUT',
    position1: 'AI Engineering Intern',
    batch: 1,
    round1Result: undefined,
    gpa: 3.9,
  }),
]

// ── Search filter ─────────────────────────────────────────────────────────────

describe('filterApplicants — search', () => {
  it('returns all applicants when search is empty', () => {
    expect(filterApplicants(APPLICANTS, {})).toHaveLength(4)
  })

  it('filters by name (case-insensitive)', () => {
    const result = filterApplicants(APPLICANTS, { search: 'alice' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('a1')
  })

  it('filters by email', () => {
    const result = filterApplicants(APPLICANTS, { search: 'bob@uet' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('a2')
  })

  it('filters by university', () => {
    const result = filterApplicants(APPLICANTS, { search: 'hcmut' })
    expect(result).toHaveLength(2)
    expect(result.map((a) => a.id)).toContain('a1')
    expect(result.map((a) => a.id)).toContain('a4')
  })

  it('returns empty array when no match', () => {
    const result = filterApplicants(APPLICANTS, { search: 'zzznomatch' })
    expect(result).toHaveLength(0)
  })
})

// ── Position filter ───────────────────────────────────────────────────────────

describe('filterApplicants — positionFilter', () => {
  it('filters by exact position', () => {
    const result = filterApplicants(APPLICANTS, { positionFilter: 'AI Engineering Intern' })
    expect(result).toHaveLength(2)
    result.forEach((a) => expect(a.position1).toBe('AI Engineering Intern'))
  })

  it('returns empty when no applicant matches the position', () => {
    const result = filterApplicants(APPLICANTS, { positionFilter: 'Human Resources Intern' })
    expect(result).toHaveLength(0)
  })

  it('returns all when positionFilter is empty string', () => {
    expect(filterApplicants(APPLICANTS, { positionFilter: '' })).toHaveLength(4)
  })
})

// ── Batch filter ──────────────────────────────────────────────────────────────

describe('filterApplicants — batchFilter', () => {
  it('filters by batch "1"', () => {
    const result = filterApplicants(APPLICANTS, { batchFilter: '1' })
    expect(result).toHaveLength(2)
    result.forEach((a) => expect(a.batch).toBe(1))
  })

  it('filters by batch "3" returning single applicant', () => {
    const result = filterApplicants(APPLICANTS, { batchFilter: '3' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('a3')
  })
})

// ── Round1 filter ─────────────────────────────────────────────────────────────

describe('filterApplicants — round1Filter', () => {
  it('filters to only Passed applicants', () => {
    const result = filterApplicants(APPLICANTS, { round1Filter: 'Passed' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('a1')
  })

  it('filters to only Waiting list applicants', () => {
    const result = filterApplicants(APPLICANTS, { round1Filter: 'Waiting list' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('a3')
  })

  it('applicants without round1Result are excluded from any result filter', () => {
    const result = filterApplicants(APPLICANTS, { round1Filter: 'Passed' })
    const ids = result.map((a) => a.id)
    expect(ids).not.toContain('a4') // a4 has no round1Result
  })
})

// ── Combined filters ──────────────────────────────────────────────────────────

describe('filterApplicants — combined filters', () => {
  it('position + batch narrows the set', () => {
    const result = filterApplicants(APPLICANTS, {
      positionFilter: 'AI Engineering Intern',
      batchFilter: '1',
    })
    expect(result).toHaveLength(2)
  })

  it('search + round1 finds specific applicant', () => {
    const result = filterApplicants(APPLICANTS, {
      search: 'carol',
      round1Filter: 'Waiting list',
    })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('a3')
  })

  it('incompatible filters return empty', () => {
    const result = filterApplicants(APPLICANTS, {
      batchFilter: '1',
      round1Filter: 'Waiting list', // carol is batch 3
    })
    expect(result).toHaveLength(0)
  })
})

// ── Advanced filter conditions ────────────────────────────────────────────────

describe('filterApplicants — filterConditions (Advanced Filter Builder)', () => {
  const cond = (
    field: string,
    operator: FilterCondition['operator'],
    value: string
  ): FilterCondition => ({ id: 'test', field: field as FilterCondition['field'], operator, value })

  it('contains operator on university', () => {
    const result = filterApplicants(APPLICANTS, {
      filterConditions: [cond('university', 'contains', 'hcmut')],
    })
    expect(result).toHaveLength(2)
  })

  it('equals operator on position1', () => {
    const result = filterApplicants(APPLICANTS, {
      filterConditions: [cond('position1', 'equals', 'Data Analysis Intern')],
    })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('a2')
  })

  it('gt (greater than) operator on gpa', () => {
    const result = filterApplicants(APPLICANTS, {
      filterConditions: [cond('gpa', 'gt', '3.5')],
    })
    // a1 (3.8), a4 (3.9) — a3 is exactly 3.5 so excluded
    expect(result).toHaveLength(2)
    expect(result.map((a) => a.id)).toContain('a1')
    expect(result.map((a) => a.id)).toContain('a4')
  })

  it('gte (greater than or equal) operator on gpa includes the boundary', () => {
    const result = filterApplicants(APPLICANTS, {
      filterConditions: [cond('gpa', 'gte', '3.5')],
    })
    // a1(3.8), a3(3.5), a4(3.9)
    expect(result).toHaveLength(3)
  })

  it('lt (less than) operator on gpa', () => {
    const result = filterApplicants(APPLICANTS, {
      filterConditions: [cond('gpa', 'lt', '3.5')],
    })
    // only a2 (3.2)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('a2')
  })

  it('lte (less than or equal) operator on gpa includes the boundary', () => {
    const result = filterApplicants(APPLICANTS, {
      filterConditions: [cond('gpa', 'lte', '3.5')],
    })
    // a2(3.2), a3(3.5)
    expect(result).toHaveLength(2)
  })

  it('multiple conditions stack (AND logic)', () => {
    const result = filterApplicants(APPLICANTS, {
      filterConditions: [cond('university', 'contains', 'hcmut'), cond('gpa', 'gt', '3.8')],
    })
    // HCMUT: a1(3.8), a4(3.9) → gt 3.8 → only a4(3.9)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('a4')
  })

  it('non-numeric value on numeric operator passes through (returns true)', () => {
    // gpa field with a non-numeric condition value should not crash
    const result = filterApplicants(APPLICANTS, {
      filterConditions: [cond('gpa', 'gt', 'not-a-number')],
    })
    // parseFloat('not-a-number') = NaN → condition returns true → all pass through
    expect(result).toHaveLength(4)
  })
})
