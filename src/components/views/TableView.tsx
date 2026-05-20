import ApplicantTable, { type PaginationInfo } from "@/components/table/ApplicantTable"
import { PinStarButton } from "@/components/pin/PinStarButton"
import type { Applicant } from "@/lib/types"

interface TableViewProps {
  data: Applicant[]
  onViewDetail?: (applicant: Applicant) => void
  onDataChange?: (applicants: Applicant[]) => void
  indexOffset?: number
  paginationInfo?: PaginationInfo
}

export function TableView({ data, onViewDetail, onDataChange, indexOffset, paginationInfo }: TableViewProps) {
  return (
    <ApplicantTable
      data={data}
      onViewDetail={onViewDetail}
      onDataChange={onDataChange}
      renderPinAction={applicant => <PinStarButton id={applicant.id} />}
      indexOffset={indexOffset}
      paginationInfo={paginationInfo}
    />
  )
}
