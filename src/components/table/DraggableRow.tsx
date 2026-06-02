"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ChevronDown, Eye, GripVertical, Copy, Download, CheckCircle2, XCircle, Clock, UserCheck, Pin, PinOff, FileText } from "lucide-react"
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { SearchHighlight } from "@/components/candidates/SearchHighlight"
import { CandidatePreviewDialog, DelayedTextPreview } from "@/components/candidates/CandidatePreviewDialog"
import { PortfolioLinkPopover } from "@/components/candidates/PortfolioLinkPopover"
import {
  CANDIDATE_BATCH_OPTIONS,
  CANDIDATE_CHIP_STYLES,
  CANDIDATE_PIC_OPTIONS,
  CANDIDATE_ROUND_OPTIONS,
  formatCandidateBatchLabel,
} from "@/lib/candidates/constants"
import { candidateLinksFromApplicant } from "@/lib/candidates/candidateLinks"
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
  selectedCount?: number
  onBulkBatch?: (batch: number) => void
  onBulkPic?: (pic: string) => void
  onBulkRound1?: (result: string) => void
  onBulkRound2?: (result: string) => void
  onBulkDelete?: () => void
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
          styleKey
            ? (CANDIDATE_CHIP_STYLES[styleKey] ?? "border-border bg-muted text-muted-foreground")
            : "border-border bg-muted/60 text-muted-foreground",
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
                className="text-muted-foreground hover:bg-muted w-full justify-start px-3 py-1.5 text-left text-xs"
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
                className={cn(
                  "hover:bg-muted flex w-full items-center justify-start gap-2 px-3 py-1.5 text-left text-xs",
                  value === opt.value && "font-semibold"
                )}
              >
                <span className={cn("inline-block size-2 rounded-full border", CANDIDATE_CHIP_STYLES[opt.styleKey ?? opt.label])} />
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
  return <SelectChip value={value} options={CANDIDATE_ROUND_OPTIONS.map(option => ({ value: option, label: option }))} onChange={onChange} />
}

function BatchChip({ value, onChange }: { value?: number; onChange?: (v: number | undefined) => void }) {
  return (
    <SelectChip
      value={value}
      options={CANDIDATE_BATCH_OPTIONS.map(option => ({
        value: option,
        label: formatCandidateBatchLabel(option),
        styleKey: formatCandidateBatchLabel(option),
      }))}
      onChange={onChange}
      allowUnset={false}
    />
  )
}

function PicChip({ value, onChange }: { value?: string; onChange?: (v: string | undefined) => void }) {
  return <SelectChip value={value} options={CANDIDATE_PIC_OPTIONS.map(option => ({ value: option, label: option }))} onChange={onChange} />
}

