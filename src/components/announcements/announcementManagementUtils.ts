import { format } from "date-fns"
import { AtSign, CircleDot, Flag, Siren } from "lucide-react"
import type { AnnouncementPriority } from "@/lib/announcements/types"

export const PRIORITY_OPTIONS: AnnouncementPriority[] = ["low", "normal", "high", "urgent"]

export const PRIORITY_UI = {
  low: {
    label: "Low",
    description: "General context or updates",
    icon: CircleDot,
  },
  normal: {
    label: "Normal",
    description: "Standard team communication",
    icon: Flag,
  },
  high: {
    label: "High",
    description: "Action needed soon",
    icon: AtSign,
  },
  urgent: {
    label: "Urgent",
    description: "Immediate attention required",
    icon: Siren,
  },
} satisfies Record<AnnouncementPriority, { label: string; description: string; icon: typeof CircleDot }>

export interface DateTimeParts {
  date: Date | undefined
  time: string
}

export interface AnnouncementWindowState {
  startsAt: DateTimeParts
  endsAt: DateTimeParts
}

export function emptyAnnouncementWindowState(): AnnouncementWindowState {
  return {
    startsAt: { date: undefined, time: "" },
    endsAt: { date: undefined, time: "" },
  }
}

export function toLocalDateTimeParts(iso: string | null): DateTimeParts {
  if (!iso) {
    return {
      date: undefined,
      time: "",
    }
  }

  const date = new Date(iso)

  return {
    date,
    time: format(date, "HH:mm"),
  }
}

export function toIsoDateTime(date: Date | undefined, time: string) {
  if (!date || !time) return null

  const [hours, minutes] = time.split(":")
  if (hours === undefined || minutes === undefined) return null

  const nextDate = new Date(date)
  nextDate.setHours(Number(hours), Number(minutes), 0, 0)
  return nextDate.toISOString()
}

export function formatWindowLabel(startsAt: string | null, endsAt: string | null) {
  if (startsAt && endsAt) return `Active ${new Date(startsAt).toLocaleString()} - ${new Date(endsAt).toLocaleString()}`
  if (startsAt) return `Starts ${new Date(startsAt).toLocaleString()}`
  if (endsAt) return `Ends ${new Date(endsAt).toLocaleString()}`
  return null
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? "")
    .join("")
}

export function formatQueuedAttachmentSize(files: File[]) {
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0)
  if (totalBytes < 1024) return `${totalBytes} B`
  if (totalBytes < 1024 * 1024) return `${(totalBytes / 1024).toFixed(1)} KB`
  return `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`
}
