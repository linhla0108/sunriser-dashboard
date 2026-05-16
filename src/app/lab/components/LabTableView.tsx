'use client'

import { useState } from 'react'
import { Eye, ChevronUp, ChevronDown, ChevronsUpDown, Plus, GitCompare } from 'lucide-react'
import { Pagination } from '@skeletonlabs/skeleton-react'
import { Applicant } from '@/lib/types'
import { getPosColor, getPosShort, ROUND1_BADGE } from '../lab-utils'

const ROUND1_OPTIONS = ['Passed', 'Failed', 'Waiting list'] as const
const PAGE_SIZE = 50

interface LabTableViewProps {
  applicants: Applicant[]
  selectedIds: Set<string>
  onToggleSelect: (id: string) => void
  onSelectAll: () => void
  onClearAll: () => void
  onOpenDetail: (a: Applicant) => void
  onUpdateRound1: (id: string, result: 'Passed' | 'Failed' | 'Waiting list' | undefined) => void
  compareIds: string[]
  onToggleCompare: (id: string) => void
}

type SortKey = 'name' | 'gpa' | 'batch' | 'university'
type SortDir = 'asc' | 'desc'

function SortIcon({ k, sortKey, sortDir }: { k: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (sortKey !== k) return <ChevronsUpDown size={11} className="text-[#c0c0c0]" />
  return sortDir === 'asc' ? (
    <ChevronUp size={11} className="text-[#8d1600]" />
  ) : (
    <ChevronDown size={11} className="text-[#8d1600]" />
  )
}

export default function LabTableView({
  applicants,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onClearAll,
  onOpenDetail,
  onUpdateRound1,
  compareIds,
  onToggleCompare,
}: LabTableViewProps) {
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [page, setPage] = useState(1)
  const [inlineEditId, setInlineEditId] = useState<string | null>(null)

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(1)
  }

  const sorted = [...applicants].sort((a, b) => {
    let va: string | number = ''
    let vb: string | number = ''
    if (sortKey === 'name') {
      va = a.name
      vb = b.name
    } else if (sortKey === 'gpa') {
      va = a.gpa
      vb = b.gpa
    } else if (sortKey === 'batch') {
      va = a.batch
      vb = b.batch
    } else if (sortKey === 'university') {
      va = a.university
      vb = b.university
    }
    if (va < vb) return sortDir === 'asc' ? -1 : 1
    if (va > vb) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const allPageSelected = paged.length > 0 && paged.every((a) => selectedIds.has(a.id))

  return (
    <div
      className="overflow-hidden rounded-3xl bg-white"
      style={{
        boxShadow:
          'rgba(4, 23, 43, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.1) 0px 8px 10px -6px',
      }}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#f9f9f9]">
              <th className="w-10 px-3 py-3">
                <input
                  type="checkbox"
                  checked={allPageSelected}
                  onChange={() => (allPageSelected ? onClearAll() : onSelectAll())}
                  className="cursor-pointer rounded border-[#e5e5e5] text-[#8d1600]"
                  style={{ accentColor: '#8d1600' }}
                />
              </th>
              <th className="px-3 py-3 text-left">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-1 text-[10px] font-semibold tracking-widest text-[#555555] uppercase hover:text-[#1b1b1b]"
                >
                  Applicant <SortIcon k="name" sortKey={sortKey} sortDir={sortDir} />
                </button>
              </th>
              <th className="hidden px-3 py-3 text-left sm:table-cell">
                <span className="text-[10px] font-semibold tracking-widest text-[#555555] uppercase">
                  Position
                </span>
              </th>
              <th className="hidden px-3 py-3 text-left lg:table-cell">
                <button
                  onClick={() => handleSort('university')}
                  className="flex items-center gap-1 text-[10px] font-semibold tracking-widest text-[#555555] uppercase hover:text-[#1b1b1b]"
                >
                  University <SortIcon k="university" sortKey={sortKey} sortDir={sortDir} />
                </button>
              </th>
              <th className="hidden px-3 py-3 text-left sm:table-cell">
                <button
                  onClick={() => handleSort('gpa')}
                  className="flex items-center gap-1 text-[10px] font-semibold tracking-widest text-[#555555] uppercase hover:text-[#1b1b1b]"
                >
                  GPA <SortIcon k="gpa" sortKey={sortKey} sortDir={sortDir} />
                </button>
              </th>
              <th className="hidden px-3 py-3 text-left lg:table-cell">
                <button
                  onClick={() => handleSort('batch')}
                  className="flex items-center gap-1 text-[10px] font-semibold tracking-widest text-[#555555] uppercase hover:text-[#1b1b1b]"
                >
                  Batch <SortIcon k="batch" sortKey={sortKey} sortDir={sortDir} />
                </button>
              </th>
              <th className="hidden px-3 py-3 text-left lg:table-cell">
                <span className="text-[10px] font-semibold tracking-widest text-[#555555] uppercase">
                  PIC
                </span>
              </th>
              <th className="px-3 py-3 text-left">
                <span className="text-[10px] font-semibold tracking-widest text-[#555555] uppercase">
                  Round 1
                </span>
              </th>
              <th className="w-20 px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {paged.map((a) => {
              const posColor = getPosColor(a.position1)
              const r1Badge = a.round1Result ? ROUND1_BADGE[a.round1Result] : null
              const isSelected = selectedIds.has(a.id)
              const isInCompare = compareIds.includes(a.id)
              const isInlineEdit = inlineEditId === a.id

              return (
                <tr
                  key={a.id}
                  className={`border-b border-[#f9f9f9] transition-colors last:border-0 ${isSelected ? 'bg-[#ffdad3]/20' : 'hover:bg-[#fafafa]'}`}
                >
                  {/* Checkbox */}
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(a.id)}
                      style={{ accentColor: '#8d1600' }}
                      className="cursor-pointer rounded border-[#e5e5e5]"
                    />
                  </td>

                  {/* Name + email */}
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
                        style={{ backgroundColor: posColor.light, color: posColor.bg }}
                      >
                        {a.name.split(' ').slice(-1)[0][0]}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold tracking-tight text-[#1b1b1b]">
                          {a.name}
                        </p>
                        <p className="truncate text-xs text-[#767676]">{a.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Position */}
                  <td className="hidden px-3 py-3 sm:table-cell">
                    <span
                      className="inline-flex h-5 items-center rounded-full px-2 text-[11px] font-semibold"
                      style={{ backgroundColor: posColor.light, color: posColor.bg }}
                    >
                      {getPosShort(a.position1)}
                    </span>
                  </td>

                  {/* University */}
                  <td className="hidden px-3 py-3 lg:table-cell">
                    <span className="block max-w-[120px] truncate text-sm text-[#555555]">
                      {a.university}
                    </span>
                  </td>

                  {/* GPA */}
                  <td className="hidden px-3 py-3 sm:table-cell">
                    <span
                      className="text-sm font-semibold tabular-nums"
                      style={{
                        color: a.gpa >= 8.5 ? '#16a34a' : a.gpa >= 7 ? '#1b1b1b' : '#767676',
                      }}
                    >
                      {a.gpa.toFixed(1)}
                    </span>
                  </td>

                  {/* Batch */}
                  <td className="hidden px-3 py-3 lg:table-cell">
                    <span className="text-sm text-[#555555]">{a.batch}</span>
                  </td>

                  {/* PIC */}
                  <td className="hidden px-3 py-3 lg:table-cell">
                    <span className="text-sm text-[#555555]">{a.pic ?? '—'}</span>
                  </td>

                  {/* Round 1 — inline edit (Feature 6) */}
                  <td className="relative px-3 py-3">
                    {isInlineEdit ? (
                      <div className="absolute top-1 left-2 z-20 min-w-[130px] overflow-hidden rounded-2xl border border-[#e5e5e5] bg-white shadow-lg">
                        <button
                          onClick={() => {
                            onUpdateRound1(a.id, undefined)
                            setInlineEditId(null)
                          }}
                          className="w-full px-3 py-2 text-left text-xs text-[#767676] transition-colors hover:bg-[#f9f9f9]"
                        >
                          — No result
                        </button>
                        {ROUND1_OPTIONS.map((opt) => {
                          const b = ROUND1_BADGE[opt]
                          return (
                            <button
                              key={opt}
                              onClick={() => {
                                onUpdateRound1(a.id, opt)
                                setInlineEditId(null)
                              }}
                              className="w-full px-3 py-2 text-left text-xs font-semibold transition-colors hover:bg-[#f9f9f9]"
                              style={{ color: b.text }}
                            >
                              {opt}
                            </button>
                          )
                        })}
                      </div>
                    ) : null}
                    <button
                      onClick={() => setInlineEditId(isInlineEdit ? null : a.id)}
                      className="group flex items-center gap-1"
                    >
                      {r1Badge ? (
                        <span
                          className="inline-flex h-5 items-center rounded-full px-2 text-[11px] font-semibold"
                          style={{
                            backgroundColor: r1Badge.bg,
                            color: r1Badge.text,
                            border: `1px solid ${r1Badge.border}`,
                          }}
                        >
                          {a.round1Result}
                        </span>
                      ) : (
                        <span className="inline-flex h-5 items-center gap-1 rounded-full bg-[#f9f9f9] px-2 text-[11px] font-medium text-[#767676] opacity-0 transition-opacity group-hover:opacity-100">
                          <Plus size={9} /> Set
                        </span>
                      )}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onToggleCompare(a.id)}
                        title={isInCompare ? 'Remove from compare' : 'Add to compare'}
                        className={`flex h-6 w-6 items-center justify-center rounded-lg transition-colors ${isInCompare ? 'bg-[#8d1600] text-white' : 'text-[#c0c0c0] hover:bg-[#ffdad3]/20 hover:text-[#8d1600]'}`}
                      >
                        <GitCompare size={12} />
                      </button>
                      <button
                        onClick={() => onOpenDetail(a)}
                        className="flex h-6 w-6 items-center justify-center rounded-lg text-[#c0c0c0] transition-colors hover:bg-[#ffdad3]/20 hover:text-[#8d1600]"
                      >
                        <Eye size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[#f9f9f9] px-4 py-3">
          <span className="text-xs text-[#767676]">
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} of{' '}
            {sorted.length}
          </span>
          <Pagination
            page={page}
            count={sorted.length}
            pageSize={PAGE_SIZE}
            onPageChange={(details) => setPage(details.page)}
            className="flex items-center gap-1"
          >
            <Pagination.PrevTrigger
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-7 cursor-pointer rounded-full px-3 text-xs font-medium text-[#555555] transition-colors hover:bg-[#f9f9f9] disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Prev
            </Pagination.PrevTrigger>
            <span className="flex h-7 items-center px-3 text-xs text-[#767676]">
              {page} / {totalPages}
            </span>
            <Pagination.NextTrigger
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-7 cursor-pointer rounded-full px-3 text-xs font-medium text-[#555555] transition-colors hover:bg-[#f9f9f9] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next →
            </Pagination.NextTrigger>
          </Pagination>
        </div>
      )}
    </div>
  )
}
