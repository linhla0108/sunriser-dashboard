"use client"

import { useCallback, useEffect, useRef } from "react"
import { z } from "zod"
import { usePersistedState } from "@/lib/v2/persistence/usePersistedState"

const pinnedSchema = z.array(z.string())
const pinnedChangeEvent = "v2:pinned-change"

export function usePinned() {
  const [ids, setStoredIds] = usePersistedState<string[]>("v2.pinned", [], pinnedSchema)
  const idsRef = useRef(ids)

  useEffect(() => {
    idsRef.current = ids
  }, [ids])

  useEffect(() => {
    function handlePinnedChange(event: Event) {
      const next = (event as CustomEvent<string[]>).detail
      if (pinnedSchema.safeParse(next).success) {
        idsRef.current = next
        setStoredIds(next)
      }
    }

    window.addEventListener(pinnedChangeEvent, handlePinnedChange)
    return () => window.removeEventListener(pinnedChangeEvent, handlePinnedChange)
  }, [setStoredIds])

  const setIds = useCallback(
    (next: string[]) => {
      idsRef.current = next
      setStoredIds(next)
      window.queueMicrotask(() => {
        window.dispatchEvent(new CustomEvent(pinnedChangeEvent, { detail: next }))
      })
    },
    [setStoredIds]
  )

  const add = useCallback(
    (id: string) => {
      const current = idsRef.current
      if (current.includes(id)) return false
      setIds([...current, id])
      return true
    },
    [setIds]
  )

  const remove = useCallback(
    (id: string) => {
      setIds(idsRef.current.filter(item => item !== id))
    },
    [setIds]
  )

  const clear = useCallback(() => {
    setIds([])
  }, [setIds])

  function has(id: string) {
    return ids.includes(id)
  }

  return { ids, add, remove, clear, has }
}
