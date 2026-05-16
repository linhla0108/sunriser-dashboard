'use client'

import { useState, useMemo } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, SlidersHorizontal } from 'lucide-react'
import { Applicant } from '@/lib/types'
import DraggableRow from './DraggableRow'

interface ApplicantTableProps {
  data: Applicant[]
  onViewDetail?: (applicant: Applicant) => void
}

type SortKey = 'name' | 'gpa' | 'batch' | 'university'
type SortDir = 'asc' | 'desc'

const POSITIONS = [
  'AI Engineering Intern',
  'Data Analysis Intern',
  'Game Design Intern',
  'Unity Development Intern',
  'Game User Acquisition Intern',
  'Human Resources Intern',
  'Game Quality Assurance Intern',
]

const RESULTS = ['Passed', 'Failed', 'Waiting list']

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown size={12} className="text-[#767676]" />
  return sortDir === 'asc' ? (
    <ChevronUp size={12} className="text-[#FF5533]" />
  ) : (
    <ChevronDown size={12} className="text-[#FF5533]" />
  )
}

export default function ApplicantTable({ data, onViewDetail }: ApplicantTableProps) {
  const [items, setItems] = useState<Applicant[]>(data)
  const [search, setSearch] = useState('')
  const [positionFilter, setPositionFilter] = useState('')
  const [batchFilter, setBatchFilter] = useState('')
  const [resultFilter, setResultFilter] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setItems((prev) => {
        const oldIdx = prev.findIndex((a) => a.id === active.id)
        const newIdx = prev.findIndex((a) => a.id === over.id)
        return arrayMove(prev, oldIdx, newIdx)
      })
    }
  }

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const filtered = useMemo(() => {
    let result = [...items]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          a.position1.toLowerCase().includes(q) ||
          a.university.toLowerCase().includes(q)
      )
    }

    if (positionFilter) result = result.filter((a) => a.position1 === positionFilter)
    if (batchFilter) result = result.filter((a) => a.batch === Number(batchFilter))
    if (resultFilter) result = result.filter((a) => a.round1Result === resultFilter)

    result.sort((a, b) => {
      let cmp = 0
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name)
      else if (sortKey === 'gpa') cmp = a.gpa - b.gpa
      else if (sortKey === 'batch') cmp = a.batch - b.batch
      else if (sortKey === 'university') cmp = a.university.localeCompare(b.university)
      return sortDir === 'asc' ? cmp : -cmp
    })

    return result
  }, [items, search, positionFilter, batchFilter, resultFilter, sortKey, sortDir])

  const hasFilters = search || positionFilter || batchFilter || resultFilter

  const selectClass =
    'h-9 rounded-2xl border border-[#e2e2e2] bg-white text-sm text-[#1b1b1b] px-3 pr-8 appearance-none focus:outline-none focus:border-[#FF5533] transition-colors text-[#555555] cursor-pointer'

  return (
    <div data-cid="applicant-table">
      {/* Filters bar */}
      <div className="mb-3 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative max-w-xs min-w-[180px] flex-1">
          <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-[#767676]" />
          <input
            data-cid="table-search"
            type="text"
            placeholder="Search name, email, position..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-2xl border border-[#e2e2e2] bg-white pr-4 pl-9 text-sm text-[#1b1b1b] transition-colors placeholder:text-[#767676] focus:border-[#FF5533] focus:outline-none"
          />
        </div>

        {/* Position filter */}
        <div className="relative hidden sm:block">
          <select
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
            className={selectClass}
          >
            <option value="">All Positions</option>
            {POSITIONS.map((p) => (
              <option key={p} value={p}>
                {p.replace(' Intern', '')}
              </option>
            ))}
          </select>
          <ChevronDown
            size={12}
            className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[#6B5549]"
          />
        </div>

        {/* Batch filter */}
        <div className="relative hidden sm:block">
          <select
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
            className={selectClass}
          >
            <option value="">All Batches</option>
            <option value="1">Batch 1</option>
            <option value="2">Batch 2</option>
            <option value="3">Batch 3</option>
          </select>
          <ChevronDown
            size={12}
            className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[#6B5549]"
          />
        </div>

        {/* Round 1 result filter */}
        <div className="relative hidden sm:block">
          <select
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value)}
            className={selectClass}
          >
            <option value="">All Results</option>
            {RESULTS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <ChevronDown
            size={12}
            className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[#6B5549]"
          />
        </div>

        {/* Mobile filter button */}
        <button
          onClick={() => setMobileFilterOpen(true)}
          className="flex h-9 items-center gap-2 rounded-2xl border border-[#e2e2e2] bg-white px-3 text-sm text-[#555555] sm:hidden"
        >
          <SlidersHorizontal size={14} />
          {(positionFilter || batchFilter || resultFilter) && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#FF5533] text-[9px] font-bold text-white">
              {[positionFilter, batchFilter, resultFilter].filter(Boolean).length}
            </span>
          )}
        </button>

        <span className="ml-auto text-xs font-medium text-[#6B5549]">
          {filtered.length} of {items.length}
        </span>
      </div>

      {/* Table wrapper */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div
          className="overflow-hidden rounded-3xl bg-white"
          style={{
            boxShadow:
              'rgba(4, 23, 43, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.1) 0px 8px 10px -6px',
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-[#f9f9f9]">
                  <th className="w-8 py-3 pr-2 pl-4" />
                  <th className="w-8 px-3 py-3 text-left text-xs font-semibold tracking-wider text-[#767676] uppercase">
                    #
                  </th>
                  <th className="px-3 py-3 text-left">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-[#767676] uppercase transition-colors hover:text-[#FF5533]"
                    >
                      Name
                      <SortIcon col="name" sortKey={sortKey} sortDir={sortDir} />
                    </button>
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold tracking-wider text-[#767676] uppercase">
                    Position
                  </th>
                  <th className="hidden px-3 py-3 text-left lg:table-cell">
                    <button
                      onClick={() => handleSort('university')}
                      className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-[#767676] uppercase transition-colors hover:text-[#FF5533]"
                    >
                      University
                      <SortIcon col="university" sortKey={sortKey} sortDir={sortDir} />
                    </button>
                  </th>
                  <th className="hidden px-3 py-3 text-center sm:table-cell">
                    <button
                      onClick={() => handleSort('gpa')}
                      className="mx-auto flex items-center gap-1.5 text-xs font-semibold tracking-wider text-[#767676] uppercase transition-colors hover:text-[#FF5533]"
                    >
                      GPA
                      <SortIcon col="gpa" sortKey={sortKey} sortDir={sortDir} />
                    </button>
                  </th>
                  <th className="hidden px-3 py-3 text-center text-xs font-semibold tracking-wider text-[#767676] uppercase lg:table-cell">
                    Year
                  </th>
                  <th className="hidden px-3 py-3 text-center sm:table-cell">
                    <button
                      onClick={() => handleSort('batch')}
                      className="mx-auto flex items-center gap-1.5 text-xs font-semibold tracking-wider text-[#767676] uppercase transition-colors hover:text-[#FF5533]"
                    >
                      Batch
                      <SortIcon col="batch" sortKey={sortKey} sortDir={sortDir} />
                    </button>
                  </th>
                  <th className="hidden px-3 py-3 text-left text-xs font-semibold tracking-wider text-[#767676] uppercase lg:table-cell">
                    PIC
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold tracking-wider text-[#767676] uppercase">
                    Round 1
                  </th>
                  <th className="hidden px-3 py-3 text-left text-xs font-semibold tracking-wider text-[#767676] uppercase sm:table-cell">
                    Round 2
                  </th>
                  <th className="px-3 py-3 pr-4 text-xs font-semibold tracking-wider text-[#767676] uppercase">
                    Actions
                  </th>
                </tr>
              </thead>

              <SortableContext
                items={filtered.map((a) => a.id)}
                strategy={verticalListSortingStrategy}
              >
                <tbody>
                  {filtered.length > 0 ? (
                    filtered.map((applicant, i) => (
                      <DraggableRow
                        key={applicant.id}
                        applicant={applicant}
                        index={i}
                        onViewDetail={onViewDetail}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={12} className="px-4 py-10 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f9f9f9]">
                            <Search size={20} className="text-[#767676]" />
                          </div>
                          <p className="text-sm font-medium text-[#1b1b1b]">
                            No applicants match your filters.
                          </p>
                          {hasFilters && (
                            <button
                              onClick={() => {
                                setSearch('')
                                setPositionFilter('')
                                setBatchFilter('')
                                setResultFilter('')
                              }}
                              className="text-sm font-medium text-[#FF5533] hover:underline"
                            >
                              Clear filters
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </SortableContext>
            </table>
          </div>
        </div>
      </DndContext>

      {/* Mobile filter bottom sheet */}
      {mobileFilterOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 sm:hidden"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-white p-5 sm:hidden"
            style={{ boxShadow: '0 -8px 32px rgba(4,23,43,0.12)' }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-[#1b1b1b]" style={{ fontSize: 'var(--text-h2)' }}>
                Filters
              </h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-[#767676] hover:bg-[#f9f9f9]"
              >
                <ChevronDown size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="mb-1.5 text-xs font-semibold tracking-widest text-[#6B5549] uppercase">
                  Position
                </p>
                <select
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value)}
                  className="h-10 w-full rounded-2xl border border-[#e2e2e2] bg-white px-3 text-sm text-[#555555] focus:border-[#FF5533] focus:outline-none"
                >
                  <option value="">All Positions</option>
                  {POSITIONS.map((p) => (
                    <option key={p} value={p}>
                      {p.replace(' Intern', '')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="mb-1.5 text-xs font-semibold tracking-widest text-[#6B5549] uppercase">
                  Batch
                </p>
                <select
                  value={batchFilter}
                  onChange={(e) => setBatchFilter(e.target.value)}
                  className="h-10 w-full rounded-2xl border border-[#e2e2e2] bg-white px-3 text-sm text-[#555555] focus:border-[#FF5533] focus:outline-none"
                >
                  <option value="">All Batches</option>
                  <option value="1">Batch 1</option>
                  <option value="2">Batch 2</option>
                  <option value="3">Batch 3</option>
                </select>
              </div>
              <div>
                <p className="mb-1.5 text-xs font-semibold tracking-widest text-[#6B5549] uppercase">
                  Round 1 Result
                </p>
                <select
                  value={resultFilter}
                  onChange={(e) => setResultFilter(e.target.value)}
                  className="h-10 w-full rounded-2xl border border-[#e2e2e2] bg-white px-3 text-sm text-[#555555] focus:border-[#FF5533] focus:outline-none"
                >
                  <option value="">All Results</option>
                  {RESULTS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => {
                  setPositionFilter('')
                  setBatchFilter('')
                  setResultFilter('')
                }}
                className="h-10 flex-1 rounded-full border border-[#e2e2e2] text-sm font-semibold text-[#555555] transition-colors hover:bg-[#f9f9f9]"
              >
                Clear
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="h-10 flex-1 rounded-full bg-[#FF5533] text-sm font-semibold text-white transition-colors hover:bg-[#E63D1F]"
              >
                Apply
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
