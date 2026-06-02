"use client"

import { useState } from "react"
import { useHrStaff } from "@/lib/hr/useHrStaff"
import { HrStaffStats } from "@/components/hr/HrStaffStats"
import { HrStaffToolbar } from "@/components/hr/HrStaffToolbar"
import { HrStaffTable } from "@/components/hr/HrStaffTable"
import { HrStaffFormDialog } from "@/components/hr/HrStaffFormDialog"
import { HrStaffDeleteDialog } from "@/components/hr/HrStaffDeleteDialog"
import type { HrStaff, HrRole, HrStatus } from "@/lib/hr/types"

export default function HrPage() {
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<HrRole | "all">("all")
  const [statusFilter, setStatusFilter] = useState<HrStatus | "all">("all")
  const [editTarget, setEditTarget] = useState<HrStaff | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<HrStaff | null>(null)

  const { staff, filtered, activeCount, inactiveCount, updateStaff, deleteStaff, setStatus } = useHrStaff(search, roleFilter, statusFilter)

  function handleEdit(s: HrStaff) {
    setEditTarget(s)
  }

  function handleSave(data: Omit<HrStaff, "id">) {
    if (!editTarget) return
    updateStaff({ ...data, id: editTarget.id })
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
        <h1 className="font-heading text-foreground text-xl font-semibold">HR Team</h1>
        <p className="text-muted-foreground mt-0.5 text-sm">Manage your recruitment and HR staff members.</p>
      </header>

      <HrStaffStats total={staff.length} active={activeCount} inactive={inactiveCount} />

      <HrStaffToolbar
        search={search}
        roleFilter={roleFilter}
        statusFilter={statusFilter}
        onSearch={setSearch}
        onRoleChange={setRoleFilter}
        onStatusChange={setStatusFilter}
      />

      <HrStaffTable staff={filtered} onEdit={handleEdit} onDelete={setDeleteTarget} onSetStatus={setStatus} />

      <HrStaffFormDialog open={Boolean(editTarget)} initial={editTarget} onSave={handleSave} onClose={() => setEditTarget(null)} />

      <HrStaffDeleteDialog staff={deleteTarget} onConfirm={handleDeleteConfirm} onClose={() => setDeleteTarget(null)} />
    </div>
  )
}
