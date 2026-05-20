"use client"

import { Printer, X } from "lucide-react"
import { ActionTooltip } from "@/components/common/ActionTooltip"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { mockApplicants } from "@/lib/mockData"
import type { Applicant } from "@/lib/types"
import { usePinned } from "@/lib/pin/usePinned"
import { initials, round1Tone, shortPosition } from "@/components/views/viewUtils"

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

const tableBorder = "border-[#ded1cb] dark:border-white/15"
const tableHeader = "bg-[#2b2522] text-white"
const tableHeaderMeta = "text-[#f1d7cf]"
const rowEven = "bg-[#fbf6f3] dark:bg-white/7"
const rowOdd = "bg-white dark:bg-white/3"
const rowLabelEven = "bg-[#f4ebe6] dark:bg-white/10"
const rowLabelOdd = "bg-[#fff9f6] dark:bg-white/6"
const rowLabelDifferent = "border-l-2 border-l-primary text-[#8d1600] dark:text-primary"

interface CompareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CompareDialog({ open, onOpenChange }: CompareDialogProps) {
  const { ids, remove } = usePinned()
  const items = ids.map(id => mockApplicants.find(item => item.id === id)).filter(Boolean) as Applicant[]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-v2-glass-panel="strong"
        className="bg-card/90 max-h-[calc(100vh-2rem)] max-w-[calc(100vw-2rem)] gap-0 overflow-hidden rounded-3xl p-0 backdrop-blur-xl sm:max-w-[1120px]"
      >
        <DialogHeader className="p-4 pr-12">
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
            <h2 className="text-foreground text-lg font-semibold">No pinned candidates</h2>
            <p className="text-muted-foreground mt-2 text-sm">Pin candidates from the table or pipeline view to compare them here.</p>
          </div>
        ) : (
          <div className="max-h-[calc(100vh-9rem)] overflow-auto">
            <table className="w-max min-w-full border-separate border-spacing-0">
              <thead className="sticky top-0 z-10">
                <tr>
                  <th
                    className={`${tableHeader} ${tableBorder} text-md sticky left-0 z-20 w-36 border border-l-0 px-4 py-4 text-left font-semibold tracking-widest uppercase shadow-[8px_0_16px_rgba(27,27,27,0.08)]`}
                  >
                    Candidate
                  </th>
                  {items.map(item => (
                    <th
                      key={item.id}
                      className={`${tableHeader} ${tableBorder} min-w-[220px] border-t border-r border-b px-4 py-4 text-left align-top`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="bg-primary text-primary-foreground ring-primary/35 flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ring-2">
                          {initials(item.position1)}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-white">{item.name}</span>
                          <span className={`${tableHeaderMeta} block truncate text-xs`}>{shortPosition(item.position1)}</span>
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => remove(item.id)}
                          aria-label={`Remove ${item.name}`}
                          className="ml-auto rounded-full text-white/70 hover:bg-white/10 hover:text-white"
                        >
                          <X />
                        </Button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FIELDS.map((field, idx) => {
                  const values = items.map(field.get)
                  const different = new Set(values).size > 1
                  const isEvenRow = idx % 2 === 0
                  const cellSurface = isEvenRow ? rowEven : rowOdd
                  const labelSurface = isEvenRow ? rowLabelEven : rowLabelOdd
                  return (
                    <tr key={field.label}>
                      <td
                        className={`${tableBorder} ${labelSurface} sticky left-0 z-20 border-r border-b px-4 py-3 font-semibold shadow-[8px_0_16px_rgba(27,27,27,0.05)] backdrop-blur-lg ${different ? `text-sm ${rowLabelDifferent}` : "text-muted-foreground text-xs"}`}
                      >
                        {field.label}
                      </td>
                      {items.map(item => (
                        <td
                          key={item.id}
                          className={`${tableBorder} ${cellSurface} text-foreground min-w-[220px] border-r border-b px-4 py-3 text-sm`}
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
