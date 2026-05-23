"use client"

import { createContext, useCallback, useContext, useMemo, useState } from "react"
import { z } from "zod"
import { usePersistedState } from "@/lib/persistence/usePersistedState"

export type V2DrawerId = "chat" | "notes"
export type V2DrawerMode = "float" | "dock"
export type V2DockLayout = "stack" | "columns"

interface DockPlacement {
  index: number
  count: number
  right: number
  width: number
  top?: string
  height?: string
}

interface DrawerRegistryValue {
  open: Record<V2DrawerId, boolean>
  mode: Record<V2DrawerId, V2DrawerMode>
  width: Record<V2DrawerId, number>
  dockedIds: V2DrawerId[]
  dockedWidth: number
  dockLayout: V2DockLayout
  toggle: (id: V2DrawerId) => void
  close: (id: V2DrawerId) => void
  setMode: (id: V2DrawerId, mode: V2DrawerMode) => void
  setWidth: (id: V2DrawerId, width: number) => void
  setDockLayout: (layout: V2DockLayout) => void
  getDockPlacement: (id: V2DrawerId) => DockPlacement | null
  moveDock: (id: V2DrawerId, overId: V2DrawerId) => void
  activeFloatId: V2DrawerId | null
  setActiveFloat: (id: V2DrawerId) => void
  floatPos: Record<V2DrawerId, { x: number; y: number } | null>
  setFloatPos: (id: V2DrawerId, pos: { x: number; y: number } | null) => void
}

const DRAWER_IDS: V2DrawerId[] = ["chat", "notes"]
const DrawerRegistryContext = createContext<DrawerRegistryValue | null>(null)
const modeSchema = z.enum(["float", "dock"])
const dockLayoutSchema = z.enum(["stack", "columns"])
const drawerOrderSchema = z.array(z.enum(["chat", "notes"]))
const widthSchema = z.number().min(320).max(560)
const floatPosSchema = z.nullable(z.object({ x: z.number(), y: z.number() }))

function normalizeOrder(order: V2DrawerId[]) {
  return [...order.filter((id, index) => DRAWER_IDS.includes(id) && order.indexOf(id) === index), ...DRAWER_IDS.filter(id => !order.includes(id))]
}

