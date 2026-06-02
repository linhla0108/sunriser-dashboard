"use client"

import { SquarePen, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { HrStaff, HrStatus } from "@/lib/hr/types"

interface Props {
  staff: HrStaff[]
  onEdit: (s: HrStaff) => void
  onDelete: (s: HrStaff) => void
  onSetStatus: (id: string, status: HrStatus) => void
}

function statusTone(status: HrStatus) {
  return status === "active"
    ? {
        tooltip: "Active: can work on accounts",
        switchClass: "data-checked:bg-primary data-unchecked:bg-zinc-300 dark:data-unchecked:bg-zinc-700",
      }
    : {
        tooltip: "Inactive: temporarily turned off",
        switchClass: "data-checked:bg-primary data-unchecked:bg-zinc-400 dark:data-unchecked:bg-zinc-700",
      }
}

export function HrStaffTable({ staff, onEdit, onDelete, onSetStatus }: Props) {
  if (staff.length === 0) {
    return <div className="border-border bg-card text-muted-foreground rounded-3xl border py-10 text-center text-sm">No staff members found.</div>
  }

  return (
    <div className="border-border bg-card overflow-hidden rounded-3xl border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-border bg-muted/40 border-b">
            <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">Staff</th>
            <th className="text-muted-foreground hidden px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase sm:table-cell">Role</th>
            <th className="text-muted-foreground hidden px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase md:table-cell">
              Department
            </th>
            <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">Status</th>
            <th className="text-muted-foreground hidden px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase lg:table-cell">Joined</th>
            <th className="text-muted-foreground px-4 py-3 text-right text-xs font-semibold tracking-wide uppercase">Actions</th>
          </tr>
        </thead>
        <tbody>
          {staff.map((s, i) => (
            <tr key={s.id} className={i < staff.length - 1 ? "border-border border-b" : ""}>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{s.avatarInitials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-foreground leading-tight font-medium">{s.name}</p>
                    <p className="text-muted-foreground text-xs">{s.email}</p>
                  </div>
                </div>
              </td>
              <td className="text-muted-foreground hidden px-4 py-3 sm:table-cell">{s.role}</td>
              <td className="text-muted-foreground hidden px-4 py-3 md:table-cell">{s.department}</td>
              <td className="px-4 py-3">
                <Tooltip>
                  <TooltipTrigger>
                    <Switch
                      checked={s.status === "active"}
                      size="default"
                      aria-label={`Toggle ${s.name} status`}
                      className={statusTone(s.status).switchClass}
                      onCheckedChange={checked => onSetStatus(s.id, checked ? "active" : "inactive")}
                    />
                  </TooltipTrigger>
                  <TooltipContent>{statusTone(s.status).tooltip}</TooltipContent>
                </Tooltip>
              </td>
              <td className="text-muted-foreground hidden px-4 py-3 lg:table-cell">{s.joinedAt}</td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-xl" aria-label={`Edit ${s.name}`} onClick={() => onEdit(s)}>
                    <SquarePen className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive h-7 w-7 rounded-xl"
                    aria-label={`Delete ${s.name}`}
                    onClick={() => onDelete(s)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
