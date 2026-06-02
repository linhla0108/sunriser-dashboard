"use client"

import { Download, FilePlus2, NotebookPen, Sparkles } from "lucide-react"
import { AnnouncementCenter } from "@/components/announcements/AnnouncementCenter"
import { ActionTooltip } from "@/components/common/ActionTooltip"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth/useAuth"

interface TopBarProps {
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  drawerSlots?: React.ReactNode
  onOpenChat?: () => void
  onOpenNotes?: () => void
  onCreateReport?: () => void
  onExportData?: () => void
}

export function TopBar({
  title = "Overview",
  subtitle = "SUN.RISER 2026 · Internship Recruitment",
  actions,
  drawerSlots,
  onOpenChat,
  onOpenNotes,
  onCreateReport,
  onExportData,
}: TopBarProps) {
  const { can } = useAuth()
  const canEdit = can("edit")
  const canDelete = can("delete")
  return (
    <header
      data-v2-glass-panel="strong"
      className="border-foreground/10 bg-background/80 sticky top-0 z-30 border-b px-3 py-3 backdrop-blur-xl sm:px-4 lg:px-6"
    >
      <div className="flex min-h-11 items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-foreground truncate text-xl font-semibold tracking-normal">{title}</h1>
          {subtitle ? <p className="text-muted-foreground mt-0.5 hidden truncate text-sm sm:block">{subtitle}</p> : null}
        </div>

        <div className="flex items-center gap-2">
          {drawerSlots}
          <AnnouncementCenter />
          <ActionTooltip label="Open AI drawer">
            <Button
              variant="plain"
              size="plain"
              type="button"
              onClick={onOpenChat}
              className="text-muted-foreground hover:bg-foreground/5 hover:text-foreground flex size-9 items-center justify-center rounded-lg transition"
            >
              <Sparkles className="size-4" />
            </Button>
          </ActionTooltip>
          <ActionTooltip label="Open notes">
            <Button
              variant="plain"
              size="plain"
              type="button"
              onClick={onOpenNotes}
              className="text-muted-foreground hover:bg-foreground/5 hover:text-foreground flex size-9 items-center justify-center rounded-lg transition"
            >
              <NotebookPen className="size-4" />
            </Button>
          </ActionTooltip>
          <ActionTooltip label={canEdit ? "Create report" : "You don't have permission to create reports"}>
            <Button
              variant="plain"
              size="plain"
              type="button"
              onClick={onCreateReport}
              disabled={!canEdit}
              aria-disabled={!canEdit}
              className="bg-primary text-primary-foreground hover:bg-primary/90 hidden h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 sm:flex"
            >
              <FilePlus2 className="size-4" />
              Create Report
            </Button>
          </ActionTooltip>
          <ActionTooltip label={canDelete ? "Export data" : "You don't have permission to export"}>
            <Button
              variant="plain"
              size="plain"
              type="button"
              onClick={onExportData}
              disabled={!canDelete}
              aria-disabled={!canDelete}
              className="border-foreground/10 text-foreground hover:bg-foreground/5 hidden h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 sm:flex"
            >
              <Download className="size-4" />
              Export Data
            </Button>
          </ActionTooltip>
          {actions}
        </div>
      </div>
    </header>
  )
}
