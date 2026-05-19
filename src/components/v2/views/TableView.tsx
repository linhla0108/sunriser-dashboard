import ApplicantTable from "@/components/table/ApplicantTable"
import { PinStarButton } from "@/components/v2/pin/PinStarButton"
import type { Applicant } from "@/lib/types"

interface TableViewProps {
  data: Applicant[]
  onViewDetail?: (applicant: Applicant) => void
  onDataChange?: (applicants: Applicant[]) => void
}

export function TableView({ data, onViewDetail, onDataChange }: TableViewProps) {
  return (
    <ApplicantTable
      data={data}
      onViewDetail={onViewDetail}
      onDataChange={onDataChange}
      renderPinAction={applicant => <PinStarButton id={applicant.id} />}
    />
  )
}
