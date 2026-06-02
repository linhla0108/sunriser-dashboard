"use client"

import { toast } from "sonner"
import { Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getAnnouncementAttachmentUrl } from "@/lib/announcements/client"
import type { AnnouncementSummary } from "@/lib/announcements/types"
import { AnnouncementPriorityBadge } from "./AnnouncementPriorityBadge"
import { formatWindowLabel } from "./announcementManagementUtils"

interface ManagedAnnouncementListProps {
  announcements: AnnouncementSummary[]
  heading: string
  isAdmin: boolean
  loading: boolean
  stats: Record<string, number>
  userId?: string
  onEdit: (announcement: AnnouncementSummary) => void
  onDelete: (announcement: AnnouncementSummary) => void
}

export function ManagedAnnouncementList({ announcements, heading, isAdmin, loading, stats, userId, onEdit, onDelete }: ManagedAnnouncementListProps) {
  return (
    <section className="border-foreground/10 rounded-2xl border p-4">
      <div className="mb-4">
        <h2 className="text-base font-semibold">{heading}</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          {isAdmin ? "Admins can edit and delete all announcements." : "Managers can edit and delete only their own announcements."}
        </p>
      </div>

      {loading ? (
        <div className="space-y-3" aria-label="Loading managed announcements">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="border-foreground/10 rounded-2xl border p-4">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-3/4" />
              <div className="mt-4 flex gap-2">
                <Skeleton className="h-8 w-20 rounded-full" />
                <Skeleton className="h-8 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : null}
      {!loading && announcements.length === 0 ? <div className="text-muted-foreground text-sm">No managed announcements yet.</div> : null}

      <div className="space-y-3">
        {announcements.map(announcement => {
          const canEdit = isAdmin || announcement.authorUserId === userId
          const windowLabel = formatWindowLabel(announcement.startsAt, announcement.endsAt)

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
                    {windowLabel ? <span>{windowLabel}</span> : null}
                    <span>
                      {announcement.attachments.length} attachment{announcement.attachments.length === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => onEdit(announcement)} disabled={!canEdit}>
                    Edit
                  </Button>
                  <Button type="button" size="sm" variant="destructive" onClick={() => onDelete(announcement)} disabled={!canEdit}>
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
  )
}
