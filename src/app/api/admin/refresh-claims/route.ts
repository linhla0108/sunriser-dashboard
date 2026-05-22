import { NextResponse, type NextRequest } from "next/server"
import { requireAdmin } from "@/lib/admin/serverGuard"
import { createAdminClient } from "@/lib/supabase/admin"

interface Body {
  userId?: string
  role?: "admin" | "manager" | "member" | "viewer"
}

/**
 * Mirror user_access.role into auth.users.app_metadata.role so that
 * RLS policies relying on auth.jwt() see the new role on the next refresh.
 *
 * POST { userId, role } → 204
 */
export async function POST(request: NextRequest) {
  const guard = await requireAdmin()
  if (!guard.ok) return NextResponse.json({ error: guard.reason }, { status: 403 })

  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: "service_role_not_configured" }, { status: 503 })

  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 })
  }

  if (!body.userId || !body.role) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 })
  }
  if (!["admin", "manager", "member", "viewer"].includes(body.role)) {
    return NextResponse.json({ error: "invalid_role" }, { status: 400 })
  }

  const { data: existing, error: getErr } = await admin.auth.admin.getUserById(body.userId)
  if (getErr || !existing.user) {
    return NextResponse.json({ error: "user_not_found" }, { status: 404 })
  }
  const merged = { ...(existing.user.app_metadata ?? {}), role: body.role }

  const { error } = await admin.auth.admin.updateUserById(body.userId, {
    app_metadata: merged,
  })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return new NextResponse(null, { status: 204 })
}
