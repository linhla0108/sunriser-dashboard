import type { Applicant } from "@/lib/types"

// Placeholder until googleapis is installed in task 2.2.
// Will be replaced with: import type { sheets_v4 } from 'googleapis'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SheetsClient = any

export interface SheetsSyncResult {
  ok: boolean
  direction: "pull" | "push"
  rowsCount: number
  error?: string
  startedAt: string
  finishedAt: string
}

export interface SheetMapping {
  headers: string[]
  required: ReadonlyArray<keyof Applicant>
}

// Required columns that must exist in the sheet header row.
export const REQUIRED_SHEET_HEADERS: ReadonlyArray<keyof Applicant> = ["id", "name", "email", "position1", "batch", "submittedAt"] as const
