"use client"

import { useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  rectIntersection,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ArrowRight } from "lucide-react"
import { SearchHighlight } from "@/components/candidates/SearchHighlight"
import { PinStarButton } from "@/components/pin/PinStarButton"
import type { CandidatePipelineGroup } from "@/lib/candidates/candidateUrlState"
import type { Applicant } from "@/lib/types"
import { getColumnTheme, groupApplicants, initials, round1Tone, round2Tone, shortPosition } from "./viewUtils"

type PipelineGroupBy = CandidatePipelineGroup

interface PipelineViewProps {
  data: Applicant[]
  onReorder?: (items: Applicant[]) => void
  onViewDetail?: (applicant: Applicant) => void
  searchQuery?: string
  groupBy?: PipelineGroupBy
  onGroupByChange?: (groupBy: PipelineGroupBy) => void
}

const COL_PREFIX = "col::"

const ROUND1_KEY_TO_VALUE: Record<string, Applicant["round1Result"]> = {
  pass: "Passed",
  waiting: "Waiting list",
  fail: "Failed",
  "not-reviewed": undefined,
}

const ROUND2_KEY_TO_VALUE: Record<string, Applicant["round2Result"]> = {
  pass: "Passed",
  waiting: "Waiting list",
  fail: "Failed",
  "not-reviewed": undefined,
}

function updateItemColumn(item: Applicant, groupBy: PipelineGroupBy, columnKey: string, columns: ReturnType<typeof groupApplicants>): Applicant {
  if (groupBy === "round1") {
    return { ...item, round1Result: ROUND1_KEY_TO_VALUE[columnKey] }
  }
  if (groupBy === "round2") {
    return { ...item, round2Result: ROUND2_KEY_TO_VALUE[columnKey] }
  }
  if (groupBy === "batch") {
    const num = parseInt(columnKey.replace("Batch ", ""), 10)
    return { ...item, batch: num }
  }
  if (groupBy === "position") {
    // rawKey holds the full position1 string built at grouping time — safe even
    // when the target column is currently empty (no sample item available).
    const col = columns.find(c => c.key === columnKey)
    if (col?.rawKey) return { ...item, position1: col.rawKey }
  }
  return item
}

