"use client"

import { useState } from "react"
import { X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const BATCH_OPTIONS = [1, 2, 3] as const
const PIC_OPTIONS = ["Quỳnh", "Nhiên", "Yến", "Minh", "Huy", "Linh"] as const

const BATCH_DOT: Record<number, string> = {
  1: "border-sky-300 bg-sky-100",
  2: "border-violet-300 bg-violet-100",
  3: "border-orange-300 bg-orange-100",
}

type Step = "menu" | "batch" | "pic" | "delete"

interface BulkActionBarProps {
  selectedCount: number
  onClear: () => void
  onBulkBatch: (batch: number) => void
  onBulkPic: (pic: string) => void
  onBulkDelete: () => void
}

export function BulkActionBar({ selectedCount, onClear, onBulkBatch, onBulkPic, onBulkDelete }: BulkActionBarProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>("menu")
  const [pendingBatch, setPendingBatch] = useState<number | null>(null)
  const [pendingPic, setPendingPic] = useState<string | null>(null)

  function resetPopover() {
    setStep("menu")
    setPendingBatch(null)
    setPendingPic(null)
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) resetPopover()
  }

  function confirmBatch() {
    if (pendingBatch == null) return
    onBulkBatch(pendingBatch)
    setOpen(false)
    resetPopover()
  }

  function confirmPic() {
    if (!pendingPic) return
    onBulkPic(pendingPic)
    setOpen(false)
    resetPopover()
  }

  function confirmDelete() {
    onBulkDelete()
    setOpen(false)
    resetPopover()
  }

  if (selectedCount === 0) return null

  return (
    <div
      data-cid="bulk-action-bar"
      className="mb-3 flex items-center gap-3 rounded-3xl bg-white px-4 py-2.5"
      style={{ boxShadow: "rgba(4, 23, 43, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.08) 0px 4px 6px -1px" }}
    >
      <span className="text-sm text-[#555555]">
        <span className="font-semibold text-[#FF5533]">{selectedCount}</span> selected
      </span>

      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger className="border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground inline-flex h-7 cursor-pointer items-center gap-1 rounded-full border px-3 text-xs font-medium shadow-sm transition-colors">
          Actions <ChevronDown className="size-3" />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-52 p-1.5">
          {step === "menu" && (
            <>
              <button type="button" onClick={() => setStep("batch")} className="hover:bg-muted w-full rounded-xl px-3 py-1.5 text-left text-sm">
                Set Batch
              </button>
              <button type="button" onClick={() => setStep("pic")} className="hover:bg-muted w-full rounded-xl px-3 py-1.5 text-left text-sm">
                Assign PIC
              </button>
              <div className="bg-border my-1 h-px" />
              <button
                type="button"
                onClick={() => setStep("delete")}
                className="hover:bg-muted w-full rounded-xl px-3 py-1.5 text-left text-sm text-red-600"
              >
                Delete selected
              </button>
            </>
          )}

          {step === "batch" && (
            <div className="space-y-2">
              <p className="px-1 text-xs font-semibold text-[#555555]">Set batch for {selectedCount} candidates</p>
              <div className="space-y-0.5">
                {BATCH_OPTIONS.map(b => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setPendingBatch(b)}
                    className={`hover:bg-muted flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-left text-sm ${pendingBatch === b ? "bg-muted font-semibold" : ""}`}
                  >
                    <span className={`inline-block size-2 rounded-full border ${BATCH_DOT[b]}`} />
                    Batch {b}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 flex-1 rounded-full text-xs"
                  onClick={() => {
                    setStep("menu")
                    setPendingBatch(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-7 flex-1 rounded-full bg-[#FF5533] text-xs text-white hover:bg-[#E63D1F]"
                  disabled={pendingBatch == null}
                  onClick={confirmBatch}
                >
                  Apply
                </Button>
              </div>
            </div>
          )}

          {step === "pic" && (
            <div className="space-y-2">
              <p className="px-1 text-xs font-semibold text-[#555555]">Assign PIC for {selectedCount} candidates</p>
              <div className="space-y-0.5">
                {PIC_OPTIONS.map(pic => (
                  <button
                    key={pic}
                    type="button"
                    onClick={() => setPendingPic(pic)}
                    className={`hover:bg-muted w-full rounded-xl px-3 py-1.5 text-left text-sm ${pendingPic === pic ? "bg-muted font-semibold" : ""}`}
                  >
                    {pic}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 flex-1 rounded-full text-xs"
                  onClick={() => {
                    setStep("menu")
                    setPendingPic(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-7 flex-1 rounded-full bg-[#FF5533] text-xs text-white hover:bg-[#E63D1F]"
                  disabled={!pendingPic}
                  onClick={confirmPic}
                >
                  Apply
                </Button>
              </div>
            </div>
          )}

          {step === "delete" && (
            <div className="space-y-3 px-1 py-1">
              <p className="text-sm text-[#1b1b1b]">
                Delete <span className="font-semibold">{selectedCount}</span> candidates from this list?
              </p>
              <p className="text-xs text-[#767676]">This removes them from the local view only.</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="h-7 flex-1 rounded-full text-xs" onClick={() => setStep("menu")}>
                  Cancel
                </Button>
                <Button size="sm" className="h-7 flex-1 rounded-full bg-red-600 text-xs text-white hover:bg-red-700" onClick={confirmDelete}>
                  Delete
                </Button>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>

      <Button
        variant="ghost"
        size="sm"
        onClick={onClear}
        aria-label="Clear selection"
        className="ml-auto h-7 rounded-full px-3 text-xs text-[#767676] hover:text-[#1b1b1b]"
      >
        <X className="mr-1 size-3" /> Clear
      </Button>
    </div>
  )
}
