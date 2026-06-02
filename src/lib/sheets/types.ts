import type { Applicant } from "@/lib/types"
import type { sheets_v4 } from "googleapis"

export type SheetsClient = sheets_v4.Sheets

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
