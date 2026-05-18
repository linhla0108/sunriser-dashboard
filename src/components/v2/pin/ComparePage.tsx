"use client"

import { Printer, X } from "lucide-react"
import { ActionTooltip } from "@/components/v2/common/ActionTooltip"
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

export function ComparePage() {
  const { ids, remove } = usePinned()
  const items = ids
    .map(id => mockApplicants.find(item => item.id === id))
    .filter(Boolean)
    .slice(0, 5) as Applicant[]

  if (items.length === 0) {
    return (
      <div className="p-3 sm:p-4 lg:p-6">
        <div className="rounded-3xl border border-dashed border-[var(--v2-ink)]/15 bg-[var(--v2-surface)] p-8 text-center">
          <h2 className="text-lg font-semibold text-[var(--v2-ink)]">No pinned candidates</h2>
          <p className="mt-2 text-sm text-[var(--v2-muted)]">Pin candidates from the table, pipeline, or gallery view to compare them here.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 print:p-0">
      <div className="mb-4 flex items-center justify-between gap-3 print:hidden">
        <div>
          <h2 className="text-lg font-semibold text-[var(--v2-ink)]">Compare Candidates</h2>
          <p className="text-sm text-[var(--v2-muted)]">Side-by-side view for up to five pinned candidates.</p>
        </div>
        <ActionTooltip label="Export PDF">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex h-9 items-center gap-2 rounded-full bg-[var(--v2-primary)] px-3 text-sm font-semibold text-white"
          >
            <Printer className="size-4" />
            Export PDF
          </button>
        </ActionTooltip>
      </div>

      <div className="overflow-x-auto rounded-3xl bg-[var(--v2-surface)] shadow-[0_18px_44px_rgba(15,23,42,0.10)] print:shadow-none">
        <table className="w-full min-w-[760px]">
          <thead>
            <tr className="border-b border-[var(--v2-ink)]/10">
              <th className="w-36 px-4 py-4 text-left text-xs font-semibold tracking-widest text-[var(--v2-muted)] uppercase">Field</th>
              {items.map(item => (
                <th key={item.id} className="px-4 py-4 text-left align-top">
                  <div className="flex items-start gap-2">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--v2-primary)] text-sm font-bold text-white">
                      {initials(item.name)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-[var(--v2-ink)]">{item.name}</span>
                      <span className="block truncate text-xs text-[var(--v2-muted)]">{shortPosition(item.position1)}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      aria-label={`Remove ${item.name}`}
                      className="ml-auto rounded-full p-1 text-[var(--v2-muted)] hover:bg-[var(--v2-ink)]/5 print:hidden"
                    >
                      <X className="size-3.5" />
                    </button>
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
                <tr key={field.label} className="border-b border-[var(--v2-ink)]/5 last:border-0">
                  <td className="px-4 py-3 text-xs font-semibold text-[var(--v2-muted)]">{field.label}</td>
                  {items.map(item => (
                    <td key={item.id} className={`px-4 py-3 text-sm text-[var(--v2-ink)] ${different ? "bg-[var(--v2-primary)]/5" : ""}`}>
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
    </div>
  )
}
