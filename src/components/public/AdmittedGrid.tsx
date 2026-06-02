"use client"

import { useMemo, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { SearchableSelect } from "@/components/ui/select"
import { mockApplicants } from "@/lib/mockData"

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map(part => part[0]?.toUpperCase())
    .join("")
}

export function AdmittedGrid() {
  const admitted = useMemo(() => mockApplicants.filter(item => item.round1Result === "Passed"), [])
  const positions = useMemo(() => Array.from(new Set(admitted.map(item => item.position1))).sort(), [admitted])
  const positionOptions = useMemo(() => [{ value: "all", label: "All positions" }, ...positions.map(p => ({ value: p, label: p }))], [positions])
  const [position, setPosition] = useState<string>("all")

  const visible = position === "all" ? admitted : admitted.filter(item => item.position1 === position)

  return (
    <section className="mx-auto max-w-5xl px-4 pb-12 sm:px-6">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-foreground text-2xl font-semibold">Admitted candidates</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {visible.length} of {admitted.length} candidates cleared Round 1.
          </p>
        </div>
        <SearchableSelect
          aria-label="Admitted position"
          value={position}
          options={positionOptions}
          onValueChange={value => setPosition(value)}
          placeholder="Filter by position"
          className="w-full sm:w-64"
        />
      </header>

      <ul className="public-grid grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {visible.map(candidate => (
          <li key={candidate.id} className="border-foreground/10 bg-card flex flex-col items-center gap-2 rounded-2xl border p-4 text-center">
            <Avatar className="size-14">
              <AvatarFallback>{getInitials(candidate.name)}</AvatarFallback>
            </Avatar>
            <span className="text-foreground text-sm font-semibold">{candidate.name}</span>
            <span className="text-muted-foreground text-xs">{candidate.position1}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
