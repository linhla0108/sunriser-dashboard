"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"
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
  const [pillCenterX, setPillCenterX] = useState<number | null>(null)
  const [clickedPageButton, setClickedPageButton] = useState<"prev" | "next" | null>(null)
  const clickedTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    function syncTableCenter() {
      const table = document.querySelector('[data-cid="applicant-table"]')
      const rect = table?.getBoundingClientRect()
      setPillCenterX(rect && rect.width > 0 ? Math.round(rect.left + rect.width / 2) : null)
    }

    syncTableCenter()
    window.addEventListener("resize", syncTableCenter)

    const table = document.querySelector('[data-cid="applicant-table"]')
    const observer =
      table && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            syncTableCenter()
          })
        : null
    if (table) observer?.observe(table)

    return () => {
      window.removeEventListener("resize", syncTableCenter)
      observer?.disconnect()
    }
  }, [])

  useEffect(() => {
    return () => {
      if (clickedTimeoutRef.current) window.clearTimeout(clickedTimeoutRef.current)
    }
  }, [])

  function handlePaginationPress(direction: "prev" | "next") {
    setClickedPageButton(direction)
    if (clickedTimeoutRef.current) window.clearTimeout(clickedTimeoutRef.current)
    clickedTimeoutRef.current = window.setTimeout(() => setClickedPageButton(null), 420)
  }

  function handlePaginationClick(direction: "prev" | "next") {
    if (direction === "prev") pagination?.goPrev()
    else pagination?.goNext()
  }

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
    <div
      data-testid="v2-pill-nav-root"
      className="pointer-events-none fixed inset-x-0 bottom-5 z-40 h-12 px-4"
      style={{ "--v2-pill-center-x": pillCenterX ? `${pillCenterX}px` : "50%" } as CSSProperties}
    >
      <nav
        aria-label="Candidate view options"
        data-testid="v2-view-pill-nav"
        data-v2-glass-panel="strong"
        onKeyDown={handleKeyDown}
        className="border-border bg-card/80 text-foreground ring-foreground/5 pointer-events-auto absolute top-0 flex w-fit -translate-x-1/2 items-center gap-1 rounded-full border p-1.5 shadow-[0_18px_44px_rgba(15,23,42,0.16)] ring-1 backdrop-blur-xl"
        style={{ left: "var(--v2-pill-center-x)" }}
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
      </nav>
      {pagination && view === "table" ? (
        <nav
          aria-label="Candidate table pagination"
          data-testid="v2-table-pagination-pill"
          data-v2-glass-panel="strong"
          onKeyDown={handleKeyDown}
          className="border-border bg-card/80 text-muted-foreground ring-foreground/5 pointer-events-auto absolute top-0 flex w-fit items-center gap-1 rounded-full border p-1.5 shadow-[0_18px_44px_rgba(15,23,42,0.16)] ring-1 backdrop-blur-xl"
          style={{ left: "calc(var(--v2-pill-center-x) + 88px)" }}
        >
          <ActionTooltip label="Previous page" shortcut="←">
            <Button
              variant="plain"
              size="plain"
              type="button"
              onPointerDown={() => handlePaginationPress("prev")}
              onClick={() => handlePaginationClick("prev")}
              disabled={!pagination.canGoPrev}
              aria-label="Previous page"
              data-pagination-clicked={clickedPageButton === "prev" ? "true" : undefined}
              className={`hover:bg-foreground/5 hover:text-foreground focus-visible:outline-primary flex size-10 items-center justify-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-40 ${
                clickedPageButton === "prev" ? "bg-primary/10 text-primary" : "text-muted-foreground"
              }`}
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </Button>
          </ActionTooltip>
          <ActionTooltip label="Next page" shortcut="→">
            <Button
              variant="plain"
              size="plain"
              type="button"
              onPointerDown={() => handlePaginationPress("next")}
              onClick={() => handlePaginationClick("next")}
              disabled={!pagination.canGoNext}
              aria-label="Next page"
              data-pagination-clicked={clickedPageButton === "next" ? "true" : undefined}
              className={`hover:bg-foreground/5 hover:text-foreground focus-visible:outline-primary flex size-10 items-center justify-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-40 ${
                clickedPageButton === "next" ? "bg-primary/10 text-primary" : "text-muted-foreground"
              }`}
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </Button>
          </ActionTooltip>
        </nav>
      ) : null}
    </div>
  )

  if (!portalNode) return null
  return createPortal(nav, portalNode)
}
