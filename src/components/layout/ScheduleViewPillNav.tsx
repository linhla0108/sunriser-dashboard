"use client"

import { createPortal } from "react-dom"
import { Calendar, List } from "lucide-react"
import { ActionTooltip } from "@/components/common/ActionTooltip"
import { Button } from "@/components/ui/button"
import type { ScheduleView } from "@/lib/schedule/scheduleUrlState"

const VIEWS: Array<{ key: ScheduleView; label: string; Icon: typeof Calendar; shortcut: string }> = [
  { key: "gantt", label: "Gantt timeline", Icon: Calendar, shortcut: "1" },
  { key: "agenda", label: "Agenda list", Icon: List, shortcut: "2" },
]

interface ScheduleViewPillNavProps {
  view: ScheduleView
  onViewChange: (view: ScheduleView) => void
}

export function ScheduleViewPillNav({ view, onViewChange }: ScheduleViewPillNavProps) {
  const portalNode = typeof document === "undefined" ? null : document.body

  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key === "1") {
      event.preventDefault()
      onViewChange("gantt")
    } else if (event.key === "2") {
      event.preventDefault()
      onViewChange("agenda")
    }
  }

  const nav = (
    <nav
      aria-label="Schedule view options"
      data-testid="schedule-view-pill-nav"
      data-v2-glass-panel="strong"
      onKeyDown={handleKeyDown}
      className="border-border bg-card/70 text-foreground ring-foreground/5 fixed inset-x-0 bottom-20 z-40 mx-auto flex w-fit max-w-[calc(100vw-2rem)] items-center gap-1 rounded-full border p-1.5 shadow-[0_18px_44px_rgba(15,23,42,0.16)] ring-1 backdrop-blur-xl sm:bottom-6"
    >
      {VIEWS.map(item => {
        const Icon = item.Icon
        const active = view === item.key
        return (
          <ActionTooltip key={item.key} label={item.label} shortcut={item.shortcut}>
            <Button
              variant="plain"
              size="plain"
              type="button"
              onClick={() => onViewChange(item.key)}
              aria-label={item.label}
              aria-pressed={active}
              className={`focus-visible:outline-primary flex size-10 items-center justify-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
              }`}
            >
              <Icon className="size-4" aria-hidden="true" />
            </Button>
          </ActionTooltip>
        )
      })}
    </nav>
  )

  if (!portalNode) return null
  return createPortal(nav, portalNode)
}
