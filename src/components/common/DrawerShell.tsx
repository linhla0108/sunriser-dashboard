"use client"

import { useRef } from "react"
import { Columns2, GripHorizontal, Maximize2, Minimize2, Rows2, X } from "lucide-react"
import { ActionTooltip } from "@/components/common/ActionTooltip"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { type V2DrawerId, useDrawerRegistry } from "@/lib/drawer/DrawerRegistry"

interface DrawerShellProps {
  id: V2DrawerId
  title: string
  subtitle?: string
  children: React.ReactNode
}

type ResizeDirection = "top" | "right" | "bottom" | "left" | "top-left" | "top-right" | "bottom-right" | "bottom-left"

const RESIZE_HANDLES: Array<{ direction: ResizeDirection; className: string }> = [
  { direction: "top", className: "top-0 right-12 left-12 h-2 cursor-ns-resize hover:bg-primary/15" },
  { direction: "right", className: "top-12 right-0 bottom-12 w-2 cursor-ew-resize hover:bg-primary/15" },
  { direction: "bottom", className: "right-12 bottom-0 left-12 h-2 cursor-ns-resize hover:bg-primary/15" },
  { direction: "left", className: "top-12 bottom-12 left-0 w-2 cursor-ew-resize hover:bg-primary/15" },
  { direction: "top-left", className: "top-0 left-0 size-4 cursor-nwse-resize rounded-br-xl hover:bg-primary/15" },
  { direction: "top-right", className: "top-0 right-0 size-4 cursor-nesw-resize rounded-bl-xl hover:bg-primary/15" },
  { direction: "bottom-right", className: "right-0 bottom-0 size-4 cursor-nwse-resize rounded-tl-xl hover:bg-primary/15" },
  { direction: "bottom-left", className: "bottom-0 left-0 size-4 cursor-nesw-resize rounded-tr-xl hover:bg-primary/15" },
]

