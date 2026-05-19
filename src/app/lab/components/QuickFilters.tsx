"use client"

import { X } from "lucide-react"
import { FilterCondition } from "../lab-types"
import { ALL_POSITIONS, getPosColor, getPosShort } from "../lab-utils"
import { Button } from "@/components/ui/button"

const ROUND1_OPTIONS = [
  {
    value: "Passed",
    color: {
      active: "bg-[#22c55e] text-white",
      inactive: "bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0]",
    },
  },
  {
    value: "Failed",
    color: {
      active: "bg-[#ef4444] text-white",
      inactive: "bg-[#fef2f2] text-[#dc2626] border border-[#fecaca]",
    },
  },
  {
    value: "Waiting list",
    color: {
      active: "bg-[#f59e0b] text-white",
      inactive: "bg-[#fffbeb] text-[#d97706] border border-[#fde68a]",
    },
  },
]

interface QuickFiltersProps {
  position: string
  batch: string
  round1: string
  onPosition: (v: string) => void
  onBatch: (v: string) => void
  onRound1: (v: string) => void
  extraConditions: FilterCondition[]
  onRemoveCondition: (id: string) => void
}

export default function QuickFilters({
  position,
  batch,
  round1,
  onPosition,
  onBatch,
  onRound1,
  extraConditions,
  onRemoveCondition,
}: QuickFiltersProps) {
  const hasAnyFilter = position || batch || round1 || extraConditions.length > 0

  return (
    <div className="mb-3 flex flex-wrap items-center gap-1.5">
      {/* Batch */}
      {["1", "2", "3"].map(b => (
        <Button
          variant="plain"
          size="plain"
          key={b}
          onClick={() => onBatch(batch === b ? "" : b)}
          className={`h-6 rounded-full px-2.5 text-xs font-semibold transition-all ${batch === b ? "bg-[#1b1b1b] text-white" : "bg-[#f9f9f9] text-[#555555] hover:bg-[#f0f0f0]"}`}
        >
          Batch {b}
        </Button>
      ))}

      <div className="h-4 w-px bg-[#e8e8e8]" />

      {/* Round 1 result */}
      {ROUND1_OPTIONS.map(({ value, color }) => (
        <Button
          variant="plain"
          size="plain"
          key={value}
          onClick={() => onRound1(round1 === value ? "" : value)}
          className={`h-6 rounded-full px-2.5 text-xs font-semibold transition-all ${round1 === value ? color.active : color.inactive}`}
        >
          {value}
        </Button>
      ))}

      <div className="h-4 w-px bg-[#e8e8e8]" />

      {/* Position chips */}
      {ALL_POSITIONS.map(pos => {
        const c = getPosColor(pos)
        const isActive = position === pos
        return (
          <Button
            variant="plain"
            size="plain"
            key={pos}
            onClick={() => onPosition(isActive ? "" : pos)}
            className="h-6 rounded-full px-2.5 text-xs font-semibold transition-all"
            style={{
              backgroundColor: isActive ? c.bg : c.light,
              color: isActive ? c.text : "#555555",
              border: isActive ? "none" : `1px solid ${c.bg}55`,
            }}
          >
            {getPosShort(pos)}
          </Button>
        )
      })}

      {/* Extra filter builder conditions */}
      {extraConditions.map(cond => (
        <span
          key={cond.id}
          className="flex h-6 items-center gap-1 rounded-full border border-[#8d1600] bg-[#ffdad3]/20 px-2.5 text-xs font-semibold text-[#8d1600]"
        >
          {cond.field} {cond.operator} {cond.value}
          <Button variant="plain" size="plain" onClick={() => onRemoveCondition(cond.id)} className="ml-0.5 hover:text-[#7a1200]">
            <X size={9} />
          </Button>
        </span>
      ))}

      {/* Clear all */}
      {hasAnyFilter && (
        <Button
          variant="plain"
          size="plain"
          onClick={() => {
            onPosition("")
            onBatch("")
            onRound1("")
          }}
          className="flex h-6 items-center gap-1 rounded-full px-2.5 text-xs font-medium text-[#767676] transition-colors hover:bg-[#f9f9f9] hover:text-[#1b1b1b]"
        >
          <X size={9} />
          Clear
        </Button>
      )}
    </div>
  )
}
