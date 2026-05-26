"use client"

import { Pencil, Trash2, Power } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { HrStaff } from "@/lib/hr/types"

interface Props {
  staff: HrStaff[]
  onEdit: (s: HrStaff) => void
  onDelete: (s: HrStaff) => void
  onToggleStatus: (id: string) => void
}

export function HrStaffTable({ staff, onEdit, onDelete, onToggleStatus }: Props) {
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
                <Badge variant={s.status === "active" ? "default" : "secondary"} className="rounded-full text-xs capitalize">
                  {s.status}
                </Badge>
              </td>
              <td className="text-muted-foreground hidden px-4 py-3 lg:table-cell">{s.joinedAt}</td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-xl"
                    onClick={() => onToggleStatus(s.id)}
                    title={s.status === "active" ? "Deactivate" : "Activate"}
                  >
                    <Power className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-xl" onClick={() => onEdit(s)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive h-7 w-7 rounded-xl"
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
