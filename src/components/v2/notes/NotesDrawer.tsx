"use client"

import { Plus, Trash2 } from "lucide-react"
import { ActionTooltip } from "@/components/v2/common/ActionTooltip"
import { DrawerShell } from "@/components/v2/common/DrawerShell"
import { useNotes } from "@/lib/v2/notes/useNotes"

export function NotesDrawer() {
  const { createNote, deleteNote, items, updateNote } = useNotes()

  return (
    <DrawerShell id="notes" title="Notes" subtitle="Auto-saved local workspace notes">
      <div className="space-y-3">
        <ActionTooltip label="New note">
          <button
            type="button"
            onClick={createNote}
            className="flex h-9 w-full items-center justify-center gap-2 rounded-full bg-[var(--v2-primary)] text-sm font-semibold text-white"
          >
            <Plus className="size-4" />
            New note
          </button>
        </ActionTooltip>
        {items.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[var(--v2-ink)]/15 p-5 text-center text-sm text-[var(--v2-muted)]">No notes yet.</p>
        ) : null}
        {items.map(note => (
          <article key={note.id} className="rounded-2xl border border-[var(--v2-ink)]/10 bg-[var(--v2-bg)] p-3">
            <div className="flex items-center gap-2">
              <input
                value={note.title}
                onChange={event => updateNote(note.id, { title: event.target.value })}
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[var(--v2-ink)] outline-none"
              />
              <ActionTooltip label="Delete note">
                <button
                  type="button"
                  onClick={() => deleteNote(note.id)}
                  className="rounded-full p-1 text-[var(--v2-muted)] hover:bg-[var(--v2-ink)]/5"
                >
                  <Trash2 className="size-4" />
                </button>
              </ActionTooltip>
            </div>
            <textarea
              value={note.body}
              onChange={event => updateNote(note.id, { body: event.target.value })}
              placeholder="Write a quick note..."
              className="mt-2 min-h-28 w-full resize-none rounded-xl border border-[var(--v2-ink)]/10 bg-[var(--v2-surface)] p-2 text-sm text-[var(--v2-ink)] outline-none focus:border-[var(--v2-primary)]"
            />
            <p className="mt-1 text-xs text-[var(--v2-muted)]">Saved {new Date(note.updatedAt).toLocaleTimeString()}</p>
          </article>
        ))}
      </div>
    </DrawerShell>
  )
}
