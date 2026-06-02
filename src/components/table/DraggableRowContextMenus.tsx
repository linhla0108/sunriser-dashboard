"use client"

import type { RefObject } from "react"
import { createPortal } from "react-dom"
import { CheckCircle2, ChevronDown, Clock, Copy, Download, Eye, Pin, PinOff, UserCheck, XCircle } from "lucide-react"
import {
  CANDIDATE_BATCH_OPTIONS,
  CANDIDATE_CHIP_STYLES,
  CANDIDATE_PIC_OPTIONS,
  CANDIDATE_ROUND_OPTIONS,
  formatCandidateBatchLabel,
} from "@/lib/candidates/constants"
import type { Applicant } from "@/lib/types"
import { cn } from "@/lib/utils"
import { exportRowCSV } from "./rowExport"

export type RowSubMenu = "copy" | "pic" | "batch" | "round1" | "round2" | null

export const VIEWPORT_MARGIN = 8

export function fitMenuPosition(anchorX: number, anchorY: number, menuWidth: number, menuHeight: number) {
  const x =
    anchorX + menuWidth + VIEWPORT_MARGIN > window.innerWidth ? Math.max(VIEWPORT_MARGIN, anchorX - menuWidth) : Math.max(VIEWPORT_MARGIN, anchorX)
  const y =
    anchorY + menuHeight + VIEWPORT_MARGIN > window.innerHeight ? Math.max(VIEWPORT_MARGIN, anchorY - menuHeight) : Math.max(VIEWPORT_MARGIN, anchorY)

  return { x, y }
}

function RoundStatusIcon({ result }: { result: string }) {
  if (result === "Passed") return <CheckCircle2 className="size-4 shrink-0 text-green-600" />
  if (result === "Failed") return <XCircle className="size-4 shrink-0 text-red-500" />
  return <Clock className="size-4 shrink-0 text-amber-500" />
}

interface DraggableRowContextMenusProps {
  applicant: Applicant
  ctxPos: { x: number; y: number } | null
  subMenu: RowSubMenu
  subPos: { x: number; y: number }
  useBulkContext: boolean
  selectedCount: number
  ctxMenuRef: RefObject<HTMLDivElement | null>
  subMenuRef: RefObject<HTMLDivElement | null>
  copyBtnRef: RefObject<HTMLButtonElement | null>
  picBtnRef: RefObject<HTMLButtonElement | null>
  batchBtnRef: RefObject<HTMLButtonElement | null>
  round1BtnRef: RefObject<HTMLButtonElement | null>
  round2BtnRef: RefObject<HTMLButtonElement | null>
  isPinned: (id: string) => boolean
  pinAdd: (id: string) => void
  pinRemove: (id: string) => void
  closeAll: () => void
  openSubMenu: (which: RowSubMenu, btnRef: RefObject<HTMLButtonElement | null>) => void
  onViewDetail?: (applicant: Applicant) => void
  onUpdateApplicant?: (id: string, patch: Partial<Applicant>) => void
  onBulkBatch?: (batch: number) => void
  onBulkPic?: (pic: string) => void
  onBulkRound1?: (result: string) => void
  onBulkRound2?: (result: string) => void
  onBulkDelete?: () => void
}

export function DraggableRowContextMenus({
  applicant,
  ctxPos,
  subMenu,
  subPos,
  useBulkContext,
  selectedCount,
  ctxMenuRef,
  subMenuRef,
  copyBtnRef,
  picBtnRef,
  batchBtnRef,
  round1BtnRef,
  round2BtnRef,
  isPinned,
  pinAdd,
  pinRemove,
  closeAll,
  openSubMenu,
  onViewDetail,
  onUpdateApplicant,
  onBulkBatch,
  onBulkPic,
  onBulkRound1,
  onBulkRound2,
  onBulkDelete,
}: DraggableRowContextMenusProps) {
  return (
    <>
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
                    if (isPinned(applicant.id)) pinRemove(applicant.id)
                    else pinAdd(applicant.id)
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
                  if (useBulkContext) onBulkPic?.(pic)
                  else onUpdateApplicant?.(applicant.id, { pic })
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
