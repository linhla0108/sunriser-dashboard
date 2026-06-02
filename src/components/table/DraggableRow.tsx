"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Eye, GripVertical, FileText } from "lucide-react"
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { SearchHighlight } from "@/components/candidates/SearchHighlight"
import { CandidatePreviewDialog, DelayedTextPreview } from "@/components/candidates/CandidatePreviewDialog"
import { PortfolioLinkPopover } from "@/components/candidates/PortfolioLinkPopover"
import { candidateLinksFromApplicant } from "@/lib/candidates/candidateLinks"
import { Applicant } from "@/lib/types"
import { usePinned } from "@/lib/pin/usePinned"
import { BatchChip, PicChip, RoundChip } from "./DraggableRowChips"
import { DraggableRowContextMenus, VIEWPORT_MARGIN, fitMenuPosition, type RowSubMenu } from "./DraggableRowContextMenus"

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
  const [subMenu, setSubMenu] = useState<RowSubMenu>(null)
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

  function openSubMenu(which: RowSubMenu, btnRef: React.RefObject<HTMLButtonElement | null>) {
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

      <DraggableRowContextMenus
        applicant={applicant}
        ctxPos={ctxPos}
        subMenu={subMenu}
        subPos={subPos}
        useBulkContext={useBulkContext}
        selectedCount={selectedCount}
        ctxMenuRef={ctxMenuRef}
        subMenuRef={subMenuRef}
        copyBtnRef={copyBtnRef}
        picBtnRef={picBtnRef}
        batchBtnRef={batchBtnRef}
        round1BtnRef={round1BtnRef}
        round2BtnRef={round2BtnRef}
        isPinned={isPinned}
        pinAdd={pinAdd}
        pinRemove={pinRemove}
        closeAll={closeAll}
        openSubMenu={openSubMenu}
        onViewDetail={onViewDetail}
        onUpdateApplicant={onUpdateApplicant}
        onBulkBatch={onBulkBatch}
        onBulkPic={onBulkPic}
        onBulkRound1={onBulkRound1}
        onBulkRound2={onBulkRound2}
        onBulkDelete={onBulkDelete}
      />
    </>
  )
}
