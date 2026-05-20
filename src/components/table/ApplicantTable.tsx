"use client"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { ChevronUp, ChevronDown, ChevronsUpDown, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Applicant } from "@/lib/types"
import type { CandidateSortDir, CandidateSortKey, CandidateSortState } from "@/lib/candidates/candidateUrlState"
import DraggableRow from "./DraggableRow"

export interface PaginationInfo {
  start: number
  end: number
  total: number
  currentPage: number
  totalPages: number
}

interface ApplicantTableProps {
  data: Applicant[]
  onViewDetail?: (applicant: Applicant) => void
  onDataChange?: (applicants: Applicant[]) => void
  renderPinAction?: (applicant: Applicant) => ReactNode
  indexOffset?: number
  paginationInfo?: PaginationInfo
  searchQuery?: string
  sortState?: CandidateSortState
  onSortChange?: (sortState: CandidateSortState) => void
}

const DEFAULT_SORT_STATE: Exclude<CandidateSortState, null> = { key: "name", dir: "asc" }

function SortIcon({ col, sortKey, sortDir }: { col: CandidateSortKey; sortKey: CandidateSortKey | null; sortDir: CandidateSortDir }) {
  if (col !== sortKey) return <ChevronsUpDown className="text-muted-foreground size-3" />
  return sortDir === "asc" ? <ChevronUp className="text-primary size-3" /> : <ChevronDown className="text-primary size-3" />
}

// undefined optional fields always sort to the bottom regardless of direction
function optionalStr(val: string | undefined): string {
  return val == null ? "￿" : val
}

