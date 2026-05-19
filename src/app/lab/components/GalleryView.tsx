"use client"

import { useState, useEffect, useRef } from "react"
import { Eye, GitCompare, CheckCircle2 } from "lucide-react"
import { animate, stagger } from "animejs"
import { Pagination } from "@skeletonlabs/skeleton-react"
import { Applicant } from "@/lib/types"
import { getPosColor, getPosShort, ROUND1_BADGE, getInitials, prefersReducedMotion } from "../lab-utils"
import { Button } from "@/components/ui/button"

const PAGE_SIZE = 24

interface GalleryViewProps {
  applicants: Applicant[]
  selectedIds: Set<string>
  onToggleSelect: (id: string) => void
  onOpenDetail: (a: Applicant) => void
  compareIds: string[]
  onToggleCompare: (id: string) => void
}

export default function GalleryView({ applicants, selectedIds, onToggleSelect, onOpenDetail, compareIds, onToggleCompare }: GalleryViewProps) {
  const [page, setPage] = useState(1)
  const totalPages = Math.ceil(applicants.length / PAGE_SIZE)
  const paged = applicants.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!gridRef.current || prefersReducedMotion()) return
    const cards = gridRef.current.querySelectorAll<HTMLElement>(".gallery-card")
    animate(cards, { opacity: [0, 1], translateY: [12, 0], duration: 250, delay: stagger(20) })
  }, [page])

  return (
    <div>
      <div ref={gridRef} className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {paged.map(a => (
          <GalleryCard
            key={a.id}
            applicant={a}
            isSelected={selectedIds.has(a.id)}
            onToggleSelect={() => onToggleSelect(a.id)}
            onOpenDetail={() => onOpenDetail(a)}
            isInCompare={compareIds.includes(a.id)}
            onToggleCompare={() => onToggleCompare(a.id)}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          page={page}
          count={applicants.length}
          pageSize={PAGE_SIZE}
          onPageChange={details => setPage(details.page)}
          className="flex items-center justify-center gap-2"
        >
          <Pagination.PrevTrigger
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="h-8 cursor-pointer rounded-full border border-[#e5e5e5] px-4 text-sm font-medium text-[#555555] transition-colors hover:bg-[#f9f9f9] disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Prev
          </Pagination.PrevTrigger>
          <span className="text-sm text-[#767676]">
            {page} / {totalPages}
          </span>
          <Pagination.NextTrigger
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="h-8 cursor-pointer rounded-full border border-[#e5e5e5] px-4 text-sm font-medium text-[#555555] transition-colors hover:bg-[#f9f9f9] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next →
          </Pagination.NextTrigger>
        </Pagination>
      )}
    </div>
  )
}

function GalleryCard({
  applicant: a,
  isSelected,
  onToggleSelect,
  onOpenDetail,
  isInCompare,
  onToggleCompare,
}: {
  applicant: Applicant
  isSelected: boolean
  onToggleSelect: () => void
  onOpenDetail: () => void
  isInCompare: boolean
  onToggleCompare: () => void
}) {
  const posColor = getPosColor(a.position1)
  const r1Badge = a.round1Result ? ROUND1_BADGE[a.round1Result] : null
  const initials = getInitials(a.name)

  return (
    <div
      onClick={onOpenDetail}
      className="gallery-card group relative cursor-pointer overflow-hidden rounded-3xl bg-white transition-all hover:-translate-y-0.5"
      style={{
        border: isSelected ? "2px solid #8d1600" : "1px solid rgba(4,23,43,0.06)",
        boxShadow: isSelected ? "rgba(141,22,0,0.15) 0px 0px 0px 3px" : "rgba(4, 23, 43, 0.04) 0px 2px 8px",
      }}
    >
      <Button
        type="button"
        variant="plain"
        size="plain"
        aria-label={`View ${a.name}`}
        className="absolute inset-0 z-0 h-full w-full"
        onClick={e => {
          e.stopPropagation()
          onOpenDetail()
        }}
      />
      {/* Color header */}
      <div className="relative z-10 flex h-14 items-center justify-center" style={{ backgroundColor: posColor.light }}>
        {/* Avatar */}
        <div
          className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
          style={{ backgroundColor: posColor.bg, color: posColor.text }}
        >
          {initials}
        </div>

        {/* Select checkbox */}
        <Button
          variant="plain"
          size="plain"
          onClick={e => {
            e.stopPropagation()
            onToggleSelect()
          }}
          className="absolute top-1.5 left-1.5 z-20"
        >
          {isSelected ? (
            <CheckCircle2 size={16} className="text-[#8d1600]" fill="white" />
          ) : (
            <div className="h-4 w-4 rounded-full border-2 border-white bg-white/50 opacity-0 transition-opacity group-hover:opacity-100" />
          )}
        </Button>

        {/* Compare / view buttons */}
        <div className="absolute top-1.5 right-1.5 z-20 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="plain"
            size="plain"
            onClick={e => {
              e.stopPropagation()
              onToggleCompare()
            }}
            className={`flex h-5 w-5 items-center justify-center rounded-full transition-colors ${isInCompare ? "bg-[#8d1600] text-white" : "bg-white text-[#767676] hover:text-[#8d1600]"}`}
          >
            <GitCompare size={10} />
          </Button>
        </div>
      </div>

      {/* Card body */}
      <div className="relative z-10 p-3">
        <p className="mb-0.5 truncate text-xs leading-tight font-bold tracking-tight text-[#1b1b1b]">{a.name}</p>
        <p className="mb-2 truncate text-[10px] font-semibold" style={{ color: posColor.bg }}>
          {getPosShort(a.position1)}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[#767676]">{a.university}</span>
          <span className="text-[10px] font-bold tabular-nums" style={{ color: a.gpa >= 8.5 ? "#16a34a" : a.gpa >= 7 ? "#555555" : "#767676" }}>
            {a.gpa.toFixed(1)}
          </span>
        </div>

        {/* Round 1 badge */}
        {r1Badge ? (
          <div className="mt-2">
            <span className="rounded-full px-1.5 py-0.5 text-[9px] font-bold" style={{ backgroundColor: r1Badge.bg, color: r1Badge.text }}>
              {a.round1Result}
            </span>
          </div>
        ) : (
          <div className="mt-2">
            <span className="rounded-full bg-[#f9f9f9] px-1.5 py-0.5 text-[9px] font-medium text-[#767676]">New</span>
          </div>
        )}
      </div>

      {/* Bottom eye button */}
      <Button
        variant="plain"
        size="plain"
        onClick={e => {
          e.stopPropagation()
          onOpenDetail()
        }}
        className="relative z-20 flex w-full items-center justify-center gap-1 border-t border-[#f5f5f5] py-2 text-[10px] font-semibold text-[#767676] opacity-0 transition-colors group-hover:opacity-100 hover:bg-[#ffdad3]/20 hover:text-[#8d1600]"
      >
        <Eye size={10} /> View
      </Button>
    </div>
  )
}
