import { NextResponse } from "next/server"
import { requireSheetsAccess } from "@/lib/admin/sheetsGuard"
import { pullFromSheet } from "@/lib/sheets/pull"

export async function POST() {
  const guard = await requireSheetsAccess()
  if (!guard.ok) {
    return NextResponse.json({ ok: false, error: guard.reason }, { status: guard.status ?? 403 })
  }

  const result = await pullFromSheet({ triggeredBy: guard.userId })

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: "Sync failed. Check server logs." }, { status: 500 })
  }

  return NextResponse.json({ ok: true, rowsCount: result.rowsCount, errors: result.errors })
}
