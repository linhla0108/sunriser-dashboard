import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/serverGuard"
import { createAdminClient } from "@/lib/supabase/admin"

/**
 * List all users with email enrichment from auth.users. Reads
 * user_profiles + user_access via service_role (bypasses RLS, safe because
 * the caller is already verified as an admin).
 *
 * GET → { users: AdminUserRow[] }
 */
export async function GET() {
  const guard = await requireAdmin()
  if (!guard.ok) return NextResponse.json({ error: guard.reason }, { status: guard.status ?? 403 })

  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: "service_role_not_configured" }, { status: 503 })

  const [authList, profiles, access] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 200 }),
    admin.from("user_profiles").select("user_id, full_name, birthday, positions, notes"),
    admin.from("user_access").select("user_id, active, role, permissions"),
  ])

  if (authList.error) return NextResponse.json({ error: authList.error.message }, { status: 500 })
  if (profiles.error) return NextResponse.json({ error: profiles.error.message }, { status: 500 })
  if (access.error) return NextResponse.json({ error: access.error.message }, { status: 500 })

  const emailById = new Map(authList.data.users.map(u => [u.id, u.email ?? ""]))
  const accessById = new Map((access.data ?? []).map(r => [r.user_id, r]))

  const users = (profiles.data ?? []).map(p => {
    const a = accessById.get(p.user_id)
    return {
      user_id: p.user_id,
      email: emailById.get(p.user_id) ?? "",
      full_name: p.full_name ?? "",
      birthday: p.birthday,
      positions: p.positions ?? [],
      notes: p.notes,
      active: a?.active ?? true,
      role: a?.role ?? "member",
      permissions: a?.permissions ?? ["read"],
    }
  })

  return NextResponse.json({ users })
}
