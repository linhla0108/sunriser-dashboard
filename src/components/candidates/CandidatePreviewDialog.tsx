"use client"

import { useState, type ReactNode } from "react"
import { ExternalLink } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { BinaryPreview } from "@/components/candidates/CandidateBinaryPreview"
import { cn } from "@/lib/utils"
import { displayHost, openPreviewTarget } from "./previewDialogUtils"
import type { CandidatePreviewDialogProps } from "./previewDialogTypes"

export type { CandidatePreviewTarget } from "./previewDialogTypes"
export { DelayedTextPreview, truncatePreviewText } from "./DelayedTextPreview"

function PreviewTrigger({ triggerLabel, onClick, children }: { triggerLabel: string; onClick: () => void; children: ReactNode }) {
  const [tooltipOpen, setTooltipOpen] = useState(false)

  return (
    <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
      <TooltipTrigger
        render={
          <button
            type="button"
            onMouseDown={event => event.preventDefault()}
            onClick={event => {
              setTooltipOpen(false)
              event.currentTarget.blur()
              onClick()
            }}
            onMouseLeave={event => event.currentTarget.blur()}
            className={cn(
              "text-muted-foreground inline-flex size-7 cursor-pointer items-center justify-center rounded-full transition-colors outline-none",
              "hover:bg-foreground/5 hover:text-primary",
              tooltipOpen && "bg-foreground/5 text-primary"
            )}
            aria-label={triggerLabel}
          >
            {children}
          </button>
        }
      />
      <TooltipContent className="max-w-xs">{triggerLabel}</TooltipContent>
    </Tooltip>
  )
}

export function CandidatePreviewDialog({ title, description, targets, triggerLabel, icon: Icon }: CandidatePreviewDialogProps) {
  const [open, setOpen] = useState(false)
  const activeTarget = targets[0]

  if (targets.length === 0 || !activeTarget) {
    return <span className="text-muted-foreground text-xs">-</span>
  }

  return (
    <>
      <PreviewTrigger triggerLabel={triggerLabel} onClick={() => setOpen(true)}>
        <Icon className="size-4" />
      </PreviewTrigger>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex h-[90dvh] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] flex-col gap-3 p-4 sm:h-[90dvh] sm:w-[90vw] sm:max-w-[90vw] sm:p-5">
          <DialogHeader className="shrink-0 pr-8">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {description ?? "Preview is loaded through a restricted proxy when possible, without sending a referrer."}
            </DialogDescription>
          </DialogHeader>

          <div className="text-muted-foreground flex min-w-0 shrink-0 items-center gap-2 text-xs">
            <ExternalLink className="size-3.5 shrink-0" />
            <span className="truncate">{displayHost(activeTarget.url)}</span>
            <button
              type="button"
              onClick={() => openPreviewTarget(activeTarget.url)}
              className="text-primary ml-auto inline-flex items-center gap-1 text-xs font-medium hover:underline"
            >
              <ExternalLink className="size-3.5" />
              Open in new tab
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col">
            <BinaryPreview key={activeTarget.url} target={activeTarget} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
