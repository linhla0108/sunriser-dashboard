"use client"

import { useEffect, useRef } from "react"
import { X, Eye } from "lucide-react"
import { animate } from "animejs"
import { Applicant } from "@/lib/types"
import { getPosColor, getPosShort, ROUND1_BADGE, getInitials, prefersReducedMotion } from "../lab-utils"
import { Button } from "@/components/ui/button"

interface ComparePanelProps {
  compareIds: string[]
  applicants: Applicant[]
  onClose: () => void
  onRemove: (id: string) => void
  onOpenDetail: (a: Applicant) => void
}

const ROWS: { label: string; render: (a: Applicant) => React.ReactNode }[] = [
  { label: "Position", render: a => <PosBadge applicant={a} /> },
  {
    label: "University",
    render: a => <span className="text-sm text-[#1b1b1b]">{a.university}</span>,
  },
  { label: "Major", render: a => <span className="text-sm text-[#555555]">{a.major}</span> },
  { label: "Year", render: a => <span className="text-sm text-[#555555]">{a.yearOfStudy}</span> },
  { label: "GPA", render: a => <GpaCell gpa={a.gpa} /> },
  {
    label: "Full time",
    render: a => (
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${a.fullTime ? "bg-[#f0fdf4] text-[#16a34a]" : "bg-[#f9f9f9] text-[#767676]"}`}
      >
        {a.fullTime ? "Yes" : "No"}
      </span>
    ),
  },
  {
    label: "Experience",
    render: a => (
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${a.hasExperience ? "bg-[#f0fdf4] text-[#16a34a]" : "bg-[#f9f9f9] text-[#767676]"}`}
      >
        {a.hasExperience ? "Yes" : "No"}
      </span>
    ),
  },
  {
    label: "Batch",
    render: a => <span className="text-sm text-[#555555]">Batch {a.batch}</span>,
  },
  { label: "Round 1", render: a => <R1Badge applicant={a} /> },
  {
    label: "Round 2",
    render: a => <span className="text-sm text-[#555555]">{a.round2Result ?? "—"}</span>,
  },
  {
    label: "Discovery",
    render: a => <span className="text-sm text-[#555555]">{a.discoveryChannel}</span>,
  },
]

export default function ComparePanel({ compareIds, applicants, onClose, onRemove, onOpenDetail }: ComparePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const items = compareIds.map(id => applicants.find(a => a.id === id)).filter(Boolean) as Applicant[]

  useEffect(() => {
    if (!panelRef.current || prefersReducedMotion()) return
    animate(panelRef.current, {
      translateY: ["20px", "0px"],
      opacity: [0, 1],
      duration: 280,
      ease: "outCubic",
    })
  }, [])

  if (items.length === 0) return null

  return (
    <>
      <Button
        type="button"
        variant="plain"
        size="plain"
        aria-label="Close compare panel"
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
        <div
          ref={panelRef}
          className="w-full overflow-hidden rounded-t-3xl bg-white sm:max-w-4xl sm:rounded-3xl"
          style={{ boxShadow: "0 24px 64px rgba(4,23,43,0.16)", maxHeight: "90vh" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#f5f5f5] px-5 py-4">
            <div>
              <h2 className="font-bold text-[#1b1b1b]" style={{ fontSize: "var(--text-h2)" }}>
                Compare Applicants
              </h2>
              <p className="mt-0.5 text-xs text-[#767676]">{items.length} candidates selected</p>
            </div>
            <Button
              variant="plain"
              size="plain"
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-full text-[#767676] transition-colors hover:bg-[#f9f9f9]"
            >
              <X size={14} />
            </Button>
          </div>

          <div className="overflow-auto" style={{ maxHeight: "calc(90vh - 80px)" }}>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#f5f5f5]">
                  <th className="w-28 px-4 py-3 text-left">
                    <span className="text-[10px] font-semibold tracking-widest text-[#6B5549] uppercase">Field</span>
                  </th>
                  {items.map(a => {
                    const posColor = getPosColor(a.position1)
                    return (
                      <th key={a.id} className="px-4 py-3 text-left">
                        <div className="flex items-start gap-2">
                          <div
                            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
                            style={{ backgroundColor: posColor.bg, color: posColor.text }}
                          >
                            {getInitials(a.name).slice(-1)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-[#1b1b1b]">{a.name}</p>
                            <p className="truncate text-[10px] text-[#767676]">{a.email}</p>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-1">
                          <Button
                            variant="plain"
                            size="plain"
                            onClick={() => onOpenDetail(a)}
                            className="flex h-5 w-5 items-center justify-center rounded-md text-[#767676] transition-colors hover:bg-[#ffdad3]/20 hover:text-[#8d1600]"
                          >
                            <Eye size={10} />
                          </Button>
                          <Button
                            variant="plain"
                            size="plain"
                            onClick={() => onRemove(a.id)}
                            className="flex h-5 w-5 items-center justify-center rounded-md text-[#767676] transition-colors hover:bg-[#fef2f2] hover:text-[#ef4444]"
                          >
                            <X size={10} />
                          </Button>
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {ROWS.map(row => (
                  <tr key={row.label} className="border-b border-[#f9f9f9] last:border-0">
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-[#767676]">{row.label}</span>
                    </td>
                    {items.map(a => (
                      <td key={a.id} className="px-4 py-3">
                        {row.render(a)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}

function PosBadge({ applicant: a }: { applicant: Applicant }) {
  const c = getPosColor(a.position1)
  return (
    <span className="inline-flex h-5 items-center rounded-full px-2 text-[10px] font-semibold" style={{ backgroundColor: c.light, color: c.bg }}>
      {getPosShort(a.position1)}
    </span>
  )
}

function GpaCell({ gpa }: { gpa: number }) {
  return (
    <span className="text-sm font-bold tabular-nums" style={{ color: gpa >= 8.5 ? "#16a34a" : gpa >= 7 ? "#1b1b1b" : "#767676" }}>
      {gpa.toFixed(2)}
    </span>
  )
}

function R1Badge({ applicant: a }: { applicant: Applicant }) {
  if (!a.round1Result) return <span className="text-xs text-[#767676]">—</span>
  const b = ROUND1_BADGE[a.round1Result]
  return (
    <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: b.bg, color: b.text }}>
      {a.round1Result}
    </span>
  )
}
