"use client"

import { useEffect } from "react"
import { nanoid } from "nanoid"
import { Download, RefreshCw, Share2, X } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { ActionTooltip } from "@/components/v2/common/ActionTooltip"
import { usePinned } from "@/lib/v2/pin/usePinned"
import { useReport } from "@/lib/v2/report/useReport"
import type { ReportSnapshot } from "@/lib/v2/report/types"
import { Button } from "@/components/ui/button"

interface ReportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SHARES_KEY = "v2.report.shares"

function writeShare(snapshot: ReportSnapshot) {
  try {
    const raw = window.localStorage.getItem(SHARES_KEY)
    const map = raw ? (JSON.parse(raw) as Record<string, ReportSnapshot>) : {}
    map[snapshot.shareId] = snapshot
    window.localStorage.setItem(SHARES_KEY, JSON.stringify(map))
  } catch {
    // best-effort persistence
  }
}

export function ReportModal({ open, onOpenChange }: ReportModalProps) {
  const { ids } = usePinned()
  const { sections, generate, regenerate, abort, pending } = useReport()

  useEffect(() => {
    if (open) void generate(ids)
    else abort()
  }, [open, ids, generate, abort])

  async function handleShare() {
    if (sections.length === 0) {
      toast("Wait for the report to finish generating first.")
      return
    }
    const shareId = nanoid(10)
    const snapshot: ReportSnapshot = {
      shareId,
      generatedAt: new Date().toISOString(),
      sections,
      sourceApplicants: ids,
    }
    writeShare(snapshot)
    const url = `${window.location.origin}/public/report/${shareId}`
    try {
      await navigator.clipboard.writeText(url)
      toast("Share link copied!", { description: url })
    } catch {
      toast("Share link ready — copy manually", { description: url })
    }
  }

  function handleDownload() {
    window.print()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        data-v2-glass-panel="strong"
        className="bg-card/90 text-foreground max-h-[85vh] w-full max-w-2xl overflow-hidden backdrop-blur-xl sm:max-w-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <DialogTitle className="font-heading text-foreground text-lg">Generated report</DialogTitle>
            <p className="text-muted-foreground mt-1 text-xs">
              {ids.length} pinned candidate{ids.length === 1 ? "" : "s"} · mock generation
            </p>
          </div>
          <div className="flex items-center gap-1">
            <ActionTooltip label="Regenerate" shortcut="R">
              <Button
                variant="plain"
                size="plain"
                type="button"
                onClick={regenerate}
                disabled={pending}
                className="text-muted-foreground hover:bg-foreground/5 hover:text-foreground flex size-8 items-center justify-center rounded-lg transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw className={`size-4 ${pending ? "animate-spin" : ""}`} />
              </Button>
            </ActionTooltip>
            <ActionTooltip label="Copy share link">
              <Button
                variant="plain"
                size="plain"
                type="button"
                onClick={handleShare}
                className="text-muted-foreground hover:bg-foreground/5 hover:text-foreground flex size-8 items-center justify-center rounded-lg transition"
              >
                <Share2 className="size-4" />
              </Button>
            </ActionTooltip>
            <ActionTooltip label="Download as PDF">
              <Button
                variant="plain"
                size="plain"
                type="button"
                onClick={handleDownload}
                className="text-muted-foreground hover:bg-foreground/5 hover:text-foreground flex size-8 items-center justify-center rounded-lg transition"
              >
                <Download className="size-4" />
              </Button>
            </ActionTooltip>
            <ActionTooltip label="Close report">
              <Button
                variant="plain"
                size="plain"
                type="button"
                onClick={() => onOpenChange(false)}
                className="text-muted-foreground hover:bg-foreground/5 hover:text-foreground flex size-8 items-center justify-center rounded-lg transition"
              >
                <X className="size-4" />
              </Button>
            </ActionTooltip>
          </div>
        </div>

        <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
          {sections.length === 0 && !pending ? <p className="text-muted-foreground py-10 text-center text-sm">No content yet.</p> : null}
          {sections.map(section => (
            <section key={section.id} data-v2-card="" className="border-foreground/10 bg-background/40 rounded-2xl border p-4">
              <h3 className="font-heading text-foreground text-sm font-semibold">{section.title}</h3>
              <p className="text-foreground/85 mt-2 text-sm whitespace-pre-line">{section.content}</p>
            </section>
          ))}
          {pending ? (
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              <span className="bg-primary size-2 animate-pulse rounded-full" />
              Generating next section…
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
