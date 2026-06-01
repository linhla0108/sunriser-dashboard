"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth/useAuth"
import { useAnnouncements } from "@/lib/announcements/AnnouncementProvider"
import { cn } from "@/lib/utils"
import {
  createAnnouncement,
  fetchAnnouncementStats,
  getAnnouncementAttachmentUrl,
  listManagedAnnouncements,
  softDeleteAnnouncement,
  updateAnnouncement,
  uploadAnnouncementAttachment,
} from "@/lib/announcements/client"
import type { AnnouncementPriority, AnnouncementSummary } from "@/lib/announcements/types"
import { AnnouncementPriorityBadge } from "./AnnouncementPriorityBadge"

const PRIORITY_OPTIONS: AnnouncementPriority[] = ["low", "normal", "high", "urgent"]

function toLocalDateTimeValue(iso: string | null) {
  if (!iso) return ""
  const date = new Date(iso)
  const tzOffset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16)
}

function toIsoDateTime(value: string) {
  return value ? new Date(value).toISOString() : null
}

export function AnnouncementManagementPage() {
  const { user } = useAuth()
  const { refresh: refreshInbox } = useAnnouncements()
  const [announcements, setAnnouncements] = useState<AnnouncementSummary[]>([])
  const [stats, setStats] = useState<Record<string, number>>({})
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [priority, setPriority] = useState<AnnouncementPriority>("normal")
  const [pinned, setPinned] = useState(false)
  const [dueAt, setDueAt] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AnnouncementSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const isAdmin = user?.role === "admin"

  const loadPage = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const [managed, readStats] = await Promise.all([listManagedAnnouncements(user.role, user.id), fetchAnnouncementStats()])
      setAnnouncements(managed)
      setStats(Object.fromEntries(readStats.map(stat => [stat.announcementId, stat.readCount])))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load announcements")
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadPage()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [loadPage])

  const resetForm = useCallback(() => {
    setEditingId(null)
    setTitle("")
    setBody("")
    setPriority("normal")
    setPinned(false)
    setDueAt("")
    setFiles([])
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) return

    setSaving(true)
    try {
      const saved = editingId
        ? await updateAnnouncement({
            id: editingId,
            title,
            body,
            priority,
            pinned,
            dueAt: toIsoDateTime(dueAt),
          })
        : await createAnnouncement(
            {
              title,
              body,
              priority,
              pinned,
              dueAt: toIsoDateTime(dueAt),
            },
            user.id
          )

      if (files.length > 0) {
        for (const file of files) {
          await uploadAnnouncementAttachment(saved.id, file)
        }
      }

      toast.success(editingId ? "Announcement updated" : "Announcement published")
      resetForm()
      await Promise.all([loadPage(), refreshInbox()])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save announcement")
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setSaving(true)
    try {
      await softDeleteAnnouncement(deleteTarget.id)
      toast.success("Announcement deleted")
      setDeleteTarget(null)
      await Promise.all([loadPage(), refreshInbox()])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete announcement")
    } finally {
      setSaving(false)
    }
  }

  function startEdit(announcement: AnnouncementSummary) {
    setEditingId(announcement.id)
    setTitle(announcement.title)
    setBody(announcement.body)
    setPriority(announcement.priority)
    setPinned(announcement.pinned)
    setDueAt(toLocalDateTimeValue(announcement.dueAt))
    setFiles([])
  }

  const heading = useMemo(() => (isAdmin ? "All announcements" : "Your announcements"), [isAdmin])

  return (
    <div className="mx-auto max-w-6xl px-3 py-6 sm:px-4 lg:px-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Manage announcements</h1>
          <p className="text-muted-foreground mt-1 text-sm">Publish updates to all active users and track read counts.</p>
        </div>
        <Link href="/announcements" className={cn(buttonVariants({ variant: "outline" }))}>
          Back to inbox
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <section className="border-foreground/10 rounded-2xl border p-4">
          <h2 className="text-base font-semibold">{editingId ? "Edit announcement" : "New announcement"}</h2>
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="announcement-title">Title</Label>
              <Input id="announcement-title" value={title} onChange={event => setTitle(event.target.value)} maxLength={160} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="announcement-body">Body</Label>
              <textarea
                id="announcement-body"
                value={body}
                onChange={event => setBody(event.target.value)}
                maxLength={5000}
                rows={8}
                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 min-h-36 w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-3"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="announcement-priority">Priority</Label>
                <select
                  id="announcement-priority"
                  value={priority}
                  onChange={event => setPriority(event.target.value as AnnouncementPriority)}
                  className="border-input bg-background h-8 w-full rounded-lg border px-2.5 text-sm"
                >
                  {PRIORITY_OPTIONS.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="announcement-due-at">Due date</Label>
                <Input id="announcement-due-at" type="datetime-local" value={dueAt} onChange={event => setDueAt(event.target.value)} />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={pinned} onChange={event => setPinned(event.target.checked)} />
              <span>Pin this announcement</span>
            </label>

            <div className="space-y-1.5">
              <Label htmlFor="announcement-files">Attachments</Label>
              <Input
                id="announcement-files"
                type="file"
                multiple
                accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,image/png,image/jpeg"
                onChange={event => setFiles(Array.from(event.target.files ?? []))}
              />
              <p className="text-muted-foreground text-xs">PDF, DOCX, XLSX, PNG, JPG. Maximum 10 MB per file.</p>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Save changes" : "Publish announcement"}
              </Button>
              {editingId ? (
                <Button type="button" variant="outline" onClick={resetForm} disabled={saving}>
                  Cancel edit
                </Button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="border-foreground/10 rounded-2xl border p-4">
          <div className="mb-4">
            <h2 className="text-base font-semibold">{heading}</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {isAdmin ? "Admins can edit and delete all announcements." : "Managers can edit and delete only their own announcements."}
            </p>
          </div>

          {loading ? <div className="text-muted-foreground text-sm">Loading managed announcements...</div> : null}
          {!loading && announcements.length === 0 ? <div className="text-muted-foreground text-sm">No managed announcements yet.</div> : null}

          <div className="space-y-3">
            {announcements.map(announcement => {
              const canEdit = isAdmin || announcement.authorUserId === user?.id
              return (
                <article key={announcement.id} className="border-foreground/10 rounded-2xl border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-medium">{announcement.title}</h3>
                        {announcement.pinned ? <Badge variant="outline">Pinned</Badge> : null}
                        <AnnouncementPriorityBadge priority={announcement.priority} />
                      </div>
                      <p className="text-muted-foreground line-clamp-3 text-sm whitespace-pre-wrap">{announcement.body}</p>
                      <div className="text-muted-foreground flex flex-wrap gap-3 text-xs">
                        <span>Reads {stats[announcement.id] ?? 0}</span>
                        {announcement.dueAt ? <span>Due {new Date(announcement.dueAt).toLocaleString()}</span> : null}
                        <span>
                          {announcement.attachments.length} attachment{announcement.attachments.length === 1 ? "" : "s"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" size="sm" variant="outline" onClick={() => startEdit(announcement)} disabled={!canEdit}>
                        Edit
                      </Button>
                      <Button type="button" size="sm" variant="destructive" onClick={() => setDeleteTarget(announcement)} disabled={!canEdit}>
                        <Trash2 className="size-4" />
                        Delete
                      </Button>
                    </div>
                  </div>

                  {announcement.attachments.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {announcement.attachments.map(attachment => (
                        <Button
                          key={attachment.id}
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            try {
                              const url = await getAnnouncementAttachmentUrl(attachment.id)
                              window.open(url, "_blank", "noopener,noreferrer")
                            } catch (err) {
                              toast.error(err instanceof Error ? err.message : "Failed to open attachment")
                            }
                          }}
                        >
                          {attachment.originalFilename}
                        </Button>
                      ))}
                    </div>
                  ) : null}
                </article>
              )
            })}
          </div>
        </section>
      </div>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={open => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete announcement?</DialogTitle>
            <DialogDescription>This performs a soft delete. The announcement disappears from member and management views.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => void confirmDelete()} disabled={saving}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
