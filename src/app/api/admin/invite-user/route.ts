import { NextResponse, type NextRequest } from "next/server"
import { requireAdmin } from "@/lib/admin/serverGuard"
import { createAdminClient } from "@/lib/supabase/admin"

interface Body {
  email?: string
  fullName?: string
}

/**
 * Invite a new user by email. Supabase sends them a magic link; on signup,
 * the handle_new_user trigger fills in the three companion rows automatically.
 *
 * POST { email, fullName? } → { userId } | { error }
 */
export async function POST(request: NextRequest) {
  const guard = await requireAdmin()
  if (!guard.ok) return NextResponse.json({ error: guard.reason }, { status: guard.status ?? 403 })

  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: "service_role_not_configured" }, { status: 503 })

  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 })
  }

  const email = body.email?.trim().toLowerCase()
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 })
  }

  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: body.fullName ? { full_name: body.fullName } : undefined,
  })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ userId: data.user?.id ?? null }, { status: 201 })
}
