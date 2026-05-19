"use client"

import { useState } from "react"
import { X, Download } from "lucide-react"
import { Dialog } from "@skeletonlabs/skeleton-react"
import { Applicant } from "@/lib/types"
import { Button } from "@/components/ui/button"

const COLUMN_OPTIONS: { key: keyof Applicant; label: string; default: boolean }[] = [
  { key: "name", label: "Name", default: true },
  { key: "email", label: "Email", default: true },
  { key: "phone", label: "Phone", default: false },
  { key: "position1", label: "Position", default: true },
  { key: "university", label: "University", default: true },
  { key: "gpa", label: "GPA", default: true },
  { key: "yearOfStudy", label: "Year", default: true },
  { key: "batch", label: "Batch", default: true },
  { key: "pic", label: "PIC", default: true },
  { key: "round1Result", label: "Round 1", default: true },
  { key: "round1Notes", label: "R1 Notes", default: false },
  { key: "round2Result", label: "Round 2", default: false },
  { key: "hasExperience", label: "Has Experience", default: false },
  { key: "fullTime", label: "Full Time", default: false },
  { key: "discoveryChannel", label: "Discovery Channel", default: false },
  { key: "submittedAt", label: "Submitted At", default: false },
]

interface ExportModalProps {
  open: boolean
  onClose: () => void
  applicants: Applicant[]
  totalAll: number
}

export default function ExportModal({ open, onClose, applicants, totalAll }: ExportModalProps) {
  const [selectedCols, setSelectedCols] = useState<Set<keyof Applicant>>(new Set(COLUMN_OPTIONS.filter(c => c.default).map(c => c.key)))
  const [format, setFormat] = useState<"csv" | "json">("csv")

  if (!open) return null

  function toggleCol(key: keyof Applicant) {
    setSelectedCols(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function doExport() {
    const cols = COLUMN_OPTIONS.filter(c => selectedCols.has(c.key))
    const rows = applicants

    if (format === "csv") {
      const header = cols.map(c => c.label).join(",")
      const body = rows
        .map(row =>
          cols
            .map(c => {
              const val = row[c.key]
              const str = String(val ?? "")
              const escaped = str.replace(/"/g, '""')
              return escaped.includes(",") || escaped.includes('"') ? `"${escaped}"` : escaped
            })
            .join(",")
        )
        .join("\n")
      const blob = new Blob([`${header}\n${body}`], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `sunriser-${new Date().getFullYear()}-${Date.now()}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } else {
      const data = rows.map(row => Object.fromEntries(cols.map(c => [c.key, row[c.key]])))
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `sunriser-${new Date().getFullYear()}-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
    onClose()
  }

  return (
    <Dialog
      open={true}
      onOpenChange={isOpen => {
        if (!isOpen) onClose()
      }}
    >
      <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      <Dialog.Positioner className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Dialog.Content
          aria-label="Export applicants"
          className="w-full max-w-[460px] rounded-3xl bg-white p-5"
          style={{ boxShadow: "0 24px 64px rgba(4,23,43,0.16)" }}
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-[#1b1b1b]" style={{ fontSize: "var(--text-h2)" }}>
                Export Data
              </h2>
              <p className="mt-0.5 text-xs text-[#767676]">
                Exporting <strong className="text-[#8d1600]">{applicants.length}</strong> rows
                {applicants.length < totalAll && ` (filtered from ${totalAll})`}
              </p>
            </div>
            <Button
              variant="plain"
              size="plain"
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-full text-[#767676] transition-colors hover:bg-[#f9f9f9]"
            >
              <X size={14} />
            </Button>
          </div>

          {/* Format */}
          <div className="mb-4">
            <p className="mb-2 text-xs font-semibold tracking-widest text-[#6B5549] uppercase">Format</p>
            <div className="flex gap-2">
              {(["csv", "json"] as const).map(f => (
                <Button
                  variant="plain"
                  size="plain"
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`h-8 rounded-full border px-4 text-xs font-semibold tracking-wide uppercase transition-all ${format === f ? "border-[#8d1600] bg-[#8d1600] text-white" : "border-[#e5e5e5] text-[#555555] hover:bg-[#f9f9f9]"}`}
                >
                  {f}
                </Button>
              ))}
            </div>
          </div>

          {/* Columns */}
          <div className="mb-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold tracking-widest text-[#6B5549] uppercase">Columns</p>
              <div className="flex gap-2">
                <Button
                  variant="plain"
                  size="plain"
                  onClick={() => setSelectedCols(new Set(COLUMN_OPTIONS.map(c => c.key)))}
                  className="text-xs text-[#8d1600] hover:underline"
                >
                  All
                </Button>
                <Button
                  variant="plain"
                  size="plain"
                  onClick={() => setSelectedCols(new Set(COLUMN_OPTIONS.filter(c => c.default).map(c => c.key)))}
                  className="text-xs text-[#767676] hover:underline"
                >
                  Default
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {COLUMN_OPTIONS.map(col => (
                <Button
                  variant="plain"
                  size="plain"
                  key={col.key}
                  onClick={() => toggleCol(col.key)}
                  className={`h-7 rounded-full border px-3 text-xs font-semibold transition-all ${selectedCols.has(col.key) ? "border-[#1b1b1b] bg-[#1b1b1b] text-white" : "border-[#e5e5e5] text-[#555555] hover:bg-[#f9f9f9]"}`}
                >
                  {col.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="plain"
              size="plain"
              onClick={onClose}
              className="h-9 flex-1 rounded-full border border-[#e5e5e5] text-sm font-semibold text-[#555555] transition-colors hover:bg-[#f9f9f9]"
            >
              Cancel
            </Button>
            <Button
              variant="plain"
              size="plain"
              onClick={doExport}
              disabled={selectedCols.size === 0}
              className="flex h-9 flex-1 items-center justify-center gap-2 rounded-full bg-[#8d1600] text-sm font-semibold text-white transition-colors hover:bg-[#7a1200] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download size={14} /> Export {format.toUpperCase()}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog>
  )
}
