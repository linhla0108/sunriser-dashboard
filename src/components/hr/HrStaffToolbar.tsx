"use client"

import { Search, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SearchableSelect } from "@/components/ui/select"
import type { HrRole, HrStatus } from "@/lib/hr/types"

const ROLES: HrRole[] = ["HR Manager", "Recruiter", "Coordinator", "Analyst", "Intern"]
const ROLE_OPTIONS = [{ value: "all", label: "All roles" }, ...ROLES.map(role => ({ value: role, label: role }))]
const STATUS_OPTIONS = [
  { value: "all", label: "All status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
]

interface Props {
  search: string
  roleFilter: HrRole | "all"
  statusFilter: HrStatus | "all"
  onSearch: (v: string) => void
  onRoleChange: (v: HrRole | "all") => void
  onStatusChange: (v: HrStatus | "all") => void
  onAdd: () => void
}

export function HrStaffToolbar({ search, roleFilter, statusFilter, onSearch, onRoleChange, onStatusChange, onAdd }: Props) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-[160px]">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search staff..."
          value={search}
          onChange={e => onSearch(e.target.value)}
          className="rounded-full pl-9 text-sm h-9"
        />
      </div>

      <SearchableSelect
        aria-label="Role"
        value={roleFilter}
        options={ROLE_OPTIONS}
        onValueChange={v => onRoleChange(v as HrRole | "all")}
        placeholder="Role"
        className="h-9 w-[140px] rounded-full text-sm"
      />

      <SearchableSelect
        aria-label="Status"
        value={statusFilter}
        options={STATUS_OPTIONS}
        onValueChange={v => onStatusChange(v as HrStatus | "all")}
        placeholder="Status"
        className="h-9 w-[120px] rounded-full text-sm"
      />

      <Button onClick={onAdd} className="h-9 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 ml-auto">
        <Plus className="mr-1.5 h-3.5 w-3.5" />
        Add Staff
      </Button>
    </div>
  )
}
