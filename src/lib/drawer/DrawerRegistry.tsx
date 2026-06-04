"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
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
  top?: string | number
  height?: string | number
}

interface DrawerRegistryValue {
  open: Record<V2DrawerId, boolean>
  mode: Record<V2DrawerId, V2DrawerMode>
  width: Record<V2DrawerId, number>
  height: Record<V2DrawerId, number>
  dockedIds: V2DrawerId[]
  dockedWidth: number
  dockLayout: V2DockLayout
  dockStackRatio: number
  toggle: (id: V2DrawerId) => void
  close: (id: V2DrawerId) => void
  setMode: (id: V2DrawerId, mode: V2DrawerMode) => void
  setWidth: (id: V2DrawerId, width: number) => void
  setHeight: (id: V2DrawerId, height: number) => void
  setDockStackRatio: (ratio: number) => void
  setDockLayout: (layout: V2DockLayout) => void
  getDockPlacement: (id: V2DrawerId) => DockPlacement | null
  moveDock: (id: V2DrawerId, overId: V2DrawerId) => void
  activeFloatId: V2DrawerId | null
  setActiveFloat: (id: V2DrawerId) => void
  floatPos: Record<V2DrawerId, { x: number; y: number } | null>
  setFloatPos: (id: V2DrawerId, pos: { x: number; y: number } | null) => void
}

const DRAWER_IDS: V2DrawerId[] = ["chat", "notes"]
const DOCK_INSET = 12
const DOCK_GAP = 12
const DOCK_CONTENT_GAP = 12
const DOCK_MIN_HEIGHT = 320
const FLOAT_MIN_HEIGHT = 320
const FLOAT_MAX_HEIGHT = 720
const DrawerRegistryContext = createContext<DrawerRegistryValue | null>(null)
const modeSchema = z.enum(["float", "dock"])
const dockLayoutSchema = z.enum(["stack", "columns"])
const drawerOrderSchema = z.array(z.enum(["chat", "notes"]))
const widthSchema = z.number().min(320).max(560)
const heightSchema = z.number().min(FLOAT_MIN_HEIGHT).max(FLOAT_MAX_HEIGHT)
const dockStackRatioSchema = z.number().min(0.2).max(0.8)
const floatPosSchema = z.nullable(z.object({ x: z.number(), y: z.number() }))

