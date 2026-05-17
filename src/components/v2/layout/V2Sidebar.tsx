"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCallback, useRef, useState } from "react"
import { LayoutDashboard, PanelLeftClose, PanelLeftOpen, Settings, Users } from "lucide-react"
import { z } from "zod"
import { ActionTooltip } from "@/components/v2/common/ActionTooltip"
import { useShortcut } from "@/lib/v2/keyboard/useShortcut"
import { usePersistedState } from "@/lib/v2/persistence/usePersistedState"

const NAV_ITEMS = [
  { href: "/v2/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/v2/candidates", label: "Candidates", icon: Users },
  { href: "/v2/settings", label: "Settings", icon: Settings },
]

export function V2Sidebar() {
  const pathname = usePathname()
  const peekTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [peek, setPeek] = useState(false)
  const [collapsed, setCollapsed] = usePersistedState("v2.sidebar.collapsed", false, z.boolean())

  const expanded = !collapsed || peek

  const toggleCollapsed = useCallback(() => {
    setCollapsed(current => !current)
    setPeek(false)
  }, [setCollapsed])

  useShortcut({ key: "\\", meta: true }, toggleCollapsed)

  function handlePointerEnter() {
    if (!collapsed) return
    peekTimer.current = setTimeout(() => setPeek(true), 300)
  }

  function handlePointerLeave() {
    if (peekTimer.current) clearTimeout(peekTimer.current)
    setPeek(false)
  }

  return (
    <aside
      data-testid="v2-sidebar"
      onMouseEnter={handlePointerEnter}
      onMouseLeave={handlePointerLeave}
      className={`hidden h-screen shrink-0 flex-col border-r border-[var(--v2-ink)]/10 bg-[var(--v2-surface)] transition-[width] duration-200 sm:flex ${expanded ? "w-[240px]" : "w-16"}`}
    >
      <div className="flex min-h-16 items-center justify-between gap-2 px-3">
        {expanded ? (
          <div>
            <span className="block text-sm font-bold tracking-tight text-[var(--v2-ink)]">SUN.RISER</span>
            <span className="block text-xs font-medium text-[var(--v2-muted)]">Workspace V2</span>
          </div>
        ) : (
          <span className="mx-auto text-lg font-bold text-[var(--v2-primary)]">S</span>
        )}

        <ActionTooltip label={collapsed ? "Expand sidebar" : "Collapse sidebar"} shortcut="⌘\\">
          <button
            type="button"
            onClick={toggleCollapsed}
            className="flex size-9 items-center justify-center rounded-lg text-[var(--v2-muted)] transition hover:bg-[var(--v2-ink)]/5 hover:text-[var(--v2-ink)]"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
          </button>
        </ActionTooltip>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-2 py-3">
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href
          const Icon = item.icon
          const link = (
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors ${active ? "bg-[var(--v2-primary)] text-white" : "text-[var(--v2-muted)] hover:bg-[var(--v2-ink)]/5 hover:text-[var(--v2-ink)]"}`}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              {expanded ? <span>{item.label}</span> : null}
            </Link>
          )

          return collapsed && !peek ? (
            <ActionTooltip key={item.href} label={item.label}>
              {link}
            </ActionTooltip>
          ) : (
            <div key={item.href}>{link}</div>
          )
        })}
      </nav>

      <div className="px-3 pb-4">
        <div className="flex min-h-9 items-center gap-2 rounded-xl bg-[var(--v2-ink)]/5 px-3">
          <span className="size-2 rounded-full bg-[var(--v2-primary)]" />
          {expanded ? <span className="text-xs font-medium text-[var(--v2-muted)]">Mock workspace</span> : null}
        </div>
      </div>
    </aside>
  )
}
