import { NextResponse, type NextRequest } from "next/server"
import { requireSheetsAccess } from "@/lib/admin/sheetsGuard"
import { pushToSheet } from "@/lib/sheets/push"

export async function POST(request: NextRequest) {
  const guard = await requireSheetsAccess()
  if (!guard.ok) {
    return NextResponse.json({ ok: false, error: guard.reason }, { status: guard.status ?? 403 })
  }

  const { searchParams } = new URL(request.url)
  const dryRun = searchParams.get("dryRun") === "true"

  const result = await pushToSheet({ dryRun, triggeredBy: guard.userId })

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: "Sync failed. Check server logs." }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    rowsCount: result.rowsCount,
    ...(dryRun && result.preview ? { preview: result.preview } : {}),
  })
}
