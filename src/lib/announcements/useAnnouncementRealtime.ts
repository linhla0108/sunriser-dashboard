"use client"

import { useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"

export interface AnnouncementInsertPayload {
  schema: "public"
  table: "announcements"
  eventType: "INSERT"
  new: {
    id: string
    title: string
    body: string
    priority: "low" | "normal" | "high" | "urgent"
    pinned: boolean
    due_at: string | null
    author_user_id: string
    created_at: string
    updated_at: string
    deleted_at: string | null
  }
}

interface RealtimeClient {
  channel: (name: string) => {
    on: (
      event: "postgres_changes",
      filter: Record<string, unknown>,
      callback: (payload: AnnouncementInsertPayload) => void
    ) => {
      subscribe: () => { unsubscribe?: () => void }
    }
  }
  removeChannel?: (channel: { unsubscribe?: () => void }) => Promise<unknown> | unknown
}

export function useAnnouncementRealtime({
  enabled,
  onInsert,
  client,
}: {
  enabled: boolean
  onInsert: (payload: AnnouncementInsertPayload) => void
  client?: RealtimeClient
}) {
  const supabase = useMemo(() => client ?? (createClient() as unknown as RealtimeClient), [client])

  useEffect(() => {
    if (!enabled) return

    const channel = supabase
      .channel("announcements-insert")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "announcements",
        },
        onInsert
      )
      .subscribe()

    return () => {
      channel.unsubscribe?.()
      supabase.removeChannel?.(channel)
    }
  }, [enabled, onInsert, supabase])
}
