"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ChevronDown, Eye, GripVertical } from "lucide-react"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Applicant } from "@/lib/types"

interface DraggableRowProps {
  applicant: Applicant
  index: number
  onViewDetail?: (applicant: Applicant) => void
  pinAction?: ReactNode
  onUpdateApplicant?: (id: string, patch: Partial<Applicant>) => void
}

const ROUND_OPTIONS = ["Passed", "Failed", "Waiting list"] as const
const BATCH_OPTIONS = [1, 2, 3] as const
const PIC_OPTIONS = ["Quỳnh", "Nhiên", "Yến", "Minh", "Huy", "Linh"] as const

const CHIP_STYLES: Record<string, string> = {
  Passed: "border-green-300 bg-green-100 text-green-900",
  Failed: "border-red-300 bg-red-50 text-red-800",
  "Waiting list": "border-amber-300 bg-amber-50 text-amber-800",
  "Batch 1": "border-sky-300 bg-sky-50 text-sky-800",
  "Batch 2": "border-violet-300 bg-violet-50 text-violet-800",
  "Batch 3": "border-orange-300 bg-orange-50 text-orange-800",
  Quỳnh: "border-rose-300 bg-rose-50 text-rose-800",
  Nhiên: "border-teal-300 bg-teal-50 text-teal-800",
  Yến: "border-indigo-300 bg-indigo-50 text-indigo-800",
  Minh: "border-lime-300 bg-lime-50 text-lime-800",
  Huy: "border-cyan-300 bg-cyan-50 text-cyan-800",
  Linh: "border-fuchsia-300 bg-fuchsia-50 text-fuchsia-800",
}

interface ChipOption<T extends string | number> {
  label: string
  value: T
  styleKey?: string
}

function SelectChip<T extends string | number>({
  value,
  options,
  onChange,
  unsetLabel = "— unset",
  allowUnset = true,
}: {
  value?: T
  options: ChipOption<T>[]
  onChange?: (v: T | undefined) => void
  unsetLabel?: string
  allowUnset?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const selected = options.find(opt => opt.value === value)
  const label = selected?.label ?? (value ? String(value) : "————")
  const styleKey = selected?.styleKey ?? selected?.label ?? (value ? String(value) : undefined)

  useEffect(() => {
    if (!open) return
    function handle(e: MouseEvent) {
      const target = e.target as Node
      if (!btnRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handle)
    return () => document.removeEventListener("mousedown", handle)
  }, [open])

  function handleOpen() {
    if (!onChange) return
    const rect = btnRef.current?.getBoundingClientRect()
    if (rect) setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width })
    setOpen(v => !v)
  }

  return (
    <span data-round-chip="" className="block w-full">
      <Button
        variant="plain"
        size="plain"
        ref={btnRef}
        type="button"
        onClick={handleOpen}
        className={cn(
          "flex w-full min-w-0 items-center justify-center gap-1 rounded-full border px-2 py-0.5 text-center text-xs font-medium transition-opacity",
          styleKey ? (CHIP_STYLES[styleKey] ?? "border-border bg-muted text-muted-foreground") : "border-border bg-muted/60 text-muted-foreground",
          onChange ? "cursor-pointer hover:opacity-75" : "cursor-default"
        )}
      >
        <span className="min-w-0 truncate">{label}</span>
        {onChange && <ChevronDown className="size-2.5 shrink-0 opacity-50" />}
      </Button>

      {open &&
        onChange &&
        createPortal(
          <div
            ref={menuRef}
            data-round-chip=""
            style={{ top: pos.top, left: pos.left, width: pos.width }}
            data-v2-glass-panel="strong"
            className="border-border fixed z-[9999] min-w-[130px] overflow-hidden rounded-xl border bg-white py-1 shadow-xl"
          >
            {allowUnset && (
              <Button
                variant="plain"
                size="plain"
                type="button"
                onClick={() => {
                  onChange(undefined)
                  setOpen(false)
                }}
                className="text-muted-foreground hover:bg-muted w-full px-3 py-1.5 text-left text-xs"
              >
                {unsetLabel}
              </Button>
            )}
            {options.map(opt => (
              <Button
                variant="plain"
                size="plain"
                key={String(opt.value)}
                type="button"
                onClick={() => {
                  onChange(opt.value)
                  setOpen(false)
                }}
                className={cn("hover:bg-muted flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs", value === opt.value && "font-semibold")}
              >
                <span className={cn("inline-block size-2 rounded-full border", CHIP_STYLES[opt.styleKey ?? opt.label])} />
                {opt.label}
              </Button>
            ))}
          </div>,
          document.body
        )}
    </span>
  )
}

