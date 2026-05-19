"use client"

import { Printer, X } from "lucide-react"
import { ActionTooltip } from "@/components/v2/common/ActionTooltip"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { mockApplicants } from "@/lib/mockData"
import type { Applicant } from "@/lib/types"
import { usePinned } from "@/lib/v2/pin/usePinned"
import { initials, round1Tone, shortPosition } from "@/components/v2/views/viewUtils"

const FIELDS: Array<{ label: string; get: (item: Applicant) => string }> = [
  { label: "Position", get: item => item.position1 },
  { label: "University", get: item => item.university },
  { label: "Major", get: item => item.major },
  { label: "Year", get: item => item.yearOfStudy },
  { label: "GPA", get: item => item.gpa.toFixed(2) },
  { label: "Full time", get: item => (item.fullTime ? "Yes" : "No") },
  { label: "Experience", get: item => (item.hasExperience ? "Yes" : "No") },
  { label: "Batch", get: item => `Batch ${item.batch}` },
  { label: "Round 1", get: item => item.round1Result ?? "Not reviewed" },
  { label: "Round 2", get: item => item.round2Result ?? "None" },
]

interface CompareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CompareDialog({ open, onOpenChange }: CompareDialogProps) {
  const { ids, remove } = usePinned()
  const items = ids.map(id => mockApplicants.find(item => item.id === id)).filter(Boolean) as Applicant[]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-v2-glass-panel="strong" className="max-h-[calc(100vh-2rem)] max-w-[calc(100vw-2rem)] overflow-hidden rounded-3xl bg-card/90 p-0 backdrop-blur-xl sm:max-w-[1120px]">
        <DialogHeader className="border-b border-foreground/10 p-4 pr-12">
          <div className="flex items-start justify-between gap-3">
            <div>
              <DialogTitle>Compare Candidates</DialogTitle>
              <DialogDescription>{items.length} pinned candidates in a horizontal comparison.</DialogDescription>
            </div>
            {items.length > 0 ? (
              <ActionTooltip label="Export PDF">
                <Button type="button" onClick={() => window.print()} size="sm" className="rounded-full">
                  <Printer data-icon="inline-start" />
                  Export PDF
                </Button>
              </ActionTooltip>
            ) : null}
          </div>
        </DialogHeader>

        {items.length === 0 ? (
          <div className="p-8 text-center">
            <h2 className="text-lg font-semibold text-foreground">No pinned candidates</h2>
            <p className="mt-2 text-sm text-muted-foreground">Pin candidates from the table or pipeline view to compare them here.</p>
          </div>
        ) : (
          <div className="max-h-[calc(100vh-9rem)] overflow-auto">
            <table className="w-max min-w-full">
              <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur">
                <tr className="border-b border-foreground/10">
                  <th className="sticky left-0 z-20 w-36 bg-card/95 px-4 py-4 text-left text-xs font-semibold tracking-widest text-muted-foreground uppercase backdrop-blur">
                    Field
                  </th>
                  {items.map(item => (
                    <th key={item.id} className="min-w-[220px] px-4 py-4 text-left align-top">
                      <div className="flex items-start gap-2">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                          {initials(item.name)}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-foreground">{item.name}</span>
                          <span className="block truncate text-xs text-muted-foreground">{shortPosition(item.position1)}</span>
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => remove(item.id)}
                          aria-label={`Remove ${item.name}`}
                          className="ml-auto rounded-full text-muted-foreground"
                        >
                          <X />
                        </Button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FIELDS.map(field => {
                  const values = items.map(field.get)
                  const different = new Set(values).size > 1
                  return (
                    <tr key={field.label} className="border-b border-foreground/5 last:border-0">
                      <td className="sticky left-0 bg-card/95 px-4 py-3 text-xs font-semibold text-muted-foreground backdrop-blur">{field.label}</td>
                      {items.map(item => (
                        <td
                          key={item.id}
                          className={`min-w-[220px] px-4 py-3 text-sm text-foreground ${different ? "bg-primary/5" : ""}`}
                        >
                          {field.label === "Round 1" ? (
                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${round1Tone(item.round1Result)}`}>
                              {field.get(item)}
                            </span>
                          ) : (
                            field.get(item)
                          )}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
