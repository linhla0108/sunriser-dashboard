"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { HrStaff, HrRole } from "@/lib/v2/hr/types"

const ROLES: HrRole[] = ["HR Manager", "Recruiter", "Coordinator", "Analyst", "Intern"]

interface Props {
  open: boolean
  initial?: HrStaff | null
  onSave: (data: Omit<HrStaff, "id">) => void
  onClose: () => void
}

const EMPTY: Omit<HrStaff, "id"> = {
  name: "",
  email: "",
  role: "Recruiter",
  department: "Human Resources",
  status: "active",
  joinedAt: new Date().toISOString().slice(0, 10),
  avatarInitials: "",
}

function FormBody({ initial, onSave, onClose }: { initial: HrStaff | null | undefined; onSave: Props["onSave"]; onClose: Props["onClose"] }) {
  const [form, setForm] = useState<Omit<HrStaff, "id">>(
    initial
      ? { name: initial.name, email: initial.email, role: initial.role, department: initial.department, status: initial.status, joinedAt: initial.joinedAt, avatarInitials: initial.avatarInitials }
      : EMPTY
  )

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function handleSave() {
    if (!form.name.trim() || !form.email.trim()) return
    const initials = form.avatarInitials.trim() || form.name.split(" ").slice(-2).map(w => w[0]).join("").toUpperCase()
    onSave({ ...form, avatarInitials: initials })
    onClose()
  }

  return (
    <>
      <div className="space-y-4 py-2">
        <div className="space-y-1.5">
          <Label htmlFor="hr-name" className="text-xs font-medium">Full name</Label>
          <Input id="hr-name" value={form.name} onChange={e => set("name", e.target.value)} placeholder="Nguyễn Văn A" className="rounded-2xl" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="hr-email" className="text-xs font-medium">Email</Label>
          <Input id="hr-email" type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="name@sunriser.vn" className="rounded-2xl" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Role</Label>
            <Select value={form.role} onValueChange={v => set("role", v as HrRole)}>
              <SelectTrigger className="rounded-2xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Status</Label>
            <Select value={form.status} onValueChange={v => set("status", v as "active" | "inactive")}>
              <SelectTrigger className="rounded-2xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="hr-dept" className="text-xs font-medium">Department</Label>
          <Input id="hr-dept" value={form.department} onChange={e => set("department", e.target.value)} placeholder="Human Resources" className="rounded-2xl" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="hr-joined" className="text-xs font-medium">Joined date</Label>
          <Input id="hr-joined" type="date" value={form.joinedAt} onChange={e => set("joinedAt", e.target.value)} className="rounded-2xl" />
        </div>
      </div>

      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onClose} className="rounded-full">Cancel</Button>
        <Button onClick={handleSave} disabled={!form.name.trim() || !form.email.trim()} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
          {initial ? "Save changes" : "Add staff"}
        </Button>
      </DialogFooter>
    </>
  )
}

export function HrStaffFormDialog({ open, initial, onSave, onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose() }}>
      <DialogContent className="rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Staff" : "Add Staff"}</DialogTitle>
        </DialogHeader>
        <FormBody key={`${open}-${initial?.id ?? "new"}`} initial={initial} onSave={onSave} onClose={onClose} />
      </DialogContent>
    </Dialog>
  )
}
