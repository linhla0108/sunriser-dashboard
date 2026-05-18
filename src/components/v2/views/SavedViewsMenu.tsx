"use client"

import { useRef, useState } from "react"
import { Bookmark, Check, Trash2 } from "lucide-react"
import { ActionTooltip } from "@/components/v2/common/ActionTooltip"
import { useSavedViews } from "@/lib/v2/views/useSavedViews"

export function SavedViewsMenu() {
  const anchorRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const { deleteSaved, loadSaved, saveCurrent, savedViews } = useSavedViews()

  function save() {
    const trimmed = name.trim()
    if (!trimmed) return
    saveCurrent(trimmed)
    setName("")
  }

  return (
    <div className="relative">
      <ActionTooltip label="Saved views">
        <button
          ref={anchorRef}
          type="button"
          onClick={() => setOpen(current => !current)}
          className="flex size-10 items-center justify-center rounded-full text-[var(--v2-muted)] transition-colors hover:bg-[var(--v2-ink)]/5 hover:text-[var(--v2-ink)]"
          aria-label="Saved views"
          aria-expanded={open}
        >
          <Bookmark className="size-4" />
        </button>
      </ActionTooltip>
      {open ? (
        <div className="absolute right-0 bottom-full mb-2 w-[280px] rounded-3xl border border-[var(--v2-ink)]/10 bg-[var(--v2-surface)] p-3 text-[var(--v2-ink)] shadow-[0_18px_44px_rgba(15,23,42,0.16)]">
          <p className="mb-2 text-xs font-semibold tracking-widest text-[var(--v2-muted)] uppercase">Saved Views</p>
          <div className="max-h-44 space-y-1 overflow-auto">
            {savedViews.length === 0 ? <p className="py-4 text-center text-sm text-[var(--v2-muted)]">No saved views yet</p> : null}
            {savedViews.map(item => (
              <div key={item.id} className="flex items-center gap-2 rounded-xl px-2 py-2 hover:bg-[var(--v2-ink)]/5">
                <button type="button" onClick={() => loadSaved(item)} className="min-w-0 flex-1 truncate text-left text-sm font-medium">
                  {item.name}
                </button>
                <button
                  type="button"
                  onClick={() => deleteSaved(item.id)}
                  aria-label={`Delete ${item.name}`}
                  className="rounded-lg p-1 text-[var(--v2-muted)] hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2 border-t border-[var(--v2-ink)]/10 pt-3">
            <input
              value={name}
              onChange={event => setName(event.target.value)}
              onKeyDown={event => event.key === "Enter" && save()}
              placeholder="View name..."
              className="h-8 min-w-0 flex-1 rounded-2xl border border-[var(--v2-ink)]/10 bg-[var(--v2-bg)] px-3 text-xs outline-none focus:border-[var(--v2-primary)]"
            />
            <ActionTooltip label="Save current view">
              <button
                type="button"
                onClick={save}
                disabled={!name.trim()}
                className="flex h-8 items-center gap-1 rounded-full bg-[var(--v2-primary)] px-3 text-xs font-semibold text-white disabled:opacity-50"
              >
                <Check className="size-3" />
                Save
              </button>
            </ActionTooltip>
          </div>
        </div>
      ) : null}
    </div>
  )
}
