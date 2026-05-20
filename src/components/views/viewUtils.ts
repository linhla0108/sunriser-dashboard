import type { Applicant } from "@/lib/types"

export const ROUND_1_GROUPS = [
  { key: "not-reviewed", label: "Not Reviewed", test: (item: Applicant) => !item.round1Result },
  { key: "pass", label: "Pass", test: (item: Applicant) => item.round1Result === "Passed" },
  { key: "waiting", label: "Waiting", test: (item: Applicant) => item.round1Result === "Waiting list" },
  { key: "fail", label: "Fail", test: (item: Applicant) => item.round1Result === "Failed" },
] as const

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join("")
}

export function shortPosition(position: string) {
  return position.replace(" Intern", "").replace("Game User Acquisition", "UA")
}

export function round1Tone(result?: Applicant["round1Result"]) {
  if (result === "Passed") return "bg-emerald-50 text-emerald-700 ring-emerald-200"
  if (result === "Failed") return "bg-rose-50 text-rose-700 ring-rose-200"
  if (result === "Waiting list") return "bg-amber-50 text-amber-700 ring-amber-200"
  return "bg-foreground/5 text-muted-foreground ring-foreground/10"
}

export function groupApplicants(items: Applicant[], groupBy: "round1" | "position" | "batch") {
  if (groupBy === "round1") {
    return ROUND_1_GROUPS.map(group => ({
      key: group.key,
      label: group.label,
      /** rawKey is the full position1 value used for mutations; not needed for round1. */
      rawKey: null as string | null,
      items: items.filter(group.test),
    }))
  }

  const map = new Map<string, Applicant[]>()
  for (const item of items) {
    const key = groupBy === "position" ? shortPosition(item.position1) : `Batch ${item.batch}`
    map.set(key, [...(map.get(key) ?? []), item])
  }

  return Array.from(map, ([label, grouped]) => ({
    key: label,
    label,
    /** rawKey stores the original position1 string so updateItemColumn can restore it
     *  without having to find a sample item (which fails on empty target columns). */
    rawKey: groupBy === "position" ? (grouped[0]?.position1 ?? null) : null,
    items: grouped,
  }))
}
