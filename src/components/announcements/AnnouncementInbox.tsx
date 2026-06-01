"use client"

import { Download, Megaphone, PinIcon } from "lucide-react"
import Link from "next/link"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { AnnouncementSummary } from "@/lib/announcements/types"
import { cn } from "@/lib/utils"
import { AnnouncementPriorityBadge } from "./AnnouncementPriorityBadge"

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export function AnnouncementInbox({
  announcements,
  loading,
  error,
  canManageAnnouncements,
  onMarkRead,
  onOpenAttachment,
}: {
  announcements: AnnouncementSummary[]
  loading: boolean
  error: string | null
  canManageAnnouncements: boolean
  onMarkRead: (announcementId: string) => void
  onOpenAttachment: (attachmentId: string) => void
}) {
  const pinned = announcements.filter(announcement => announcement.pinned)
  const regular = announcements.filter(announcement => !announcement.pinned)

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-3 py-6 sm:px-4 lg:px-6">
        <div className="text-muted-foreground rounded-2xl border px-4 py-10 text-sm">Loading announcements...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-3 py-6 sm:px-4 lg:px-6">
        <div className="border-destructive/20 bg-destructive/5 text-destructive rounded-2xl border px-4 py-10 text-sm">{error}</div>
      </div>
    )
  }

  if (announcements.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-3 py-6 sm:px-4 lg:px-6">
        <div className="text-muted-foreground rounded-2xl border px-4 py-10 text-sm">No announcements yet.</div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-3 py-6 sm:px-4 lg:px-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Announcements</h1>
          <p className="text-muted-foreground mt-1 text-sm">Pinned items stay at the top. Due dates are informational only.</p>
        </div>
        {canManageAnnouncements ? (
          <Link href="/admin/announcements" className={cn(buttonVariants({ variant: "outline" }))}>
            Manage
          </Link>
        ) : null}
      </div>

      <div className="space-y-6">
        {pinned.length > 0 ? (
          <section>
            <div className="mb-3 flex items-center gap-2 text-sm font-medium">
              <PinIcon className="size-4" />
              <span>Pinned</span>
            </div>
            <div className="space-y-3">
              {pinned.map(announcement => (
                <AnnouncementCard key={announcement.id} announcement={announcement} onMarkRead={onMarkRead} onOpenAttachment={onOpenAttachment} />
              ))}
            </div>
          </section>
        ) : null}

        <section>
          <div className="mb-3 flex items-center gap-2 text-sm font-medium">
            <Megaphone className="size-4" />
            <span>Inbox</span>
          </div>
          <div className="space-y-3">
            {regular.map(announcement => (
              <AnnouncementCard key={announcement.id} announcement={announcement} onMarkRead={onMarkRead} onOpenAttachment={onOpenAttachment} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function AnnouncementCard({
  announcement,
  onMarkRead,
  onOpenAttachment,
}: {
  announcement: AnnouncementSummary
  onMarkRead: (announcementId: string) => void
  onOpenAttachment: (attachmentId: string) => void
}) {
  const unread = announcement.readAt === null

  return (
    <article
      data-testid={`announcement-${announcement.id}`}
      className={`rounded-2xl border p-4 shadow-sm ${unread ? "border-primary/25 bg-primary/5" : "border-foreground/10 bg-background"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold">{announcement.title}</h2>
            {unread ? <Badge>Unread</Badge> : <Badge variant="secondary">Read</Badge>}
            {announcement.pinned ? <Badge variant="outline">Pinned</Badge> : null}
            <AnnouncementPriorityBadge priority={announcement.priority} />
          </div>
          <div className="text-muted-foreground flex flex-wrap gap-3 text-xs">
            <span>Published {formatDateTime(announcement.createdAt)}</span>
            {announcement.dueAt ? <span>Due {formatDateTime(announcement.dueAt)}</span> : null}
          </div>
        </div>
        {unread ? (
          <Button variant="outline" size="sm" onClick={() => onMarkRead(announcement.id)}>
            Mark read
          </Button>
        ) : null}
      </div>

      <p className="mt-3 text-sm leading-6 whitespace-pre-wrap">{announcement.body}</p>

      {announcement.attachments.length > 0 ? (
        <div className="mt-4 space-y-2">
          <div className="text-muted-foreground text-xs font-medium uppercase">Attachments</div>
          <div className="flex flex-wrap gap-2">
            {announcement.attachments.map(attachment => (
              <Button key={attachment.id} variant="outline" size="sm" onClick={() => onOpenAttachment(attachment.id)}>
                <Download className="size-4" />
                {attachment.originalFilename}
              </Button>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  )
}
