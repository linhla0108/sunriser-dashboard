"use client"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { animate, type JSAnimation } from "animejs"
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core"
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
  selectedData?: Applicant[]
  onViewDetail?: (applicant: Applicant) => void
  onDataChange?: (applicants: Applicant[]) => void
  renderPinAction?: (applicant: Applicant) => ReactNode
  indexOffset?: number
  paginationInfo?: PaginationInfo
  searchQuery?: string
  sortState?: CandidateSortState
  onSortChange?: (sortState: CandidateSortState) => void
  selectedIds?: Set<string>
  onToggleSelect?: (id: string) => void
  selectedSectionOpen?: boolean
  onSelectedSectionOpenChange?: (open: boolean) => void
  onBulkBatch?: (batch: number) => void
  onBulkPic?: (pic: string) => void
  onBulkRound1?: (result: string) => void
  onBulkRound2?: (result: string) => void
  onBulkDelete?: () => void
}

const DEFAULT_SORT_STATE: Exclude<CandidateSortState, null> = { key: "name", dir: "asc" }
const EMPTY_APPLICANTS: Applicant[] = []

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

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export function reorderApplicantsWithinList(data: Applicant[], activeId: string, overId: string) {
  const oldIdx = data.findIndex(a => a.id === activeId)
  const newIdx = data.findIndex(a => a.id === overId)
  if (oldIdx < 0 || newIdx < 0 || oldIdx === newIdx) return data
  return arrayMove(data, oldIdx, newIdx)
}

