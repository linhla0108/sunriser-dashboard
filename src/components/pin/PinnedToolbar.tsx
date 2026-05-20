"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { SortableContext, arrayMove, horizontalListSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ChevronDown, GitCompare, GripHorizontal, PanelTopClose, PanelTopOpen, Trash2, X } from "lucide-react"
import { ActionTooltip } from "@/components/common/ActionTooltip"
import { CompareDialog } from "@/components/pin/ComparePage"
import { Button } from "@/components/ui/button"
import { mockApplicants } from "@/lib/mockData"
import { cn } from "@/lib/utils"
import { usePinned } from "@/lib/pin/usePinned"
import type { Applicant } from "@/lib/types"

const DELETE_ZONE_ID = "pinned-delete-zone"

type PinnedItem = Applicant

export function PinnedToolbar() {
  const [compareOpen, setCompareOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [tabMode, setTabMode] = useState(false)
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
  }, [items.length, collapsed])

  if (ids.length === 0) return null

  function handleDragStart(event: DragStartEvent) {
    setDraggingId(String(event.active.id))
  }

  function handleDragEnd(event: DragEndEvent) {
    const activeId = String(event.active.id)
    const overId = event.over?.id ? String(event.over.id) : null
    setDraggingId(null)

    if (!overId) return
    if (overId === DELETE_ZONE_ID) {
      remove(activeId)
      return
    }

    const oldIndex = ids.indexOf(activeId)
    const newIndex = ids.indexOf(overId)
    if (oldIndex >= 0 && newIndex >= 0 && oldIndex !== newIndex) {
      reorder(arrayMove(ids, oldIndex, newIndex))
    }
  }

  return (
    <div
      data-v2-glass-panel="strong"
      className={cn(
        "border-foreground/10 bg-background/85 sticky z-20 border-b px-3 py-2 backdrop-blur-xl sm:px-4 lg:px-6",
        tabMode ? "top-0" : "top-[75px]"
      )}
    >
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={() => setDraggingId(null)}>
        <div className="flex min-w-0 items-center gap-2">
          <Button
            variant="plain"
            size="plain"
            type="button"
            onClick={() => setCollapsed(current => !current)}
            aria-expanded={!collapsed}
            className="border-foreground/10 bg-card/80 text-foreground ring-foreground/10 flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold ring-1"
          >
            <GripHorizontal className="text-muted-foreground size-3.5" />
            Pinned
            <span className="bg-primary/10 text-primary rounded-full px-1.5 py-0.5 text-[10px]">{ids.length}</span>
            <ChevronDown className={cn("text-muted-foreground size-3.5 transition-transform", collapsed ? "-rotate-90" : "rotate-0")} />
          </Button>

          {!collapsed ? (
            <>
              <div className="relative min-w-0 flex-1">
                {canScrollLeft ? <div className="from-background pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r to-transparent" /> : null}
                {canScrollRight ? <div className="from-background pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l to-transparent" /> : null}
                <div ref={scrollerRef} className="scrollbar-thin flex min-w-0 flex-nowrap items-center gap-2 overflow-x-auto overscroll-x-contain pr-1">
                  <SortableContext items={ids} strategy={horizontalListSortingStrategy}>
                    {items.map(item => (
                      <PinnedChip key={item.id} item={item} onRemove={remove} />
                    ))}
                  </SortableContext>
                </div>
              </div>

              <PinnedDeleteZone visible={!!draggingId} />

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
              <ActionTooltip label={tabMode ? "Use sticky bar" : "Use sticky tab"}>
                <Button
                  variant="plain"
                  size="plain"
                  type="button"
                  onClick={() => setTabMode(current => !current)}
                  className="border-foreground/10 text-muted-foreground hover:bg-foreground/5 flex size-8 shrink-0 items-center justify-center rounded-full border"
                >
                  {tabMode ? <PanelTopOpen className="size-3.5" /> : <PanelTopClose className="size-3.5" />}
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
            </>
          ) : (
            <span className="text-muted-foreground truncate text-xs font-medium">{items.map(item => item.name).join(", ")}</span>
          )}
        </div>
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
      data-v2-field=""
      className={cn(
        "bg-card/80 text-foreground ring-foreground/10 inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-2 text-xs font-semibold ring-1 transition-shadow",
        isDragging ? "shadow-lg opacity-80" : "shadow-none"
      )}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
    >
      <button type="button" className="text-muted-foreground cursor-grab touch-none active:cursor-grabbing" aria-label={`Reorder ${item.name}`} {...listeners}>
        <GripHorizontal className="size-3.5" />
      </button>
      <span className="max-w-[180px] truncate">{item.name}</span>
      <Button
        variant="plain"
        size="plain"
        type="button"
        onClick={() => onRemove(item.id)}
        aria-label={`Remove ${item.name}`}
        className="text-muted-foreground hover:bg-foreground/5 hover:text-foreground rounded-full p-0.5"
      >
        <X className="size-3" />
      </Button>
    </span>
  )
}

function PinnedDeleteZone({ visible }: { visible: boolean }) {
  const { isOver, setNodeRef } = useDroppable({ id: DELETE_ZONE_ID })

  if (!visible) return null

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "border-destructive/30 text-destructive flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-dashed px-3 text-xs font-semibold transition-colors",
        isOver ? "bg-destructive/15" : "bg-destructive/5"
      )}
    >
      <Trash2 className="size-3.5" />
      Drop to delete
    </div>
  )
}
