"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { DndContext, DragOverlay, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core"
import { SortableContext, arrayMove, horizontalListSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GitCompare, GripHorizontal, X } from "lucide-react"
import { ActionTooltip } from "@/components/common/ActionTooltip"
import { CompareDialog } from "@/components/pin/ComparePage"
import { Button } from "@/components/ui/button"
import { mockApplicants } from "@/lib/mockData"
import { cn } from "@/lib/utils"
import { usePinned } from "@/lib/pin/usePinned"
import type { Applicant } from "@/lib/types"

type PinnedItem = Applicant

export function PinnedToolbar() {
  const [compareOpen, setCompareOpen] = useState(false)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const { clear, ids, remove, reorder } = usePinned()
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const items = useMemo(
    () =>
      ids.reduce<PinnedItem[]>((acc, id) => {
        const item = mockApplicants.find(applicant => applicant.id === id)
        if (item) acc.push(item)
        return acc
      }, []),
    [ids]
  )

  const draggingItem = useMemo(() => items.find(item => item.id === draggingId) ?? null, [draggingId, items])

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return

    function updateScrollHints() {
      const node = scrollerRef.current
      if (!node) return
      setCanScrollLeft(node.scrollLeft > 4)
      setCanScrollRight(node.scrollLeft + node.clientWidth < node.scrollWidth - 4)
    }

    updateScrollHints()
    scroller.addEventListener("scroll", updateScrollHints, { passive: true })
    window.addEventListener("resize", updateScrollHints)
    return () => {
      scroller.removeEventListener("scroll", updateScrollHints)
      window.removeEventListener("resize", updateScrollHints)
    }
  }, [items.length])

  if (ids.length === 0) return null

  function handleDragStart(event: DragStartEvent) {
    setDraggingId(String(event.active.id))
  }

  function handleDragEnd(event: DragEndEvent) {
    const activeId = String(event.active.id)
    const overId = event.over?.id ? String(event.over.id) : null
    setDraggingId(null)

    if (!overId) return

    const oldIndex = ids.indexOf(activeId)
    const newIndex = ids.indexOf(overId)
    if (oldIndex >= 0 && newIndex >= 0 && oldIndex !== newIndex) {
      reorder(arrayMove(ids, oldIndex, newIndex))
    }
  }

  return (
    <div data-v2-glass-panel="strong" className="border-foreground/10 bg-background/85 sticky top-[75px] z-20 border-b px-3 py-2 backdrop-blur-xl">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setDraggingId(null)}
      >
        <div
          data-v2-glass-panel="strong"
          className="pointer-events-auto flex w-full min-w-0 items-center gap-2 transition-[max-width,box-shadow,border-radius] duration-200"
        >
          <div className="relative min-w-0 flex-1">
            {canScrollLeft ? (
              <div className="from-background pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-linear-to-r to-transparent" />
            ) : null}
            {canScrollRight ? (
              <div className="from-background pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-linear-to-l to-transparent" />
            ) : null}

            {/* TODO: hide scrollbar */}
            <div ref={scrollerRef} className="flex min-w-0 scrollbar-thin flex-nowrap items-center gap-2 overflow-x-auto overscroll-x-contain pr-1">
              <SortableContext items={ids} strategy={horizontalListSortingStrategy}>
                {items.map(item => (
                  <PinnedChip key={item.id} item={item} onRemove={remove} />
                ))}
              </SortableContext>
            </div>
          </div>
          {/* TODO: add vertical seperate here */}
          <div className="bg-foreground/20 h-8 w-px rounded-full" />
          <ActionTooltip label="Compare pinned candidates">
            <Button
              variant="plain"
              size="plain"
              type="button"
              onClick={() => setCompareOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-semibold"
            >
              <GitCompare className="size-3.5" />
              Compare
            </Button>
          </ActionTooltip>
          <ActionTooltip label="Clear pinned candidates">
            <Button
              variant="plain"
              size="plain"
              type="button"
              onClick={() => {
                if (window.confirm("Clear all pinned candidates?")) clear()
              }}
              className="border-foreground/10 text-muted-foreground hover:bg-foreground/5 h-8 shrink-0 rounded-full border px-3 text-xs font-semibold"
            >
              Clear
            </Button>
          </ActionTooltip>
        </div>
        <DragOverlay adjustScale={false} dropAnimation={null}>
          {draggingItem ? <PinnedChipOverlay item={draggingItem} /> : null}
        </DragOverlay>
      </DndContext>
      <CompareDialog open={compareOpen} onOpenChange={setCompareOpen} />
    </div>
  )
}

function PinnedChip({ item, onRemove }: { item: PinnedItem; onRemove: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })

  return (
    <span
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      data-v2-field=""
      className={cn(
        "bg-card/80 text-foreground border-foreground/20 inline-flex shrink-0 cursor-grab items-center gap-0.5 rounded-full border p-2 text-xs font-semibold transition-shadow active:cursor-grabbing",
        isDragging ? "relative z-50 opacity-30 shadow-lg" : "shadow-none"
      )}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <span className="max-w-[180px] truncate leading-3">{item.name}</span>
      <Button
        variant="plain"
        size="plain"
        type="button"
        onClick={() => onRemove(item.id)}
        aria-label={`Remove ${item.name}`}
        className="text-muted-foreground hover:bg-foreground/5 hover:text-foreground rounded-full"
      >
        <X className="size-3" />
      </Button>
    </span>
  )
}

function PinnedChipOverlay({ item }: { item: PinnedItem }) {
  return (
    <div
      data-testid="pinned-drag-overlay"
      className="bg-card text-foreground border-foreground/40 inline-flex h-8 items-center gap-1.5 rounded-full px-2 text-xs font-semibold shadow-xl ring-1"
    >
      <GripHorizontal className="text-muted-foreground size-3.5" />
      <span className="max-w-[180px] truncate">{item.name}</span>
      <X className="text-muted-foreground size-3" />
    </div>
  )
}
