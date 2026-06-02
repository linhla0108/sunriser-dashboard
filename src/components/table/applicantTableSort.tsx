"use client"

import { arrayMove } from "@dnd-kit/sortable"
import { ChevronDown, ChevronUp, ChevronsUpDown, Copy, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import type { CandidateSortDir, CandidateSortKey } from "@/lib/candidates/candidateUrlState"
import type { Applicant } from "@/lib/types"

function SortIcon({ col, sortKey, sortDir }: { col: CandidateSortKey; sortKey: CandidateSortKey | null; sortDir: CandidateSortDir }) {
  if (col !== sortKey) return <ChevronsUpDown className="text-muted-foreground size-3" />
  return sortDir === "asc" ? <ChevronUp className="text-primary size-3" /> : <ChevronDown className="text-primary size-3" />
}

export function SortableHeader({
  label,
  col,
  sortKey,
  sortDir,
  align = "left",
  onCycleSort,
  onSetSort,
  onResetSort,
}: {
  label: string
  col: CandidateSortKey
  sortKey: CandidateSortKey | null
  sortDir: CandidateSortDir
  align?: "left" | "center"
  onCycleSort: (key: CandidateSortKey) => void
  onSetSort: (key: CandidateSortKey, dir: CandidateSortDir) => void
  onResetSort: () => void
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger className="contents">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onCycleSort(col)}
          className={`text-muted-foreground hover:text-primary h-auto rounded-xl px-1 py-0 text-xs font-semibold tracking-wider uppercase ${align === "center" ? "mx-auto" : ""}`}
        >
          {label}
          <SortIcon col={col} sortKey={sortKey} sortDir={sortDir} />
        </Button>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuGroup>
          <ContextMenuLabel>{label}</ContextMenuLabel>
          <ContextMenuItem onClick={() => onSetSort(col, "asc")}>
            <ChevronUp />
            Sort ascending
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onSetSort(col, "desc")}>
            <ChevronDown />
            Sort descending
          </ContextMenuItem>
          <ContextMenuItem onClick={() => navigator.clipboard.writeText(label)}>
            <Copy />
            Copy column name
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuItem onClick={onResetSort}>
            <RotateCcw />
            Reset sort
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  )
}

function optionalStr(val: string | undefined): string {
  return val == null ? "￿" : val
}

export function sortApplicants(data: Applicant[], sortKey: CandidateSortKey, sortDir: CandidateSortDir) {
  return [...data].sort((a, b) => {
    let cmp = 0
    if (sortKey === "name") cmp = a.name.localeCompare(b.name)
    else if (sortKey === "position") cmp = a.position1.localeCompare(b.position1)
    else if (sortKey === "gpa") cmp = a.gpa - b.gpa
    else if (sortKey === "year") cmp = a.yearOfStudy.localeCompare(b.yearOfStudy)
    else if (sortKey === "batch") cmp = a.batch - b.batch
    else if (sortKey === "university") cmp = a.university.localeCompare(b.university)
    else if (sortKey === "pic") {
      const av = optionalStr(a.pic)
      const bv = optionalStr(b.pic)
      if (a.pic == null && b.pic == null) return 0
      if (a.pic == null) return 1
      if (b.pic == null) return -1
      cmp = av.localeCompare(bv)
    } else if (sortKey === "round1") {
      if (a.round1Result == null && b.round1Result == null) return 0
      if (a.round1Result == null) return 1
      if (b.round1Result == null) return -1
      cmp = a.round1Result.localeCompare(b.round1Result)
    } else if (sortKey === "round2") {
      if (a.round2Result == null && b.round2Result == null) return 0
      if (a.round2Result == null) return 1
      if (b.round2Result == null) return -1
      cmp = a.round2Result.localeCompare(b.round2Result)
    }
    return sortDir === "asc" ? cmp : -cmp
  })
}

export function reorderApplicantsWithinList(data: Applicant[], activeId: string, overId: string) {
  const oldIdx = data.findIndex(a => a.id === activeId)
  const newIdx = data.findIndex(a => a.id === overId)
  if (oldIdx < 0 || newIdx < 0 || oldIdx === newIdx) return data
  return arrayMove(data, oldIdx, newIdx)
}
