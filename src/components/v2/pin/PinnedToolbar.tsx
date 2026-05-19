"use client"

import { useState } from "react"
import { GitCompare, X } from "lucide-react"
import { ActionTooltip } from "@/components/v2/common/ActionTooltip"
import { CompareDialog } from "@/components/v2/pin/ComparePage"
import { mockApplicants } from "@/lib/mockData"
import { usePinned } from "@/lib/v2/pin/usePinned"
import { Button } from "@/components/ui/button"

export function PinnedToolbar() {
  const [compareOpen, setCompareOpen] = useState(false)
  const { clear, ids, remove } = usePinned()

  if (ids.length === 0) return null

  const items = ids.map(id => mockApplicants.find(item => item.id === id)).filter(Boolean)

  return (
    <div
      data-v2-glass-panel="strong"
      className="border-foreground/10 bg-background/80 sticky top-[75px] z-20 border-b px-3 py-2 backdrop-blur-xl sm:px-4 lg:px-6"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">Pinned</span>
        {items.map(item =>
          item ? (
            <span
              key={item.id}
              data-v2-field=""
              className="bg-card/80 text-foreground ring-foreground/10 inline-flex h-8 items-center gap-1 rounded-full px-2 text-xs font-semibold ring-1"
            >
              {item.name}
              <Button
                variant="plain"
                size="plain"
                type="button"
                onClick={() => remove(item.id)}
                aria-label={`Remove ${item.name}`}
                className="text-muted-foreground hover:bg-foreground/5 hover:text-foreground rounded-full p-0.5"
              >
                <X className="size-3" />
              </Button>
            </span>
          ) : null
        )}
        <ActionTooltip label="Compare pinned candidates">
          <Button
            variant="plain"
            size="plain"
            type="button"
            onClick={() => setCompareOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground ml-auto flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold"
          >
            <GitCompare className="size-3.5" />
            Compare ({ids.length})
          </Button>
        </ActionTooltip>
        <ActionTooltip label="Clear pinned candidates">
          <Button
            variant="plain"
            size="plain"
            type="button"
            onClick={() => {
              if (window.confirm("Clear all pinned candidates?")) clear()
            }}
            className="border-foreground/10 text-muted-foreground hover:bg-foreground/5 h-8 rounded-full border px-3 text-xs font-semibold"
          >
            Clear
          </Button>
        </ActionTooltip>
      </div>
      <CompareDialog open={compareOpen} onOpenChange={setCompareOpen} />
    </div>
  )
}
