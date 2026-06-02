"use client"

import { useMemo, useState } from "react"
import { DndContext, DragOverlay, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core"
import { SortableContext, arrayMove, horizontalListSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Copy, GripHorizontal, PinOff, Printer, Search, X } from "lucide-react"
import { ActionTooltip } from "@/components/common/ActionTooltip"
import { SearchHighlight } from "@/components/candidates/SearchHighlight"
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { mockApplicants } from "@/lib/mockData"
import type { Applicant } from "@/lib/types"
import { usePinned } from "@/lib/pin/usePinned"
import { cn } from "@/lib/utils"
import { initials, round1Tone, shortPosition } from "@/components/views/viewUtils"

const FIELDS: Array<{ label: string; get: (item: Applicant) => string }> = [
  { label: "Position", get: item => item.position1 },
  { label: "University", get: item => item.university },
  { label: "Major", get: item => item.major },
  { label: "Year", get: item => item.yearOfStudy },
  { label: "GPA", get: item => item.gpa.toFixed(2) },
  { label: "Full time", get: item => (item.fullTime ? "Yes" : "No") },
  { label: "Experience", get: item => (item.hasExperience ? "Yes" : "No") },
  { label: "Batch", get: item => `Batch ${item.batch}` },
  { label: "Round 1", get: item => item.round1Result ?? "Not reviewed" },
  { label: "Round 2", get: item => item.round2Result ?? "None" },
]

const tableBorder = "border-[#ded1cb] dark:border-white/15"
const tableHeader = "bg-[#2b2522] text-white"
const tableHeaderMeta = "text-[#f1d7cf]"
const rowEven = "bg-[#fbf6f3] dark:bg-white/7"
const rowOdd = "bg-white dark:bg-white/3"
const rowLabelEven = "bg-[#f4ebe6] dark:bg-white/10"
const rowLabelOdd = "bg-[#fff9f6] dark:bg-white/6"
const rowLabelDifferent = "border-l-2 border-l-primary text-[#8d1600] dark:text-primary"

const SORT_OPTIONS = [
  { value: "pinned", label: "Pinned order" },
  { value: "name", label: "Name A-Z" },
  { value: "position", label: "Position A-Z" },
  { value: "university", label: "University A-Z" },
  { value: "gpa", label: "GPA high first" },
  { value: "batch", label: "Batch low first" },
  { value: "pic", label: "PIC A-Z" },
  { value: "round1", label: "Round 1 A-Z" },
  { value: "round2", label: "Round 2 A-Z" },
] as const

type CompareSortKey = (typeof SORT_OPTIONS)[number]["value"]

interface CompareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CompareDialog({ open, onOpenChange }: CompareDialogProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<CompareSortKey>("pinned")
  const [searchQuery, setSearchQuery] = useState("")
  const { ids, remove, reorder } = usePinned()
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const items = ids.map(id => mockApplicants.find(item => item.id === id)).filter(Boolean) as Applicant[]
  const displayItems = useMemo(() => (sortKey === "pinned" ? items : sortCompareItems(items, sortKey)), [items, sortKey])
  const normalizedSearch = searchQuery.trim().toLowerCase()
  const headerMatches = useMemo(() => {
    if (!normalizedSearch) return false
    return displayItems.some(item => candidateSearchText(item).includes(normalizedSearch))
  }, [displayItems, normalizedSearch])
  const visibleFields = useMemo(() => {
    if (!normalizedSearch || headerMatches) return FIELDS
    return FIELDS.filter(field => {
      const labelMatches = field.label.toLowerCase().includes(normalizedSearch)
      const valueMatches = displayItems.some(item => field.get(item).toLowerCase().includes(normalizedSearch))
      return labelMatches || valueMatches
    })
  }, [displayItems, headerMatches, normalizedSearch])
  const draggingItem = displayItems.find(item => item.id === draggingId) ?? null

  function handleSortChange(nextSortKey: CompareSortKey) {
    setSortKey(nextSortKey)
    if (nextSortKey === "pinned") return
    reorder(sortCompareItems(items, nextSortKey).map(item => item.id))
  }

  function handleDragStart(event: DragStartEvent) {
    setDraggingId(String(event.active.id))
  }

  function handleDragEnd(event: DragEndEvent) {
    const activeId = String(event.active.id)
    const overId = event.over?.id ? String(event.over.id) : null
    setDraggingId(null)

    if (!overId) return
    const currentIds = displayItems.map(item => item.id)
    const oldIndex = currentIds.indexOf(activeId)
    const newIndex = currentIds.indexOf(overId)
    if (oldIndex >= 0 && newIndex >= 0 && oldIndex !== newIndex) {
      setSortKey("pinned")
      reorder(arrayMove(currentIds, oldIndex, newIndex))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-v2-glass-panel="strong"
        className="bg-card/90 max-h-[calc(100vh-2rem)] max-w-[calc(100vw-2rem)] gap-0 overflow-hidden rounded-3xl p-0 backdrop-blur-xl sm:max-w-[1120px]"
      >
        <DialogHeader className="p-4 pr-12">
          <div className="flex items-start justify-between gap-3">
            <div>
              <DialogTitle>Compare Candidates</DialogTitle>
              <DialogDescription>{items.length} pinned candidates in a horizontal comparison.</DialogDescription>
            </div>
            {items.length > 0 ? (
              <ActionTooltip label="Export PDF">
                <Button type="button" onClick={() => window.print()} size="sm" className="rounded-full">
                  <Printer data-icon="inline-start" />
                  Export PDF
                </Button>
              </ActionTooltip>
            ) : null}
          </div>
        </DialogHeader>

        {items.length === 0 ? (
          <div className="p-8 text-center">
            <h2 className="text-foreground text-lg font-semibold">No pinned candidates</h2>
            <p className="text-muted-foreground mt-2 text-sm">Pin candidates from the table or pipeline view to compare them here.</p>
          </div>
        ) : (
          <>
            <div className="border-border/70 flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-end">
              <label className="text-muted-foreground flex min-w-44 flex-col gap-1.5 text-xs font-semibold">
                Sort compare
                <select
                  value={sortKey}
                  onChange={event => handleSortChange(event.target.value as CompareSortKey)}
                  className="border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 h-8 rounded-lg border px-2.5 text-sm outline-none focus-visible:ring-3"
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-muted-foreground flex min-w-0 flex-1 flex-col gap-1.5 text-xs font-semibold">
                Search compare
                <span className="relative">
                  <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
                  <Input
                    value={searchQuery}
                    onChange={event => setSearchQuery(event.target.value)}
                    placeholder="Search names, fields, or values"
                    className="pl-8"
                  />
                </span>
              </label>
            </div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={() => setDraggingId(null)}
            >
              <div className="max-h-[calc(100vh-12rem)] overflow-auto">
                <table className="w-max min-w-full border-separate border-spacing-0">
                  <thead className="sticky top-0 z-10">
                    <tr>
                      <th
                        className={`${tableHeader} ${tableBorder} text-md sticky left-0 z-20 w-36 border border-l-0 px-4 py-4 text-left font-semibold tracking-widest uppercase shadow-[8px_0_16px_rgba(27,27,27,0.08)]`}
                      >
                        Candidate
                      </th>
                      <SortableContext items={displayItems.map(item => item.id)} strategy={horizontalListSortingStrategy}>
                        {displayItems.map(item => (
                          <CompareCandidateHeader key={item.id} item={item} searchQuery={searchQuery} onRemove={remove} />
                        ))}
                      </SortableContext>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleFields.length === 0 ? (
                      <tr>
                        <td
                          colSpan={displayItems.length + 1}
                          className={`${tableBorder} text-muted-foreground bg-background/80 border-r border-b px-4 py-8 text-center text-sm`}
                        >
                          No compare data matches &quot;{searchQuery.trim()}&quot;.
                        </td>
                      </tr>
                    ) : (
                      visibleFields.map((field, idx) => {
                        const values = displayItems.map(field.get)
                        const different = new Set(values).size > 1
                        const isEvenRow = idx % 2 === 0
                        const cellSurface = isEvenRow ? rowEven : rowOdd
                        const labelSurface = isEvenRow ? rowLabelEven : rowLabelOdd
                        return (
                          <tr key={field.label}>
                            <td
                              className={`${tableBorder} ${labelSurface} sticky left-0 z-20 border-r border-b px-4 py-3 font-semibold shadow-[8px_0_16px_rgba(27,27,27,0.05)] backdrop-blur-lg ${different ? `text-sm ${rowLabelDifferent}` : "text-muted-foreground text-xs"}`}
                            >
                              <SearchHighlight text={field.label} query={searchQuery} />
                            </td>
                            {displayItems.map(item => {
                              const value = field.get(item)
                              return (
                                <td
                                  key={item.id}
                                  className={`${tableBorder} ${cellSurface} text-foreground min-w-[220px] border-r border-b px-4 py-3 text-sm`}
                                >
                                  {field.label === "Round 1" ? (
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${round1Tone(item.round1Result)}`}>
                                      <SearchHighlight
                                        text={value}
                                        query={searchQuery}
                                        className="text-foreground rounded-[3px] bg-white/45 px-0.5 py-0"
                                      />
                                    </span>
                                  ) : (
                                    <SearchHighlight text={value} query={searchQuery} />
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <DragOverlay adjustScale={false} dropAnimation={null}>
                {draggingItem ? <CompareCandidateOverlay item={draggingItem} /> : null}
              </DragOverlay>
            </DndContext>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function CompareCandidateHeader({ item, searchQuery, onRemove }: { item: Applicant; searchQuery: string; onRemove: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })

  return (
    <ContextMenu>
      <ContextMenuTrigger className="contents">
        <th
          ref={setNodeRef}
          className={cn(
            `${tableHeader} ${tableBorder} min-w-[220px] border-t border-r border-b px-4 py-4 text-left align-top`,
            isDragging && "opacity-30"
          )}
          style={{ transform: CSS.Transform.toString(transform), transition }}
        >
          <div className="flex items-start gap-2">
            <button
              type="button"
              {...attributes}
              {...listeners}
              aria-label={`Reorder ${item.name}`}
              className="mt-1 shrink-0 cursor-grab rounded-full p-1 text-white/55 outline-none hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/60 active:cursor-grabbing"
            >
              <GripHorizontal className="size-3.5" />
            </button>
            <span className="bg-primary text-primary-foreground ring-primary/35 flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ring-2">
              {initials(item.position1)}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-white">
                <SearchHighlight text={item.name} query={searchQuery} className="rounded-[3px] bg-white/25 px-0.5 py-0 text-white" />
              </span>
              <span className={`${tableHeaderMeta} block truncate text-xs`}>
                <SearchHighlight
                  text={shortPosition(item.position1)}
                  query={searchQuery}
                  className="rounded-[3px] bg-white/20 px-0.5 py-0 text-white"
                />
              </span>
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => onRemove(item.id)}
              aria-label={`Remove ${item.name}`}
              className="ml-auto rounded-full text-white/70 hover:bg-white/10 hover:text-white"
            >
              <X />
            </Button>
          </div>
        </th>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuGroup>
          <ContextMenuLabel className="truncate">{item.name}</ContextMenuLabel>
          <ContextMenuItem onClick={() => navigator.clipboard.writeText([item.name, item.email, item.position1, item.university].join("\n"))}>
            <Copy />
            Copy summary
          </ContextMenuItem>
          <ContextMenuItem onClick={() => navigator.clipboard.writeText(item.email)}>
            <Copy />
            Copy email
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuItem onClick={() => onRemove(item.id)}>
            <PinOff />
            Unpin from compare
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  )
}

function CompareCandidateOverlay({ item }: { item: Applicant }) {
  return (
    <div className="inline-flex min-w-[220px] items-center gap-2 rounded-lg border border-white/20 bg-[#2b2522] px-3 py-2 text-left text-white shadow-xl">
      <GripHorizontal className="size-3.5 text-white/55" />
      <span className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold">
        {initials(item.position1)}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold">{item.name}</span>
        <span className="block truncate text-xs text-[#f1d7cf]">{shortPosition(item.position1)}</span>
      </span>
    </div>
  )
}

function sortCompareItems(items: Applicant[], key: CompareSortKey) {
  if (key === "pinned") return items

  return [...items].sort((a, b) => compareApplicants(a, b, key))
}

function compareApplicants(a: Applicant, b: Applicant, key: CompareSortKey) {
  const av = getSortValue(a, key)
  const bv = getSortValue(b, key)
  const aMissing = av === null || av === ""
  const bMissing = bv === null || bv === ""

  if (aMissing && bMissing) return 0
  if (aMissing) return 1
  if (bMissing) return -1

  if (typeof av === "number" && typeof bv === "number") {
    return key === "gpa" ? bv - av : av - bv
  }

  return String(av).localeCompare(String(bv))
}

function getSortValue(item: Applicant, key: CompareSortKey) {
  if (key === "name") return item.name
  if (key === "position") return item.position1
  if (key === "university") return item.university
  if (key === "gpa") return item.gpa
  if (key === "batch") return item.batch
  if (key === "pic") return item.pic ?? null
  if (key === "round1") return item.round1Result ?? null
  if (key === "round2") return item.round2Result ?? null
  return null
}

function candidateSearchText(item: Applicant) {
  return [item.name, item.position1, item.university, item.major, item.pic, item.round1Result, item.round2Result, `Batch ${item.batch}`]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
}
