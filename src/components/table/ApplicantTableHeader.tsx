import { TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { CandidateSortDir, CandidateSortKey } from "@/lib/candidates/candidateUrlState"
import { SortableHeader } from "./applicantTableSort"

interface ApplicantTableHeaderProps {
  sortKey: CandidateSortKey | null
  sortDir: CandidateSortDir
  onCycleSort: (key: CandidateSortKey) => void
  onSetSort: (key: CandidateSortKey, dir: CandidateSortDir) => void
  onResetSort: () => void
}

export function ApplicantTableHeader({ sortKey, sortDir, onCycleSort, onSetSort, onResetSort }: ApplicantTableHeaderProps) {
  const sortableProps = { sortKey, sortDir, onCycleSort, onSetSort, onResetSort }

  return (
    <TableHeader className="sticky top-0 z-10 bg-white shadow-[0_1px_0_rgba(15,23,42,0.08)]">
      <TableRow className="border-border bg-white hover:bg-white">
        <TableHead className="text-muted-foreground w-11 min-w-11 px-0 py-3 text-center text-xs font-semibold tracking-wider uppercase">#</TableHead>
        <TableHead className="px-3 py-3 text-left">
          <SortableHeader label="Name" col="name" {...sortableProps} />
        </TableHead>
        <TableHead className="px-3 py-3 text-left">
          <SortableHeader label="Position" col="position" {...sortableProps} />
        </TableHead>
        <TableHead className="hidden px-3 py-3 text-left lg:table-cell">
          <SortableHeader label="University" col="university" {...sortableProps} />
        </TableHead>
        <TableHead className="hidden px-3 py-3 text-center sm:table-cell">
          <SortableHeader label="GPA" col="gpa" align="center" {...sortableProps} />
        </TableHead>
        <TableHead className="text-muted-foreground hidden px-3 py-3 text-center text-xs font-semibold tracking-wider uppercase lg:table-cell">
          Academic
        </TableHead>
        <TableHead className="text-muted-foreground hidden px-3 py-3 text-left text-xs font-semibold tracking-wider uppercase xl:table-cell">
          Description
        </TableHead>
        <TableHead className="text-muted-foreground hidden px-3 py-3 text-center text-xs font-semibold tracking-wider uppercase lg:table-cell">
          Portfolio
        </TableHead>
        <TableHead className="text-muted-foreground hidden px-3 py-3 text-left text-xs font-semibold tracking-wider uppercase xl:table-cell">
          Message
        </TableHead>
        <TableHead className="hidden px-3 py-3 text-center lg:table-cell">
          <SortableHeader label="Year" col="year" align="center" {...sortableProps} />
        </TableHead>
        <TableHead className="hidden px-3 py-3 text-center sm:table-cell">
          <SortableHeader label="Batch" col="batch" align="center" {...sortableProps} />
        </TableHead>
        <TableHead className="hidden px-3 py-3 text-center lg:table-cell">
          <SortableHeader label="PIC" col="pic" align="center" {...sortableProps} />
        </TableHead>
        <TableHead className="px-3 py-3 text-center">
          <SortableHeader label="Round 1" col="round1" align="center" {...sortableProps} />
        </TableHead>
        <TableHead className="hidden px-3 py-3 text-center sm:table-cell">
          <SortableHeader label="Round 2" col="round2" align="center" {...sortableProps} />
        </TableHead>
        <TableHead className="text-muted-foreground w-[116px] px-3 py-3 pr-4 text-xs font-semibold tracking-wider uppercase">Actions</TableHead>
      </TableRow>
    </TableHeader>
  )
}