export function PipelineView({ data, onReorder, onViewDetail, searchQuery, groupBy: controlledGroupBy, onGroupByChange }: PipelineViewProps) {
  const [internalGroupBy, setInternalGroupBy] = useState<PipelineGroupBy>("round1")
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overColumnKey, setOverColumnKey] = useState<string | null>(null)
  // Two-layer tracking: state drives re-renders (safe for JSX reads), ref drives
  // collisionDetection callbacks which fire synchronously during pointer events
  // before React can flush the state update.
  const [sourceColumnKey, setSourceColumnKey] = useState<string | null>(null)
  const sourceColumnKeyRef = useRef<string | null>(null)
  const groupBy = controlledGroupBy ?? internalGroupBy

  function setGroupBy(next: PipelineGroupBy) {
    if (onGroupByChange) onGroupByChange(next)
    else setInternalGroupBy(next)
  }

  const columns = useMemo(() => groupApplicants(data, groupBy), [groupBy, data])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const activeApplicant = activeId ? (data.find(item => item.id === activeId) ?? null) : null

  // Custom collision: when dragging outside the source column, only target the
  // column droppable (not individual item sortables) to eliminate the dual-trigger
  // conflict between within-column sort and cross-column drop.
  function collisionDetection(args: Parameters<typeof closestCenter>[0]) {
    const colContainers = args.droppableContainers.filter(c => String(c.id).startsWith(COL_PREFIX))
    const itemContainers = args.droppableContainers.filter(c => !String(c.id).startsWith(COL_PREFIX))

    const colHits = rectIntersection({ ...args, droppableContainers: colContainers })

    if (colHits.length > 0) {
      const hitColKey = String(colHits[0].id).slice(COL_PREFIX.length)
      if (hitColKey !== sourceColumnKeyRef.current) {
        return colHits
      }
    }

    return closestCenter({ ...args, droppableContainers: itemContainers })
  }

  function handleDragStart(event: DragStartEvent) {
    const id = String(event.active.id)
    setActiveId(id)
    const srcKey = columns.find(col => col.items.some(i => i.id === id))?.key ?? null
    sourceColumnKeyRef.current = srcKey // used by collisionDetection (sync, no state flush)
    setSourceColumnKey(srcKey) // used by render (reactive)
    setOverColumnKey(srcKey)
  }

  function handleDragOver(event: DragOverEvent) {
    const { over } = event
    if (!over) {
      setOverColumnKey(null)
      return
    }

    const isColDrop = String(over.id).startsWith(COL_PREFIX)
    const key = isColDrop ? String(over.id).slice(COL_PREFIX.length) : (columns.find(col => col.items.some(i => i.id === over.id))?.key ?? null)

    setOverColumnKey(key)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    setOverColumnKey(null)
    setSourceColumnKey(null)
    sourceColumnKeyRef.current = null
    if (!over || active.id === over.id) return

    const isColumnDrop = String(over.id).startsWith(COL_PREFIX)
    const targetColumnKey = isColumnDrop ? String(over.id).slice(COL_PREFIX.length) : columns.find(col => col.items.some(i => i.id === over.id))?.key

    const dragSourceColumnKey = columns.find(col => col.items.some(i => i.id === active.id))?.key

    if (!targetColumnKey) return

    let newData = [...data]

    if (targetColumnKey !== dragSourceColumnKey) {
      newData = newData.map(item => (item.id === active.id ? updateItemColumn(item, groupBy, targetColumnKey, columns) : item))
    }

    if (!isColumnDrop) {
      const oldIndex = newData.findIndex(item => item.id === active.id)
      const newIndex = newData.findIndex(item => item.id === over.id)
      if (oldIndex >= 0 && newIndex >= 0) {
        newData = arrayMove(newData, oldIndex, newIndex)
      }
    }

    onReorder?.(newData)
  }

  function handleDragCancel() {
    setActiveId(null)
    setOverColumnKey(null)
    setSourceColumnKey(null)
    sourceColumnKeyRef.current = null
  }

  const isRoundGroupBy = groupBy === "round1" || groupBy === "round2"

  return (
    <section className="space-y-3" aria-label="Candidate pipeline">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-foreground text-base font-semibold">Pipeline</h2>
          <p className="text-muted-foreground text-sm">Click a card to view details. Drag to move between columns.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-foreground/5 flex items-center gap-0.5 rounded-full p-1">
            <button onClick={() => setGroupBy("round1")} className={`rounded-full px-3 py-1 text-sm font-semibold transition-colors ${groupBy === "round1" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>Round 1</button>
            <button onClick={() => setGroupBy("round2")} className={`rounded-full px-3 py-1 text-sm font-semibold transition-colors ${groupBy === "round2" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>Round 2</button>
          </div>
          <label className="text-muted-foreground flex items-center gap-2 text-sm">
            Group by
            <select
              value={isRoundGroupBy ? "" : groupBy}
              onChange={event => { if (event.target.value) setGroupBy(event.target.value as PipelineGroupBy) }}
              className="border-foreground/10 bg-card text-foreground focus:border-primary h-9 rounded-2xl border px-3 text-sm outline-none"
            >
              <option value="" disabled>—</option>
              <option value="position">Position</option>
              <option value="batch">Batch</option>
            </select>
          </label>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex min-h-[520px] gap-3 overflow-x-auto pb-4">
          {columns.map(column => {
            const isExternalDragOver = !!activeId && overColumnKey === column.key && sourceColumnKey !== column.key

            return (
              <PipelineColumn
                key={column.key}
                column={column}
                groupBy={groupBy}
                onViewDetail={onViewDetail}
                searchQuery={searchQuery}
                isExternalDragOver={isExternalDragOver}
              />
            )
          })}
        </div>
        {createPortal(
          <DragOverlay>{activeApplicant ? <PipelineCardOverlay applicant={activeApplicant} groupBy={groupBy} /> : null}</DragOverlay>,
          document.body
        )}
      </DndContext>
    </section>
  )
}

function PipelineColumn({
  column,
  groupBy,
  onViewDetail,
  searchQuery,
  isExternalDragOver,
}: {
  column: ReturnType<typeof groupApplicants>[number]
  groupBy: PipelineGroupBy
  onViewDetail?: (applicant: Applicant) => void
  searchQuery?: string
  isExternalDragOver: boolean
}) {
  const { setNodeRef } = useDroppable({ id: `${COL_PREFIX}${column.key}` })
  const theme = getColumnTheme(column.key)

  return (
    <div className={`flex w-[280px] shrink-0 flex-col gap-2 rounded-2xl p-1.5 ${theme.colBg}`}>
      <div className="flex items-center justify-between px-2 py-1.5">
        <span className="text-foreground text-sm font-semibold">{column.label}</span>
        <span className="bg-foreground/5 text-muted-foreground rounded-full px-2 py-0.5 text-xs font-semibold">{column.items.length}</span>
      </div>
      <SortableContext items={column.items.map(item => item.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className={`relative flex flex-col gap-2 ${isExternalDragOver ? "min-h-[500px]" : ""}`}>
          {isExternalDragOver && (
            <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed backdrop-blur-[2px] ${theme.overlayBg} ${theme.overlayBorder}`}>
              <div className={`flex items-center gap-2 rounded-full px-4 py-2 ring-1 ${theme.badgeBg}`}>
                <ArrowRight className={`size-4 ${theme.icon}`} />
                <span className={`text-sm font-semibold ${theme.icon}`}>Change to {column.label}</span>
              </div>
            </div>
          )}
          <div className={`flex flex-col gap-2 ${isExternalDragOver ? "pointer-events-none opacity-30" : ""}`}>
            {column.items.slice(0, 120).map(item => (
              <PipelineCard key={item.id} applicant={item} groupBy={groupBy} onViewDetail={onViewDetail} searchQuery={searchQuery} />
            ))}
            {column.items.length > 120 && (
              <p className="text-muted-foreground px-3 py-2 text-center text-xs">Showing 120 of {column.items.length} — use filters to narrow results</p>
            )}
            {column.items.length === 0 ? (
              <div className="border-foreground/15 text-muted-foreground rounded-2xl border border-dashed px-3 py-6 text-center text-sm">No candidates</div>
            ) : null}
          </div>
        </div>
      </SortableContext>
    </div>
  )
}

function roundBadge(applicant: Applicant, groupBy: PipelineGroupBy) {
  if (groupBy === "round1") return { label: applicant.round1Result ?? "Not reviewed", tone: round1Tone(applicant.round1Result) }
  if (groupBy === "round2") return { label: applicant.round2Result ?? "Not reviewed", tone: round2Tone(applicant.round2Result) }
  return null
}

function PipelineCard({
  applicant,
  groupBy,
  onViewDetail,
  searchQuery,
}: {
  applicant: Applicant
  groupBy: PipelineGroupBy
  onViewDetail?: (applicant: Applicant) => void
  searchQuery?: string
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: applicant.id })
  const badge = roundBadge(applicant, groupBy)

  return (
    <article
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={() => onViewDetail?.(applicant)}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      data-v2-card=""
      className={`border-foreground/10 bg-card/80 cursor-pointer rounded-2xl border p-3 shadow-[0_8px_24px_rgba(15,23,42,0.08)] ${isDragging ? "ring-primary/30 opacity-40 ring-2" : "hover:shadow-[0_12px_32px_rgba(15,23,42,0.12)]"}`}
    >
      <div className="flex items-start gap-2">
        <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold">
          {initials(applicant.name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-foreground truncate text-sm font-semibold">
            <SearchHighlight text={applicant.name} query={searchQuery} />
          </p>
          <p className="text-muted-foreground truncate text-xs">
            <SearchHighlight text={shortPosition(applicant.position1)} query={searchQuery} />
          </p>
        </div>
        <PinStarButton id={applicant.id} />
      </div>
      {badge && (
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${badge.tone}`}>{badge.label}</span>
          <span className="text-muted-foreground text-xs font-semibold">GPA {applicant.gpa.toFixed(1)}</span>
        </div>
      )}
      {!badge && <div className="mt-2 text-muted-foreground text-xs font-semibold">GPA {applicant.gpa.toFixed(1)}</div>}
    </article>
  )
}

function PipelineCardOverlay({ applicant, groupBy }: { applicant: Applicant; groupBy: PipelineGroupBy }) {
  const badge = roundBadge(applicant, groupBy)

  return (
    <article
      data-v2-glass-panel="strong"
      className="border-primary/30 bg-card/90 ring-primary/20 rounded-2xl border p-3 shadow-[0_20px_40px_rgba(15,23,42,0.20)] ring-2"
    >
      <div className="flex items-start gap-2">
        <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold">
          {initials(applicant.name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-foreground truncate text-sm font-semibold">{applicant.name}</p>
          <p className="text-muted-foreground truncate text-xs">{shortPosition(applicant.position1)}</p>
        </div>
      </div>
      {badge && (
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${badge.tone}`}>{badge.label}</span>
          <span className="text-muted-foreground text-xs font-semibold">GPA {applicant.gpa.toFixed(1)}</span>
        </div>
      )}
    </article>
  )
}
