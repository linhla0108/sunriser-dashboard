"use client"

import { createPortal } from "react-dom"
import { BarChart3, ChevronLeft, ChevronRight, Kanban, Table2 } from "lucide-react"
import { ActionTooltip } from "@/components/common/ActionTooltip"
import { V2_VIEW_KEYS, type V2View, useViewState } from "@/lib/views/useViewState"
import { Button } from "@/components/ui/button"

const VIEWS: Array<{
  key: V2View
  label: string
  Icon: typeof Table2
}> = [
  { key: "table", label: "Table view", Icon: Table2 },
  { key: "pipeline", label: "Pipeline view", Icon: Kanban },
  { key: "chart", label: "Chart view", Icon: BarChart3 },
]

interface PaginationControls {
  canGoPrev: boolean
  canGoNext: boolean
  goPrev: () => void
  goNext: () => void
}

interface ViewPillNavProps {
  view?: V2View
  onViewChange?: (view: V2View) => void
  pagination?: PaginationControls
}

export function ViewPillNav({ view: controlledView, onViewChange, pagination }: ViewPillNavProps = {}) {
  const { view: storedView, setView: setStoredView } = useViewState()
  const view = controlledView ?? storedView
  const setView = onViewChange ?? setStoredView
  const portalNode = typeof document === "undefined" ? null : document.body

  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    const index = Number(event.key) - 1
    const nextView = V2_VIEW_KEYS[index]
    if (nextView) {
      event.preventDefault()
      setView(nextView)
      return
    }

    if (view !== "table" || !pagination) return

    if (event.key === "ArrowLeft" && pagination.canGoPrev) {
      event.preventDefault()
      pagination.goPrev()
    }

    if (event.key === "ArrowRight" && pagination.canGoNext) {
      event.preventDefault()
      pagination.goNext()
    }
  }

  const nav = (
    <nav
      aria-label="Candidate view options"
      data-testid="v2-view-pill-nav"
      data-v2-glass-panel="strong"
      onKeyDown={handleKeyDown}
      className="border-border bg-card/70 text-foreground ring-foreground/5 fixed inset-x-0 bottom-20 z-40 mx-auto flex w-fit max-w-[calc(100vw-2rem)] items-center gap-1 rounded-full border p-1.5 shadow-[0_18px_44px_rgba(15,23,42,0.16)] ring-1 backdrop-blur-xl sm:bottom-6"
    >
      {VIEWS.map((item, index) => {
        const Icon = item.Icon
        const active = view === item.key

        return (
          <ActionTooltip key={item.key} label={item.label} shortcut={String(index + 1)}>
            <Button
              variant="plain"
              size="plain"
              type="button"
              onClick={() => setView(item.key)}
              aria-label={item.label}
              aria-pressed={active}
              className={`focus-visible:outline-primary flex size-10 items-center justify-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"}`}
            >
              <Icon className="size-4" aria-hidden="true" />
            </Button>
          </ActionTooltip>
        )
      })}
      {pagination && view === "table" ? (
        <>
          <div className="bg-border mx-1 h-5 w-px" aria-hidden="true" />
          <ActionTooltip label="Previous page" shortcut="←">
            <Button
              variant="plain"
              size="plain"
              type="button"
              onClick={pagination.goPrev}
              disabled={!pagination.canGoPrev}
              aria-label="Previous page"
              className="text-muted-foreground hover:bg-foreground/5 hover:text-foreground focus-visible:outline-primary flex size-10 items-center justify-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </Button>
          </ActionTooltip>
          <ActionTooltip label="Next page" shortcut="→">
            <Button
              variant="plain"
              size="plain"
              type="button"
              onClick={pagination.goNext}
              disabled={!pagination.canGoNext}
              aria-label="Next page"
              className="text-muted-foreground hover:bg-foreground/5 hover:text-foreground focus-visible:outline-primary flex size-10 items-center justify-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </Button>
          </ActionTooltip>
        </>
      ) : null}
    </nav>
  )

  if (!portalNode) return null
  return createPortal(nav, portalNode)
}
