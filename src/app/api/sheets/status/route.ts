import { NextResponse } from "next/server"
import { requireSheetsAccess } from "@/lib/admin/sheetsGuard"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  const guard = await requireSheetsAccess()
  if (!guard.ok) {
    return NextResponse.json({ ok: false, error: guard.reason }, { status: guard.status ?? 403 })
  }

  const supabase = createAdminClient()
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "service_unavailable" }, { status: 503 })
  }

  const { data, error } = await supabase
    .from("sheets_sync_log")
    .select("direction, status, rows_count, finished_at, error")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ ok: false, error: "Failed to read sync log." }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    lastSync: data
      ? {
          direction: data.direction as "pull" | "push",
          status: data.status as "ok" | "error",
          rowsCount: data.rows_count as number | null,
          finishedAt: data.finished_at as string | null,
          error: data.error as string | null,
        }
      : null,
  })
}