export default function ApplicantTable({
  data,
  selectedData = EMPTY_APPLICANTS,
  onViewDetail,
  onDataChange,
  renderPinAction,
  indexOffset = 0,
  paginationInfo,
  searchQuery,
  sortState,
  onSortChange,
  selectedIds,
  onToggleSelect,
  selectedSectionOpen = true,
  onSelectedSectionOpenChange,
  onBulkBatch,
  onBulkPic,
  onBulkRound1,
  onBulkRound2,
  onBulkDelete,
}: ApplicantTableProps) {
  const initialSort = sortState === undefined ? DEFAULT_SORT_STATE : sortState
  const [items, setItems] = useState<Applicant[]>(() => (initialSort ? sortApplicants(data, initialSort.key, initialSort.dir) : [...data]))
  const [selectedItems, setSelectedItems] = useState<Applicant[]>(() =>
    initialSort ? sortApplicants(selectedData, initialSort.key, initialSort.dir) : [...selectedData]
  )
  const [sortKey, setSortKey] = useState<CandidateSortKey | null>(initialSort?.key ?? null)
  const [sortDir, setSortDir] = useState<CandidateSortDir>(initialSort?.dir ?? "asc")
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [selectedPanelMounted, setSelectedPanelMounted] = useState(selectedSectionOpen && selectedData.length > 0)
  const selectedPanelRef = useRef<HTMLDivElement>(null)
  const selectedPanelAnimationRef = useRef<JSAnimation | null>(null)
  const sortStateRef = useRef<{ sortKey: CandidateSortKey | null; sortDir: CandidateSortDir }>({
    sortKey: initialSort?.key ?? null,
    sortDir: initialSort?.dir ?? "asc",
  })
  const originalOrderRef = useRef<Applicant[]>(data)
  const selectedOriginalOrderRef = useRef<Applicant[]>(selectedData)
  const hasSelectedSection = selectedItems.length > 0

  useEffect(() => {
    sortStateRef.current = { sortKey, sortDir }
  }, [sortKey, sortDir])

  // Re-sync when incoming pre-filtered data changes, preserving current sort
  useEffect(() => {
    originalOrderRef.current = data
    selectedOriginalOrderRef.current = selectedData
    const { sortKey: currentSortKey, sortDir: currentSortDir } = sortStateRef.current
    if (currentSortKey) {
      setItems(sortApplicants(data, currentSortKey, currentSortDir))
      setSelectedItems(sortApplicants(selectedData, currentSortKey, currentSortDir))
    } else {
      setItems([...data])
      setSelectedItems([...selectedData])
    }
  }, [data, selectedData])

  useEffect(() => {
    if (!hasSelectedSection) {
      selectedPanelAnimationRef.current?.cancel()
      selectedPanelAnimationRef.current = null
      globalThis.setTimeout(() => setSelectedPanelMounted(false), 0)
      return
    }

    if (selectedSectionOpen) {
      globalThis.setTimeout(() => setSelectedPanelMounted(true), 0)
    }
  }, [hasSelectedSection, selectedSectionOpen])

  useEffect(() => {
    const panel = selectedPanelRef.current
    if (!hasSelectedSection || !selectedPanelMounted || !panel) return

    selectedPanelAnimationRef.current?.cancel()

    if (prefersReducedMotion()) {
      panel.style.height = selectedSectionOpen ? "" : "0px"
      panel.style.opacity = selectedSectionOpen ? "" : "0"
      panel.style.transform = selectedSectionOpen ? "" : "translateY(-4px)"
      panel.style.overflow = selectedSectionOpen ? "" : "hidden"
      panel.style.willChange = ""
      if (!selectedSectionOpen) globalThis.setTimeout(() => setSelectedPanelMounted(false), 0)
      return
    }

    panel.style.overflow = "hidden"
    panel.style.willChange = "height, opacity, transform"

    if (selectedSectionOpen) {
      panel.style.height = "0px"
      panel.style.opacity = "0"
      panel.style.transform = "translateY(-6px)"
      const targetHeight = panel.scrollHeight

      selectedPanelAnimationRef.current = animate(panel, {
        height: [`0px`, `${targetHeight}px`],
        opacity: [0, 1],
        translateY: ["-6px", "0px"],
        duration: 240,
        ease: "outCubic",
        onComplete: () => {
          panel.style.height = ""
          panel.style.opacity = ""
          panel.style.transform = ""
          panel.style.overflow = ""
          panel.style.willChange = ""
          selectedPanelAnimationRef.current = null
        },
      })
      return
    }

    const currentHeight = panel.getBoundingClientRect().height || panel.scrollHeight
    panel.style.height = `${currentHeight}px`
    panel.style.opacity = "1"
    panel.style.transform = "translateY(0px)"

    selectedPanelAnimationRef.current = animate(panel, {
      height: [`${currentHeight}px`, "0px"],
      opacity: [1, 0],
      translateY: ["0px", "-6px"],
      duration: 240,
      ease: "inOutQuad",
      onComplete: () => {
        panel.style.willChange = ""
        selectedPanelAnimationRef.current = null
        setSelectedPanelMounted(false)
      },
    })

    return () => {
      selectedPanelAnimationRef.current?.cancel()
      selectedPanelAnimationRef.current = null
    }
  }, [hasSelectedSection, selectedPanelMounted, selectedSectionOpen])

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
      setSelectedItems(prev => sortApplicants(prev, key, "asc"))
    } else if (sortDir === "asc") {
      // Same column, asc → desc
      nextSort = { key, dir: "desc" }
      setSortDir("desc")
      setItems(prev => sortApplicants(prev, key, "desc"))
      setSelectedItems(prev => sortApplicants(prev, key, "desc"))
    } else {
      // Same column, desc → clear (restore original order)
      nextSort = null
      setSortKey(null)
      setItems([...originalOrderRef.current])
      setSelectedItems([...selectedOriginalOrderRef.current])
    }
    onSortChange?.(nextSort)
  }

  function handleUpdateApplicant(id: string, patch: Partial<Applicant>) {
    const nextSelected = selectedItems.map(a => (a.id === id ? { ...a, ...patch } : a))
    const nextItems = items.map(a => (a.id === id ? { ...a, ...patch } : a))
    setSelectedItems(nextSelected)
    setItems(nextItems)
    onDataChange?.([...nextSelected, ...nextItems])
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveDragId(String(event.active.id))
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDragId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return
    const activeId = String(active.id)
    const overId = String(over.id)
    const activeIsSelected = selectedItems.some(a => a.id === activeId)
    const overIsSelected = selectedItems.some(a => a.id === overId)

    if (activeIsSelected) {
      if (!overIsSelected) return
      const nextSelected = reorderApplicantsWithinList(selectedItems, activeId, overId)
      setSelectedItems(nextSelected)
      onDataChange?.(nextSelected)
      return
    }

    if (overIsSelected) return
    const next = reorderApplicantsWithinList(items, activeId, overId)
    setItems(next)
    onDataChange?.(next)
  }

  function handleDragCancel() {
    setActiveDragId(null)
  }

  const activeDragSelected = activeDragId ? selectedItems.some(a => a.id === activeDragId) : false

  return (
    <div data-cid="applicant-table">
      {/* Table wrapper */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div
          data-v2-card=""
          className="overflow-hidden rounded-3xl bg-white"
          style={{
            boxShadow: "rgba(4, 23, 43, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.1) 0px 8px 10px -6px",
          }}
        >
          <Table
            containerClassName="max-h-[calc(100dvh-18.5rem)] overflow-auto overscroll-contain sm:max-h-[calc(100dvh-15.5rem)]"
            className="min-w-[600px]"
          >
            <TableHeader className="sticky top-0 z-10 bg-white shadow-[0_1px_0_rgba(15,23,42,0.08)]">
              <TableRow className="border-border bg-white hover:bg-white">
                <TableHead className="text-muted-foreground w-11 min-w-11 px-0 py-3 text-center text-xs font-semibold tracking-wider uppercase">
                  #
                </TableHead>
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
            <SortableContext items={[...selectedItems, ...items].map(a => a.id)} strategy={verticalListSortingStrategy}>
              <TableBody>
                {hasSelectedSection ? (
                  <>
                    <TableRow className="border-border bg-[#fff5f3] hover:bg-[#fff5f3]">
                      <TableCell colSpan={11} className="p-0">
                        <Button
                          type="button"
                          variant="plain"
                          size="plain"
                          onClick={() => onSelectedSectionOpenChange?.(!selectedSectionOpen)}
                          aria-label={selectedSectionOpen ? "Collapse selected candidates" : "Expand selected candidates"}
                          className="text-foreground flex w-full justify-start gap-2 rounded-xl p-2 text-xs font-semibold"
                        >
                          {selectedSectionOpen ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                          Selected candidates: {selectedItems.length}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {selectedPanelMounted ? (
                      <TableRow className="border-border bg-[#fff5f3] hover:bg-[#fff5f3]" data-cid="selected-section-panel">
                        <TableCell colSpan={11} className="p-0">
                          <div ref={selectedPanelRef} className="overflow-hidden">
                            <table className="w-full min-w-[600px] caption-bottom text-sm">
                              <tbody>
                                {selectedItems.map((applicant, i) => (
                                  <DraggableRow
                                    key={applicant.id}
                                    applicant={applicant}
                                    index={i}
                                    onViewDetail={onViewDetail}
                                    pinAction={renderPinAction?.(applicant)}
                                    onUpdateApplicant={handleUpdateApplicant}
                                    searchQuery={searchQuery}
                                    isSelected={true}
                                    selectionMode={true}
                                    selectedCount={selectedIds?.size ?? 0}
                                    onSelect={onToggleSelect ? id => onToggleSelect(id) : undefined}
                                    onBulkBatch={onBulkBatch}
                                    onBulkPic={onBulkPic}
                                    onBulkRound1={onBulkRound1}
                                    onBulkRound2={onBulkRound2}
                                    onBulkDelete={onBulkDelete}
                                  />
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : null}
                    <TableRow className="border-border bg-muted/30 hover:bg-muted/30">
                      <TableCell colSpan={11} className="text-muted-foreground px-4 py-2 text-xs font-semibold">
                        Filtered results · {items.length}
                      </TableCell>
                    </TableRow>
                  </>
                ) : null}
                {items.length > 0 ? (
                  items.map((applicant, i) => (
                    <DraggableRow
                      key={applicant.id}
                      applicant={applicant}
                      index={indexOffset + i}
                      onViewDetail={onViewDetail}
                      pinAction={renderPinAction?.(applicant)}
                      onUpdateApplicant={handleUpdateApplicant}
                      searchQuery={searchQuery}
                      isSelected={selectedIds?.has(applicant.id)}
                      selectionMode={(selectedIds?.size ?? 0) > 0}
                      selectedCount={selectedIds?.size ?? 0}
                      onSelect={onToggleSelect ? id => onToggleSelect(id) : undefined}
                      onBulkBatch={onBulkBatch}
                      onBulkPic={onBulkPic}
                      onBulkRound1={onBulkRound1}
                      onBulkRound2={onBulkRound2}
                      onBulkDelete={onBulkDelete}
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
        <DragOverlay>
          {activeDragSelected && selectedItems.length > 1 ? (
            <div className="border-primary/30 text-foreground rounded-2xl border bg-white/95 px-3 py-2 text-xs font-semibold shadow-xl">
              <div className="flex items-center gap-2">
                <span className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full text-[10px]">
                  {selectedItems.length}
                </span>
                {selectedItems.length} selected
              </div>
              <div className="mt-1 max-w-[180px] truncate text-[11px] font-medium text-[#555555]">{selectedItems[0]?.name}</div>
            </div>
          ) : null}
        </DragOverlay>
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
