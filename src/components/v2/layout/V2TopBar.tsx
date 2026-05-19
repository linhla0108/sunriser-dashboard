"use client"

import { Download, FilePlus2, NotebookPen, Sparkles } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ActionTooltip } from "@/components/v2/common/ActionTooltip"
import { useAuth } from "@/lib/v2/auth/useAuth"
import { Button } from "@/components/ui/button"

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
          <ActionTooltip label="Open AI drawer" shortcut="Ctrl+J">
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
          <ActionTooltip label="Open notes" shortcut="Ctrl+N">
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
          <ActionTooltip label="Create report" shortcut="Ctrl+R">
            <Button
              variant="plain"
              size="plain"
              type="button"
              onClick={onCreateReport}
              className="bg-primary text-primary-foreground hover:bg-primary/90 hidden h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition sm:flex"
            >
              <FilePlus2 className="size-4" />
              Create Report
            </Button>
          </ActionTooltip>
          <ActionTooltip label="Export data">
            <Button
              variant="plain"
              size="plain"
              type="button"
              onClick={onExportData}
              className="border-foreground/10 text-foreground hover:bg-foreground/5 hidden h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition sm:flex"
            >
              <Download className="size-4" />
              Export Data
            </Button>
          </ActionTooltip>
          {actions}

          <DropdownMenu>
            <DropdownMenuTrigger
              className="focus-visible:ring-primary/25 rounded-full outline-none focus-visible:ring-3"
              aria-label="Open account menu"
            >
              <Avatar>
                <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <div className="px-1.5 py-1">
                <span className="text-foreground block text-sm font-medium">{user?.name ?? "Guest"}</span>
                <span className="text-muted-foreground mt-1 block truncate text-xs">{user?.email ?? "No active session"}</span>
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
