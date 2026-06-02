"use client"

import { useMemo } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { AnnouncementDetailDialog } from "@/components/announcements/AnnouncementDetailDialog"
import { AnnouncementInbox } from "@/components/announcements/AnnouncementInbox"
import { useAnnouncements } from "@/lib/announcements/AnnouncementProvider"
import { getAnnouncementAttachmentUrl } from "@/lib/announcements/client"

export default function AnnouncementsPage() {
  const { announcements, loading, error, markRead, canManageAnnouncements } = useAnnouncements()
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedAnnouncementId = searchParams.get("announcement")
  const selectedAnnouncement = useMemo(
    () => announcements.find(announcement => announcement.id === selectedAnnouncementId) ?? null,
    [announcements, selectedAnnouncementId]
  )

  function openAttachment(attachmentId: string) {
    void (async () => {
      try {
        const url = await getAnnouncementAttachmentUrl(attachmentId)
        window.open(url, "_blank", "noopener,noreferrer")
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to open attachment")
      }
    })()
  }

  return (
    <>
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
        onOpenAttachment={openAttachment}
      />
      <AnnouncementDetailDialog
        announcement={selectedAnnouncement}
        open={selectedAnnouncement !== null}
        onMarkRead={announcementId =>
          markRead(announcementId).catch(err => {
            toast.error(err instanceof Error ? err.message : "Failed to mark announcement as read")
          })
        }
        onOpenAttachment={openAttachment}
        onOpenChange={open => {
          if (open) return
          router.replace(pathname, { scroll: false })
        }}
      />
    </>
  )
}
