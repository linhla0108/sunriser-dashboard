"use client"

import { createContext, useCallback, useContext, useMemo } from "react"
import { toast } from "sonner"
import { z } from "zod"
import { usePersistedState } from "@/lib/v2/persistence/usePersistedState"

export type V2DrawerId = "chat" | "notes"
export type V2DrawerMode = "float" | "dock"

interface DrawerRegistryValue {
  open: Record<V2DrawerId, boolean>
  mode: Record<V2DrawerId, V2DrawerMode>
  width: Record<V2DrawerId, number>
  dockedWidth: number
  toggle: (id: V2DrawerId) => void
  close: (id: V2DrawerId) => void
  setMode: (id: V2DrawerId, mode: V2DrawerMode) => void
  setWidth: (id: V2DrawerId, width: number) => void
}

const DrawerRegistryContext = createContext<DrawerRegistryValue | null>(null)
const modeSchema = z.enum(["float", "dock"])
const widthSchema = z.number().min(320).max(560)

export function DrawerRegistryProvider({ children }: { children: React.ReactNode }) {
  const [chatOpen, setChatOpen] = usePersistedState("v2.chat.open", false, z.boolean())
  const [notesOpen, setNotesOpen] = usePersistedState("v2.notes.open", false, z.boolean())
  const [chatMode, setChatMode] = usePersistedState<V2DrawerMode>("v2.chat.mode", "float", modeSchema)
  const [notesMode, setNotesMode] = usePersistedState<V2DrawerMode>("v2.notes.mode", "float", modeSchema)
  const [chatWidth, setChatWidth] = usePersistedState("v2.chat.dockWidth", 380, widthSchema)
  const [notesWidth, setNotesWidth] = usePersistedState("v2.notes.dockWidth", 360, widthSchema)

  const open = useMemo(() => ({ chat: chatOpen, notes: notesOpen }), [chatOpen, notesOpen])
  const mode = useMemo(() => ({ chat: chatMode, notes: notesMode }), [chatMode, notesMode])
  const width = useMemo(() => ({ chat: chatWidth, notes: notesWidth }), [chatWidth, notesWidth])
  const dockedWidth = open.chat && chatMode === "dock" ? chatWidth : open.notes && notesMode === "dock" ? notesWidth : 0

  const setOpenById = useCallback(
    (id: V2DrawerId, next: boolean | ((current: boolean) => boolean)) => {
      if (id === "chat") setChatOpen(next)
      else setNotesOpen(next)
    },
    [setChatOpen, setNotesOpen]
  )

  const setMode = useCallback(
    (id: V2DrawerId, nextMode: V2DrawerMode) => {
      const other: V2DrawerId = id === "chat" ? "notes" : "chat"
      if (nextMode === "dock" && open[other] && mode[other] === "dock") {
        toast(`${other === "chat" ? "AI Drawer" : "Notes Drawer"} is docked; ${id === "chat" ? "AI" : "Notes"} opened in floating mode.`)
        nextMode = "float"
      }
      if (id === "chat") setChatMode(nextMode)
      else setNotesMode(nextMode)
    },
    [mode, open, setChatMode, setNotesMode]
  )

  const value = useMemo<DrawerRegistryValue>(
    () => ({
      open,
      mode,
      width,
      dockedWidth,
      toggle: id => setOpenById(id, current => !current),
      close: id => setOpenById(id, false),
      setMode,
      setWidth: (id, nextWidth) => {
        const clamped = Math.min(560, Math.max(320, nextWidth))
        if (id === "chat") setChatWidth(clamped)
        else setNotesWidth(clamped)
      },
    }),
    [dockedWidth, mode, open, setChatWidth, setMode, setNotesWidth, setOpenById, width]
  )

  return <DrawerRegistryContext.Provider value={value}>{children}</DrawerRegistryContext.Provider>
}

export function useDrawerRegistry() {
  const context = useContext(DrawerRegistryContext)
  if (!context) throw new Error("useDrawerRegistry must be used within DrawerRegistryProvider")
  return context
}
