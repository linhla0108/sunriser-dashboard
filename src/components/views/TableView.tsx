import ApplicantTable, { type PaginationInfo } from "@/components/table/ApplicantTable"
import { PinStarButton } from "@/components/pin/PinStarButton"
import type { CandidateSortState } from "@/lib/candidates/candidateUrlState"
import type { Applicant } from "@/lib/types"

interface TableViewProps {
  data: Applicant[]
  selectedData?: Applicant[]
  onViewDetail?: (applicant: Applicant) => void
  onDataChange?: (applicants: Applicant[]) => void
  indexOffset?: number
  paginationInfo?: PaginationInfo
  searchQuery?: string
  sortState?: CandidateSortState
  onSortChange?: (sortState: CandidateSortState) => void
  selectedIds?: Set<string>
  onToggleSelect?: (id: string) => void
  selectedSectionOpen?: boolean
  onSelectedSectionOpenChange?: (open: boolean) => void
  onBulkBatch?: (batch: number) => void
  onBulkPic?: (pic: string) => void
  onBulkRound1?: (result: string) => void
  onBulkRound2?: (result: string) => void
  onBulkDelete?: () => void
}

export function TableView({
  data,
  selectedData,
  onViewDetail,
  onDataChange,
  indexOffset,
  paginationInfo,
  searchQuery,
  sortState,
  onSortChange,
  selectedIds,
  onToggleSelect,
  selectedSectionOpen,
  onSelectedSectionOpenChange,
  onBulkBatch,
  onBulkPic,
  onBulkRound1,
  onBulkRound2,
  onBulkDelete,
}: TableViewProps) {
  return (
    <ApplicantTable
      data={data}
      selectedData={selectedData}
      onViewDetail={onViewDetail}
      onDataChange={onDataChange}
      renderPinAction={applicant => <PinStarButton id={applicant.id} />}
      indexOffset={indexOffset}
      paginationInfo={paginationInfo}
      searchQuery={searchQuery}
      sortState={sortState}
      onSortChange={onSortChange}
      selectedIds={selectedIds}
      onToggleSelect={onToggleSelect}
      selectedSectionOpen={selectedSectionOpen}
      onSelectedSectionOpenChange={onSelectedSectionOpenChange}
      onBulkBatch={onBulkBatch}
      onBulkPic={onBulkPic}
      onBulkRound1={onBulkRound1}
      onBulkRound2={onBulkRound2}
      onBulkDelete={onBulkDelete}
    />
  )
}
