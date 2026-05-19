"use client"

import { useState } from "react"
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Eye, GripVertical } from "lucide-react"
import { ActionTooltip } from "@/components/v2/common/ActionTooltip"
import { PinStarButton } from "@/components/v2/pin/PinStarButton"
import type { Applicant } from "@/lib/types"
import { initials, round1Tone, shortPosition } from "./viewUtils"
import { Button } from "@/components/ui/button"

interface GalleryViewProps {
  data: Applicant[]
  onReorder?: (items: Applicant[]) => void
  onViewDetail?: (applicant: Applicant) => void
}

export function GalleryView({ data, onReorder, onViewDetail }: GalleryViewProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const activeApplicant = activeId ? (data.find(item => item.id === activeId) ?? null) : null

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id))
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    if (!over || active.id === over.id) return
    const oldIndex = data.findIndex(item => item.id === active.id)
    const newIndex = data.findIndex(item => item.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    onReorder?.(arrayMove(data, oldIndex, newIndex))
  }

  function handleDragCancel() {
    setActiveId(null)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={data.map(item => item.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.slice(0, 120).map(item => (
            <GalleryCard key={item.id} applicant={item} onViewDetail={onViewDetail} />
          ))}
        </div>
        {data.length > 120 && (
          <p className="text-muted-foreground mt-4 text-center text-sm">Showing 120 of {data.length} candidates — use filters to narrow results</p>
        )}
      </SortableContext>
      <DragOverlay>{activeApplicant ? <GalleryCardOverlay applicant={activeApplicant} /> : null}</DragOverlay>
    </DndContext>
  )
}

function GalleryCard({ applicant, onViewDetail }: { applicant: Applicant; onViewDetail?: (applicant: Applicant) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: applicant.id })

  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      data-v2-card=""
      className={`border-foreground/10 bg-card/80 overflow-hidden rounded-3xl border shadow-[0_12px_28px_rgba(15,23,42,0.08)] ${isDragging ? "ring-primary/30 opacity-40 ring-2" : ""}`}
    >
      <div className="bg-primary/8 flex items-start gap-3 p-4">
        <div className="bg-primary text-primary-foreground flex size-12 shrink-0 items-center justify-center rounded-full text-sm font-bold">
          {initials(applicant.name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-foreground truncate font-semibold">{applicant.name}</p>
          <p className="text-muted-foreground truncate text-sm">{shortPosition(applicant.position1)}</p>
        </div>
        <PinStarButton id={applicant.id} />
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground truncate">{applicant.university}</span>
          <span className="text-foreground font-semibold">{applicant.gpa.toFixed(1)}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${round1Tone(applicant.round1Result)}`}>
            {applicant.round1Result ?? "Not reviewed"}
          </span>
          <span className="bg-foreground/5 text-muted-foreground rounded-full px-2 py-0.5 text-xs font-semibold">Batch {applicant.batch}</span>
        </div>
        <div className="flex items-center gap-2">
          <ActionTooltip label="Drag card">
            <Button
              variant="plain"
              size="plain"
              {...attributes}
              {...listeners}
              type="button"
              className="border-foreground/10 text-muted-foreground hover:bg-foreground/5 flex size-9 cursor-grab items-center justify-center rounded-full border"
              aria-label="Drag card"
            >
              <GripVertical className="size-4" />
            </Button>
          </ActionTooltip>
          <ActionTooltip label="View candidate">
            <Button
              variant="plain"
              size="plain"
              type="button"
              onClick={() => onViewDetail?.(applicant)}
              className="bg-foreground/5 text-foreground hover:bg-foreground/10 flex h-9 flex-1 items-center justify-center gap-1 rounded-full text-sm font-semibold"
            >
              <Eye className="size-4" />
              View
            </Button>
          </ActionTooltip>
        </div>
      </div>
    </article>
  )
}

function GalleryCardOverlay({ applicant }: { applicant: Applicant }) {
  return (
    <article
      data-v2-glass-panel="strong"
      className="border-primary/30 bg-card/90 ring-primary/20 overflow-hidden rounded-3xl border shadow-[0_24px_48px_rgba(15,23,42,0.20)] ring-2"
    >
      <div className="bg-primary/8 flex items-start gap-3 p-4">
        <div className="bg-primary text-primary-foreground flex size-12 shrink-0 items-center justify-center rounded-full text-sm font-bold">
          {initials(applicant.name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-foreground truncate font-semibold">{applicant.name}</p>
          <p className="text-muted-foreground truncate text-sm">{shortPosition(applicant.position1)}</p>
        </div>
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground truncate">{applicant.university}</span>
          <span className="text-foreground font-semibold">{applicant.gpa.toFixed(1)}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${round1Tone(applicant.round1Result)}`}>
            {applicant.round1Result ?? "Not reviewed"}
          </span>
          <span className="bg-foreground/5 text-muted-foreground rounded-full px-2 py-0.5 text-xs font-semibold">Batch {applicant.batch}</span>
        </div>
      </div>
    </article>
  )
}
