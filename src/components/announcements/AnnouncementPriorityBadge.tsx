import { Badge } from "@/components/ui/badge"
import type { AnnouncementPriority } from "@/lib/announcements/types"

const PRIORITY_LABELS: Record<AnnouncementPriority, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
}

const PRIORITY_VARIANTS: Record<AnnouncementPriority, "secondary" | "outline" | "default" | "destructive"> = {
  low: "outline",
  normal: "secondary",
  high: "default",
  urgent: "destructive",
}

export function AnnouncementPriorityBadge({ priority }: { priority: AnnouncementPriority }) {
  return <Badge variant={PRIORITY_VARIANTS[priority]}>{PRIORITY_LABELS[priority]}</Badge>
}
