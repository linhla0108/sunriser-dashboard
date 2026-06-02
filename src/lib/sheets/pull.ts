import { getSheetsClient } from "./client"
import { rowToApplicant } from "./mapping"
import type { SheetsSyncResult } from "./types"
import type { Applicant } from "@/lib/types"
import { createAdminClient } from "@/lib/supabase/admin"

export interface PullOptions {
  /** When true, fetch and parse rows but do not upsert into the database. */
  dryRun?: boolean
  triggeredBy?: string
}

export interface PullResult extends SheetsSyncResult {
  direction: "pull"
  applicants?: Applicant[]
  errors?: string[]
}

export async function pullFromSheet(options: PullOptions = {}): Promise<PullResult> {
  const { dryRun = false, triggeredBy } = options
  const startedAt = new Date().toISOString()
  const spreadsheetId = process.env.SHEETS_CANDIDATES_SPREADSHEET_ID
  const tabName = process.env.SHEETS_CANDIDATES_TAB ?? "Candidates"
  const headerRow = Number(process.env.SHEETS_CANDIDATES_HEADER_ROW ?? 1)

  if (!spreadsheetId) {
    return {
      ok: false,
      direction: "pull",
      rowsCount: 0,
      startedAt,
      finishedAt: new Date().toISOString(),
      error: "SHEETS_CANDIDATES_SPREADSHEET_ID is not configured.",
    }
  }

  const supabase = createAdminClient()
  if (!supabase) {
    return {
      ok: false,
      direction: "pull",
      rowsCount: 0,
      startedAt,
      finishedAt: new Date().toISOString(),
      error: "Server misconfiguration: admin client unavailable.",
    }
  }

  let logId: number | undefined

  // Open sync log entry before doing any work.
  if (!dryRun) {
    const { data } = await supabase
      .from("sheets_sync_log")
      .insert({ direction: "pull", status: "ok", triggered_by: triggeredBy ?? null })
      .select("id")
      .single()
    logId = data?.id
  }

  try {
    const sheets = getSheetsClient()

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: tabName,
    })

    const rawRows: string[][] = (res.data.values ?? []) as string[][]
    if (rawRows.length < headerRow) {
      throw new Error(`Sheet has fewer rows than the configured header row (${headerRow}).`)
    }

    const headers = rawRows[headerRow - 1].map((h: unknown) => String(h).trim())
    const dataRows = rawRows.slice(headerRow)

    const applicants: Applicant[] = []
    const errors: string[] = []

    dataRows.forEach((row: string[], idx: number) => {
      const result = rowToApplicant(row, headers)
      if ("error" in result) {
        errors.push(`Row ${idx + headerRow + 1}: ${result.error}`)
      } else {
        applicants.push(result)
      }
    })

    if (!dryRun && applicants.length > 0) {
      const upsertRows = applicants.map((a, idx) => ({
        id: a.id,
        data: a,
        sheet_row: headerRow + idx + 1,
        source: "sheet" as const,
        updated_at: new Date().toISOString(),
      }))

      const { error: upsertError } = await supabase.from("candidates").upsert(upsertRows, { onConflict: "id" })

      if (upsertError) throw upsertError
    }

    const finishedAt = new Date().toISOString()

    if (!dryRun && logId) {
      await supabase.from("sheets_sync_log").update({ status: "ok", rows_count: applicants.length, finished_at: finishedAt }).eq("id", logId)
    }

    return {
      ok: true,
      direction: "pull",
      rowsCount: applicants.length,
      startedAt,
      finishedAt,
      ...(dryRun ? { applicants } : {}),
      ...(errors.length > 0 ? { errors } : {}),
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error during pull."
    const finishedAt = new Date().toISOString()

    if (!dryRun && logId) {
      await supabase.from("sheets_sync_log").update({ status: "error", error: message, finished_at: finishedAt }).eq("id", logId)
    }

    return { ok: false, direction: "pull", rowsCount: 0, startedAt, finishedAt, error: message }
  }
}
