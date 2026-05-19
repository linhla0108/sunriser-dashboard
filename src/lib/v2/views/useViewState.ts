"use client"

import { useCallback, useEffect, useRef, type SetStateAction } from "react"
import { z } from "zod"
import { usePersistedState } from "@/lib/v2/persistence/usePersistedState"

export const V2_VIEW_KEYS = ["table", "pipeline", "chart", "gallery"] as const

export type V2View = (typeof V2_VIEW_KEYS)[number]

const viewSchema = z.enum(V2_VIEW_KEYS)
const viewChangeEvent = "v2:view-change"
const DEFAULT_VIEW_KEY = "v2.workspace.defaultView"

function resolveViewUpdate(current: V2View, next: SetStateAction<V2View>) {
  return typeof next === "function" ? (next as (value: V2View) => V2View)(current) : next
}

function readDefaultView(): V2View {
  if (typeof window === "undefined") return "table"
  try {
    const raw = window.localStorage.getItem(DEFAULT_VIEW_KEY)
    if (!raw) return "table"
    const parsed: unknown = JSON.parse(raw)
    const result = viewSchema.safeParse(parsed)
    return result.success ? result.data : "table"
  } catch {
    return "table"
  }
}

export function useViewState() {
  const [view, setStoredView] = usePersistedState<V2View>("v2.view.current", readDefaultView(), viewSchema)
  // Track when this instance is the one dispatching the event so the listener
  // below doesn't double-call setStoredView with the same value.
  const isDispatchingRef = useRef(false)

  useEffect(() => {
    function handleViewChange(event: Event) {
      if (isDispatchingRef.current) return // ignore events fired by this instance
      const next = (event as CustomEvent<V2View>).detail
      if (viewSchema.safeParse(next).success) setStoredView(next)
    }

    window.addEventListener(viewChangeEvent, handleViewChange)
    return () => window.removeEventListener(viewChangeEvent, handleViewChange)
  }, [setStoredView])

  const setView = useCallback(
    (next: SetStateAction<V2View>) => {
      const resolved = resolveViewUpdate(view, next)
      setStoredView(resolved)
      isDispatchingRef.current = true
      window.queueMicrotask(() => {
        window.dispatchEvent(new CustomEvent(viewChangeEvent, { detail: resolved }))
        isDispatchingRef.current = false
      })
    },
    [setStoredView, view]
  )

  return { view, setView }
}
