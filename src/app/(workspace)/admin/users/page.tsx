"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Pencil, Plus, RefreshCcw } from "lucide-react"
import { toast } from "sonner"
import { RequireAdmin } from "@/components/auth/RequireAdmin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { inviteUser, listAdminUsers, type AdminUserRow } from "@/lib/admin/adminApi"
import { useAuth } from "@/lib/auth/useAuth"
import { UserEditDrawer } from "@/components/admin/UserEditDrawer"

function badge(tone: "ok" | "warn" | "muted") {
  if (tone === "ok") return "bg-emerald-100 text-emerald-700"
  if (tone === "warn") return "bg-amber-100 text-amber-700"
  return "bg-foreground/5 text-muted-foreground"
}

function AdminUsersInner() {
  const { user } = useAuth()
  const [rows, setRows] = useState<AdminUserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")
  const [editing, setEditing] = useState<AdminUserRow | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteName, setInviteName] = useState("")
  const [inviting, setInviting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await listAdminUsers()
      setRows(data)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load users")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(r => r.full_name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) || r.user_id.toLowerCase().includes(q))
  }, [rows, filter])

  async function submitInvite() {
    setInviting(true)
    try {
      await inviteUser(inviteEmail.trim(), inviteName.trim() || undefined)
      toast.success(`Invite sent to ${inviteEmail}`)
      setInviteEmail("")
      setInviteName("")
      setInviteOpen(false)
      void load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invite failed")
    } finally {
      setInviting(false)
    }
  }

  return (
    <div className="space-y-4 p-3 sm:p-4 lg:p-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-h1 text-foreground font-semibold">Users</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">Manage roles, permissions, and profiles.</p>
        </div>
        <div className="flex items-center gap-2">
          <Input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search by name, email, or id" className="w-64" />
          <Button variant="outline" onClick={() => void load()} disabled={loading}>
            <RefreshCcw className="size-4" />
            Refresh
          </Button>
          <Button onClick={() => setInviteOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="size-4" />
            Invite user
          </Button>
        </div>
      </header>

      <div className="border-foreground/10 overflow-hidden rounded-3xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-foreground/5 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="hidden px-4 py-3 text-left font-medium sm:table-cell">Positions</th>
              <th className="px-4 py-3 text-left font-medium">Role</th>
              <th className="hidden px-4 py-3 text-left font-medium sm:table-cell">Permissions</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="text-muted-foreground px-4 py-10 text-center">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-muted-foreground px-4 py-10 text-center">
                  No users found.
                </td>
              </tr>
            )}
            {!loading &&
              filtered.map(row => {
                const isSelf = row.user_id === user?.id
                return (
                  <tr key={row.user_id} className="border-foreground/5 border-t">
                    <td className="px-4 py-3">
                      <div className="text-foreground font-medium">{row.full_name || "(unnamed)"}</div>
                      <div className="text-muted-foreground text-xs">
                        {row.email || `${row.user_id.slice(0, 8)}…`}
                        {isSelf ? " · you" : ""}
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {row.positions.length === 0 && <span className="text-muted-foreground text-xs">—</span>}
                        {row.positions.map(p => (
                          <span key={p} className={`rounded-full px-2 py-0.5 text-xs ${badge("muted")}`}>
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${badge(row.role === "admin" ? "warn" : "muted")}`}>{row.role}</span>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <div className="flex gap-1">
                        {row.permissions.map(p => (
                          <span key={p} className={`rounded-full px-2 py-0.5 text-xs ${badge("muted")}`}>
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${row.active ? badge("ok") : badge("warn")}`}>
                        {row.active ? "active" : "inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="outline" size="sm" onClick={() => setEditing(row)}>
                        <Pencil className="size-3.5" />
                        Edit
                      </Button>
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>

      <UserEditDrawer user={editing} selfUserId={user?.id ?? ""} onClose={() => setEditing(null)} onSaved={() => void load()} />

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite user</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder="name@sunriser.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-name">Full name (optional)</Label>
              <Input id="invite-name" value={inviteName} onChange={e => setInviteName(e.target.value)} placeholder="Jane Doe" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)} disabled={inviting}>
              Cancel
            </Button>
            <Button
              onClick={() => void submitInvite()}
              disabled={inviting || !inviteEmail.includes("@")}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {inviting ? "Sending..." : "Send invite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function AdminUsersPage() {
  return (
    <RequireAdmin>
      <AdminUsersInner />
    </RequireAdmin>
  )
}
