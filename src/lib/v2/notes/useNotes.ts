"use client"

import { nanoid } from "nanoid"
import { z } from "zod"
import { usePersistedState } from "@/lib/v2/persistence/usePersistedState"
import type { Note } from "./types"

const noteScopeSchema = z.custom<Note["scope"]>(value => typeof value === "string" && (value === "global" || value.startsWith("candidate:")))

const notesSchema: z.ZodSchema<Note[]> = z.array(
  z.object({
    id: z.string(),
    scope: noteScopeSchema,
    title: z.string(),
    body: z.string(),
    updatedAt: z.string(),
  })
)

export function useNotes(candidateId?: string) {
  const scope = candidateId ? (`candidate:${candidateId}` as const) : "global"
  const [items, setItems] = usePersistedState<Note[]>("v2.notes.items", [], notesSchema)
  const scoped = items.filter(item => item.scope === scope)

  function createNote() {
    const note: Note = {
      id: nanoid(8),
      scope,
      title: "Untitled note",
      body: "",
      updatedAt: new Date().toISOString(),
    }
    setItems(current => [note, ...current])
    return note
  }

  function updateNote(id: string, patch: Partial<Pick<Note, "title" | "body">>) {
    setItems(current => current.map(item => (item.id === id ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item)))
  }

  function deleteNote(id: string) {
    setItems(current => current.filter(item => item.id !== id))
  }

  return { items: scoped, createNote, updateNote, deleteNote }
}
