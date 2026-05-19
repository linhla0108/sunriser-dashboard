"use client"

import { useState } from "react"
import { ChevronDown, Search, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const POSITIONS = [
  "AI Engineering Intern",
  "Data Analysis Intern",
  "Game Design Intern",
  "Unity Development Intern",
  "Game User Acquisition Intern",
  "Human Resources Intern",
  "Game Quality Assurance Intern",
]

const RESULTS = ["Passed", "Failed", "Waiting list"]

interface CandidateFiltersBarProps {
  search: string
  positionFilter: string
  batchFilter: string
  resultFilter: string
  hasFilters: boolean
  total: number
  filteredCount: number
  onSearchChange: (v: string) => void
  onPositionChange: (v: string) => void
  onBatchChange: (v: string) => void
  onResultChange: (v: string) => void
  onClearAll: () => void
}

export function CandidateFiltersBar({
  search,
  positionFilter,
  batchFilter,
  resultFilter,
  hasFilters,
  total,
  filteredCount,
  onSearchChange,
  onPositionChange,
  onBatchChange,
  onResultChange,
  onClearAll,
}: CandidateFiltersBarProps) {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const activeCount = [positionFilter, batchFilter, resultFilter].filter(Boolean).length

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs min-w-[180px] flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-3.5 -translate-y-1/2" />
          <Input
            data-v2-field=""
            data-cid="table-search"
            type="text"
            placeholder="Search name, email, position..."
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            className="border-border text-foreground placeholder:text-muted-foreground focus-visible:border-primary h-9 rounded-2xl bg-white/80 pr-4 pl-9 text-sm backdrop-blur"
          />
        </div>

        <div className="relative hidden sm:block">
          <Select value={positionFilter || "all"} onValueChange={v => onPositionChange(v === "all" ? "" : (v ?? ""))}>
            <SelectTrigger
              data-v2-field=""
              className="text-muted-foreground focus-visible:border-primary h-9 w-[180px] rounded-2xl bg-white/80 backdrop-blur"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Positions</SelectItem>
              {POSITIONS.map(p => (
                <SelectItem key={p} value={p}>
                  {p.replace(" Intern", "")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="relative hidden sm:block">
          <Select value={batchFilter || "all"} onValueChange={v => onBatchChange(v === "all" ? "" : (v ?? ""))}>
            <SelectTrigger
              data-v2-field=""
              className="text-muted-foreground focus-visible:border-primary h-9 w-[132px] rounded-2xl bg-white/80 backdrop-blur"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Batches</SelectItem>
              <SelectItem value="1">Batch 1</SelectItem>
              <SelectItem value="2">Batch 2</SelectItem>
              <SelectItem value="3">Batch 3</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative hidden sm:block">
          <Select value={resultFilter || "all"} onValueChange={v => onResultChange(v === "all" ? "" : (v ?? ""))}>
            <SelectTrigger
              data-v2-field=""
              className="text-muted-foreground focus-visible:border-primary h-9 w-[132px] rounded-2xl bg-white/80 backdrop-blur"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Results</SelectItem>
              {RESULTS.map(r => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => setMobileFilterOpen(true)}
          data-v2-field=""
          className="text-muted-foreground h-9 rounded-2xl bg-white/80 backdrop-blur sm:hidden"
        >
          <SlidersHorizontal data-icon="inline-start" />
          {activeCount > 0 && (
            <span className="bg-primary text-primary-foreground flex size-4 items-center justify-center rounded-full text-[9px] font-bold">
              {activeCount}
            </span>
          )}
        </Button>

        <span className="text-muted-foreground ml-auto text-xs font-medium">
          {filteredCount} of {total}
        </span>
      </div>

      {mobileFilterOpen && (
        <>
          <Button
            type="button"
            variant="plain"
            size="plain"
            aria-label="Close filters"
            className="fixed inset-0 z-40 bg-black/20 sm:hidden"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div
            data-v2-glass-panel="strong"
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-white/90 p-5 backdrop-blur-xl sm:hidden"
            style={{ boxShadow: "0 -8px 32px rgba(4,23,43,0.12)" }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-foreground font-bold" style={{ fontSize: "var(--text-h2)" }}>
                Filters
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setMobileFilterOpen(false)}
                className="text-muted-foreground rounded-full"
              >
                <ChevronDown />
              </Button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-muted-foreground mb-1.5 text-xs font-semibold tracking-widest uppercase">Position</p>
                <Select value={positionFilter || "all"} onValueChange={v => onPositionChange(v === "all" ? "" : (v ?? ""))}>
                  <SelectTrigger
                    data-v2-field=""
                    className="text-muted-foreground focus-visible:border-primary h-10 w-full rounded-2xl bg-white/80 backdrop-blur"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Positions</SelectItem>
                    {POSITIONS.map(p => (
                      <SelectItem key={p} value={p}>
                        {p.replace(" Intern", "")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-muted-foreground mb-1.5 text-xs font-semibold tracking-widest uppercase">Batch</p>
                <Select value={batchFilter || "all"} onValueChange={v => onBatchChange(v === "all" ? "" : (v ?? ""))}>
                  <SelectTrigger
                    data-v2-field=""
                    className="text-muted-foreground focus-visible:border-primary h-10 w-full rounded-2xl bg-white/80 backdrop-blur"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Batches</SelectItem>
                    <SelectItem value="1">Batch 1</SelectItem>
                    <SelectItem value="2">Batch 2</SelectItem>
                    <SelectItem value="3">Batch 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-muted-foreground mb-1.5 text-xs font-semibold tracking-widest uppercase">Round 1 Result</p>
                <Select value={resultFilter || "all"} onValueChange={v => onResultChange(v === "all" ? "" : (v ?? ""))}>
                  <SelectTrigger
                    data-v2-field=""
                    className="text-muted-foreground focus-visible:border-primary h-10 w-full rounded-2xl bg-white/80 backdrop-blur"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Results</SelectItem>
                    {RESULTS.map(r => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onClearAll()
                  setMobileFilterOpen(false)
                }}
                className="text-muted-foreground h-10 flex-1 rounded-full"
              >
                Clear
              </Button>
              <Button type="button" onClick={() => setMobileFilterOpen(false)} className="h-10 flex-1 rounded-full">
                Apply
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
