'use client'

import { useEffect, useRef } from 'react'
import { Eye, GitCompare } from 'lucide-react'
import { animate, stagger } from 'animejs'
import { Applicant } from '@/lib/types'
import {
  getPosColor,
  getPosShort,
  ROUND1_BADGE,
  getInitials,
  prefersReducedMotion,
} from '../lab-utils'

const COLUMNS: {
  id: string
  label: string
  headerBg: string
  headerText: string
  dot: string
  badgeBg: string
  badgeText: string
  predicate: (a: Applicant) => boolean
}[] = [
  {
    id: 'new',
    label: 'New',
    headerBg: 'bg-[#f5f5f5]',
    headerText: 'text-[#1b1b1b]',
    dot: '#1b1b1b',
    badgeBg: 'bg-[#1b1b1b]',
    badgeText: 'text-[#fcfcfc]',
    predicate: (a) => !a.round1Result,
  },
  {
    id: 'passed',
    label: 'Passed',
    headerBg: 'bg-[#ffdad3]/20',
    headerText: 'text-[#8d1600]',
    dot: '#8d1600',
    badgeBg: 'bg-[#ffdad3]',
    badgeText: 'text-[#8d1600]',
    predicate: (a) => a.round1Result === 'Passed' && !a.round2Result,
  },
  {
    id: 'waiting',
    label: 'Waitlisted',
    headerBg: 'bg-[#fafafa]',
    headerText: 'text-[#555555]',
    dot: '#767676',
    badgeBg: 'bg-[#f9f9f9]',
    badgeText: 'text-[#555555]',
    predicate: (a) => a.round1Result === 'Waiting list',
  },
  {
    id: 'failed',
    label: 'Rejected',
    headerBg: 'bg-[#fafafa]',
    headerText: 'text-[#555555]',
    dot: '#767676',
    badgeBg: 'bg-[#f9f9f9]',
    badgeText: 'text-[#555555]',
    predicate: (a) => a.round1Result === 'Failed',
  },
  {
    id: 'round2',
    label: 'Round 2',
    headerBg: 'bg-[#f5f5f5]',
    headerText: 'text-[#1b1b1b]',
    dot: '#1b1b1b',
    badgeBg: 'bg-[#1b1b1b]',
    badgeText: 'text-[#fcfcfc]',
    predicate: (a) => !!a.round2Result,
  },
]

const COL_CAP = 30

interface KanbanViewProps {
  applicants: Applicant[]
  onOpenDetail: (a: Applicant) => void
  compareIds: string[]
  onToggleCompare: (id: string) => void
}

export default function KanbanView({
  applicants,
  onOpenDetail,
  compareIds,
  onToggleCompare,
}: KanbanViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || prefersReducedMotion()) return
    const cards = containerRef.current.querySelectorAll<HTMLElement>('.kanban-card')
    if (!cards.length) return
    animate(cards, {
      opacity: [0, 1],
      translateY: [8, 0],
      duration: 220,
      delay: stagger(25, { start: 50 }),
    })
  }, [])

  return (
    <div ref={containerRef} className="flex min-h-[500px] gap-3 overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const items = applicants.filter(col.predicate)
        const visible = items.slice(0, COL_CAP)
        const overflow = items.length - COL_CAP

        return (
          <div key={col.id} className="flex w-[260px] flex-shrink-0 flex-col gap-2">
            {/* Column header */}
            <div
              className={`flex items-center justify-between rounded-2xl border border-[#e8e8e8] px-3 py-2.5 ${col.headerBg}`}
            >
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: col.dot }} />
                <span className={`text-xs font-bold ${col.headerText}`}>{col.label}</span>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold tabular-nums ${col.badgeBg} ${col.badgeText}`}
              >
                {items.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-2">
              {visible.map((a) => (
                <KanbanCard
                  key={a.id}
                  applicant={a}
                  onOpen={() => onOpenDetail(a)}
                  isInCompare={compareIds.includes(a.id)}
                  onToggleCompare={() => onToggleCompare(a.id)}
                />
              ))}
              {overflow > 0 && (
                <div className="px-3 py-2 text-center text-xs text-[#767676]">+{overflow} more</div>
              )}
              {items.length === 0 && (
                <div className="rounded-2xl border border-dashed border-[#e8e8e8] px-3 py-6 text-center text-xs text-[#767676]">
                  No applicants
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function KanbanCard({
  applicant: a,
  onOpen,
  isInCompare,
  onToggleCompare,
}: {
  applicant: Applicant
  onOpen: () => void
  isInCompare: boolean
  onToggleCompare: () => void
}) {
  const posColor = getPosColor(a.position1)
  const r1Badge = a.round1Result ? ROUND1_BADGE[a.round1Result] : null

  return (
    <div
      className="kanban-card group cursor-pointer rounded-2xl bg-white p-3 transition-all hover:shadow-md"
      style={{ border: '1px solid rgba(4,23,43,0.06)' }}
      onClick={onOpen}
    >
      {/* Position color strip */}
      <div className="mb-2.5 flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
            style={{ backgroundColor: posColor.light, color: posColor.bg }}
          >
            {getInitials(a.name).slice(-1)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold tracking-tight text-[#1b1b1b]">{a.name}</p>
            <p className="truncate text-[10px] text-[#767676]">{a.email}</p>
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleCompare()
            }}
            className={`flex h-5 w-5 items-center justify-center rounded-md transition-colors ${isInCompare ? 'bg-[#8d1600] text-white' : 'text-[#c0c0c0] hover:text-[#8d1600]'}`}
          >
            <GitCompare size={10} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onOpen()
            }}
            className="flex h-5 w-5 items-center justify-center rounded-md text-[#c0c0c0] transition-colors hover:text-[#8d1600]"
          >
            <Eye size={10} />
          </button>
        </div>
      </div>

      {/* Position badge */}
      <div className="flex items-center justify-between gap-2">
        <span
          className="inline-flex h-5 max-w-[140px] items-center truncate rounded-full px-2 text-[10px] font-semibold"
          style={{ backgroundColor: posColor.light, color: posColor.bg }}
        >
          {getPosShort(a.position1)}
        </span>
        <span className="text-[10px] font-semibold text-[#767676] tabular-nums">
          {a.gpa.toFixed(1)}
        </span>
      </div>

      {/* Round 1 badge */}
      {r1Badge && (
        <div className="mt-2 border-t border-[#f5f5f5] pt-2">
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{ backgroundColor: r1Badge.bg, color: r1Badge.text }}
          >
            {a.round1Result}
          </span>
        </div>
      )}
    </div>
  )
}