function RoundChip({ value, onChange }: { value?: string; onChange?: (v: string | undefined) => void }) {
  return <SelectChip value={value} options={ROUND_OPTIONS.map(value => ({ value, label: value }))} onChange={onChange} />
}

function BatchChip({ value, onChange }: { value?: number; onChange?: (v: number | undefined) => void }) {
  return (
    <SelectChip
      value={value}
      options={BATCH_OPTIONS.map(value => ({ value, label: `Batch ${value}`, styleKey: `Batch ${value}` }))}
      onChange={onChange}
      allowUnset={false}
    />
  )
}

function PicChip({ value, onChange }: { value?: string; onChange?: (v: string | undefined) => void }) {
  return <SelectChip value={value} options={PIC_OPTIONS.map(value => ({ value, label: value }))} onChange={onChange} />
}

export default function DraggableRow({ applicant, index, onViewDetail, pinAction, onUpdateApplicant }: DraggableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: applicant.id,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const rowBg = applicant.round1Result === "Passed" ? "bg-green-50/60" : applicant.round1Result === "Waiting list" ? "bg-amber-50/60" : ""

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-border hover:bg-muted/70 border-b text-sm transition-colors ${isDragging ? "cursor-grabbing shadow-lg" : ""} ${rowBg}`}
    >
      <td className="text-foreground w-8 px-3 py-3 text-center font-mono text-xs">{index + 1}</td>

      {/* Name — always visible */}
      <td className="px-3 py-3">
        <div>
          <p className="text-foreground max-w-[140px] truncate font-medium sm:max-w-none">{applicant.name}</p>
          <p className="text-muted-foreground mt-0.5 hidden text-xs sm:block">{applicant.email}</p>
        </div>
      </td>

      {/* Position — always visible */}
      <td className="px-3 py-3">
        <span className="text-foreground text-xs whitespace-nowrap">{applicant.position1.replace(" Intern", "")}</span>
      </td>

      {/* University — desktop only */}
      <td className="hidden px-3 py-3 lg:table-cell">
        <span className="text-foreground text-xs">{applicant.university}</span>
      </td>

      {/* GPA — tablet+ */}
      <td className="hidden px-3 py-3 text-center sm:table-cell">
        <span
          className={`text-sm font-semibold ${applicant.gpa >= 8.5 ? "text-foreground" : applicant.gpa >= 7.0 ? "text-muted-foreground" : "text-amber-600"}`}
        >
          {applicant.gpa.toFixed(1)}
        </span>
      </td>

      {/* Year — desktop only */}
      <td className="hidden px-3 py-3 text-center lg:table-cell">
        <span className="text-muted-foreground text-xs">{applicant.yearOfStudy.replace("Năm ", "")}</span>
      </td>

      {/* Batch — tablet+ */}
      <td className="hidden px-3 py-3 text-center sm:table-cell">
        <BatchChip value={applicant.batch} onChange={onUpdateApplicant ? v => onUpdateApplicant(applicant.id, { batch: v }) : undefined} />
      </td>

      {/* PIC — desktop only */}
      <td className="hidden px-3 py-3 lg:table-cell">
        <PicChip value={applicant.pic} onChange={onUpdateApplicant ? v => onUpdateApplicant(applicant.id, { pic: v }) : undefined} />
      </td>

      {/* Round 1 — always visible */}
      <td className="px-3 py-3">
        <RoundChip
          value={applicant.round1Result}
          onChange={onUpdateApplicant ? v => onUpdateApplicant(applicant.id, { round1Result: v }) : undefined}
        />
      </td>

      {/* Round 2 — tablet+ */}
      <td className="hidden px-3 py-3 sm:table-cell">
        <RoundChip
          value={applicant.round2Result}
          onChange={onUpdateApplicant ? v => onUpdateApplicant(applicant.id, { round2Result: v }) : undefined}
        />
      </td>

      <td className="px-3 py-3 pr-4">
        <div className="flex items-center justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            {...attributes}
            {...listeners}
            className="text-muted-foreground hover:text-muted-foreground cursor-grab touch-none rounded-full active:cursor-grabbing"
            aria-label="Grab row to reorder"
            title="Grab row to reorder"
          >
            <GripVertical />
          </Button>
          {pinAction}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onViewDetail?.(applicant)}
            disabled={!onViewDetail}
            className="text-muted-foreground hover:text-primary rounded-full"
            aria-label="View applicant"
          >
            <Eye />
          </Button>
        </div>
      </td>
    </tr>
  )
}
