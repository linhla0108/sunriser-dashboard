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
import { ChevronUp, ChevronDown, ChevronsUpDown, Search } from 'lucide-react'
import { Applicant } from '@/lib/types'
import DraggableRow from './DraggableRow'

interface ApplicantTableProps {
  data: Applicant[]
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
  if (col !== sortKey) return <ChevronsUpDown size={12} className="text-[#a3a6af]" />
  return sortDir === 'asc' ? (
    <ChevronUp size={12} className="text-[#17191c]" />
  ) : (
    <ChevronDown size={12} className="text-[#17191c]" />
  )
}

export default function ApplicantTable({ data }: ApplicantTableProps) {
  const [items, setItems] = useState<Applicant[]>(data)
  const [search, setSearch] = useState('')
  const [positionFilter, setPositionFilter] = useState('')
  const [batchFilter, setBatchFilter] = useState('')
  const [resultFilter, setResultFilter] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

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

    if (positionFilter) {
      result = result.filter((a) => a.position1 === positionFilter)
    }

    if (batchFilter) {
      result = result.filter((a) => a.batch === Number(batchFilter))
    }

    if (resultFilter) {
      result = result.filter((a) => a.round1Result === resultFilter)
    }

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

  const selectClass =
    'h-9 rounded-2xl border border-[#e5e7eb] bg-white text-sm text-[#17191c] px-3 pr-8 appearance-none focus:outline-none focus:border-[#17191c] transition-colors text-[#4c4c4c] cursor-pointer'

  return (
    <div>
      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a3a6af]"
          />
          <input
            type="text"
            placeholder="Search name, email, position..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 rounded-2xl border border-[#e5e7eb] bg-white pl-9 pr-4 text-sm text-[#17191c] placeholder:text-[#a3a6af] focus:outline-none focus:border-[#17191c] transition-colors"
          />
        </div>

        {/* Position filter */}
        <div className="relative">
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
          <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777b86] pointer-events-none" />
        </div>

        {/* Batch filter */}
        <div className="relative">
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
          <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777b86] pointer-events-none" />
        </div>

        {/* Round 1 result filter */}
        <div className="relative">
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
          <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777b86] pointer-events-none" />
        </div>

        <span className="text-xs text-[#a3a6af] ml-auto">
          {filtered.length} of {items.length} records
        </span>
      </div>

      {/* Table wrapper */}
      <div
        className="bg-white rounded-3xl overflow-hidden"
        style={{
          boxShadow:
            'rgba(4, 23, 43, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.1) 0px 8px 10px -6px',
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-[#f7f7f8]">
                <th className="pl-4 pr-2 py-3 w-8" />
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#a3a6af] uppercase tracking-wider w-8">
                  #
                </th>
                <th className="px-3 py-3 text-left">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#a3a6af] uppercase tracking-wider hover:text-[#17191c] transition-colors"
                  >
                    Name
                    <SortIcon col="name" sortKey={sortKey} sortDir={sortDir} />
                  </button>
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#a3a6af] uppercase tracking-wider">
                  Position
                </th>
                <th className="px-3 py-3 text-left">
                  <button
                    onClick={() => handleSort('university')}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#a3a6af] uppercase tracking-wider hover:text-[#17191c] transition-colors"
                  >
                    University
                    <SortIcon col="university" sortKey={sortKey} sortDir={sortDir} />
                  </button>
                </th>
                <th className="px-3 py-3 text-center">
                  <button
                    onClick={() => handleSort('gpa')}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#a3a6af] uppercase tracking-wider hover:text-[#17191c] transition-colors mx-auto"
                  >
                    GPA
                    <SortIcon col="gpa" sortKey={sortKey} sortDir={sortDir} />
                  </button>
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-[#a3a6af] uppercase tracking-wider">
                  Year
                </th>
                <th className="px-3 py-3 text-center">
                  <button
                    onClick={() => handleSort('batch')}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#a3a6af] uppercase tracking-wider hover:text-[#17191c] transition-colors mx-auto"
                  >
                    Batch
                    <SortIcon col="batch" sortKey={sortKey} sortDir={sortDir} />
                  </button>
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#a3a6af] uppercase tracking-wider">
                  PIC
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#a3a6af] uppercase tracking-wider">
                  Round 1
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#a3a6af] uppercase tracking-wider">
                  Round 2
                </th>
                <th className="px-3 py-3 pr-4 text-xs font-semibold text-[#a3a6af] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filtered.map((a) => a.id)}
                strategy={verticalListSortingStrategy}
              >
                <tbody>
                  {filtered.length > 0 ? (
                    filtered.map((applicant, i) => (
                      <DraggableRow key={applicant.id} applicant={applicant} index={i} />
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={12}
                        className="px-6 py-12 text-center text-sm text-[#a3a6af]"
                      >
                        No applicants match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </SortableContext>
            </DndContext>
          </table>
        </div>
      </div>
    </div>
  )
}
