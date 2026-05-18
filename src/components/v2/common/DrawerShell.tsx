"use client"

import { useRef } from "react"
import { Maximize2, Minimize2, X } from "lucide-react"
import { ActionTooltip } from "@/components/v2/common/ActionTooltip"
import { type V2DrawerId, useDrawerRegistry } from "@/lib/v2/drawer/DrawerRegistry"

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

  if (!registry.open[id]) return null

  const docked = registry.mode[id] === "dock"
  const width = registry.width[id]

  function startResize(event: React.PointerEvent<HTMLDivElement>) {
    startX.current = event.clientX
    startWidth.current = width
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function resize(event: React.PointerEvent<HTMLDivElement>) {
    if (!(event.buttons & 1)) return
    registry.setWidth(id, startWidth.current + startX.current - event.clientX)
  }

  return (
    <aside
      data-testid={`v2-${id}-drawer`}
      className={
        docked
          ? "fixed inset-y-0 right-0 z-40 hidden border-l border-[var(--v2-ink)]/10 bg-[var(--v2-surface)] shadow-[-20px_0_44px_rgba(15,23,42,0.10)] lg:flex"
          : "fixed inset-x-3 bottom-24 z-50 flex max-h-[calc(100vh-7rem)] flex-col rounded-3xl border border-[var(--v2-ink)]/10 bg-[var(--v2-surface)] shadow-[0_24px_64px_rgba(15,23,42,0.18)] sm:inset-x-auto sm:right-4 sm:bottom-24 sm:w-[400px]"
      }
      style={docked ? { width } : undefined}
    >
      {docked ? (
        <div
          role="separator"
          aria-label={`Resize ${title}`}
          onPointerDown={startResize}
          onPointerMove={resize}
          className="absolute inset-y-0 left-0 w-1 cursor-ew-resize hover:bg-[var(--v2-primary)]/40"
        />
      ) : null}
      <header className="flex items-start justify-between gap-3 border-b border-[var(--v2-ink)]/10 p-4">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-[var(--v2-ink)]">{title}</h2>
          {subtitle ? <p className="mt-0.5 truncate text-sm text-[var(--v2-muted)]">{subtitle}</p> : null}
        </div>
        <div className="flex items-center gap-1">
          <ActionTooltip label={docked ? "Float drawer" : "Dock drawer"}>
            <button
              type="button"
              onClick={() => registry.setMode(id, docked ? "float" : "dock")}
              className="flex size-8 items-center justify-center rounded-full text-[var(--v2-muted)] hover:bg-[var(--v2-ink)]/5"
            >
              {docked ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
            </button>
          </ActionTooltip>
          <ActionTooltip label="Close drawer">
            <button
              type="button"
              onClick={() => registry.close(id)}
              className="flex size-8 items-center justify-center rounded-full text-[var(--v2-muted)] hover:bg-[var(--v2-ink)]/5"
            >
              <X className="size-4" />
            </button>
          </ActionTooltip>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-auto p-4">{children}</div>
    </aside>
  )
}
