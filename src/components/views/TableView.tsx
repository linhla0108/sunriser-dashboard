import ApplicantTable, { type PaginationInfo } from "@/components/table/ApplicantTable"
import { PinStarButton } from "@/components/pin/PinStarButton"
import type { CandidateSortState } from "@/lib/candidates/candidateUrlState"
import type { Applicant } from "@/lib/types"

interface TableViewProps {
  data: Applicant[]
  onViewDetail?: (applicant: Applicant) => void
  onDataChange?: (applicants: Applicant[]) => void
  indexOffset?: number
  paginationInfo?: PaginationInfo
  searchQuery?: string
  sortState?: CandidateSortState
  onSortChange?: (sortState: CandidateSortState) => void
}

export function TableView({ data, onViewDetail, onDataChange, indexOffset, paginationInfo, searchQuery, sortState, onSortChange }: TableViewProps) {
  return (
    <ApplicantTable
      data={data}
      onViewDetail={onViewDetail}
      onDataChange={onDataChange}
      renderPinAction={applicant => <PinStarButton id={applicant.id} />}
      indexOffset={indexOffset}
      paginationInfo={paginationInfo}
      searchQuery={searchQuery}
      sortState={sortState}
      onSortChange={onSortChange}
    />
  )
}
