"use client"

import { useState } from "react"
import { useHrStaff } from "@/lib/v2/hr/useHrStaff"
import { HrStaffStats } from "@/components/v2/hr/HrStaffStats"
import { HrStaffToolbar } from "@/components/v2/hr/HrStaffToolbar"
import { HrStaffTable } from "@/components/v2/hr/HrStaffTable"
import { HrStaffFormDialog } from "@/components/v2/hr/HrStaffFormDialog"
import { HrStaffDeleteDialog } from "@/components/v2/hr/HrStaffDeleteDialog"
import type { HrStaff, HrRole, HrStatus } from "@/lib/v2/hr/types"

export default function HrPage() {
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<HrRole | "all">("all")
  const [statusFilter, setStatusFilter] = useState<HrStatus | "all">("all")
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<HrStaff | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<HrStaff | null>(null)

  const { staff, filtered, activeCount, inactiveCount, createStaff, updateStaff, deleteStaff, toggleStatus } = useHrStaff(search, roleFilter, statusFilter)

  function handleAdd() {
    setEditTarget(null)
    setFormOpen(true)
  }

  function handleEdit(s: HrStaff) {
    setEditTarget(s)
    setFormOpen(true)
  }

  function handleSave(data: Omit<HrStaff, "id">) {
    if (editTarget) {
      updateStaff({ ...data, id: editTarget.id })
    } else {
      createStaff(data)
    }
  }

  function handleDeleteConfirm() {
    if (deleteTarget) {
      deleteStaff(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6">
      <header className="mb-4">
        <h1 className="font-heading text-xl font-semibold text-foreground">HR Team</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Manage your recruitment and HR staff members.</p>
      </header>

      <HrStaffStats total={staff.length} active={activeCount} inactive={inactiveCount} />

      <HrStaffToolbar
        search={search}
        roleFilter={roleFilter}
        statusFilter={statusFilter}
        onSearch={setSearch}
        onRoleChange={setRoleFilter}
        onStatusChange={setStatusFilter}
        onAdd={handleAdd}
      />

      <HrStaffTable
        staff={filtered}
        onEdit={handleEdit}
        onDelete={setDeleteTarget}
        onToggleStatus={toggleStatus}
      />

      <HrStaffFormDialog
        open={formOpen}
        initial={editTarget}
        onSave={handleSave}
        onClose={() => setFormOpen(false)}
      />

      <HrStaffDeleteDialog
        staff={deleteTarget}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}
