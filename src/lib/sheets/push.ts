import { getSheetsClient } from "./client"
import { applicantToRow } from "./mapping"
import type { SheetsSyncResult } from "./types"
import type { Applicant } from "@/lib/types"
import { createAdminClient } from "@/lib/supabase/admin"

export interface PushOptions {
  /** When true, compute the payload but do not write to the sheet. */
  dryRun?: boolean
  triggeredBy?: string
}

export interface PushResult extends SheetsSyncResult {
  direction: "push"
  /** Preview rows when dryRun=true. */
  preview?: string[][]
}

export async function pushToSheet(options: PushOptions = {}): Promise<PushResult> {
  const { dryRun = false, triggeredBy } = options
  const startedAt = new Date().toISOString()
  const spreadsheetId = process.env.SHEETS_CANDIDATES_SPREADSHEET_ID
  const tabName = process.env.SHEETS_CANDIDATES_TAB ?? "Candidates"
  const headerRow = Number(process.env.SHEETS_CANDIDATES_HEADER_ROW ?? 1)

  if (!spreadsheetId) {
    return {
      ok: false,
      direction: "push",
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
      direction: "push",
      rowsCount: 0,
      startedAt,
      finishedAt: new Date().toISOString(),
      error: "Server misconfiguration: admin client unavailable.",
    }
  }

  let logId: number | undefined

  if (!dryRun) {
    const { data } = await supabase
      .from("sheets_sync_log")
      .insert({ direction: "push", status: "ok", triggered_by: triggeredBy ?? null })
      .select("id")
      .single()
    logId = data?.id
  }

  try {
    const sheets = getSheetsClient()

    // Read the current header row from the sheet to preserve column order.
    const headerRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${tabName}!${headerRow}:${headerRow}`,
    })
    const headers: string[] = ((headerRes.data.values?.[0] as string[] | undefined) ?? []).map((h: string) => String(h).trim())

    if (headers.length === 0) {
      throw new Error(`Could not read header row ${headerRow} from tab "${tabName}".`)
    }

    // Read all candidates from the database.
    const { data: rows, error: fetchError } = await supabase.from("candidates").select("data").order("sheet_row", { ascending: true })

    if (fetchError) throw fetchError

    const applicants: Applicant[] = (rows ?? []).map(r => r.data as Applicant)

    if (applicants.length === 0) {
      const finishedAt = new Date().toISOString()
      if (!dryRun && logId) {
        await supabase.from("sheets_sync_log").update({ status: "ok", rows_count: 0, finished_at: finishedAt }).eq("id", logId)
      }
      return { ok: true, direction: "push", rowsCount: 0, startedAt, finishedAt }
    }

    // Build the data rows (header row + data rows, overwrite from headerRow onward).
    const dataRows = applicants.map(a => applicantToRow(a, headers))
    const allRows = [headers, ...dataRows]

    if (dryRun) {
      return {
        ok: true,
        direction: "push",
        rowsCount: applicants.length,
        startedAt,
        finishedAt: new Date().toISOString(),
        preview: allRows,
      }
    }

    // Write back to the sheet using batchUpdate for atomicity.
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: "USER_ENTERED",
        data: [
          {
            range: `${tabName}!A${headerRow}`,
            values: allRows,
          },
        ],
      },
    })

    const finishedAt = new Date().toISOString()

    if (logId) {
      await supabase.from("sheets_sync_log").update({ status: "ok", rows_count: applicants.length, finished_at: finishedAt }).eq("id", logId)
    }

    return { ok: true, direction: "push", rowsCount: applicants.length, startedAt, finishedAt }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error during push."
    const finishedAt = new Date().toISOString()

    if (!dryRun && logId) {
      await supabase.from("sheets_sync_log").update({ status: "error", error: message, finished_at: finishedAt }).eq("id", logId)
    }

    return { ok: false, direction: "push", rowsCount: 0, startedAt, finishedAt, error: message }
  }
}
