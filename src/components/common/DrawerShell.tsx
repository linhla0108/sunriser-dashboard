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
  const draggingHeader = useRef(false)

  if (!registry.open[id]) return null

  const docked = registry.mode[id] === "dock"
  const placement = registry.getDockPlacement(id)
  const width = placement?.width ?? registry.width[id]

  function startResize(event: React.PointerEvent<HTMLDivElement>) {
    startX.current = event.clientX
    startWidth.current = width
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function resize(event: React.PointerEvent<HTMLDivElement>) {
    if (!(event.buttons & 1)) return
    registry.setWidth(id, startWidth.current + startX.current - event.clientX)
  }

  function startHeaderDrag(event: React.PointerEvent<HTMLButtonElement>) {
    if (!docked) return
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

  const dockStyle = placement
    ? registry.dockLayout === "stack"
      ? { width, top: placement.top, height: placement.height, right: 0 }
      : { width, top: 0, bottom: 0, right: placement.right }
    : undefined

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
              "fixed inset-x-3 bottom-24 max-h-[calc(100vh-7rem)] rounded-3xl border shadow-[0_24px_64px_rgba(15,23,42,0.18)] sm:inset-x-auto sm:right-4 sm:bottom-24 sm:w-[400px]",
              registry.activeFloatId === id ? "z-50" : "z-40"
            )
      )}
      style={docked ? dockStyle : { width }}
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
            onPointerDown={startHeaderDrag}
            onPointerUp={endHeaderDrag}
            className={cn("text-muted-foreground hover:bg-foreground/5 mt-0.5 rounded-full p-1", docked ? "cursor-grab active:cursor-grabbing" : "cursor-default opacity-40")}
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
