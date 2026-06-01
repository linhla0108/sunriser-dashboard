"use client"

import { CheckCircle2, Clock, Copy, Download, Eye, Pin, PinOff, UserCheck, XCircle } from "lucide-react"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { usePinned } from "@/lib/pin/usePinned"
import type { Applicant } from "@/lib/types"

const ROUND_OPTIONS = ["Passed", "Failed", "Waiting list"] as const
const BATCH_OPTIONS = [1, 2, 3] as const
const PIC_OPTIONS = ["Quỳnh", "Nhiên", "Yến", "Minh", "Huy", "Linh"] as const

interface CandidateCardContextMenuProps {
  applicant: Applicant
  children: React.ReactNode
  onViewDetail?: (applicant: Applicant) => void
  onUpdateApplicant?: (id: string, patch: Partial<Applicant>) => void
}

function escapeCSV(value: unknown): string {
  return `"${String(value ?? "").replace(/"/g, '""')}"`
}

function exportCandidateCSV(applicant: Applicant) {
  const headers = ["Name", "Email", "Phone", "Position", "University", "GPA", "Batch", "PIC", "Round 1", "Round 2"]
  const row = [
    applicant.name,
    applicant.email,
    applicant.phone,
    applicant.position1,
    applicant.university,
    applicant.gpa,
    applicant.batch,
    applicant.pic ?? "",
    applicant.round1Result ?? "",
    applicant.round2Result ?? "",
  ]
  const csv = [headers, row].map(items => items.map(escapeCSV).join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${applicant.name.replace(/\s+/g, "-")}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

function copyCandidateSummary(applicant: Applicant) {
  navigator.clipboard.writeText([applicant.name, applicant.email, applicant.phone, applicant.position1].filter(Boolean).join("\n"))
}

function RoundIcon({ result }: { result: string }) {
  if (result === "Passed") return <CheckCircle2 className="size-4 text-green-600" />
  if (result === "Failed") return <XCircle className="size-4 text-red-500" />
  return <Clock className="size-4 text-amber-500" />
}

export function CandidateCardContextMenu({ applicant, children, onViewDetail, onUpdateApplicant }: CandidateCardContextMenuProps) {
  const { has: isPinned, add: pinAdd, remove: pinRemove } = usePinned()
  const canEdit = !!onUpdateApplicant
  const pinned = isPinned(applicant.id)

  function update(patch: Partial<Applicant>) {
    onUpdateApplicant?.(applicant.id, patch)
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger className="contents">{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuLabel className="truncate">{applicant.name}</ContextMenuLabel>
        {onViewDetail ? (
          <ContextMenuItem onClick={() => onViewDetail(applicant)}>
            <Eye />
            View detail
          </ContextMenuItem>
        ) : null}
        <ContextMenuItem onClick={() => copyCandidateSummary(applicant)}>
          <Copy />
          Copy summary
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => {
            if (pinned) pinRemove(applicant.id)
            else pinAdd(applicant.id)
          }}
        >
          {pinned ? <PinOff /> : <Pin />}
          {pinned ? "Unpin from compare" : "Pin to compare"}
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuSub>
          <ContextMenuSubTrigger disabled={!canEdit}>
            <UserCheck />
            Assign PIC
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-44">
            <ContextMenuGroup>
              {PIC_OPTIONS.map(pic => (
                <ContextMenuItem key={pic} disabled={applicant.pic === pic} onClick={() => update({ pic })}>
                  {applicant.pic === pic ? <CheckCircle2 className="text-green-600" /> : <span className="size-4" />}
                  {pic}
                </ContextMenuItem>
              ))}
            </ContextMenuGroup>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSub>
          <ContextMenuSubTrigger disabled={!canEdit}>
            <span className="size-4 rounded-full border border-orange-300 bg-orange-100" />
            Set Batch
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-40">
            <ContextMenuGroup>
              {BATCH_OPTIONS.map(batch => (
                <ContextMenuItem key={batch} disabled={applicant.batch === batch} onClick={() => update({ batch })}>
                  {applicant.batch === batch ? <CheckCircle2 className="text-green-600" /> : <span className="size-4" />}
                  Batch {batch}
                </ContextMenuItem>
              ))}
            </ContextMenuGroup>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSub>
          <ContextMenuSubTrigger disabled={!canEdit}>
            <CheckCircle2 />
            Set Round 1
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            {ROUND_OPTIONS.map(result => (
              <ContextMenuItem key={result} disabled={applicant.round1Result === result} onClick={() => update({ round1Result: result })}>
                <RoundIcon result={result} />
                {result}
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSub>
          <ContextMenuSubTrigger disabled={!canEdit}>
            <CheckCircle2 />
            Set Round 2
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            {ROUND_OPTIONS.map(result => (
              <ContextMenuItem key={result} disabled={applicant.round2Result === result} onClick={() => update({ round2Result: result })}>
                <RoundIcon result={result} />
                {result}
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSeparator />

        <ContextMenuItem onClick={() => exportCandidateCSV(applicant)}>
          <Download />
          Export candidate CSV
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
