"use client"

import { RequirePublisher } from "@/components/auth/RequirePublisher"
import { AnnouncementManagementPage } from "@/components/announcements/AnnouncementManagementPage"

export default function AdminAnnouncementsPage() {
  return (
    <RequirePublisher>
      <AnnouncementManagementPage />
    </RequirePublisher>
  )
}
