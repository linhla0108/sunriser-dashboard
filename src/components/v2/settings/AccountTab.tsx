"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/v2/auth/useAuth"

function getInitials(name?: string) {
  if (!name) return "SR"
  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map(part => part[0]?.toUpperCase())
    .join("")
}

export function AccountTab() {
  const { user, role, signOut } = useAuth()
  const [current, setCurrent] = useState("")
  const [next, setNext] = useState("")
  const [confirm, setConfirm] = useState("")
  const [confirmOpen, setConfirmOpen] = useState(false)

  function handleChangePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!current || !next) {
      toast.error("Fill in both password fields.")
      return
    }
    if (next !== confirm) {
      toast.error("New passwords do not match.")
      return
    }
    setCurrent("")
    setNext("")
    setConfirm("")
    toast.success("Password updated", { description: "Mock save — no backend call." })
  }

  return (
    <div className="mt-6 space-y-6">
      <section className="flex items-center gap-4 rounded-2xl border border-foreground/10 p-4">
        <Avatar className="size-12">
          <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{user?.name ?? "Guest"}</p>
          <p className="truncate text-xs text-muted-foreground">{user?.email ?? "No active session"}</p>
        </div>
        <Badge variant="secondary" className="capitalize">
          {role}
        </Badge>
      </section>

      <section className="rounded-2xl border border-foreground/10 p-4">
        <h2 className="font-heading text-sm font-semibold text-foreground">Change password</h2>
        <form className="mt-3 space-y-3" onSubmit={handleChangePassword}>
          <div className="space-y-1.5">
            <Label htmlFor="password-current">Current password</Label>
            <Input
              id="password-current"
              type="password"
              autoComplete="current-password"
              value={current}
              onChange={event => setCurrent(event.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="password-next">New password</Label>
              <Input id="password-next" type="password" autoComplete="new-password" value={next} onChange={event => setNext(event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password-confirm">Confirm new password</Label>
              <Input
                id="password-confirm"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={event => setConfirm(event.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Save password</Button>
          </div>
        </form>
      </section>

      <section className="flex items-center justify-between gap-4 rounded-2xl border border-foreground/10 p-4">
        <div>
          <p className="text-sm font-medium text-foreground">Sign out of this workspace</p>
          <p className="text-xs text-muted-foreground">Returns you to the login screen.</p>
        </div>
        <Button variant="outline" onClick={() => setConfirmOpen(true)}>
          Sign out
        </Button>
      </section>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogTitle>Sign out?</DialogTitle>
          <p className="text-sm text-muted-foreground">Your local drafts and notes will remain on this device.</p>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button
              onClick={() => {
                setConfirmOpen(false)
                signOut()
              }}
            >
              Sign out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
