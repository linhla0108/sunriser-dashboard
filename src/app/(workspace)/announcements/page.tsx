"use client"

import { toast } from "sonner"
import { AnnouncementInbox } from "@/components/announcements/AnnouncementInbox"
import { useAnnouncements } from "@/lib/announcements/AnnouncementProvider"
import { getAnnouncementAttachmentUrl } from "@/lib/announcements/client"

export default function AnnouncementsPage() {
  const { announcements, loading, error, markRead, canManageAnnouncements } = useAnnouncements()

  return (
    <AnnouncementInbox
      announcements={announcements}
      loading={loading}
      error={error}
      canManageAnnouncements={canManageAnnouncements}
      onMarkRead={announcementId => {
        void markRead(announcementId).catch(err => {
          toast.error(err instanceof Error ? err.message : "Failed to mark announcement as read")
        })
      }}
      onOpenAttachment={attachmentId => {
        void (async () => {
          try {
            const url = await getAnnouncementAttachmentUrl(attachmentId)
            window.open(url, "_blank", "noopener,noreferrer")
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to open attachment")
          }
        })()
      }}
    />
  )
}
