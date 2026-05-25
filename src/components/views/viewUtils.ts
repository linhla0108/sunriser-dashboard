import type { Applicant } from "@/lib/types"

export const ROUND_1_GROUPS = [
  { key: "not-reviewed", label: "Not Reviewed", test: (item: Applicant) => !item.round1Result },
  { key: "pass", label: "Pass", test: (item: Applicant) => item.round1Result === "Passed" },
  { key: "waiting", label: "Waiting", test: (item: Applicant) => item.round1Result === "Waiting list" },
  { key: "fail", label: "Fail", test: (item: Applicant) => item.round1Result === "Failed" },
] as const

export const ROUND_2_GROUPS = [
  { key: "not-reviewed", label: "Not Reviewed", test: (item: Applicant) => !item.round2Result },
  { key: "pass", label: "Pass", test: (item: Applicant) => item.round2Result === "Passed" },
  { key: "waiting", label: "Waiting", test: (item: Applicant) => item.round2Result === "Waiting list" },
  { key: "fail", label: "Fail", test: (item: Applicant) => item.round2Result === "Failed" },
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

export function round1Tone(result?: string) {
  if (result === "Passed") return "bg-emerald-50 text-emerald-700 ring-emerald-200"
  if (result === "Failed") return "bg-rose-50 text-rose-700 ring-rose-200"
  if (result === "Waiting list") return "bg-amber-50 text-amber-700 ring-amber-200"
  return "bg-foreground/5 text-muted-foreground ring-foreground/10"
}

export const round2Tone = round1Tone

export function getColumnTheme(columnKey: string) {
  if (columnKey === "pass")
    return {
      colBg: "bg-emerald-50",
      colBorder: "border-emerald-200",
      headerBg: "bg-emerald-100",
      headerText: "text-emerald-900 font-bold",
      countBadge: "bg-emerald-200 text-emerald-800",
      overlayBg: "bg-emerald-50/60",
      overlayBorder: "border-emerald-300/60",
      badgeBg: "bg-emerald-100/80 text-emerald-800",
      icon: "text-emerald-600",
    }
  if (columnKey === "fail")
    return {
      colBg: "bg-rose-50",
      colBorder: "border-rose-200",
      headerBg: "bg-rose-100",
      headerText: "text-rose-900 font-bold",
      countBadge: "bg-rose-200 text-rose-800",
      overlayBg: "bg-rose-50/60",
      overlayBorder: "border-rose-300/60",
      badgeBg: "bg-rose-100/80 text-rose-800",
      icon: "text-rose-600",
    }
  if (columnKey === "waiting")
    return {
      colBg: "bg-amber-50",
      colBorder: "border-amber-200",
      headerBg: "bg-amber-100",
      headerText: "text-amber-900 font-bold",
      countBadge: "bg-amber-200 text-amber-800",
      overlayBg: "bg-amber-50/60",
      overlayBorder: "border-amber-300/60",
      badgeBg: "bg-amber-100/80 text-amber-800",
      icon: "text-amber-600",
    }
  if (columnKey === "not-reviewed")
    return {
      colBg: "bg-foreground/[0.03]",
      colBorder: "border-foreground/10",
      headerBg: "bg-foreground/[0.06]",
      headerText: "text-foreground font-bold",
      countBadge: "bg-foreground/10 text-muted-foreground",
      overlayBg: "bg-foreground/5",
      overlayBorder: "border-foreground/20",
      badgeBg: "bg-foreground/8 text-muted-foreground",
      icon: "text-muted-foreground",
    }
  return {
    colBg: "bg-primary/[0.04]",
    colBorder: "border-primary/20",
    headerBg: "bg-primary/[0.08]",
    headerText: "text-primary font-bold",
    countBadge: "bg-primary/10 text-primary",
    overlayBg: "bg-primary/8",
    overlayBorder: "border-primary/40",
    badgeBg: "bg-primary/10 text-primary",
    icon: "text-primary",
  }
}

export const PIC_CHIP_STYLE: Record<string, string> = {
  Quỳnh: "bg-rose-50 border-rose-200 text-rose-700",
  Nhiên: "bg-teal-50 border-teal-200 text-teal-700",
  Yến: "bg-indigo-50 border-indigo-200 text-indigo-700",
  Minh: "bg-lime-50 border-lime-200 text-lime-700",
  Huy: "bg-cyan-50 border-cyan-200 text-cyan-700",
  Linh: "bg-fuchsia-50 border-fuchsia-200 text-fuchsia-700",
}

export function groupApplicants(items: Applicant[], groupBy: "round1" | "round2" | "position" | "batch") {
  if (groupBy === "round1") {
    return ROUND_1_GROUPS.map(group => ({
      key: group.key,
      label: group.label,
      rawKey: null as string | null,
      items: items.filter(group.test),
    }))
  }

  if (groupBy === "round2") {
    return ROUND_2_GROUPS.map(group => ({
      key: group.key,
      label: group.label,
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
