"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth/useAuth"
import type { AnnouncementSummary } from "./types"
import { listVisibleAnnouncements, markAnnouncementRead } from "./client"
import { useAnnouncementRealtime, type AnnouncementInsertPayload } from "./useAnnouncementRealtime"

interface AnnouncementContextValue {
  announcements: AnnouncementSummary[]
  unreadCount: number
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  markRead: (announcementId: string) => Promise<void>
  canManageAnnouncements: boolean
}

const AnnouncementContext = createContext<AnnouncementContextValue | null>(null)

function sortAnnouncements(announcements: AnnouncementSummary[]) {
  return [...announcements].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    const aUnread = a.readAt === null
    const bUnread = b.readAt === null
    if (aUnread !== bUnread) return aUnread ? -1 : 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

export function AnnouncementProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [announcements, setAnnouncements] = useState<AnnouncementSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const canManageAnnouncements = user?.access.active === true && (user.role === "admin" || user.role === "manager")

  const refresh = useCallback(async () => {
    if (!user?.id || !user.access.active) {
      setAnnouncements([])
      setError(null)
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const next = await listVisibleAnnouncements(user.id)
      setAnnouncements(next)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load announcements")
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [refresh])

  const handleRealtimeInsert = useCallback(
    async (payload: AnnouncementInsertPayload) => {
      if (!user?.id || !user.access.active) return
      await refresh()
      if (payload.new.author_user_id === user.id) return
      toast("New announcement", {
        description: payload.new.title,
        action: {
          label: "Open",
          onClick: () => {
            window.location.href = "/announcements"
          },
        },
      })
    },
    [refresh, user]
  )

  useAnnouncementRealtime({
    enabled: Boolean(user?.id && user.access.active),
    onInsert: payload => {
      void handleRealtimeInsert(payload)
    },
  })

  const markRead = useCallback(
    async (announcementId: string) => {
      if (!user?.id) return
      const readAt = await markAnnouncementRead(announcementId, user.id)
      setAnnouncements(current =>
        sortAnnouncements(current.map(announcement => (announcement.id === announcementId ? { ...announcement, readAt } : announcement)))
      )
    },
    [user]
  )

  const value = useMemo<AnnouncementContextValue>(
    () => ({
      announcements,
      unreadCount: announcements.filter(announcement => announcement.readAt === null).length,
      loading,
      error,
      refresh,
      markRead,
      canManageAnnouncements,
    }),
    [announcements, loading, error, refresh, markRead, canManageAnnouncements]
  )

  return <AnnouncementContext.Provider value={value}>{children}</AnnouncementContext.Provider>
}

export function useAnnouncements() {
  const context = useContext(AnnouncementContext)
  if (!context) throw new Error("useAnnouncements must be used within AnnouncementProvider")
  return context
}