function exportRowCSV(applicant: Applicant) {
  const headers = [
    "Name",
    "Email",
    "Phone",
    "Position",
    "University",
    "GPA",
    "Academic File",
    "Experience Description",
    "Portfolio",
    "Message",
    "Note",
    "Batch",
    "PIC",
    "Round 1",
    "Round 2",
  ]
  const row = [
    applicant.name,
    applicant.email,
    applicant.phone,
    applicant.position1,
    applicant.university,
    applicant.gpa,
    applicant.academicFile ?? "",
    applicant.experienceDesc ?? "",
    applicant.portfolio ?? "",
    applicant.sunStudioMessage ?? "",
    applicant.note ?? "",
    applicant.batch,
    applicant.pic ?? "",
    applicant.round1Result ?? "",
    applicant.round2Result ?? "",
  ]
  const csv = [headers, row].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${applicant.name.replace(/\s+/g, "-")}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

type SubMenu = "copy" | "pic" | "batch" | "round1" | "round2" | null

const VIEWPORT_MARGIN = 8

function fitMenuPosition(anchorX: number, anchorY: number, menuWidth: number, menuHeight: number) {
  const x =
    anchorX + menuWidth + VIEWPORT_MARGIN > window.innerWidth ? Math.max(VIEWPORT_MARGIN, anchorX - menuWidth) : Math.max(VIEWPORT_MARGIN, anchorX)
  const y =
    anchorY + menuHeight + VIEWPORT_MARGIN > window.innerHeight ? Math.max(VIEWPORT_MARGIN, anchorY - menuHeight) : Math.max(VIEWPORT_MARGIN, anchorY)

  return { x, y }
}

function effectiveStatus(a: Applicant): string | undefined {
  return a.round2Result || a.round1Result
}

function RoundStatusIcon({ result }: { result: string }) {
  if (result === "Passed") return <CheckCircle2 className="size-4 shrink-0 text-green-600" />
  if (result === "Failed") return <XCircle className="size-4 shrink-0 text-red-500" />
  return <Clock className="size-4 shrink-0 text-amber-500" />
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
  selectedCount = 0,
  onBulkBatch,
  onBulkPic,
  onBulkRound1,
  onBulkRound2,
  onBulkDelete,
}: DraggableRowProps) {
  const { has: isPinned, add: pinAdd, remove: pinRemove } = usePinned()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: applicant.id,
  })
  const [ctxPos, setCtxPos] = useState<{ x: number; y: number } | null>(null)
  const [subMenu, setSubMenu] = useState<SubMenu>(null)
  const [subPos, setSubPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const ctxAnchorRef = useRef<{ x: number; y: number } | null>(null)
  const ctxMenuRef = useRef<HTMLDivElement>(null)
  const subMenuRef = useRef<HTMLDivElement>(null)
  const copyBtnRef = useRef<HTMLButtonElement>(null)
  const picBtnRef = useRef<HTMLButtonElement>(null)
  const batchBtnRef = useRef<HTMLButtonElement>(null)
  const round1BtnRef = useRef<HTMLButtonElement>(null)
  const round2BtnRef = useRef<HTMLButtonElement>(null)

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

  useLayoutEffect(() => {
    if (!ctxPos) return
    const anchor = ctxAnchorRef.current
    const menu = ctxMenuRef.current
    if (!anchor || !menu) return

    const rect = menu.getBoundingClientRect()
    const next = fitMenuPosition(anchor.x, anchor.y, rect.width, rect.height)
    if (Math.abs(next.x - ctxPos.x) > 1 || Math.abs(next.y - ctxPos.y) > 1) {
      setCtxPos(next)
    }
  }, [ctxPos])

  function openSubMenu(which: SubMenu, btnRef: React.RefObject<HTMLButtonElement | null>) {
    const rect = btnRef.current?.getBoundingClientRect()
    if (!rect) return
    const SUB_W = 176
    const SUB_H = 180
    const x = rect.right + SUB_W > window.innerWidth ? rect.left - SUB_W : rect.right
    const y =
      rect.top + SUB_H + VIEWPORT_MARGIN > window.innerHeight ? Math.max(VIEWPORT_MARGIN, window.innerHeight - SUB_H - VIEWPORT_MARGIN) : rect.top
    setSubPos({ x, y })
    setSubMenu(which)
  }

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const status = effectiveStatus(applicant)
  const showSelectionCheckbox = selectionMode || isSelected
  const useBulkContext = !!isSelected && selectedCount > 0
  const rowBg =
    status === "Passed"
      ? "border-l-2 border-l-emerald-300 bg-emerald-50"
      : status === "Failed"
        ? "border-l-2 border-l-red-300 bg-red-50"
        : status === "Waiting list"
          ? "border-l-2 border-l-amber-300 bg-amber-50"
          : ""
  const selectedRowStyle = isSelected
    ? status === "Passed"
      ? "shadow-[inset_2px_0_0_rgb(110,231,183),inset_0_0_0_1px_rgba(255,85,51,0.24)]"
      : status === "Failed"
        ? "shadow-[inset_2px_0_0_rgb(252,165,165),inset_0_0_0_1px_rgba(255,85,51,0.24)]"
        : status === "Waiting list"
          ? "shadow-[inset_2px_0_0_rgb(252,211,77),inset_0_0_0_1px_rgba(255,85,51,0.24)]"
          : "bg-[#fff5f3] shadow-[inset_2px_0_0_#FF5533,inset_0_0_0_1px_rgba(255,85,51,0.22)]"
    : ""
  const portfolioLinks = candidateLinksFromApplicant(applicant)
  const academicTargets = applicant.academicFile ? [{ label: "Academic file", url: applicant.academicFile }] : []

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const MENU_W = 220
    const MENU_H_ESTIMATE = useBulkContext ? 280 : 360
    ctxAnchorRef.current = { x: e.clientX, y: e.clientY }
    setCtxPos(fitMenuPosition(e.clientX, e.clientY, MENU_W, MENU_H_ESTIMATE))
  }

  return (
    <>
      <tr
        ref={setNodeRef}
        style={style}
        onContextMenu={handleContextMenu}
        data-selected={isSelected ? "true" : undefined}
        className={`group hover:bg-muted/70 border-border border-b text-sm transition-colors ${isDragging ? "cursor-grabbing shadow-lg" : ""} ${rowBg} ${selectedRowStyle}`}
      >
        <td className="text-foreground w-11 min-w-11 px-0 py-3 text-center font-mono text-xs">
          <div className="relative mx-auto h-4 w-6">
            <span
              className={`absolute inset-0 flex items-center justify-center transition-opacity ${
                showSelectionCheckbox ? "opacity-0" : "opacity-100 group-hover:opacity-0"
              }`}
            >
              {index + 1}
            </span>
            <span
              className={`absolute inset-0 flex items-center justify-center transition-opacity ${
                showSelectionCheckbox ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
            >
              <Checkbox
                checked={!!isSelected}
                onCheckedChange={checked => onSelect?.(applicant.id, !!checked)}
                aria-label={`Select ${applicant.name}`}
                onClick={e => e.stopPropagation()}
                className={showSelectionCheckbox ? "" : "pointer-events-none group-hover:pointer-events-auto"}
              />
            </span>
          </div>
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

        {/* Academic file — desktop only */}
        <td className="hidden px-3 py-3 text-center lg:table-cell">
          <CandidatePreviewDialog
            title={`${applicant.name} academic file`}
            targets={academicTargets}
            triggerLabel={`Preview academic file for ${applicant.name}`}
            icon={FileText}
          />
        </td>

        {/* Description — wide desktop only */}
        <td className="hidden max-w-[260px] px-3 py-3 xl:table-cell">
          <DelayedTextPreview text={applicant.experienceDesc} />
        </td>

        {/* Portfolio — desktop only */}
        <td className="hidden px-3 py-3 text-center lg:table-cell">
          {portfolioLinks.length > 0 ? (
            <div className="inline-flex max-w-[88px] flex-wrap items-center justify-center gap-1">
              {portfolioLinks.map((url, linkIndex) => (
                <PortfolioLinkPopover
                  key={`${url}-${linkIndex}`}
                  url={url}
                  label={`Open portfolio ${linkIndex + 1} for ${applicant.name}`}
                  className="text-muted-foreground hover:text-primary rounded-full"
                />
              ))}
            </div>
          ) : (
            <span className="text-muted-foreground text-xs">-</span>
          )}
        </td>

        {/* Message — wide desktop only */}
        <td className="hidden max-w-[260px] px-3 py-3 xl:table-cell">
          <DelayedTextPreview text={applicant.sunStudioMessage} />
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
            data-cid={useBulkContext ? "bulk-context-menu" : "row-context-menu"}
            style={{ top: ctxPos.y, left: ctxPos.x }}
            className="border-border fixed z-[9999] min-w-52 overflow-hidden rounded-xl border bg-white py-1 shadow-xl"
          >
            <div className="text-muted-foreground truncate px-3 py-1 text-xs font-semibold">
              {useBulkContext ? `${selectedCount} candidates selected` : applicant.name}
            </div>
            <div className="bg-border -mx-0 my-1 h-px" />

            {useBulkContext ? (
              <>
                <button
                  ref={batchBtnRef}
                  type="button"
                  onMouseEnter={() => openSubMenu("batch", batchBtnRef)}
                  onClick={() => openSubMenu("batch", batchBtnRef)}
                  className={`hover:bg-muted flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm ${subMenu === "batch" ? "bg-muted" : ""}`}
                >
                  <span className="size-4 shrink-0 rounded-full border border-orange-300 bg-orange-100" /> Set Batch
                  <ChevronDown className="ml-auto size-3.5 -rotate-90" />
                </button>
                <button
                  ref={picBtnRef}
                  type="button"
                  onMouseEnter={() => openSubMenu("pic", picBtnRef)}
                  onClick={() => openSubMenu("pic", picBtnRef)}
                  className={`hover:bg-muted flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm ${subMenu === "pic" ? "bg-muted" : ""}`}
                >
                  <UserCheck className="size-4 shrink-0" /> Assign PIC
                  <ChevronDown className="ml-auto size-3.5 -rotate-90" />
                </button>
                <button
                  ref={round1BtnRef}
                  type="button"
                  onMouseEnter={() => openSubMenu("round1", round1BtnRef)}
                  onClick={() => openSubMenu("round1", round1BtnRef)}
                  className={`hover:bg-muted flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm ${subMenu === "round1" ? "bg-muted" : ""}`}
                >
                  <CheckCircle2 className="size-4 shrink-0 text-green-600" /> Set Round 1 status
                  <ChevronDown className="ml-auto size-3.5 -rotate-90" />
                </button>
                <button
                  ref={round2BtnRef}
                  type="button"
                  onMouseEnter={() => openSubMenu("round2", round2BtnRef)}
                  onClick={() => openSubMenu("round2", round2BtnRef)}
                  className={`hover:bg-muted flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm ${subMenu === "round2" ? "bg-muted" : ""}`}
                >
                  <CheckCircle2 className="size-4 shrink-0 text-green-600" /> Set Round 2 status
                  <ChevronDown className="ml-auto size-3.5 -rotate-90" />
                </button>
                <div className="bg-border -mx-0 my-1 h-px" />
                <button
                  type="button"
                  onClick={() => {
                    onBulkDelete?.()
                    closeAll()
                  }}
                  className="hover:bg-muted flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-red-600"
                >
                  <XCircle className="size-4 shrink-0" /> Delete selected
                </button>
              </>
            ) : (
              <>
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

                <button
                  ref={copyBtnRef}
                  type="button"
                  onMouseEnter={() => openSubMenu("copy", copyBtnRef)}
                  onClick={() => openSubMenu("copy", copyBtnRef)}
                  className={`hover:bg-muted flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm ${subMenu === "copy" ? "bg-muted" : ""}`}
                >
                  <Copy className="size-4 shrink-0" /> Copy
                  <ChevronDown className="ml-auto size-3.5 -rotate-90" />
                </button>

                <button
                  ref={picBtnRef}
                  type="button"
                  onMouseEnter={() => openSubMenu("pic", picBtnRef)}
                  onClick={() => openSubMenu("pic", picBtnRef)}
                  className={`hover:bg-muted flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm ${subMenu === "pic" ? "bg-muted" : ""}`}
                >
                  <UserCheck className="size-4 shrink-0" /> Assign PIC
                  <ChevronDown className="ml-auto size-3.5 -rotate-90" />
                </button>

                <div className="bg-border -mx-0 my-1 h-px" />
                <button
                  ref={round1BtnRef}
                  type="button"
                  onMouseEnter={() => openSubMenu("round1", round1BtnRef)}
                  onClick={() => openSubMenu("round1", round1BtnRef)}
                  className={`hover:bg-muted flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm ${subMenu === "round1" ? "bg-muted" : ""}`}
                >
                  <CheckCircle2 className="size-4 shrink-0 text-green-600" /> Set Round 1 status
                  <ChevronDown className="ml-auto size-3.5 -rotate-90" />
                </button>
                <button
                  ref={round2BtnRef}
                  type="button"
                  onMouseEnter={() => openSubMenu("round2", round2BtnRef)}
                  onClick={() => openSubMenu("round2", round2BtnRef)}
                  className={`hover:bg-muted flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm ${subMenu === "round2" ? "bg-muted" : ""}`}
                >
                  <CheckCircle2 className="size-4 shrink-0 text-green-600" /> Set Round 2 status
                  <ChevronDown className="ml-auto size-3.5 -rotate-90" />
                </button>

                <div className="bg-border -mx-0 my-1 h-px" />
                <button
                  type="button"
                  onClick={() => {
                    if (isPinned(applicant.id)) {
                      pinRemove(applicant.id)
                    } else {
                      pinAdd(applicant.id)
                    }
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
              </>
            )}
          </div>,
          document.body
        )}

      {/* Copy flyout */}
      {subMenu === "copy" &&
        !useBulkContext &&
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
            {CANDIDATE_PIC_OPTIONS.map(pic => (
              <button
                key={pic}
                type="button"
                disabled={!useBulkContext && applicant.pic === pic}
                onClick={() => {
                  if (useBulkContext) {
                    onBulkPic?.(pic)
                  } else {
                    onUpdateApplicant?.(applicant.id, { pic })
                  }
                  closeAll()
                }}
                className="hover:bg-muted flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm disabled:pointer-events-none disabled:opacity-50"
              >
                {!useBulkContext && applicant.pic === pic ? (
                  <CheckCircle2 className="size-3.5 shrink-0 text-green-600" />
                ) : (
                  <span className="size-3.5 shrink-0" />
                )}
                {pic}
              </button>
            ))}
          </div>,
          document.body
        )}

      {/* Set Batch flyout */}
      {subMenu === "batch" &&
        useBulkContext &&
        createPortal(
          <div
            ref={subMenuRef}
            style={{ top: subPos.y, left: subPos.x }}
            className="border-border fixed z-[10000] min-w-44 overflow-hidden rounded-xl border bg-white py-1 shadow-xl"
          >
            {CANDIDATE_BATCH_OPTIONS.map(batch => (
              <button
                key={batch}
                type="button"
                onClick={() => {
                  onBulkBatch?.(batch)
                  closeAll()
                }}
                className="hover:bg-muted flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm"
              >
                <span className={cn("inline-block size-2 rounded-full border", CANDIDATE_CHIP_STYLES[formatCandidateBatchLabel(batch)])} />
                {formatCandidateBatchLabel(batch)}
              </button>
            ))}
          </div>,
          document.body
        )}

      {/* Round status flyout */}
      {(subMenu === "round1" || subMenu === "round2") &&
        createPortal(
          <div
            ref={subMenuRef}
            style={{ top: subPos.y, left: subPos.x }}
            className="border-border fixed z-[10000] min-w-44 overflow-hidden rounded-xl border bg-white py-1 shadow-xl"
          >
            {CANDIDATE_ROUND_OPTIONS.map(result => {
              const current = subMenu === "round1" ? applicant.round1Result : applicant.round2Result
              return (
                <button
                  key={result}
                  type="button"
                  disabled={!useBulkContext && current === result}
                  onClick={() => {
                    if (useBulkContext) {
                      if (subMenu === "round1") onBulkRound1?.(result)
                      else onBulkRound2?.(result)
                    } else if (subMenu === "round1") {
                      onUpdateApplicant?.(applicant.id, { round1Result: result })
                    } else {
                      onUpdateApplicant?.(applicant.id, { round2Result: result })
                    }
                    closeAll()
                  }}
                  className="hover:bg-muted flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm disabled:pointer-events-none disabled:opacity-50"
                >
                  <RoundStatusIcon result={result} />
                  {result === "Waiting list" ? "Waiting list" : `Mark as ${result}`}
                </button>
              )
            })}
          </div>,
          document.body
        )}
    </>
  )
}
