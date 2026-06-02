"use client"

interface Props {
  total: number
  active: number
  inactive: number
}

export function HrStaffStats({ total, active, inactive }: Props) {
  return (
    <div className="mb-4 grid grid-cols-3 gap-3">
      <div className="border-border bg-card rounded-2xl border p-4">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">Total Staff</p>
        <p className="text-foreground mt-1 text-2xl font-bold">{total}</p>
      </div>
      <div className="border-border bg-card rounded-2xl border p-4">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">Active</p>
        <p className="text-primary mt-1 text-2xl font-bold">{active}</p>
      </div>
      <div className="border-border bg-card rounded-2xl border p-4">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">Inactive</p>
        <p className="text-muted-foreground mt-1 text-2xl font-bold">{inactive}</p>
      </div>
    </div>
  )
}
