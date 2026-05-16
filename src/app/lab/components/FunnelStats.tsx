'use client'

import { Applicant } from '@/lib/types'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

interface FunnelStatsProps {
  applicants: Applicant[]
}

export default function FunnelStats({ applicants }: FunnelStatsProps) {
  const [expanded, setExpanded] = useState(false)

  const total = applicants.length
  const reviewed = applicants.filter((a) => a.round1Result).length
  const passed = applicants.filter((a) => a.round1Result === 'Passed').length
  const waitlisted = applicants.filter((a) => a.round1Result === 'Waiting list').length
  const failed = applicants.filter((a) => a.round1Result === 'Failed').length
  const round2 = applicants.filter((a) => a.round2Result).length

  const stages = [
    { label: 'Applied', count: total, color: '#4BA2FF', pct: 100 },
    {
      label: 'Reviewed',
      count: reviewed,
      color: '#7B69FB',
      pct: total ? Math.round((reviewed / total) * 100) : 0,
    },
    {
      label: 'Passed R1',
      count: passed,
      color: '#55DB9C',
      pct: total ? Math.round((passed / total) * 100) : 0,
    },
    {
      label: 'Waitlisted',
      count: waitlisted,
      color: '#F9D529',
      pct: total ? Math.round((waitlisted / total) * 100) : 0,
    },
    {
      label: 'Failed R1',
      count: failed,
      color: '#F76969',
      pct: total ? Math.round((failed / total) * 100) : 0,
    },
    {
      label: 'Round 2',
      count: round2,
      color: '#8d1600',
      pct: total ? Math.round((round2 / total) * 100) : 0,
    },
  ]

  return (
    <div
      className="mb-4 rounded-3xl bg-white p-4"
      style={{
        boxShadow:
          'rgba(4, 23, 43, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.1) 0px 8px 10px -6px',
      }}
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-3"
      >
        {/* Compact funnel bar */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="flex-shrink-0 text-xs font-semibold tracking-widest text-[#6B5549] uppercase">
            Pipeline
          </span>
          <div className="flex h-2 min-w-0 flex-1 gap-px overflow-hidden rounded-full">
            {stages
              .filter((s) => s.count > 0)
              .map((s) => (
                <div
                  key={s.label}
                  className="h-full rounded-full transition-all"
                  style={{
                    backgroundColor: s.color,
                    flexShrink: 0,
                    width: `${s.pct}%`,
                    minWidth: s.count > 0 ? 4 : 0,
                  }}
                  title={`${s.label}: ${s.count}`}
                />
              ))}
          </div>
          <span className="flex-shrink-0 text-xs font-semibold text-[#1b1b1b] tabular-nums">
            {passed}/{total} passed
          </span>
        </div>
        <span className="flex-shrink-0 text-[#767676]">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>

      {/* Expanded: funnel breakdown */}
      {expanded && (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {stages.map((s) => (
            <div key={s.label} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <div
                  className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span className="truncate text-[11px] font-medium text-[#767676]">{s.label}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#f9f9f9]">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ backgroundColor: s.color, width: `${s.pct}%` }}
                />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-bold text-[#1b1b1b] tabular-nums">
                  {s.count.toLocaleString()}
                </span>
                <span className="text-[10px] text-[#767676]">{s.pct}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
