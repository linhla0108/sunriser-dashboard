"use client"

import { useMemo, useState } from "react"
import { Bell, CheckCheck, Copy, ExternalLink, Inbox, Link2, PinIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ActionTooltip } from "@/components/common/ActionTooltip"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "@/components/ui/context-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SegmentedControl } from "@/components/ui/segmented-control"
import {
  buildAnnouncementDetailHref,
  filterAnnouncementsForTab,
  formatAnnouncementDateRange,
  type AnnouncementCenterTab,
} from "@/lib/announcements/presentation"
import { useAnnouncements } from "@/lib/announcements/AnnouncementProvider"
import { getAnnouncementAttachmentUrl } from "@/lib/announcements/client"
import type { AnnouncementSummary } from "@/lib/announcements/types"
import { cn } from "@/lib/utils"
import { AnnouncementDetailDialog } from "./AnnouncementDetailDialog"
import { AnnouncementPriorityBadge } from "./AnnouncementPriorityBadge"

const TAB_CONFIG: Array<{ value: AnnouncementCenterTab; label: string }> = [
  { value: "unread", label: "Unread" },
  { value: "pinned", label: "Pinned" },
  { value: "all", label: "All" },
]

export function AnnouncementCenter() {
  const router = useRouter()
  const { announcements, unreadCount, loading, error, markRead } = useAnnouncements()
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<AnnouncementCenterTab>("all")
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<string | null>(null)

  const selectedAnnouncement = useMemo(
    () => announcements.find(announcement => announcement.id === selectedAnnouncementId) ?? null,
    [announcements, selectedAnnouncementId]
  )
  const filteredAnnouncements = useMemo(() => filterAnnouncementsForTab(announcements, activeTab), [activeTab, announcements])

  function openAnnouncement(announcementId: string) {
    setSelectedAnnouncementId(announcementId)
    setPopoverOpen(false)
  }

  async function handleCopy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label} copied`)
    } catch {
      toast.error(`Failed to copy ${label.toLowerCase()}`)
    }
  }

  return (
    <>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <ActionTooltip label="Open announcements">
          <PopoverTrigger
            render={
              <Button
                variant="plain"
                size="plain"
                type="button"
                aria-label={unreadCount > 0 ? `Open announcements (${unreadCount} unread)` : "Open announcements"}
                className="text-muted-foreground hover:bg-foreground/5 hover:text-foreground relative flex size-9 items-center justify-center rounded-lg transition"
              >
                <Bell className="size-4" />
                {unreadCount > 0 ? <Badge className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-[10px]">{unreadCount}</Badge> : null}
              </Button>
            }
          />
        </ActionTooltip>

        <PopoverContent align="end" sideOffset={10} className="w-[min(26rem,calc(100vw-1rem))] rounded-3xl p-0 shadow-xl">
          <div className="border-b px-3 py-3 sm:px-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Announcements</div>
                {unreadCount > 0 ? (
                  <div className="text-muted-foreground text-xs">
                    {unreadCount} unread update{unreadCount === 1 ? "" : "s"}
                  </div>
                ) : null}
              </div>
              <ActionTooltip label="Open announcements page">
                <Link
                  href="/announcements"
                  aria-label="Open announcements page"
                  className="text-muted-foreground hover:bg-foreground/5 hover:text-foreground inline-flex size-8 items-center justify-center rounded-lg transition"
                  onClick={() => setPopoverOpen(false)}
                >
                  <Inbox className="size-4" />
                </Link>
              </ActionTooltip>
            </div>

            <SegmentedControl.Root
              value={activeTab}
              onValueChange={value => setActiveTab(value as AnnouncementCenterTab)}
              className="mt-3 w-full p-1"
            >
              {TAB_CONFIG.map(tab => (
                <SegmentedControl.Item key={tab.value} value={tab.value}>
                  {tab.label}
                </SegmentedControl.Item>
              ))}
            </SegmentedControl.Root>
          </div>

          <ScrollArea className="max-h-[min(30rem,calc(100dvh-10rem))]">
            <div className="space-y-2 px-3 py-3 sm:px-4 [&_[data-slot=scroll-area-scrollbar]]:hidden">
              {loading ? (
                <div className="text-muted-foreground rounded-2xl border border-dashed px-4 py-8 text-center text-sm">Loading announcements...</div>
              ) : error ? (
                <div className="border-destructive/20 bg-destructive/5 text-destructive rounded-2xl border px-4 py-8 text-center text-sm">
                  {error}
                </div>
              ) : filteredAnnouncements.length === 0 ? (
                <div className="bg-muted/40 text-muted-foreground rounded-2xl px-4 py-8 text-center text-sm">No announcements in this tab.</div>
              ) : (
                filteredAnnouncements.map(announcement => (
                  <AnnouncementCenterItem
                    key={announcement.id}
                    announcement={announcement}
                    onCopyLink={() => void handleCopy(`${window.location.origin}${buildAnnouncementDetailHref(announcement.id)}`, "Link")}
                    onCopyTitle={() => void handleCopy(announcement.title, "Title")}
                    onMarkRead={() => void markRead(announcement.id)}
                    onOpen={() => openAnnouncement(announcement.id)}
                    onOpenInboxPage={() => router.push(buildAnnouncementDetailHref(announcement.id))}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>

      <AnnouncementDetailDialog
        announcement={selectedAnnouncement}
        open={selectedAnnouncement !== null}
        onMarkRead={markRead}
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
        onOpenChange={open => {
          if (!open) setSelectedAnnouncementId(null)
        }}
      />
    </>
  )
}

function AnnouncementCenterItem({
  announcement,
  onOpen,
  onMarkRead,
  onCopyTitle,
  onCopyLink,
  onOpenInboxPage,
}: {
  announcement: AnnouncementSummary
  onOpen: () => void
  onMarkRead: () => void
  onCopyTitle: () => void
  onCopyLink: () => void
  onOpenInboxPage: () => void
}) {
  const unread = announcement.readAt === null

  return (
    <ContextMenu>
      <ContextMenuTrigger className="contents">
        <Button
          variant="plain"
          size="plain"
          onClick={onOpen}
          data-testid={`announcement-center-item-${announcement.id}`}
          className={cn(
            "h-auto w-full justify-start rounded-2xl border px-3 py-3 text-left transition",
            unread ? "border-primary/20 bg-primary/6 hover:bg-primary/10" : "border-border/70 bg-background/70 hover:bg-muted/40"
          )}
        >
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-semibold">{announcement.title}</span>
                {announcement.pinned ? <PinIcon className="text-muted-foreground size-3.5 shrink-0" /> : null}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <AnnouncementPriorityBadge priority={announcement.priority} />
                {unread ? <Badge variant="outline">Unread</Badge> : null}
              </div>
              <div className="text-muted-foreground mt-2 text-xs leading-5">{formatAnnouncementDateRange(announcement)}</div>
            </div>
          </div>
        </Button>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-52">
        <ContextMenuItem onClick={onOpen}>
          <ExternalLink />
          Open
        </ContextMenuItem>
        <ContextMenuItem onClick={onMarkRead} disabled={!unread}>
          <CheckCheck />
          Mark as read
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onCopyTitle}>
          <Copy />
          Copy title
        </ContextMenuItem>
        <ContextMenuItem onClick={onCopyLink}>
          <Link2 />
          Copy link
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onOpenInboxPage}>
          <ExternalLink />
          Open inbox page
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
