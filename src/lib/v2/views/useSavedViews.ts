"use client"

import { nanoid } from "nanoid"
import { z } from "zod"
import type { V2View } from "@/lib/v2/views/useViewState"
import { useViewState } from "@/lib/v2/views/useViewState"
import { usePersistedState } from "@/lib/v2/persistence/usePersistedState"

export interface V2SavedView {
  id: string
  name: string
  view: V2View
  createdAt: string
}

const savedViewsSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    view: z.enum(["table", "pipeline", "gallery", "chart"]),
    createdAt: z.string(),
  })
)

export function useSavedViews() {
  const { view, setView } = useViewState()
  const [savedViews, setSavedViews] = usePersistedState<V2SavedView[]>("v2.view.savedViews", [], savedViewsSchema)

  function saveCurrent(name: string) {
    setSavedViews(current => [{ id: nanoid(8), name, view, createdAt: new Date().toISOString() }, ...current])
  }

  function loadSaved(savedView: V2SavedView) {
    setView(savedView.view)
  }

  function deleteSaved(id: string) {
    setSavedViews(current => current.filter(item => item.id !== id))
  }

  return { savedViews, saveCurrent, loadSaved, deleteSaved }
}
