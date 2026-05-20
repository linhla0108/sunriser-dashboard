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

export function DrawerShell({ id, title, subtitle, children }: DrawerShellProps) {
  const registry = useDrawerRegistry()
  const startX = useRef(0)
  const startWidth = useRef(0)
  const dragStart = useRef<{ pointerX: number; pointerY: number; panelX: number; panelY: number } | null>(null)
  const draggingHeader = useRef(false)

  if (!registry.open[id]) return null

  const docked = registry.mode[id] === "dock"
  const placement = registry.getDockPlacement(id)
  const width = placement?.width ?? registry.width[id]
  const floatPos = registry.floatPos[id]

  function startResize(event: React.PointerEvent<HTMLDivElement>) {
    startX.current = event.clientX
    startWidth.current = width
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function resize(event: React.PointerEvent<HTMLDivElement>) {
    if (!(event.buttons & 1)) return
    registry.setWidth(id, startWidth.current + startX.current - event.clientX)
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
    const maxY = window.innerHeight - 60
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
      ? { width, top: placement.top, height: placement.height, right: 0 }
      : { width, top: 0, bottom: 0, right: placement.right }
    : undefined

  const floatStyle = floatPos ? { left: floatPos.x, top: floatPos.y, width } : { width }

  return (
    <aside
      data-testid={`v2-${id}-drawer`}
      data-v2-glass-panel="strong"
      data-dock-id={docked ? id : undefined}
      onPointerDown={() => { if (!docked) registry.setActiveFloat(id) }}
      className={cn(
        "border-foreground/10 bg-card/80 flex flex-col backdrop-blur-xl",
        docked
          ? "fixed z-40 hidden border-l shadow-[-20px_0_44px_rgba(15,23,42,0.10)] lg:flex"
          : cn(
              "fixed max-h-[calc(100vh-7rem)] rounded-3xl border shadow-[0_24px_64px_rgba(15,23,42,0.18)]",
              floatPos ? "" : "inset-x-3 bottom-24 sm:inset-x-auto sm:right-4 sm:bottom-24 sm:w-[400px]",
              registry.activeFloatId === id ? "z-50" : "z-40"
            )
      )}
      style={docked ? dockStyle : floatStyle}
    >
      <div
        role="separator"
        aria-label={`Resize ${title}`}
        onPointerDown={startResize}
        onPointerMove={resize}
        className={cn(
          "hover:bg-primary/40 absolute z-10 cursor-ew-resize transition-colors",
          docked ? "inset-y-0 left-0 w-1" : "inset-y-8 left-0 w-1 rounded-full"
        )}
      />
      <header className="border-foreground/10 flex items-start justify-between gap-3 border-b p-4">
        <div className="flex min-w-0 items-start gap-2">
          <button
            type="button"
            aria-label={`Drag ${title} dock`}
            onPointerDown={docked ? startHeaderDrag : startFloatDrag}
            onPointerMove={docked ? undefined : moveFloatDrag}
            onPointerUp={docked ? endHeaderDrag : endFloatDrag}
            onPointerCancel={docked ? undefined : endFloatDrag}
            className={cn("text-muted-foreground hover:bg-foreground/5 mt-0.5 cursor-grab rounded-full p-1 active:cursor-grabbing")}
          >
            <GripHorizontal className="size-4" />
          </button>
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
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-4">{children}</div>
    </aside>
  )
}
