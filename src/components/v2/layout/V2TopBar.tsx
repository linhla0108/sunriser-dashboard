"use client"

import { Download, FilePlus2, NotebookPen, Sparkles } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ActionTooltip } from "@/components/v2/common/ActionTooltip"
import { useAuth } from "@/lib/v2/auth/useAuth"

interface V2TopBarProps {
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  drawerSlots?: React.ReactNode
  onOpenChat?: () => void
  onOpenNotes?: () => void
  onCreateReport?: () => void
  onExportData?: () => void
}

function getInitials(name?: string) {
  if (!name) return "SR"
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join("")
}

export function V2TopBar({
  title = "Overview",
  subtitle = "SUN.RISER 2026 · Internship Recruitment",
  actions,
  drawerSlots,
  onOpenChat,
  onOpenNotes,
  onCreateReport,
  onExportData,
}: V2TopBarProps) {
  const { role, signOut, user } = useAuth()

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--v2-ink)]/10 bg-[var(--v2-bg)]/95 px-3 py-3 backdrop-blur sm:px-4 lg:px-6">
      <div className="flex min-h-11 items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-normal text-[var(--v2-ink)]">{title}</h1>
          {subtitle ? <p className="mt-0.5 hidden truncate text-sm text-[var(--v2-muted)] sm:block">{subtitle}</p> : null}
        </div>

        <div className="flex items-center gap-2">
          {drawerSlots}
          <ActionTooltip label="Open AI drawer" shortcut="⌘J">
            <button
              type="button"
              onClick={onOpenChat}
              className="flex size-9 items-center justify-center rounded-lg text-[var(--v2-muted)] transition hover:bg-[var(--v2-ink)]/5 hover:text-[var(--v2-ink)]"
            >
              <Sparkles className="size-4" />
            </button>
          </ActionTooltip>
          <ActionTooltip label="Open notes" shortcut="⌘N">
            <button
              type="button"
              onClick={onOpenNotes}
              className="flex size-9 items-center justify-center rounded-lg text-[var(--v2-muted)] transition hover:bg-[var(--v2-ink)]/5 hover:text-[var(--v2-ink)]"
            >
              <NotebookPen className="size-4" />
            </button>
          </ActionTooltip>
          <ActionTooltip label="Create report" shortcut="⌘R">
            <button
              type="button"
              onClick={onCreateReport}
              className="hidden h-9 items-center gap-2 rounded-lg bg-[var(--v2-primary)] px-3 text-sm font-medium text-white transition hover:bg-[var(--v2-primary-hover)] sm:flex"
            >
              <FilePlus2 className="size-4" />
              Create Report
            </button>
          </ActionTooltip>
          <ActionTooltip label="Export data">
            <button
              type="button"
              onClick={onExportData}
              className="hidden h-9 items-center gap-2 rounded-lg border border-[var(--v2-ink)]/10 px-3 text-sm font-medium text-[var(--v2-ink)] transition hover:bg-[var(--v2-ink)]/5 sm:flex"
            >
              <Download className="size-4" />
              Export Data
            </button>
          </ActionTooltip>
          {actions}

          <DropdownMenu>
            <DropdownMenuTrigger
              className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-[var(--v2-primary)]/25"
              aria-label="Open account menu"
            >
              <Avatar>
                <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <div className="px-1.5 py-1">
                <span className="block text-sm font-medium text-[var(--v2-ink)]">{user?.name ?? "Guest"}</span>
                <span className="mt-1 block truncate text-xs text-[var(--v2-muted)]">{user?.email ?? "No active session"}</span>
                <Badge className="mt-2 capitalize" variant="secondary">
                  {role}
                </Badge>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
