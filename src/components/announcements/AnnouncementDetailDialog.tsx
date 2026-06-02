"use client"

import { useEffect } from "react"
import { CheckCheck, Download, PinIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatAnnouncementDateRange } from "@/lib/announcements/presentation"
import type { AnnouncementSummary } from "@/lib/announcements/types"
import { AnnouncementPriorityBadge } from "./AnnouncementPriorityBadge"

interface AnnouncementDetailDialogProps {
  announcement: AnnouncementSummary | null
  open: boolean
  onMarkRead: (announcementId: string) => Promise<void> | void
  onOpenAttachment: (attachmentId: string) => void
  onOpenChange: (open: boolean) => void
}

export function AnnouncementDetailDialog({ announcement, open, onMarkRead, onOpenAttachment, onOpenChange }: AnnouncementDetailDialogProps) {
  useEffect(() => {
    if (!open || !announcement || announcement.readAt !== null) return
    void onMarkRead(announcement.id)
  }, [announcement, onMarkRead, open])

  const isUnread = announcement?.readAt === null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-2xl">
        {announcement ? (
          <>
            <DialogHeader className="border-b px-4 py-4 sm:px-5">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <DialogTitle className="text-lg leading-tight">{announcement.title}</DialogTitle>
                    {announcement.pinned ? (
                      <Badge variant="outline">
                        <PinIcon className="size-3.5" />
                        Pinned
                      </Badge>
                    ) : null}
                    <AnnouncementPriorityBadge priority={announcement.priority} />
                    {isUnread ? <Badge>Unread</Badge> : <Badge variant="secondary">Read</Badge>}
                  </div>
                  <DialogDescription className="mt-2 text-xs">{formatAnnouncementDateRange(announcement)}</DialogDescription>
                </div>
                {isUnread ? (
                  <Button type="button" variant="outline" size="sm" onClick={() => void onMarkRead(announcement.id)}>
                    <CheckCheck className="size-4" />
                    Mark as read
                  </Button>
                ) : null}
              </div>
            </DialogHeader>

            <div className="space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
              <p className="text-sm leading-6 whitespace-pre-wrap">{announcement.body}</p>

              {announcement.attachments.length > 0 ? (
                <section className="space-y-2">
                  <div className="text-muted-foreground text-xs font-medium tracking-[0.14em] uppercase">Attachments</div>
                  <div className="flex flex-wrap gap-2">
                    {announcement.attachments.map(attachment => (
                      <Button key={attachment.id} variant="outline" size="sm" onClick={() => onOpenAttachment(attachment.id)}>
                        <Download className="size-4" />
                        {attachment.originalFilename}
                      </Button>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