function directionHas(direction: ResizeDirection, edge: "top" | "right" | "bottom" | "left") {
  return direction === edge || direction.includes(edge)
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function DrawerShell({ id, title, subtitle, children }: DrawerShellProps) {
  const registry = useDrawerRegistry()
  const dragStart = useRef<{ pointerX: number; pointerY: number; panelX: number; panelY: number } | null>(null)
  const resizeStart = useRef<{
    direction: ResizeDirection
    pointerX: number
    pointerY: number
    panelX: number
    panelY: number
    panelRight: number
    panelBottom: number
    width: number
    height: number
    dockStackRatio: number
    dockStackAvailable: number
    dockIndex: number
    dockCount: number
  } | null>(null)
  const draggingHeader = useRef(false)

  if (!registry.open[id]) return null

  const docked = registry.mode[id] === "dock"
  const placement = registry.getDockPlacement(id)
  const width = placement?.width ?? registry.width[id]
  const height = typeof placement?.height === "number" ? placement.height : registry.height[id]
  const floatPos = registry.floatPos[id]

  function startResize(direction: ResizeDirection, event: React.PointerEvent<HTMLDivElement>) {
    const aside = event.currentTarget.closest("aside")
    const rect = aside?.getBoundingClientRect()
    resizeStart.current = {
      direction,
      pointerX: event.clientX,
      pointerY: event.clientY,
      panelX: rect?.left ?? floatPos?.x ?? 0,
      panelY: rect?.top ?? floatPos?.y ?? 0,
      panelRight: rect?.right ?? (floatPos?.x ?? 0) + width,
      panelBottom: rect?.bottom ?? (floatPos?.y ?? 0) + height,
      width: rect?.width ?? width,
      height: rect?.height ?? height,
      dockStackRatio: registry.dockStackRatio,
      dockStackAvailable: window.innerHeight - 36,
      dockIndex: placement?.index ?? 0,
      dockCount: placement?.count ?? 1,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function resize(event: React.PointerEvent<HTMLDivElement>) {
    const start = resizeStart.current
    if (!start || !(event.buttons & 1)) return

    const dx = event.clientX - start.pointerX
    const dy = event.clientY - start.pointerY
    const resizeLeft = directionHas(start.direction, "left")
    const resizeRight = directionHas(start.direction, "right")
    const resizeTop = directionHas(start.direction, "top")
    const resizeBottom = directionHas(start.direction, "bottom")
    let nextFloatX = floatPos?.x ?? start.panelX
    let nextFloatY = floatPos?.y ?? start.panelY
    let shouldUpdateFloatPos = false

    if (resizeLeft || resizeRight) {
      const nextWidth = clamp(start.width + (resizeLeft ? -dx : dx), 320, 560)
      registry.setWidth(id, nextWidth)
      if (!docked && resizeLeft) {
        nextFloatX = clamp(start.panelRight - nextWidth, 0, Math.max(0, window.innerWidth - nextWidth))
        shouldUpdateFloatPos = true
      }
    }

    if (resizeTop || resizeBottom) {
      if (docked && registry.dockLayout === "stack" && start.dockCount === 2) {
        const boundaryDelta = start.dockIndex === 0 ? (resizeBottom ? dy : -dy) : resizeTop ? dy : -dy
        registry.setDockStackRatio(start.dockStackRatio + boundaryDelta / Math.max(1, start.dockStackAvailable))
      } else if (!docked) {
        const nextHeight = clamp(start.height + (resizeTop ? -dy : dy), 320, Math.min(720, Math.max(320, window.innerHeight - 112)))
        registry.setHeight(id, nextHeight)
        if (resizeTop) {
          nextFloatY = clamp(start.panelBottom - nextHeight, 0, Math.max(0, window.innerHeight - nextHeight))
          shouldUpdateFloatPos = true
        }
      }
    }

    if (!docked && shouldUpdateFloatPos) {
      registry.setFloatPos(id, { x: nextFloatX, y: nextFloatY })
    }
  }

  function endResize() {
    resizeStart.current = null
  }

  // Dock drag — reorder between docked panels
  function startHeaderDrag(event: React.PointerEvent<HTMLButtonElement>) {
    draggingHeader.current = true
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function endHeaderDrag(event: React.PointerEvent<HTMLButtonElement>) {
    if (!draggingHeader.current) return
    draggingHeader.current = false
    const target = document.elementsFromPoint(event.clientX, event.clientY).find(element => element instanceof HTMLElement && element.dataset.dockId)
    const overId = target instanceof HTMLElement ? (target.dataset.dockId as V2DrawerId | undefined) : undefined
    if (overId && overId !== id) registry.moveDock(id, overId)
  }

  // Float drag — move panel freely on screen
  function startFloatDrag(event: React.PointerEvent<HTMLButtonElement>) {
    const pos = registry.floatPos[id]
    let panelX: number
    let panelY: number
    if (pos) {
      panelX = pos.x
      panelY = pos.y
    } else {
      const aside = event.currentTarget.closest("aside")
      const rect = aside?.getBoundingClientRect()
      panelX = rect?.left ?? 0
      panelY = rect?.top ?? 0
    }
    dragStart.current = { pointerX: event.clientX, pointerY: event.clientY, panelX, panelY }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function moveFloatDrag(event: React.PointerEvent<HTMLButtonElement>) {
    if (!dragStart.current) return
    const dx = event.clientX - dragStart.current.pointerX
    const dy = event.clientY - dragStart.current.pointerY
    const maxX = window.innerWidth - width
    const maxY = window.innerHeight - height
    registry.setFloatPos(id, {
      x: Math.max(0, Math.min(dragStart.current.panelX + dx, maxX)),
      y: Math.max(0, Math.min(dragStart.current.panelY + dy, maxY)),
    })
  }

  function endFloatDrag() {
    dragStart.current = null
  }

  const dockStyle = placement
    ? registry.dockLayout === "stack"
      ? { width, top: placement.top, height: placement.height, right: placement.right }
      : { width, top: 12, bottom: 12, right: placement.right }
    : undefined

  const floatStyle = floatPos ? { left: floatPos.x, top: floatPos.y, width, height } : { width, height }

  return (
    <aside
      data-testid={`v2-${id}-drawer`}
      data-v2-glass-panel="strong"
      data-dock-id={docked ? id : undefined}
      onPointerDown={() => {
        if (!docked) registry.setActiveFloat(id)
      }}
      className={cn(
        "border-foreground/10 bg-card/70 flex flex-col overflow-hidden backdrop-blur-xl",
        docked
          ? "fixed z-40 hidden rounded-3xl border shadow-[-16px_0_36px_rgba(15,23,42,0.09)] lg:flex"
          : cn(
              "fixed max-h-[calc(100vh-7rem)] rounded-3xl border shadow-[0_20px_48px_rgba(15,23,42,0.14)]",
              floatPos ? "" : "inset-x-3 bottom-24 sm:inset-x-auto sm:right-4 sm:bottom-24 sm:w-[400px]",
              registry.activeFloatId === id ? "z-50" : "z-40"
            )
      )}
      style={docked ? dockStyle : floatStyle}
    >
      <ActionTooltip label={`Drag ${title} drawer`}>
        <Button
          variant="plain"
          size="plain"
          type="button"
          aria-label={`Drag ${title} drawer`}
          onPointerDown={docked ? startHeaderDrag : startFloatDrag}
          onPointerMove={docked ? undefined : moveFloatDrag}
          onPointerUp={docked ? endHeaderDrag : endFloatDrag}
          onPointerCancel={docked ? undefined : endFloatDrag}
          className="text-muted-foreground hover:bg-background/80 focus-visible:bg-background/85 bg-background/65 absolute top-2 left-1/2 z-30 flex size-7 -translate-x-1/2 cursor-grab items-center justify-center rounded-full border-0 shadow-none ring-0 transition-colors focus-visible:border-transparent focus-visible:ring-0 focus-visible:outline-none active:cursor-grabbing"
        >
          <GripHorizontal className="size-3.5" />
        </Button>
      </ActionTooltip>
      {RESIZE_HANDLES.map(handle => (
        <div
          key={handle.direction}
          role="separator"
          aria-label={`Resize ${title} ${handle.direction}`}
          data-resize-handle={handle.direction}
          onPointerDown={event => startResize(handle.direction, event)}
          onPointerMove={resize}
          onPointerUp={endResize}
          onPointerCancel={endResize}
          className={cn(
            "absolute z-20 border-0 bg-transparent shadow-none ring-0 transition-colors outline-none focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none",
            handle.className
          )}
        />
      ))}
      <header className="border-foreground/10 bg-card/35 flex items-start justify-between gap-3 border-b p-4 pt-5">
        <div className="flex min-w-0 items-start">
          <div className="min-w-0">
            <h2 className="text-foreground truncate text-base font-semibold">{title}</h2>
            {subtitle ? <p className="text-muted-foreground mt-0.5 truncate text-sm">{subtitle}</p> : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {docked && registry.dockedIds.length > 1 ? (
            <ActionTooltip label={registry.dockLayout === "stack" ? "Use two dock columns" : "Stack docks in one column"}>
              <Button
                variant="plain"
                size="plain"
                type="button"
                onClick={() => registry.setDockLayout(registry.dockLayout === "stack" ? "columns" : "stack")}
                className="text-muted-foreground hover:bg-foreground/5 flex size-8 items-center justify-center rounded-full"
              >
                {registry.dockLayout === "stack" ? <Columns2 className="size-4" /> : <Rows2 className="size-4" />}
              </Button>
            </ActionTooltip>
          ) : null}
          <ActionTooltip label={docked ? "Float drawer" : "Dock drawer"}>
            <Button
              variant="plain"
              size="plain"
              type="button"
              onClick={() => registry.setMode(id, docked ? "float" : "dock")}
              className="text-muted-foreground hover:bg-foreground/5 flex size-8 items-center justify-center rounded-full"
            >
              {docked ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
            </Button>
          </ActionTooltip>
          <ActionTooltip label="Close drawer">
            <Button
              variant="plain"
              size="plain"
              type="button"
              onClick={() => registry.close(id)}
              className="text-muted-foreground hover:bg-foreground/5 flex size-8 items-center justify-center rounded-full"
            >
              <X className="size-4" />
            </Button>
          </ActionTooltip>
        </div>
      </header>
      <div
        data-testid={`v2-${id}-drawer-body`}
        className="bg-card/40 flex min-h-0 flex-1 flex-col overflow-hidden rounded-b-3xl p-4 backdrop-blur-md"
      >
        {children}
      </div>
    </aside>
  )
}