export function DrawerRegistryProvider({ children }: { children: React.ReactNode }) {
  const [chatOpen, setChatOpen] = usePersistedState("v2.chat.open", false, z.boolean())
  const [notesOpen, setNotesOpen] = usePersistedState("v2.notes.open", false, z.boolean())
  const [chatMode, setChatMode] = usePersistedState<V2DrawerMode>("v2.chat.mode", "float", modeSchema)
  const [notesMode, setNotesMode] = usePersistedState<V2DrawerMode>("v2.notes.mode", "float", modeSchema)
  const [chatWidth, setChatWidth] = usePersistedState("v2.chat.dockWidth", 380, widthSchema)
  const [notesWidth, setNotesWidth] = usePersistedState("v2.notes.dockWidth", 360, widthSchema)
  const [dockLayout, setDockLayoutValue] = usePersistedState<V2DockLayout>("v2.drawer.dockLayout", "stack", dockLayoutSchema)
  const [dockOrder, setDockOrder] = usePersistedState<V2DrawerId[]>("v2.drawer.dockOrder", DRAWER_IDS, drawerOrderSchema)
  const [activeFloatId, setActiveFloat] = useState<V2DrawerId | null>(null)
  const [chatFloatPos, setChatFloatPos] = usePersistedState<{ x: number; y: number } | null>("v2.chat.floatPos", null, floatPosSchema)
  const [notesFloatPos, setNotesFloatPos] = usePersistedState<{ x: number; y: number } | null>("v2.notes.floatPos", null, floatPosSchema)

  const open = useMemo(() => ({ chat: chatOpen, notes: notesOpen }), [chatOpen, notesOpen])
  const mode = useMemo(() => ({ chat: chatMode, notes: notesMode }), [chatMode, notesMode])
  const width = useMemo(() => ({ chat: chatWidth, notes: notesWidth }), [chatWidth, notesWidth])
  const floatPos = useMemo(() => ({ chat: chatFloatPos, notes: notesFloatPos }), [chatFloatPos, notesFloatPos])

  const setFloatPos = useCallback(
    (id: V2DrawerId, pos: { x: number; y: number } | null) => {
      if (id === "chat") setChatFloatPos(pos)
      else setNotesFloatPos(pos)
    },
    [setChatFloatPos, setNotesFloatPos]
  )
  const orderedIds = useMemo(() => normalizeOrder(dockOrder), [dockOrder])
  const dockedIds = useMemo(() => orderedIds.filter(id => open[id] && mode[id] === "dock"), [mode, open, orderedIds])
  const dockedWidth = dockedIds.length === 0 ? 0 : dockLayout === "columns" ? dockedIds.reduce((total, id) => total + width[id], 0) : Math.max(...dockedIds.map(id => width[id]))

  const setOpenById = useCallback(
    (id: V2DrawerId, next: boolean | ((current: boolean) => boolean)) => {
      if (id === "chat") setChatOpen(next)
      else setNotesOpen(next)
    },
    [setChatOpen, setNotesOpen]
  )

  const setMode = useCallback(
    (id: V2DrawerId, nextMode: V2DrawerMode) => {
      if (id === "chat") setChatMode(nextMode)
      else setNotesMode(nextMode)
      setDockOrder(current => normalizeOrder([id, ...current.filter(item => item !== id)]))
    },
    [setChatMode, setDockOrder, setNotesMode]
  )

  const setWidth = useCallback(
    (id: V2DrawerId, nextWidth: number) => {
      const clamped = Math.min(560, Math.max(320, nextWidth))
      if (id === "chat") setChatWidth(clamped)
      else setNotesWidth(clamped)
    },
    [setChatWidth, setNotesWidth]
  )

  const getDockPlacement = useCallback(
    (id: V2DrawerId): DockPlacement | null => {
      const index = dockedIds.indexOf(id)
      if (index < 0) return null
      if (dockLayout === "stack") {
        return {
          index,
          count: dockedIds.length,
          right: 0,
          width: dockedWidth,
          top: `${(100 / dockedIds.length) * index}%`,
          height: `${100 / dockedIds.length}%`,
        }
      }

      return {
        index,
        count: dockedIds.length,
        right: dockedIds.slice(index + 1).reduce((total, item) => total + width[item], 0),
        width: width[id],
      }
    },
    [dockLayout, dockedIds, dockedWidth, width]
  )

  const moveDock = useCallback(
    (id: V2DrawerId, overId: V2DrawerId) => {
      if (id === overId) return
      setDockOrder(current => {
        const next = normalizeOrder(current)
        const oldIndex = next.indexOf(id)
        const newIndex = next.indexOf(overId)
        if (oldIndex < 0 || newIndex < 0) return next
        next.splice(oldIndex, 1)
        next.splice(newIndex, 0, id)
        return normalizeOrder(next)
      })
    },
    [setDockOrder]
  )

  const value = useMemo<DrawerRegistryValue>(
    () => ({
      open,
      mode,
      width,
      dockedIds,
      dockedWidth,
      dockLayout,
      toggle: id => setOpenById(id, current => !current),
      close: id => setOpenById(id, false),
      setMode,
      setWidth,
      setDockLayout: setDockLayoutValue,
      getDockPlacement,
      moveDock,
      activeFloatId,
      setActiveFloat,
      floatPos,
      setFloatPos,
    }),
    [activeFloatId, dockedIds, dockLayout, dockedWidth, floatPos, getDockPlacement, mode, moveDock, open, setActiveFloat, setDockLayoutValue, setFloatPos, setMode, setOpenById, setWidth, width]
  )

  return <DrawerRegistryContext.Provider value={value}>{children}</DrawerRegistryContext.Provider>
}

export function useDrawerRegistry() {
  const context = useContext(DrawerRegistryContext)
  if (!context) throw new Error("useDrawerRegistry must be used within DrawerRegistryProvider")
  return context
}
