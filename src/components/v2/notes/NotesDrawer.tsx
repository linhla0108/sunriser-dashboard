"use client"

import { Plus, Trash2 } from "lucide-react"
import { ActionTooltip } from "@/components/v2/common/ActionTooltip"
import { DrawerShell } from "@/components/v2/common/DrawerShell"
import { useNotes } from "@/lib/v2/notes/useNotes"
import { Button } from "@/components/ui/button"

export function NotesDrawer() {
  const { createNote, deleteNote, items, updateNote } = useNotes()

  return (
    <DrawerShell id="notes" title="Notes" subtitle="Auto-saved local workspace notes">
      <div className="space-y-3">
        <ActionTooltip label="New note">
          <Button
            variant="plain"
            size="plain"
            type="button"
            onClick={createNote}
            className="bg-primary text-primary-foreground flex h-9 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold"
          >
            <Plus className="size-4" />
            New note
          </Button>
        </ActionTooltip>
        {items.length === 0 ? (
          <p className="border-foreground/15 text-muted-foreground rounded-2xl border border-dashed p-5 text-center text-sm">No notes yet.</p>
        ) : null}
        {items.map(note => (
          <article key={note.id} data-v2-card="" className="border-foreground/10 bg-background/70 rounded-2xl border p-3">
            <div className="flex items-center gap-2">
              <input
                value={note.title}
                onChange={event => updateNote(note.id, { title: event.target.value })}
                className="text-foreground min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none"
              />
              <ActionTooltip label="Delete note">
                <Button
                  variant="plain"
                  size="plain"
                  type="button"
                  onClick={() => deleteNote(note.id)}
                  className="text-muted-foreground hover:bg-foreground/5 rounded-full p-1"
                >
                  <Trash2 className="size-4" />
                </Button>
              </ActionTooltip>
            </div>
            <textarea
              value={note.body}
              onChange={event => updateNote(note.id, { body: event.target.value })}
              placeholder="Write a quick note..."
              className="border-foreground/10 bg-card text-foreground focus:border-primary mt-2 min-h-28 w-full resize-none rounded-xl border p-2 text-sm outline-none"
              data-v2-field=""
            />
            <p className="text-muted-foreground mt-1 text-xs">Saved {new Date(note.updatedAt).toLocaleTimeString()}</p>
          </article>
        ))}
      </div>
    </DrawerShell>
  )
}