function normalizeOrder(order: V2DrawerId[]) {
  return [...order.filter((id, index) => DRAWER_IDS.includes(id) && order.indexOf(id) === index), ...DRAWER_IDS.filter(id => !order.includes(id))]
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function getViewportHeight() {
  return typeof window === "undefined" ? 720 : window.innerHeight
}

export function DrawerRegistryProvider({ children }: { children: React.ReactNode }) {
  const [chatOpen, setChatOpen] = usePersistedState("v2.chat.open", false, z.boolean())
  const [notesOpen, setNotesOpen] = usePersistedState("v2.notes.open", false, z.boolean())
  const [chatMode, setChatMode] = usePersistedState<V2DrawerMode>("v2.chat.mode", "float", modeSchema)
  const [notesMode, setNotesMode] = usePersistedState<V2DrawerMode>("v2.notes.mode", "float", modeSchema)
  const [chatWidth, setChatWidth] = usePersistedState("v2.chat.dockWidth", 380, widthSchema)
  const [notesWidth, setNotesWidth] = usePersistedState("v2.notes.dockWidth", 360, widthSchema)
  const [chatHeight, setChatHeight] = usePersistedState("v2.chat.floatHeight", 460, heightSchema)
  const [notesHeight, setNotesHeight] = usePersistedState("v2.notes.floatHeight", 440, heightSchema)
  const [dockStackRatio, setDockStackRatioValue] = usePersistedState("v2.drawer.dockStackRatio", 0.5, dockStackRatioSchema)
  const [dockLayout, setDockLayoutValue] = usePersistedState<V2DockLayout>("v2.drawer.dockLayout", "stack", dockLayoutSchema)
  const [dockOrder, setDockOrder] = usePersistedState<V2DrawerId[]>("v2.drawer.dockOrder", DRAWER_IDS, drawerOrderSchema)
  const [activeFloatId, setActiveFloat] = useState<V2DrawerId | null>(null)
  const [viewportHeight, setViewportHeight] = useState(getViewportHeight)
  const [chatFloatPos, setChatFloatPos] = usePersistedState<{ x: number; y: number } | null>("v2.chat.floatPos", null, floatPosSchema)
  const [notesFloatPos, setNotesFloatPos] = usePersistedState<{ x: number; y: number } | null>("v2.notes.floatPos", null, floatPosSchema)

  const open = useMemo(() => ({ chat: chatOpen, notes: notesOpen }), [chatOpen, notesOpen])
  const mode = useMemo(() => ({ chat: chatMode, notes: notesMode }), [chatMode, notesMode])
  const width = useMemo(() => ({ chat: chatWidth, notes: notesWidth }), [chatWidth, notesWidth])
  const height = useMemo(() => ({ chat: chatHeight, notes: notesHeight }), [chatHeight, notesHeight])
  const floatPos = useMemo(() => ({ chat: chatFloatPos, notes: notesFloatPos }), [chatFloatPos, notesFloatPos])

  useEffect(() => {
    function syncViewportHeight() {
      setViewportHeight(getViewportHeight())
    }

    syncViewportHeight()
    window.addEventListener("resize", syncViewportHeight)
    return () => window.removeEventListener("resize", syncViewportHeight)
  }, [])

  const setFloatPos = useCallback(
    (id: V2DrawerId, pos: { x: number; y: number } | null) => {
      if (id === "chat") setChatFloatPos(pos)
      else setNotesFloatPos(pos)
    },
    [setChatFloatPos, setNotesFloatPos]
  )
  const orderedIds = useMemo(() => normalizeOrder(dockOrder), [dockOrder])
  const dockedIds = useMemo(() => orderedIds.filter(id => open[id] && mode[id] === "dock"), [mode, open, orderedIds])
  const dockedWidth =
    dockedIds.length === 0
      ? 0
      : dockLayout === "columns"
        ? dockedIds.reduce((total, id) => total + width[id], DOCK_INSET + DOCK_CONTENT_GAP + DOCK_GAP * (dockedIds.length - 1))
        : Math.max(...dockedIds.map(id => width[id])) + DOCK_INSET + DOCK_CONTENT_GAP

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

  const setHeight = useCallback(
    (id: V2DrawerId, nextHeight: number) => {
      const maxHeight = Math.min(FLOAT_MAX_HEIGHT, Math.max(FLOAT_MIN_HEIGHT, viewportHeight - 112))
      const clamped = clamp(nextHeight, FLOAT_MIN_HEIGHT, maxHeight)
      if (id === "chat") setChatHeight(clamped)
      else setNotesHeight(clamped)
    },
    [setChatHeight, setNotesHeight, viewportHeight]
  )

  const getStackMinHeight = useCallback(
    (count: number) => {
      const available = Math.max(0, viewportHeight - DOCK_INSET * 2 - DOCK_GAP * Math.max(0, count - 1))
      return Math.min(DOCK_MIN_HEIGHT, Math.floor(available / Math.max(1, count)))
    },
    [viewportHeight]
  )

  const clampDockStackRatio = useCallback(
    (nextRatio: number) => {
      const available = Math.max(0, viewportHeight - DOCK_INSET * 2 - DOCK_GAP)
      if (available <= 0) return 0.5
      const minRatio = clamp(getStackMinHeight(2) / available, 0.2, 0.5)
      return clamp(nextRatio, minRatio, 1 - minRatio)
    },
    [getStackMinHeight, viewportHeight]
  )

  const setDockStackRatio = useCallback(
    (nextRatio: number) => {
      setDockStackRatioValue(clampDockStackRatio(nextRatio))
    },
    [clampDockStackRatio, setDockStackRatioValue]
  )

  const getDockPlacement = useCallback(
    (id: V2DrawerId): DockPlacement | null => {
      const index = dockedIds.indexOf(id)
      if (index < 0) return null
      if (dockLayout === "stack") {
        const stackWidth = Math.max(...dockedIds.map(item => width[item]))
        if (dockedIds.length === 1) {
          return {
            index,
            count: dockedIds.length,
            right: DOCK_INSET,
            width: stackWidth,
            top: `calc(0% + ${DOCK_INSET}px)`,
            height: `calc(100% - ${DOCK_INSET * 2}px)`,
          }
        }

        const available = Math.max(0, viewportHeight - DOCK_INSET * 2 - DOCK_GAP * (dockedIds.length - 1))
        const ratio = dockedIds.length === 2 ? clampDockStackRatio(dockStackRatio) : 1 / dockedIds.length
        const firstHeight = Math.round(available * ratio)
        const sharedMinHeight = getStackMinHeight(dockedIds.length)
        const stackHeights = dockedIds.length === 2 ? [firstHeight, available - firstHeight] : dockedIds.map(() => sharedMinHeight)
        const top = DOCK_INSET + stackHeights.slice(0, index).reduce((total, item) => total + item + DOCK_GAP, 0)

        return {
          index,
          count: dockedIds.length,
          right: DOCK_INSET,
          width: stackWidth,
          top,
          height: Math.max(sharedMinHeight, stackHeights[index] ?? sharedMinHeight),
        }
      }

      return {
        index,
        count: dockedIds.length,
        right: dockedIds.slice(index + 1).reduce((total, item) => total + width[item] + DOCK_GAP, DOCK_INSET),
        width: width[id],
      }
    },
    [clampDockStackRatio, dockLayout, dockStackRatio, dockedIds, getStackMinHeight, viewportHeight, width]
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
      height,
      dockedIds,
      dockedWidth,
      dockLayout,
      dockStackRatio: clampDockStackRatio(dockStackRatio),
      toggle: id => setOpenById(id, current => !current),
      close: id => setOpenById(id, false),
      setMode,
      setWidth,
      setHeight,
      setDockStackRatio,
      setDockLayout: setDockLayoutValue,
      getDockPlacement,
      moveDock,
      activeFloatId,
      setActiveFloat,
      floatPos,
      setFloatPos,
    }),
    [
      activeFloatId,
      clampDockStackRatio,
      dockedIds,
      dockLayout,
      dockStackRatio,
      dockedWidth,
      floatPos,
      getDockPlacement,
      height,
      mode,
      moveDock,
      open,
      setActiveFloat,
      setDockStackRatio,
      setDockLayoutValue,
      setFloatPos,
      setHeight,
      setMode,
      setOpenById,
      setWidth,
      width,
    ]
  )

  return <DrawerRegistryContext.Provider value={value}>{children}</DrawerRegistryContext.Provider>
}

export function useDrawerRegistry() {
  const context = useContext(DrawerRegistryContext)
  if (!context) throw new Error("useDrawerRegistry must be used within DrawerRegistryProvider")
  return context
}
