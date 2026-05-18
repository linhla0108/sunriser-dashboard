"use client"

import { useRouter } from "next/navigation"
import { GitCompare, X } from "lucide-react"
import { ActionTooltip } from "@/components/v2/common/ActionTooltip"
import { mockApplicants } from "@/lib/mockData"
import { usePinned } from "@/lib/v2/pin/usePinned"

export function PinnedToolbar() {
  const router = useRouter()
  const { clear, ids, remove } = usePinned()

  if (ids.length === 0) return null

  const items = ids.map(id => mockApplicants.find(item => item.id === id)).filter(Boolean)

  return (
    <div className="sticky top-[69px] z-20 border-b border-[var(--v2-ink)]/10 bg-[var(--v2-bg)]/95 px-3 py-2 backdrop-blur sm:px-4 lg:px-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold tracking-widest text-[var(--v2-muted)] uppercase">Pinned</span>
        {items.map(item =>
          item ? (
            <span
              key={item.id}
              className="inline-flex h-8 items-center gap-1 rounded-full bg-[var(--v2-surface)] px-2 text-xs font-semibold text-[var(--v2-ink)] ring-1 ring-[var(--v2-ink)]/10"
            >
              {item.name}
              <button
                type="button"
                onClick={() => remove(item.id)}
                aria-label={`Remove ${item.name}`}
                className="rounded-full p-0.5 text-[var(--v2-muted)] hover:bg-[var(--v2-ink)]/5 hover:text-[var(--v2-ink)]"
              >
                <X className="size-3" />
              </button>
            </span>
          ) : null
        )}
        <ActionTooltip label="Compare pinned candidates">
          <button
            type="button"
            onClick={() => router.push("/v2/compare")}
            className="ml-auto flex h-8 items-center gap-1.5 rounded-full bg-[var(--v2-primary)] px-3 text-xs font-semibold text-white hover:bg-[var(--v2-primary-hover)]"
          >
            <GitCompare className="size-3.5" />
            Compare ({ids.length})
          </button>
        </ActionTooltip>
        <ActionTooltip label="Clear pinned candidates">
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Clear all pinned candidates?")) clear()
            }}
            className="h-8 rounded-full border border-[var(--v2-ink)]/10 px-3 text-xs font-semibold text-[var(--v2-muted)] hover:bg-[var(--v2-ink)]/5"
          >
            Clear
          </button>
        </ActionTooltip>
      </div>
    </div>
  )
}
