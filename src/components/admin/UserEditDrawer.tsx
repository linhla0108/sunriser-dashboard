"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import type { AdminUserRow } from "@/lib/admin/adminApi"
import { refreshUserClaims, updateUserAccess, updateUserProfile } from "@/lib/admin/adminApi"
import type { AppPermission } from "@/lib/auth/types"

interface Props {
  user: AdminUserRow | null
  selfUserId: string
  onClose: () => void
  onSaved: () => void
}

const ROLES = ["admin", "manager", "member", "viewer"] as const
const PERMISSIONS: AppPermission[] = ["read", "edit", "delete"]

export function UserEditDrawer({ user, selfUserId, onClose, onSaved }: Props) {
  const [fullName, setFullName] = useState("")
  const [birthday, setBirthday] = useState("")
  const [positions, setPositions] = useState("")
  const [active, setActive] = useState(true)
  const [role, setRole] = useState<AdminUserRow["role"]>("member")
  const [perms, setPerms] = useState<AppPermission[]>(["read"])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    setFullName(user.full_name)
    setBirthday(user.birthday ?? "")
    setPositions(user.positions.join(", "))
    setActive(user.active)
    setRole(user.role)
    setPerms(user.permissions)
  }, [user])

  const isSelf = user?.user_id === selfUserId

  function togglePerm(p: AppPermission) {
    setPerms(prev => (prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]))
  }

  async function save() {
    if (!user) return
    setSaving(true)
    try {
      await updateUserProfile({
        userId: user.user_id,
        fullName,
        birthday: birthday || null,
        positions: positions
          .split(",")
          .map(p => p.trim())
          .filter(Boolean),
      })
      if (!isSelf) {
        await updateUserAccess({ userId: user.user_id, active, role, permissions: perms })
        if (role !== user.role) {
          try {
            await refreshUserClaims(user.user_id, role)
          } catch (err) {
            // Non-fatal: the DB role is updated; JWT will catch up on next refresh.
            console.warn("refreshUserClaims failed", err)
          }
        }
      }
      toast.success("User updated")
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={Boolean(user)} onOpenChange={open => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit user</SheetTitle>
          <SheetDescription>
            {isSelf
              ? "You cannot change your own role, permissions, or active status — only profile fields."
              : "Update profile fields and access. Role changes take effect on the user's next token refresh."}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 px-4">
          <section className="space-y-3">
            <h3 className="text-label font-semibold tracking-wider text-muted-foreground uppercase">Profile</h3>
            <div className="space-y-2">
              <Label htmlFor="admin-full-name">Full name</Label>
              <Input id="admin-full-name" value={fullName} onChange={e => setFullName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-birthday">Birthday</Label>
              <Input id="admin-birthday" type="date" value={birthday} onChange={e => setBirthday(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-positions">Positions (comma-separated)</Label>
              <Input id="admin-positions" value={positions} onChange={e => setPositions(e.target.value)} placeholder="HR, Recruiter" />
            </div>
          </section>

          <section className="space-y-3" aria-disabled={isSelf}>
            <h3 className="text-label font-semibold tracking-wider text-muted-foreground uppercase">Access</h3>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={active} onCheckedChange={c => setActive(c === true)} disabled={isSelf} />
              <span>Account active</span>
            </label>
            <div className="space-y-2">
              <Label htmlFor="admin-role">Role</Label>
              <select
                id="admin-role"
                value={role}
                disabled={isSelf}
                onChange={e => setRole(e.target.value as AdminUserRow["role"])}
                className="h-10 w-full rounded-lg border border-foreground/10 bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                {ROLES.map(r => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="flex gap-3">
                {PERMISSIONS.map(p => (
                  <label key={p} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={perms.includes(p)} onCheckedChange={() => togglePerm(p)} disabled={isSelf} />
                    <span>{p}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="button" onClick={save} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
