export const CANDIDATE_ROUND_OPTIONS = ["Passed", "Failed", "Waiting list"] as const
export type CandidateRoundResult = (typeof CANDIDATE_ROUND_OPTIONS)[number]

export const CANDIDATE_BATCH_OPTIONS = [1, 2, 3] as const
export type CandidateBatchOption = (typeof CANDIDATE_BATCH_OPTIONS)[number]

export const CANDIDATE_PIC_OPTIONS = ["Quỳnh", "Nhiên", "Yến", "Minh", "Huy", "Linh"] as const
export type CandidatePicOption = (typeof CANDIDATE_PIC_OPTIONS)[number]

export const CANDIDATE_ROUND_BADGE_STYLES: Record<CandidateRoundResult, { bg: string; text: string; border: string }> = {
  Passed: { bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0" },
  Failed: { bg: "#fef2f2", text: "#dc2626", border: "#fecaca" },
  "Waiting list": { bg: "#fffbeb", text: "#d97706", border: "#fde68a" },
}

export const CANDIDATE_BATCH_DOT_STYLES: Record<CandidateBatchOption, string> = {
  1: "border-sky-300 bg-sky-100",
  2: "border-violet-300 bg-violet-100",
  3: "border-orange-300 bg-orange-100",
}

export const CANDIDATE_CHIP_STYLES: Record<string, string> = {
  Passed: "border-green-300 bg-green-100 text-green-900",
  Failed: "border-red-300 bg-red-100 text-red-800",
  "Waiting list": "border-amber-300 bg-amber-100 text-amber-800",
  "Batch 1": "border-sky-300 bg-sky-50 text-sky-800",
  "Batch 2": "border-violet-300 bg-violet-50 text-violet-800",
  "Batch 3": "border-orange-300 bg-orange-50 text-orange-800",
  Quỳnh: "border-rose-300 bg-rose-50 text-rose-800",
  Nhiên: "border-teal-300 bg-teal-50 text-teal-800",
  Yến: "border-indigo-300 bg-indigo-50 text-indigo-800",
  Minh: "border-lime-300 bg-lime-50 text-lime-800",
  Huy: "border-cyan-300 bg-cyan-50 text-cyan-800",
  Linh: "border-fuchsia-300 bg-fuchsia-50 text-fuchsia-800",
}

export const CANDIDATE_PIC_CHIP_STYLES: Record<CandidatePicOption, string> = {
  Quỳnh: "bg-rose-50 border-rose-200 text-rose-700",
  Nhiên: "bg-teal-50 border-teal-200 text-teal-700",
  Yến: "bg-indigo-50 border-indigo-200 text-indigo-700",
  Minh: "bg-lime-50 border-lime-200 text-lime-700",
  Huy: "bg-cyan-50 border-cyan-200 text-cyan-700",
  Linh: "bg-fuchsia-50 border-fuchsia-200 text-fuchsia-700",
}

export function formatCandidateBatchLabel(batch: CandidateBatchOption | number) {
  return `Batch ${batch}`
}
