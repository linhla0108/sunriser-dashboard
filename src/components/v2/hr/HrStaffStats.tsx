"use client"

interface Props {
  total: number
  active: number
  inactive: number
}

export function HrStaffStats({ total, active, inactive }: Props) {
  return (
    <div className="mb-4 grid grid-cols-3 gap-3">
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total Staff</p>
        <p className="mt-1 text-2xl font-bold text-foreground">{total}</p>
      </div>
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Active</p>
        <p className="mt-1 text-2xl font-bold text-primary">{active}</p>
      </div>
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Inactive</p>
        <p className="mt-1 text-2xl font-bold text-muted-foreground">{inactive}</p>
      </div>
    </div>
  )
}
