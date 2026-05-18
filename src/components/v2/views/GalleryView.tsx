"use client"

import { useState } from "react"
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Eye, GripVertical } from "lucide-react"
import { ActionTooltip } from "@/components/v2/common/ActionTooltip"
import { PinStarButton } from "@/components/v2/pin/PinStarButton"
import type { Applicant } from "@/lib/types"
import { initials, round1Tone, shortPosition } from "./viewUtils"

interface GalleryViewProps {
  data: Applicant[]
  onViewDetail?: (applicant: Applicant) => void
}

export function GalleryView({ data, onViewDetail }: GalleryViewProps) {
  const [items, setItems] = useState(data)

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
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map(item => item.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.slice(0, 48).map(item => (
            <GalleryCard key={item.id} applicant={item} onViewDetail={onViewDetail} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

function GalleryCard({ applicant, onViewDetail }: { applicant: Applicant; onViewDetail?: (applicant: Applicant) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: applicant.id })

  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`overflow-hidden rounded-3xl border border-[var(--v2-ink)]/10 bg-[var(--v2-surface)] shadow-[0_12px_28px_rgba(15,23,42,0.08)] ${isDragging ? "opacity-60" : ""}`}
    >
      <div className="flex items-start gap-3 bg-[var(--v2-primary)]/8 p-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[var(--v2-primary)] text-sm font-bold text-white">
          {initials(applicant.name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-[var(--v2-ink)]">{applicant.name}</p>
          <p className="truncate text-sm text-[var(--v2-muted)]">{shortPosition(applicant.position1)}</p>
        </div>
        <PinStarButton id={applicant.id} />
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="truncate text-[var(--v2-muted)]">{applicant.university}</span>
          <span className="font-semibold text-[var(--v2-ink)]">{applicant.gpa.toFixed(1)}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${round1Tone(applicant.round1Result)}`}>
            {applicant.round1Result ?? "Not reviewed"}
          </span>
          <span className="rounded-full bg-[var(--v2-ink)]/5 px-2 py-0.5 text-xs font-semibold text-[var(--v2-muted)]">Batch {applicant.batch}</span>
        </div>
        <div className="flex items-center gap-2">
          <ActionTooltip label="Drag card">
            <button
              {...attributes}
              {...listeners}
              type="button"
              className="flex size-9 cursor-grab items-center justify-center rounded-full border border-[var(--v2-ink)]/10 text-[var(--v2-muted)] hover:bg-[var(--v2-ink)]/5"
              aria-label="Drag card"
            >
              <GripVertical className="size-4" />
            </button>
          </ActionTooltip>
          <ActionTooltip label="View candidate">
            <button
              type="button"
              onClick={() => onViewDetail?.(applicant)}
              className="flex h-9 flex-1 items-center justify-center gap-1 rounded-full bg-[var(--v2-ink)]/5 text-sm font-semibold text-[var(--v2-ink)] hover:bg-[var(--v2-ink)]/10"
            >
              <Eye className="size-4" />
              View
            </button>
          </ActionTooltip>
        </div>
      </div>
    </article>
  )
}