function sortApplicants(data: Applicant[], sortKey: CandidateSortKey, sortDir: CandidateSortDir) {
  return [...data].sort((a, b) => {
    let cmp = 0
    if (sortKey === "name") cmp = a.name.localeCompare(b.name)
    else if (sortKey === "position") cmp = a.position1.localeCompare(b.position1)
    else if (sortKey === "gpa") cmp = a.gpa - b.gpa
    else if (sortKey === "year") cmp = a.yearOfStudy.localeCompare(b.yearOfStudy)
    else if (sortKey === "batch") cmp = a.batch - b.batch
    else if (sortKey === "university") cmp = a.university.localeCompare(b.university)
    else if (sortKey === "pic") {
      const av = optionalStr(a.pic),
        bv = optionalStr(b.pic)
      // Keep undefined always at the bottom: if sentinel involved, don't flip
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

export default function ApplicantTable({
  data,
  onViewDetail,
  onDataChange,
  renderPinAction,
  indexOffset = 0,
  paginationInfo,
  searchQuery,
  sortState,
  onSortChange,
}: ApplicantTableProps) {
  // TODO: remove default sort and sort name will get the last word in name (e.g. "John Doe" will sort by "Doe"). Need to update sort icon to indicate this as well.
  const initialSort = sortState === undefined ? DEFAULT_SORT_STATE : sortState
  const [items, setItems] = useState<Applicant[]>(() => (initialSort ? sortApplicants(data, initialSort.key, initialSort.dir) : [...data]))
  const [sortKey, setSortKey] = useState<CandidateSortKey | null>(initialSort?.key ?? null)
  const [sortDir, setSortDir] = useState<CandidateSortDir>(initialSort?.dir ?? "asc")
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set())
  const sortStateRef = useRef<{ sortKey: CandidateSortKey | null; sortDir: CandidateSortDir }>({
    sortKey: initialSort?.key ?? null,
    sortDir: initialSort?.dir ?? "asc",
  })
  const originalOrderRef = useRef<Applicant[]>(data)

  useEffect(() => {
    sortStateRef.current = { sortKey, sortDir }
  }, [sortKey, sortDir])

  // Re-sync when incoming pre-filtered data changes, preserving current sort
  useEffect(() => {
    originalOrderRef.current = data
    const { sortKey: currentSortKey, sortDir: currentSortDir } = sortStateRef.current
    if (currentSortKey) {
      setItems(sortApplicants(data, currentSortKey, currentSortDir))
    } else {
      setItems([...data])
    }
  }, [data])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleSort(key: CandidateSortKey) {
    let nextSort: CandidateSortState
    if (sortKey !== key) {
      // New column: start with asc
      nextSort = { key, dir: "asc" }
      setSortKey(key)
      setSortDir("asc")
      setItems(prev => sortApplicants(prev, key, "asc"))
    } else if (sortDir === "asc") {
      // Same column, asc → desc
      nextSort = { key, dir: "desc" }
      setSortDir("desc")
      setItems(prev => sortApplicants(prev, key, "desc"))
    } else {
      // Same column, desc → clear (restore original order)
      nextSort = null
      setSortKey(null)
      setItems([...originalOrderRef.current])
    }
    onSortChange?.(nextSort)
  }

  function handleUpdateApplicant(id: string, patch: Partial<Applicant>) {
    const next = items.map(a => (a.id === id ? { ...a, ...patch } : a))
    setItems(next)
    onDataChange?.(next)
  }

  function togglePin(id: string) {
    setPinnedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        // Restore to current sort order
        setItems(cur => (sortKey ? sortApplicants(cur, sortKey, sortDir) : [...originalOrderRef.current]))
      } else {
        next.add(id)
        // Move pinned item to front
        setItems(cur => {
          const item = cur.find(a => a.id === id)
          if (!item) return cur
          return [item, ...cur.filter(a => a.id !== id)]
        })
      }
      return next
    })
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = items.findIndex(a => a.id === active.id)
    const newIdx = items.findIndex(a => a.id === over.id)
    if (oldIdx < 0 || newIdx < 0) return
    const next = arrayMove(items, oldIdx, newIdx)
    setItems(next)
    onDataChange?.(next)
  }

  return (
    <div data-cid="applicant-table">
      {/* Table wrapper */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div
          data-v2-card=""
          className="overflow-hidden rounded-3xl bg-white"
          style={{
            boxShadow: "rgba(4, 23, 43, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.1) 0px 8px 10px -6px",
          }}
        >
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-muted-foreground w-8 px-3 py-3 text-center text-xs font-semibold tracking-wider uppercase">#</TableHead>
                <TableHead className="px-3 py-3 text-left">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("name")}
                    className="text-muted-foreground hover:text-primary h-auto rounded-xl px-1 py-0 text-xs font-semibold tracking-wider uppercase"
                  >
                    Name
                    <SortIcon col="name" sortKey={sortKey} sortDir={sortDir} />
                  </Button>
                </TableHead>
                <TableHead className="px-3 py-3 text-left">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("position")}
                    className="text-muted-foreground hover:text-primary h-auto rounded-xl px-1 py-0 text-xs font-semibold tracking-wider uppercase"
                  >
                    Position
                    <SortIcon col="position" sortKey={sortKey} sortDir={sortDir} />
                  </Button>
                </TableHead>
                <TableHead className="hidden px-3 py-3 text-left lg:table-cell">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("university")}
                    className="text-muted-foreground hover:text-primary h-auto rounded-xl px-1 py-0 text-xs font-semibold tracking-wider uppercase"
                  >
                    University
                    <SortIcon col="university" sortKey={sortKey} sortDir={sortDir} />
                  </Button>
                </TableHead>
                <TableHead className="hidden px-3 py-3 text-center sm:table-cell">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("gpa")}
                    className="text-muted-foreground hover:text-primary mx-auto h-auto rounded-xl px-1 py-0 text-xs font-semibold tracking-wider uppercase"
                  >
                    GPA
                    <SortIcon col="gpa" sortKey={sortKey} sortDir={sortDir} />
                  </Button>
                </TableHead>
                <TableHead className="hidden px-3 py-3 text-center lg:table-cell">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("year")}
                    className="text-muted-foreground hover:text-primary mx-auto h-auto rounded-xl px-1 py-0 text-xs font-semibold tracking-wider uppercase"
                  >
                    Year
                    <SortIcon col="year" sortKey={sortKey} sortDir={sortDir} />
                  </Button>
                </TableHead>
                <TableHead className="hidden px-3 py-3 text-center sm:table-cell">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("batch")}
                    className="text-muted-foreground hover:text-primary mx-auto h-auto rounded-xl px-1 py-0 text-xs font-semibold tracking-wider uppercase"
                  >
                    Batch
                    <SortIcon col="batch" sortKey={sortKey} sortDir={sortDir} />
                  </Button>
                </TableHead>
                <TableHead className="hidden px-3 py-3 text-center lg:table-cell">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("pic")}
                    className="text-muted-foreground hover:text-primary mx-auto h-auto rounded-xl px-1 py-0 text-xs font-semibold tracking-wider uppercase"
                  >
                    PIC
                    <SortIcon col="pic" sortKey={sortKey} sortDir={sortDir} />
                  </Button>
                </TableHead>
                <TableHead className="px-3 py-3 text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("round1")}
                    className="text-muted-foreground hover:text-primary mx-auto h-auto rounded-xl px-1 py-0 text-xs font-semibold tracking-wider uppercase"
                  >
                    Round 1
                    <SortIcon col="round1" sortKey={sortKey} sortDir={sortDir} />
                  </Button>
                </TableHead>
                <TableHead className="hidden px-3 py-3 text-center sm:table-cell">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("round2")}
                    className="text-muted-foreground hover:text-primary mx-auto h-auto rounded-xl px-1 py-0 text-xs font-semibold tracking-wider uppercase"
                  >
                    Round 2
                    <SortIcon col="round2" sortKey={sortKey} sortDir={sortDir} />
                  </Button>
                </TableHead>
                <TableHead className="text-muted-foreground w-[116px] px-3 py-3 pr-4 text-xs font-semibold tracking-wider uppercase">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <SortableContext items={items.map(a => a.id)} strategy={verticalListSortingStrategy}>
              <TableBody>
                {items.length > 0 ? (
                  items.map((applicant, i) => (
                    <DraggableRow
                      key={applicant.id}
                      applicant={applicant}
                      index={indexOffset + i}
                      onViewDetail={onViewDetail}
                      pinAction={renderPinAction?.(applicant)}
                      onUpdateApplicant={handleUpdateApplicant}
                      isPinned={pinnedIds.has(applicant.id)}
                      onTogglePin={togglePin}
                      searchQuery={searchQuery}
                    />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={11} className="px-4 py-10 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="bg-muted flex size-12 items-center justify-center rounded-full">
                          <Search className="text-muted-foreground size-5" />
                        </div>
                        <p className="text-foreground text-sm font-medium">No applicants match your filters.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </SortableContext>
          </Table>
        </div>
      </DndContext>
      {paginationInfo ? (
        <div className="text-muted-foreground mt-3 flex items-center justify-between px-1 text-xs">
          <span>
            <span className="text-foreground font-medium">
              {paginationInfo.start + 1}–{paginationInfo.end}
            </span>
            {" of "}
            <span className="text-foreground font-medium">{paginationInfo.total}</span>
          </span>
          <span>
            {"Page "}
            <span className="text-foreground font-medium">{paginationInfo.currentPage}</span>
            {" / "}
            <span className="text-foreground font-medium">{paginationInfo.totalPages}</span>
          </span>
        </div>
      ) : null}
    </div>
  )
}
