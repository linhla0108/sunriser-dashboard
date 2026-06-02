import type { AnnouncementSummary } from "./types"

export type AnnouncementCenterTab = "unread" | "pinned" | "all"

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export function filterAnnouncementsForTab(announcements: AnnouncementSummary[], tab: AnnouncementCenterTab) {
  switch (tab) {
    case "unread":
      return announcements.filter(announcement => announcement.readAt === null)
    case "pinned":
      return announcements.filter(announcement => announcement.pinned)
    case "all":
    default:
      return announcements
  }
}

export function formatAnnouncementDateRange(announcement: Pick<AnnouncementSummary, "startsAt" | "endsAt">) {
  if (announcement.startsAt && announcement.endsAt) {
    return `${formatDateTime(announcement.startsAt)} - ${formatDateTime(announcement.endsAt)}`
  }

  if (announcement.startsAt) return `Starts ${formatDateTime(announcement.startsAt)}`
  if (announcement.endsAt) return `Ends ${formatDateTime(announcement.endsAt)}`

  return "Active immediately"
}

export function buildAnnouncementDetailHref(announcementId: string) {
  return `/announcements?announcement=${encodeURIComponent(announcementId)}`
}
