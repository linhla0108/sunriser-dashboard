"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ChevronDown, Eye, GripVertical, Copy, Download, CheckCircle2, XCircle, Clock, UserCheck, Pin, PinOff } from "lucide-react"
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { SearchHighlight } from "@/components/candidates/SearchHighlight"
import { cn } from "@/lib/utils"
import { Applicant } from "@/lib/types"
import { usePinned } from "@/lib/pin/usePinned"

interface DraggableRowProps {
  applicant: Applicant
  index: number
  onViewDetail?: (applicant: Applicant) => void
  pinAction?: ReactNode
  onUpdateApplicant?: (id: string, patch: Partial<Applicant>) => void
  searchQuery?: string
  isSelected?: boolean
  selectionMode?: boolean
  onSelect?: (id: string, checked: boolean) => void
}

const ROUND_OPTIONS = ["Passed", "Failed", "Waiting list"] as const
const BATCH_OPTIONS = [1, 2, 3] as const
const PIC_OPTIONS = ["Quỳnh", "Nhiên", "Yến", "Minh", "Huy", "Linh"] as const

const CHIP_STYLES: Record<string, string> = {
  Passed: "border-green-300 bg-green-100 text-green-900",
  Failed: "border-red-300 bg-red-100 text-red-800",
  "Waiting list": "border-amber-300 bg-amber-100 text-amber-800",
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

function exportRowCSV(applicant: Applicant) {
  const headers = ["Name", "Email", "Position", "University", "GPA", "Batch", "PIC", "Round 1", "Round 2"]
  const row = [
    applicant.name,
    applicant.email,
    applicant.position1,
    applicant.university,
    applicant.gpa,
    applicant.batch,
    applicant.pic ?? "",
    applicant.round1Result ?? "",
    applicant.round2Result ?? "",
  ]
  const csv = [headers, row].map(r => r.map(v => `"${v}"`).join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${applicant.name.replace(/\s+/g, "-")}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

type SubMenu = "copy" | "pic" | null

function effectiveStatus(a: Applicant): string | undefined {
  return a.round2Result || a.round1Result
}

export default function DraggableRow({
  applicant,
  index,
  onViewDetail,
  pinAction,
  onUpdateApplicant,
  searchQuery,
  isSelected,
  selectionMode,
  onSelect,
}: DraggableRowProps) {
  const { has: isPinned, add: pinAdd, remove: pinRemove } = usePinned()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: applicant.id,
  })
  const [ctxPos, setCtxPos] = useState<{ x: number; y: number } | null>(null)
  const [subMenu, setSubMenu] = useState<SubMenu>(null)
  const [subPos, setSubPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const ctxMenuRef = useRef<HTMLDivElement>(null)
  const subMenuRef = useRef<HTMLDivElement>(null)
  const copyBtnRef = useRef<HTMLButtonElement>(null)
  const picBtnRef = useRef<HTMLButtonElement>(null)

  const closeAll = useCallback(() => {
    setCtxPos(null)
    setSubMenu(null)
  }, [])

  useEffect(() => {
    if (!ctxPos) return
    function onDown(e: MouseEvent) {
      const target = e.target as Node
      const inMenu = ctxMenuRef.current?.contains(target)
      const inSub = subMenuRef.current?.contains(target)
      if (!inMenu && !inSub) closeAll()
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeAll()
    }
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [ctxPos, closeAll])

  function openSubMenu(which: SubMenu, btnRef: React.RefObject<HTMLButtonElement | null>) {
    if (subMenu === which) {
      setSubMenu(null)
      return
    }
    const rect = btnRef.current?.getBoundingClientRect()
    if (!rect) return
    const SUB_W = 176
    const x = rect.right + SUB_W > window.innerWidth ? rect.left - SUB_W : rect.right
    setSubPos({ x, y: rect.top })
    setSubMenu(which)
  }

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const status = effectiveStatus(applicant)
  const rowBg =
    status === "Passed"
      ? "border-l-2 border-emerald-300 bg-emerald-50"
      : status === "Failed"
        ? "border-l-2 border-red-300 bg-red-50"
        : status === "Waiting list"
          ? "border-l-2 border-amber-300 bg-amber-50"
          : ""

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    // Overflow guard: flip left if within 220px of right edge,
    // flip up if within 500px of bottom edge (menu can be ~470px tall with all sections).
    const MENU_W = 220
    const MENU_H = 500
    const x = e.clientX + MENU_W > window.innerWidth ? e.clientX - MENU_W : e.clientX
    const y = e.clientY + MENU_H > window.innerHeight ? e.clientY - MENU_H : e.clientY
    setCtxPos({ x: Math.max(0, x), y: Math.max(0, y) })
  }

  return (
    <>
      <tr
        ref={setNodeRef}
        style={style}
        onContextMenu={handleContextMenu}
        className={`group border-border hover:bg-muted/70 border-b text-sm transition-colors ${isDragging ? "cursor-grabbing shadow-lg" : ""} ${rowBg} ${isSelected ? "bg-[#fff5f3]" : ""}`}
      >
        <td className="text-foreground w-8 px-3 py-3 text-center font-mono text-xs">
          {selectionMode || isSelected ? (
            <div className="flex justify-center">
              <Checkbox
                checked={!!isSelected}
                onCheckedChange={checked => onSelect?.(applicant.id, !!checked)}
                aria-label={`Select ${applicant.name}`}
                onClick={e => e.stopPropagation()}
              />
            </div>
          ) : (
            <div className="relative flex h-4 items-center justify-center">
              <span className="absolute group-hover:invisible">{index + 1}</span>
              <span className="invisible absolute flex items-center justify-center group-hover:visible">
                <Checkbox
                  checked={false}
                  onCheckedChange={checked => onSelect?.(applicant.id, !!checked)}
                  aria-label={`Select ${applicant.name}`}
                  onClick={e => e.stopPropagation()}
                />
              </span>
            </div>
          )}
        </td>

        {/* Name — always visible */}
        <td className="px-3 py-3">
          <div>
            <p className="text-foreground max-w-[140px] truncate font-medium sm:max-w-none">
              <SearchHighlight text={applicant.name} query={searchQuery} />
            </p>
            <p className="text-muted-foreground mt-0.5 hidden text-xs sm:block">
              <SearchHighlight text={applicant.email} query={searchQuery} />
            </p>
          </div>
        </td>

        {/* Position — always visible */}
        <td className="px-3 py-3">
          <span className="text-foreground text-xs whitespace-nowrap">
            <SearchHighlight text={applicant.position1.replace(" Intern", "")} query={searchQuery} />
          </span>
        </td>

        {/* University — desktop only */}
        <td className="hidden px-3 py-3 lg:table-cell">
          <span className="text-foreground text-xs">
            <SearchHighlight text={applicant.university} query={searchQuery} />
          </span>
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

      {ctxPos &&
        createPortal(
          <div
            ref={ctxMenuRef}
            style={{ top: ctxPos.y, left: ctxPos.x }}
            className="border-border fixed z-[9999] min-w-52 overflow-hidden rounded-xl border bg-white py-1 shadow-xl"
          >
            <div className="text-muted-foreground truncate px-3 py-1 text-xs font-semibold">{applicant.name}</div>
            <div className="bg-border -mx-0 my-1 h-px" />

            {onViewDetail && (
              <button
                type="button"
                onClick={() => {
                  onViewDetail(applicant)
                  closeAll()
                }}
                className="hover:bg-muted flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm"
              >
                <Eye className="size-4 shrink-0" /> View detail
              </button>
            )}

            {/* Copy submenu */}
            <button
              ref={copyBtnRef}
              type="button"
              onClick={() => openSubMenu("copy", copyBtnRef)}
              className={`hover:bg-muted flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm ${subMenu === "copy" ? "bg-muted" : ""}`}
            >
              <Copy className="size-4 shrink-0" /> Copy
              <ChevronDown className="ml-auto size-3.5 -rotate-90" />
            </button>

            {/* Assign PIC submenu */}
            <button
              ref={picBtnRef}
              type="button"
              onClick={() => openSubMenu("pic", picBtnRef)}
              className={`hover:bg-muted flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm ${subMenu === "pic" ? "bg-muted" : ""}`}
            >
              <UserCheck className="size-4 shrink-0" /> Assign PIC
              <ChevronDown className="ml-auto size-3.5 -rotate-90" />
            </button>

            {/* Round 1 status */}
            <div className="bg-border -mx-0 my-1 h-px" />
            <div className="text-muted-foreground px-3 py-1 text-xs font-semibold">Round 1 status</div>
            <button
              type="button"
              disabled={applicant.round1Result === "Passed"}
              onClick={() => {
                onUpdateApplicant?.(applicant.id, { round1Result: "Passed" })
                closeAll()
              }}
              className="hover:bg-muted flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm disabled:pointer-events-none disabled:opacity-40"
            >
              <CheckCircle2 className="size-4 shrink-0 text-green-600" /> Mark as Passed
            </button>
            <button
              type="button"
              disabled={applicant.round1Result === "Failed"}
              onClick={() => {
                onUpdateApplicant?.(applicant.id, { round1Result: "Failed" })
                closeAll()
              }}
              className="hover:bg-muted flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm disabled:pointer-events-none disabled:opacity-40"
            >
              <XCircle className="size-4 shrink-0 text-red-500" /> Mark as Failed
            </button>
            <button
              type="button"
              disabled={applicant.round1Result === "Waiting list"}
              onClick={() => {
                onUpdateApplicant?.(applicant.id, { round1Result: "Waiting list" })
                closeAll()
              }}
              className="hover:bg-muted flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm disabled:pointer-events-none disabled:opacity-40"
            >
              <Clock className="size-4 shrink-0 text-amber-500" /> Waiting list
            </button>

            {/* Round 2 status */}
            <div className="bg-border -mx-0 my-1 h-px" />
            <div className="text-muted-foreground px-3 py-1 text-xs font-semibold">Round 2 status</div>
            <button
              type="button"
              disabled={applicant.round2Result === "Passed"}
              onClick={() => {
                onUpdateApplicant?.(applicant.id, { round2Result: "Passed" })
                closeAll()
              }}
              className="hover:bg-muted flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm disabled:pointer-events-none disabled:opacity-40"
            >
              <CheckCircle2 className="size-4 shrink-0 text-green-600" /> Mark as Passed
            </button>
            <button
              type="button"
              disabled={applicant.round2Result === "Failed"}
              onClick={() => {
                onUpdateApplicant?.(applicant.id, { round2Result: "Failed" })
                closeAll()
              }}
              className="hover:bg-muted flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm disabled:pointer-events-none disabled:opacity-40"
            >
              <XCircle className="size-4 shrink-0 text-red-500" /> Mark as Failed
            </button>
            <button
              type="button"
              disabled={applicant.round2Result === "Waiting list"}
              onClick={() => {
                onUpdateApplicant?.(applicant.id, { round2Result: "Waiting list" })
                closeAll()
              }}
              className="hover:bg-muted flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm disabled:pointer-events-none disabled:opacity-40"
            >
              <Clock className="size-4 shrink-0 text-amber-500" /> Waiting list
            </button>

            {/* Pin + Export */}
            <div className="bg-border -mx-0 my-1 h-px" />
            <button
              type="button"
              onClick={() => {
                isPinned(applicant.id) ? pinRemove(applicant.id) : pinAdd(applicant.id)
                closeAll()
              }}
              className="hover:bg-muted flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm"
            >
              {isPinned(applicant.id) ? (
                <PinOff className="text-muted-foreground size-4 shrink-0" />
              ) : (
                <Pin className="text-primary size-4 shrink-0" />
              )}
              {isPinned(applicant.id) ? "Unpin" : "Pin to compare"}
            </button>
            <button
              type="button"
              onClick={() => {
                exportRowCSV(applicant)
                closeAll()
              }}
              className="hover:bg-muted flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm"
            >
              <Download className="size-4 shrink-0" /> Export row as CSV
            </button>
          </div>,
          document.body
        )}

      {/* Copy flyout */}
      {subMenu === "copy" &&
        createPortal(
          <div
            ref={subMenuRef}
            style={{ top: subPos.y, left: subPos.x }}
            className="border-border fixed z-[10000] min-w-44 overflow-hidden rounded-xl border bg-white py-1 shadow-xl"
          >
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(applicant.name)
                closeAll()
              }}
              className="hover:bg-muted w-full px-3 py-1.5 text-left text-sm"
            >
              Copy name
            </button>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(applicant.email)
                closeAll()
              }}
              className="hover:bg-muted w-full px-3 py-1.5 text-left text-sm"
            >
              Copy email
            </button>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(applicant.phone)
                closeAll()
              }}
              className="hover:bg-muted w-full px-3 py-1.5 text-left text-sm"
            >
              Copy phone
            </button>
          </div>,
          document.body
        )}

      {/* Assign PIC flyout */}
      {subMenu === "pic" &&
        createPortal(
          <div
            ref={subMenuRef}
            style={{ top: subPos.y, left: subPos.x }}
            className="border-border fixed z-[10000] min-w-44 overflow-hidden rounded-xl border bg-white py-1 shadow-xl"
          >
            {PIC_OPTIONS.map(pic => (
              <button
                key={pic}
                type="button"
                disabled={applicant.pic === pic}
                onClick={() => {
                  onUpdateApplicant?.(applicant.id, { pic })
                  closeAll()
                }}
                className="hover:bg-muted flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm disabled:pointer-events-none disabled:opacity-50"
              >
                {applicant.pic === pic ? <CheckCircle2 className="size-3.5 shrink-0 text-green-600" /> : <span className="size-3.5 shrink-0" />}
                {pic}
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  )
}
