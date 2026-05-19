"use client"

import { useMemo, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  const [position, setPosition] = useState<string>("all")

  const visible = position === "all" ? admitted : admitted.filter(item => item.position1 === position)

  return (
    <section className="mx-auto max-w-5xl px-4 pb-12 sm:px-6">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Admitted candidates</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {visible.length} of {admitted.length} candidates cleared Round 1.
          </p>
        </div>
        <Select value={position} onValueChange={value => setPosition(value ?? "all")}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Filter by position" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All positions</SelectItem>
            {positions.map(p => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </header>

      <ul className="public-grid grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {visible.map(candidate => (
          <li
            key={candidate.id}
            className="flex flex-col items-center gap-2 rounded-2xl border border-foreground/10 bg-card p-4 text-center"
          >
            <Avatar className="size-14">
              <AvatarFallback>{getInitials(candidate.name)}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-semibold text-foreground">{candidate.name}</span>
            <span className="text-xs text-muted-foreground">{candidate.position1}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
