"use client"

import { useCallback, useMemo, useState } from "react"
import { ChevronDown, Search, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SearchableSelect, type SearchableSelectOption } from "@/components/ui/select"
import type { Applicant } from "@/lib/types"

const BATCH_OPTIONS = [1, 2, 3] as const
const PIC_OPTIONS = ["Quỳnh", "Nhiên", "Yến", "Minh", "Huy", "Linh"] as const

const BATCH_DOT: Record<number, string> = {
  1: "border-sky-300 bg-sky-100",
  2: "border-violet-300 bg-violet-100",
  3: "border-orange-300 bg-orange-100",
}

type BulkStep = "menu" | "batch" | "pic" | "delete"

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
  applicants?: Applicant[]
  hasFilters: boolean
  total: number
  filteredCount: number
  onSearchChange: (v: string) => void
  onPositionChange: (v: string) => void
  onBatchChange: (v: string) => void
  onResultChange: (v: string) => void
  onClearAll: () => void
  // Bulk action props — when selectedCount > 0, renders one compact action trigger in the filter row
  selectedCount?: number
  onBulkClear?: () => void
  onBulkBatch?: (batch: number) => void
  onBulkPic?: (pic: string) => void
  onBulkDelete?: () => void
}

export function CandidateFiltersBar({
  search,
  positionFilter,
  batchFilter,
  resultFilter,
  applicants = [],
  hasFilters,
  total,
  filteredCount,
  onSearchChange,
  onPositionChange,
  onBatchChange,
  onResultChange,
  onClearAll,
  selectedCount = 0,
  onBulkClear,
  onBulkBatch,
  onBulkPic,
  onBulkDelete,
}: CandidateFiltersBarProps) {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [bulkStep, setBulkStep] = useState<BulkStep>("menu")
  const [pendingBatch, setPendingBatch] = useState<number | null>(null)
  const [pendingPic, setPendingPic] = useState<string | null>(null)

  function resetBulkPopover() {
    setBulkStep("menu")
    setPendingBatch(null)
    setPendingPic(null)
  }

  function handleBulkOpenChange(next: boolean) {
    setBulkOpen(next)
    if (!next) resetBulkPopover()
  }

  function confirmBatch() {
    if (pendingBatch == null) return
    onBulkBatch?.(pendingBatch)
    setBulkOpen(false)
    resetBulkPopover()
  }

  function confirmPic() {
    if (!pendingPic) return
    onBulkPic?.(pendingPic)
    setBulkOpen(false)
    resetBulkPopover()
  }

  function confirmDelete() {
    onBulkDelete?.()
    setBulkOpen(false)
    resetBulkPopover()
  }

  function clearBulkSelection() {
    onBulkClear?.()
    setBulkOpen(false)
    resetBulkPopover()
  }

  const activeCount = [positionFilter, batchFilter, resultFilter].filter(Boolean).length
  const positionLabel = positionFilter ? positionFilter.replace(" Intern", "") : "All Positions"
  const batchLabel = batchFilter ? `Batch ${batchFilter}` : "All Batches"
  const resultLabel = resultFilter || "All Results"

  const matchesSearch = useCallback(
    (applicant: Applicant) => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        applicant.name.toLowerCase().includes(q) ||
        applicant.email.toLowerCase().includes(q) ||
        applicant.position1.toLowerCase().includes(q) ||
        applicant.university.toLowerCase().includes(q)
      )
    },
    [search]
  )

  const positionOptions = useMemo<SearchableSelectOption[]>(() => {
    return [
      { value: "all", label: "All Positions", searchText: "all positions" },
      ...POSITIONS.map(position => ({
        value: position,
        label: position.replace(" Intern", ""),
        searchText: position,
        disabled:
          applicants.length > 0 &&
          !applicants.some(
            applicant =>
              matchesSearch(applicant) &&
              applicant.position1 === position &&
              (!batchFilter || applicant.batch === Number(batchFilter)) &&
              (!resultFilter || applicant.round1Result === resultFilter)
          ),
      })),
    ]
  }, [applicants, batchFilter, matchesSearch, resultFilter])

  const batchOptions = useMemo<SearchableSelectOption[]>(() => {
    return [
      { value: "all", label: "All Batches", searchText: "all batches" },
      ...[1, 2, 3].map(batch => ({
        value: String(batch),
        label: `Batch ${batch}`,
        disabled:
          applicants.length > 0 &&
          !applicants.some(
            applicant =>
              matchesSearch(applicant) &&
              applicant.batch === batch &&
              (!positionFilter || applicant.position1 === positionFilter) &&
              (!resultFilter || applicant.round1Result === resultFilter)
          ),
      })),
    ]
  }, [applicants, matchesSearch, positionFilter, resultFilter])

  const resultOptions = useMemo<SearchableSelectOption[]>(() => {
    return [
      { value: "all", label: "All Results", searchText: "all results" },
      ...RESULTS.map(result => ({
        value: result,
        label: result,
        disabled:
          applicants.length > 0 &&
          !applicants.some(
            applicant =>
              matchesSearch(applicant) &&
              applicant.round1Result === result &&
              (!positionFilter || applicant.position1 === positionFilter) &&
              (!batchFilter || applicant.batch === Number(batchFilter))
          ),
      })),
    ]
  }, [applicants, batchFilter, matchesSearch, positionFilter])

  const bulkActions =
    selectedCount > 0 ? (
      <div data-cid="bulk-action-bar" className="order-last flex w-full sm:order-none sm:ml-auto sm:w-auto">
        <Popover open={bulkOpen} onOpenChange={handleBulkOpenChange}>
          <PopoverTrigger className="inline-flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-2xl border border-[#FF5533] bg-[#FF5533] px-3 text-xs font-semibold text-white shadow-sm transition-colors hover:border-[#E63D1F] hover:bg-[#E63D1F] sm:h-7 sm:w-auto sm:rounded-full">
            {selectedCount} selected <ChevronDown className="size-3" />
          </PopoverTrigger>
          <PopoverContent align="start" className="w-52 p-1.5">
            {bulkStep === "menu" && (
              <>
                <button type="button" onClick={() => setBulkStep("batch")} className="hover:bg-muted w-full rounded-xl px-3 py-1.5 text-left text-sm">
                  Set Batch
                </button>
                <button type="button" onClick={() => setBulkStep("pic")} className="hover:bg-muted w-full rounded-xl px-3 py-1.5 text-left text-sm">
                  Assign PIC
                </button>
                <div className="bg-border my-1 h-px" />
                <button
                  type="button"
                  onClick={clearBulkSelection}
                  className="hover:bg-muted w-full rounded-xl px-3 py-1.5 text-left text-sm"
                >
                  Clear selection
                </button>
                <button
                  type="button"
                  onClick={() => setBulkStep("delete")}
                  className="hover:bg-muted w-full rounded-xl px-3 py-1.5 text-left text-sm text-red-600"
                >
                  Delete selected
                </button>
              </>
            )}
            {bulkStep === "batch" && (
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
                      setBulkStep("menu")
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
            {bulkStep === "pic" && (
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
                      setBulkStep("menu")
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
            {bulkStep === "delete" && (
              <div className="space-y-3 px-1 py-1">
                <p className="text-sm text-[#1b1b1b]">
                  Delete <span className="font-semibold">{selectedCount}</span> candidates from this list?
                </p>
                <p className="text-xs text-[#767676]">This removes them from the local view only.</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-7 flex-1 rounded-full text-xs" onClick={() => setBulkStep("menu")}>
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
      </div>
    ) : null

  return (
    <>
      <div className="border-border mb-3 flex flex-wrap items-center gap-2 rounded-2xl border bg-white/80 p-3 shadow-sm backdrop-blur">
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
          <SearchableSelect
            aria-label="Position"
            value={positionFilter || "all"}
            options={positionOptions}
            onValueChange={v => onPositionChange(v === "all" ? "" : v)}
            placeholder={positionLabel}
            className="text-muted-foreground focus-visible:border-primary h-9 w-[180px] rounded-2xl bg-white/80 backdrop-blur"
          />
        </div>

        <div className="relative hidden sm:block">
          <SearchableSelect
            aria-label="Batch"
            value={batchFilter || "all"}
            options={batchOptions}
            onValueChange={v => onBatchChange(v === "all" ? "" : v)}
            placeholder={batchLabel}
            className="text-muted-foreground focus-visible:border-primary h-9 w-[132px] rounded-2xl bg-white/80 backdrop-blur"
          />
        </div>

        <div className="relative hidden sm:block">
          <SearchableSelect
            aria-label="Result"
            value={resultFilter || "all"}
            options={resultOptions}
            onValueChange={v => onResultChange(v === "all" ? "" : v)}
            placeholder={resultLabel}
            className="text-muted-foreground focus-visible:border-primary h-9 w-[132px] rounded-2xl bg-white/80 backdrop-blur"
          />
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

        {hasFilters ? (
          <Button
            type="button"
            variant="ghost"
            onClick={onClearAll}
            className="text-muted-foreground hidden h-9 rounded-full px-3 text-xs font-semibold sm:inline-flex"
          >
            Clear filter
          </Button>
        ) : null}

        {bulkActions ?? (
          <span className="text-muted-foreground ml-auto text-xs font-medium">
            {filteredCount} of {total}
          </span>
        )}
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
                <SearchableSelect
                  aria-label="Position"
                  value={positionFilter || "all"}
                  options={positionOptions}
                  onValueChange={v => onPositionChange(v === "all" ? "" : v)}
                  placeholder={positionLabel}
                  className="text-muted-foreground focus-visible:border-primary h-10 w-full rounded-2xl bg-white/80 backdrop-blur"
                />
              </div>
              <div>
                <p className="text-muted-foreground mb-1.5 text-xs font-semibold tracking-widest uppercase">Batch</p>
                <SearchableSelect
                  aria-label="Batch"
                  value={batchFilter || "all"}
                  options={batchOptions}
                  onValueChange={v => onBatchChange(v === "all" ? "" : v)}
                  placeholder={batchLabel}
                  className="text-muted-foreground focus-visible:border-primary h-10 w-full rounded-2xl bg-white/80 backdrop-blur"
                />
              </div>
              <div>
                <p className="text-muted-foreground mb-1.5 text-xs font-semibold tracking-widest uppercase">Round 1 Result</p>
                <SearchableSelect
                  aria-label="Result"
                  value={resultFilter || "all"}
                  options={resultOptions}
                  onValueChange={v => onResultChange(v === "all" ? "" : v)}
                  placeholder={resultLabel}
                  className="text-muted-foreground focus-visible:border-primary h-10 w-full rounded-2xl bg-white/80 backdrop-blur"
                />
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
