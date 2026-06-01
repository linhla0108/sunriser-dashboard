"use client"

import { CalendarClock, Copy, Pencil, Trash2 } from "lucide-react"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import type { TimelineEntry } from "@/lib/types"

interface ScheduleEntryContextMenuProps {
  entry: TimelineEntry
  children: React.ReactNode
  onView: (entry: TimelineEntry) => void
  onEdit: (entry: TimelineEntry) => void
  onDelete: (id: string) => void
}

function entrySummary(entry: TimelineEntry): string {
  return [
    entry.todo,
    `Start: ${new Date(entry.startDate).toLocaleString()}`,
    entry.endDate ? `End: ${new Date(entry.endDate).toLocaleString()}` : "",
    entry.batch ? `Batch: ${entry.batch}` : "",
    entry.pic ? `PIC: ${entry.pic}` : "",
    entry.note ? `Note: ${entry.note}` : "",
  ]
    .filter(Boolean)
    .join("\n")
}

export function ScheduleEntryContextMenu({ entry, children, onView, onEdit, onDelete }: ScheduleEntryContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger className="contents">{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuLabel className="truncate">{entry.todo || "Schedule entry"}</ContextMenuLabel>
        <ContextMenuItem onClick={() => onView(entry)}>
          <CalendarClock />
          View entry
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onEdit(entry)}>
          <Pencil />
          Edit entry
        </ContextMenuItem>
        <ContextMenuItem onClick={() => navigator.clipboard.writeText(entrySummary(entry))}>
          <Copy />
          Copy details
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive" onClick={() => onDelete(entry.id)}>
          <Trash2 />
          Delete entry
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
