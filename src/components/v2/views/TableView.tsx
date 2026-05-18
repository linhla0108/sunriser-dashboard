import ApplicantTable from "@/components/table/ApplicantTable"
import { PinStarButton } from "@/components/v2/pin/PinStarButton"
import type { Applicant } from "@/lib/types"

interface TableViewProps {
  data: Applicant[]
  onViewDetail?: (applicant: Applicant) => void
}

export function TableView({ data, onViewDetail }: TableViewProps) {
  return <ApplicantTable data={data} onViewDetail={onViewDetail} renderPinAction={applicant => <PinStarButton id={applicant.id} />} />
}
