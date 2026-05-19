"use client"

import { Star } from "lucide-react"
import { ActionTooltip } from "@/components/v2/common/ActionTooltip"
import { usePinned } from "@/lib/v2/pin/usePinned"
import { Button } from "@/components/ui/button"

export function PinStarButton({ id }: { id: string }) {
  const { add, has, remove } = usePinned()
  const pinned = has(id)
  const label = pinned ? "Unpin candidate" : "Pin to compare"

  return (
    <ActionTooltip label={label} shortcut="P">
      <Button
        variant="plain"
        size="plain"
        type="button"
        onClick={event => {
          event.stopPropagation()
          if (pinned) remove(id)
          else add(id)
        }}
        className="text-muted-foreground hover:bg-foreground/5 hover:text-primary focus-visible:outline-primary flex size-8 items-center justify-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={label}
        aria-pressed={pinned}
      >
        <Star className={`size-4 ${pinned ? "fill-primary text-primary" : ""}`} />
      </Button>
    </ActionTooltip>
  )
}
