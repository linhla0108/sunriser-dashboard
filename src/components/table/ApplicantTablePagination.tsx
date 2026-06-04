import { CANDIDATE_PAGE_SIZE_OPTIONS, type CandidatePageSize } from "@/lib/candidates/candidateUrlState"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface PaginationInfo {
  start: number
  end: number
  total: number
  currentPage: number
  totalPages: number
  pageSize?: CandidatePageSize
  onPageSizeChange?: (value: CandidatePageSize) => void
}

export function ApplicantTablePagination({ paginationInfo }: { paginationInfo?: PaginationInfo }) {
  if (!paginationInfo) return null

  return (
    <div className="mt-3 flex justify-end px-1">
      <div className="border-border bg-card/80 text-muted-foreground flex flex-wrap items-center justify-end gap-2 rounded-full border px-4 py-2 text-xs shadow-sm">
        {paginationInfo.pageSize !== undefined && paginationInfo.onPageSizeChange ? (
          <div className="flex items-center gap-2">
            <span>Rows per page</span>
            <Select
              value={String(paginationInfo.pageSize)}
              onValueChange={value => paginationInfo.onPageSizeChange?.(Number(value) as CandidatePageSize)}
            >
              <SelectTrigger size="sm" className="h-7 w-[68px] px-2 text-xs" aria-label="Rows per page">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CANDIDATE_PAGE_SIZE_OPTIONS.map(option => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
        <span className="bg-border h-4 w-px" aria-hidden="true" />
        <span>
          {"Page "}
          <span className="text-foreground font-medium">{paginationInfo.currentPage}</span>
          {" / "}
          <span className="text-foreground font-medium">{paginationInfo.totalPages}</span>
        </span>
      </div>
    </div>
  )
}
