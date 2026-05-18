"use client"

import { Star } from "lucide-react"
import { ActionTooltip } from "@/components/v2/common/ActionTooltip"
import { usePinned } from "@/lib/v2/pin/usePinned"

export function PinStarButton({ id }: { id: string }) {
  const { add, has, isFull, remove } = usePinned()
  const pinned = has(id)
  const disabled = !pinned && isFull
  const label = pinned ? "Unpin candidate" : disabled ? "Limit 5 pinned candidates" : "Pin to compare"

  return (
    <ActionTooltip label={label} shortcut="P">
      <button
        type="button"
        disabled={disabled}
        onClick={event => {
          event.stopPropagation()
          if (pinned) remove(id)
          else add(id)
        }}
        className="flex size-8 items-center justify-center rounded-full text-[var(--v2-muted)] transition-colors hover:bg-[var(--v2-ink)]/5 hover:text-[var(--v2-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--v2-primary)] disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={label}
        aria-pressed={pinned}
      >
        <Star className={`size-4 ${pinned ? "fill-[var(--v2-primary)] text-[var(--v2-primary)]" : ""}`} />
      </button>
    </ActionTooltip>
  )
}
