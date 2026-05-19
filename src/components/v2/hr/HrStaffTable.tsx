"use client"

import { Pencil, Trash2, Power } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { HrStaff } from "@/lib/v2/hr/types"

interface Props {
  staff: HrStaff[]
  onEdit: (s: HrStaff) => void
  onDelete: (s: HrStaff) => void
  onToggleStatus: (id: string) => void
}

export function HrStaffTable({ staff, onEdit, onDelete, onToggleStatus }: Props) {
  if (staff.length === 0) {
    return (
      <div className="rounded-3xl border border-border bg-card py-10 text-center text-sm text-muted-foreground">
        No staff members found.
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-border bg-card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Staff</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden sm:table-cell">Role</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden md:table-cell">Department</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden lg:table-cell">Joined</th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {staff.map((s, i) => (
            <tr key={s.id} className={i < staff.length - 1 ? "border-b border-border" : ""}>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">{s.avatarInitials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground leading-tight">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{s.role}</td>
              <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{s.department}</td>
              <td className="px-4 py-3">
                <Badge variant={s.status === "active" ? "default" : "secondary"} className="rounded-full text-xs capitalize">
                  {s.status}
                </Badge>
              </td>
              <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{s.joinedAt}</td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-xl" onClick={() => onToggleStatus(s.id)} title={s.status === "active" ? "Deactivate" : "Activate"}>
                    <Power className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-xl" onClick={() => onEdit(s)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-xl text-destructive hover:text-destructive" onClick={() => onDelete(s)}>
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
