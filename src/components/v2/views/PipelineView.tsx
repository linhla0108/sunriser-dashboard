"use client"

import { useMemo, useState } from "react"
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Eye, GripVertical } from "lucide-react"
import { ActionTooltip } from "@/components/v2/common/ActionTooltip"
import { PinStarButton } from "@/components/v2/pin/PinStarButton"
import type { Applicant } from "@/lib/types"
import { groupApplicants, initials, round1Tone, shortPosition } from "./viewUtils"

type PipelineGroupBy = "round1" | "position" | "batch"

interface PipelineViewProps {
  data: Applicant[]
  onViewDetail?: (applicant: Applicant) => void
}

export function PipelineView({ data, onViewDetail }: PipelineViewProps) {
  const [groupBy, setGroupBy] = useState<PipelineGroupBy>("round1")
  const [items, setItems] = useState(data)
  const columns = useMemo(() => groupApplicants(items, groupBy), [groupBy, items])

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setItems(current => {
      const oldIndex = current.findIndex(item => item.id === active.id)
      const newIndex = current.findIndex(item => item.id === over.id)
      if (oldIndex < 0 || newIndex < 0) return current
      return arrayMove(current, oldIndex, newIndex)
    })
  }

  return (
    <section className="space-y-3" aria-label="Candidate pipeline">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[var(--v2-ink)]">Pipeline</h2>
          <p className="text-sm text-[var(--v2-muted)]">Drag cards to tune board order.</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-[var(--v2-muted)]">
          Group by
          <select
            value={groupBy}
            onChange={event => setGroupBy(event.target.value as PipelineGroupBy)}
            className="h-9 rounded-2xl border border-[var(--v2-ink)]/10 bg-[var(--v2-surface)] px-3 text-sm text-[var(--v2-ink)] outline-none focus:border-[var(--v2-primary)]"
          >
            <option value="round1">Round 1</option>
            <option value="position">Position</option>
            <option value="batch">Batch</option>
          </select>
        </label>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex min-h-[520px] gap-3 overflow-x-auto pb-4">
          {columns.map(column => (
            <div key={column.key} className="flex w-[280px] shrink-0 flex-col gap-2">
              <div className="flex items-center justify-between rounded-2xl border border-[var(--v2-ink)]/10 bg-[var(--v2-surface)] px-3 py-2.5">
                <span className="text-sm font-semibold text-[var(--v2-ink)]">{column.label}</span>
                <span className="rounded-full bg-[var(--v2-ink)]/5 px-2 py-0.5 text-xs font-semibold text-[var(--v2-muted)]">
                  {column.items.length}
                </span>
              </div>
              <SortableContext items={column.items.map(item => item.id)} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-2">
                  {column.items.slice(0, 40).map(item => (
                    <PipelineCard key={item.id} applicant={item} onViewDetail={onViewDetail} />
                  ))}
                  {column.items.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[var(--v2-ink)]/15 px-3 py-6 text-center text-sm text-[var(--v2-muted)]">
                      No candidates
                    </div>
                  ) : null}
                </div>
              </SortableContext>
            </div>
          ))}
        </div>
      </DndContext>
    </section>
  )
}

function PipelineCard({ applicant, onViewDetail }: { applicant: Applicant; onViewDetail?: (applicant: Applicant) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: applicant.id })

  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`rounded-2xl border border-[var(--v2-ink)]/10 bg-[var(--v2-surface)] p-3 shadow-[0_8px_24px_rgba(15,23,42,0.08)] ${isDragging ? "opacity-60" : ""}`}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          type="button"
          aria-label="Drag candidate"
          className="mt-1 cursor-grab rounded-lg p-1 text-[var(--v2-muted)] hover:bg-[var(--v2-ink)]/5"
        >
          <GripVertical className="size-3.5" />
        </button>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--v2-primary)]/10 text-sm font-bold text-[var(--v2-primary)]">
          {initials(applicant.name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[var(--v2-ink)]">{applicant.name}</p>
          <p className="truncate text-xs text-[var(--v2-muted)]">{shortPosition(applicant.position1)}</p>
        </div>
        <PinStarButton id={applicant.id} />
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${round1Tone(applicant.round1Result)}`}>
          {applicant.round1Result ?? "Not reviewed"}
        </span>
        <span className="text-xs font-semibold text-[var(--v2-muted)]">GPA {applicant.gpa.toFixed(1)}</span>
      </div>
      <ActionTooltip label="View candidate">
        <button
          type="button"
          onClick={() => onViewDetail?.(applicant)}
          className="mt-3 flex h-8 w-full items-center justify-center gap-1 rounded-full border border-[var(--v2-ink)]/10 text-xs font-semibold text-[var(--v2-muted)] hover:bg-[var(--v2-ink)]/5 hover:text-[var(--v2-ink)]"
        >
          <Eye className="size-3.5" />
          View
        </button>
      </ActionTooltip>
    </article>
  )
}
