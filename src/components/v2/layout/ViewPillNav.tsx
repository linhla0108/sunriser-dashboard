"use client"

import { useEffect, useRef, useState } from "react"
import { BarChart3, Kanban, LayoutGrid, Table2 } from "lucide-react"
import { ActionTooltip } from "@/components/v2/common/ActionTooltip"
import { SavedViewsMenu } from "@/components/v2/views/SavedViewsMenu"
import { V2_VIEW_KEYS, type V2View, useViewState } from "@/lib/v2/views/useViewState"

const VIEWS: Array<{
  key: V2View
  label: string
  Icon: typeof Table2
}> = [
  { key: "table", label: "Table view", Icon: Table2 },
  { key: "pipeline", label: "Pipeline view", Icon: Kanban },
  { key: "gallery", label: "Gallery view", Icon: LayoutGrid },
  { key: "chart", label: "Chart view", Icon: BarChart3 },
]

function getScrollY(event: Event) {
  const target = event.target
  if (target instanceof HTMLElement) return target.scrollTop
  return window.scrollY || document.scrollingElement?.scrollTop || 0
}

export function ViewPillNav() {
  const { view, setView } = useViewState()
  const [visible, setVisible] = useState(true)
  const lastY = useRef(0)

  useEffect(() => {
    function onScroll(event: Event) {
      const y = getScrollY(event)
      if (y < 80) setVisible(true)
      else if (y > lastY.current + 4) setVisible(false)
      else if (y < lastY.current - 4) setVisible(true)
      lastY.current = y
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    document.addEventListener("scroll", onScroll, { capture: true, passive: true })

    return () => {
      window.removeEventListener("scroll", onScroll)
      document.removeEventListener("scroll", onScroll, { capture: true })
    }
  }, [])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const index = Number(event.key) - 1
      const nextView = V2_VIEW_KEYS[index]
      if (!nextView) return

      event.preventDefault()
      setView(nextView)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [setView])

  return (
    <nav
      aria-label="Candidate view options"
      data-testid="v2-view-pill-nav"
      className={`fixed inset-x-0 bottom-20 z-40 mx-auto flex w-fit max-w-[calc(100vw-2rem)] items-center gap-1 rounded-full border border-[var(--v2-ink)]/10 bg-[var(--v2-surface)]/95 p-1.5 text-[var(--v2-ink)] shadow-[0_18px_44px_rgba(15,23,42,0.16)] backdrop-blur transition-opacity duration-200 sm:bottom-6 ${visible ? "opacity-100" : "pointer-events-none opacity-0"}`}
    >
      {VIEWS.map((item, index) => {
        const Icon = item.Icon
        const active = view === item.key

        return (
          <ActionTooltip key={item.key} label={item.label} shortcut={String(index + 1)}>
            <button
              type="button"
              onClick={() => setView(item.key)}
              aria-label={item.label}
              aria-pressed={active}
              className={`flex size-10 items-center justify-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--v2-primary)] ${
                active ? "bg-[var(--v2-primary)] text-white" : "text-[var(--v2-muted)] hover:bg-[var(--v2-ink)]/5 hover:text-[var(--v2-ink)]"
              }`}
            >
              <Icon className="size-4" aria-hidden="true" />
            </button>
          </ActionTooltip>
        )
      })}
      <div className="mx-1 h-6 w-px bg-[var(--v2-ink)]/10" />
      <SavedViewsMenu />
    </nav>
  )
}
