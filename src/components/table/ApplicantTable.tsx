"use client"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { ChevronUp, ChevronDown, ChevronsUpDown, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Applicant } from "@/lib/types"
import DraggableRow from "./DraggableRow"

interface ApplicantTableProps {
  data: Applicant[]
  onViewDetail?: (applicant: Applicant) => void
  onDataChange?: (applicants: Applicant[]) => void
  renderPinAction?: (applicant: Applicant) => ReactNode
}

type SortKey = "name" | "gpa" | "batch" | "university"
type SortDir = "asc" | "desc"

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown className="text-muted-foreground size-3" />
  return sortDir === "asc" ? <ChevronUp className="text-primary size-3" /> : <ChevronDown className="text-primary size-3" />
}

function sortApplicants(data: Applicant[], sortKey: SortKey, sortDir: SortDir) {
  return [...data].sort((a, b) => {
    let cmp = 0
    if (sortKey === "name") cmp = a.name.localeCompare(b.name)
    else if (sortKey === "gpa") cmp = a.gpa - b.gpa
    else if (sortKey === "batch") cmp = a.batch - b.batch
    else if (sortKey === "university") cmp = a.university.localeCompare(b.university)
    return sortDir === "asc" ? cmp : -cmp
  })
}

export default function ApplicantTable({ data, onViewDetail, onDataChange, renderPinAction }: ApplicantTableProps) {
  const [items, setItems] = useState<Applicant[]>(() => sortApplicants(data, "name", "asc"))
  const [sortKey, setSortKey] = useState<SortKey>("name")
  const [sortDir, setSortDir] = useState<SortDir>("asc")
  const sortStateRef = useRef({ sortKey, sortDir })

  useEffect(() => {
    sortStateRef.current = { sortKey, sortDir }
  }, [sortKey, sortDir])

  // Re-sync when incoming pre-filtered data changes, preserving current sort
  useEffect(() => {
    const { sortKey: currentSortKey, sortDir: currentSortDir } = sortStateRef.current
    setItems(sortApplicants(data, currentSortKey, currentSortDir))
  }, [data])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleSort(key: SortKey) {
    const newDir = sortKey === key ? (sortDir === "asc" ? "desc" : "asc") : "asc"
    setSortKey(key)
    setSortDir(newDir)
    setItems(prev => sortApplicants(prev, key, newDir))
  }

  function handleUpdateApplicant(id: string, patch: Partial<Applicant>) {
    const next = items.map(a => (a.id === id ? { ...a, ...patch } : a))
    setItems(next)
    onDataChange?.(next)
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
                <TableHead className="text-muted-foreground px-3 py-3 text-left text-xs font-semibold tracking-wider uppercase">Position</TableHead>
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
                <TableHead className="text-muted-foreground hidden px-3 py-3 text-center text-xs font-semibold tracking-wider uppercase lg:table-cell">
                  Year
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
                <TableHead className="text-muted-foreground hidden px-3 py-3 text-center text-xs font-semibold tracking-wider uppercase lg:table-cell">
                  PIC
                </TableHead>
                <TableHead className="text-muted-foreground px-3 py-3 text-center text-xs font-semibold tracking-wider uppercase">Round 1</TableHead>
                <TableHead className="text-muted-foreground hidden px-3 py-3 text-center text-xs font-semibold tracking-wider uppercase sm:table-cell">
                  Round 2
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
                      index={i}
                      onViewDetail={onViewDetail}
                      pinAction={renderPinAction?.(applicant)}
                      onUpdateApplicant={handleUpdateApplicant}
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
    </div>
  )
}
