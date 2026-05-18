"use client"

import { useCallback, useEffect, type SetStateAction } from "react"
import { z } from "zod"
import { usePersistedState } from "@/lib/v2/persistence/usePersistedState"

export const V2_VIEW_KEYS = ["table", "pipeline", "gallery", "chart"] as const

export type V2View = (typeof V2_VIEW_KEYS)[number]

const viewSchema = z.enum(V2_VIEW_KEYS)
const viewChangeEvent = "v2:view-change"

function resolveViewUpdate(current: V2View, next: SetStateAction<V2View>) {
  return typeof next === "function" ? (next as (value: V2View) => V2View)(current) : next
}

export function useViewState() {
  const [view, setStoredView] = usePersistedState<V2View>("v2.view.current", "table", viewSchema)

  useEffect(() => {
    function handleViewChange(event: Event) {
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
      window.queueMicrotask(() => {
        window.dispatchEvent(new CustomEvent(viewChangeEvent, { detail: resolved }))
      })
    },
    [setStoredView, view]
  )

  return { view, setView }
}
