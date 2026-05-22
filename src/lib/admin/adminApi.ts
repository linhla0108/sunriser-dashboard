import { createClient } from "@/lib/supabase/client"
import type { AppAccess, AppProfile } from "@/lib/auth/types"

export interface AdminUserRow {
  user_id: string
  email: string
  full_name: string
  positions: string[]
  birthday: string | null
  notes: string | null
  active: boolean
  role: AppAccess["role"]
  permissions: AppAccess["permissions"]
}

interface ProfileJoinRow {
  user_id: string
  full_name: string
  birthday: string | null
  positions: string[]
  notes: string | null
}

interface AccessJoinRow {
  user_id: string
  active: boolean
  role: AppAccess["role"]
  permissions: AppAccess["permissions"]
}

/**
 * Fetch all users via the /api/admin/list-users server route, which uses
 * service_role to enrich profile rows with email from auth.users. Falls
 * back to a client-side join (without email) if the server route is
 * unavailable (e.g., service_role_not_configured).
 */
export async function listAdminUsers(): Promise<AdminUserRow[]> {
  try {
    const res = await fetch("/api/admin/list-users", { cache: "no-store" })
    if (res.ok) {
      const json = (await res.json()) as { users: AdminUserRow[] }
      return json.users
    }
  } catch {
    // fall through to client-side fallback
  }

  const supabase = createClient()
  const [profiles, access] = await Promise.all([
    supabase.from("user_profiles").select("user_id, full_name, birthday, positions, notes"),
    supabase.from("user_access").select("user_id, active, role, permissions"),
  ])

  if (profiles.error) throw new Error(profiles.error.message)
  if (access.error) throw new Error(access.error.message)

  const accessById = new Map<string, AccessJoinRow>(
    (access.data ?? []).map(row => [row.user_id, row as AccessJoinRow])
  )
  const profileRows = (profiles.data ?? []) as ProfileJoinRow[]

  return profileRows.map(p => {
    const a = accessById.get(p.user_id)
    return {
      user_id: p.user_id,
      email: "",
      full_name: p.full_name ?? "",
      birthday: p.birthday,
      positions: p.positions ?? [],
      notes: p.notes,
      active: a?.active ?? true,
      role: a?.role ?? "member",
      permissions: a?.permissions ?? ["read"],
    }
  })
}

export async function refreshUserClaims(userId: string, role: AppAccess["role"]): Promise<void> {
  const res = await fetch("/api/admin/refresh-claims", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ userId, role }),
  })
  if (!res.ok && res.status !== 503) {
    const body = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(body.error ?? "Failed to refresh claims")
  }
}

export async function inviteUser(email: string, fullName?: string): Promise<string | null> {
  const res = await fetch("/api/admin/invite-user", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, fullName }),
  })
  const body = (await res.json().catch(() => ({}))) as { userId?: string | null; error?: string }
  if (!res.ok) throw new Error(body.error ?? "Failed to invite user")
  return body.userId ?? null
}

export interface UpdateAccessInput {
  userId: string
  active: boolean
  role: AppAccess["role"]
  permissions: AppAccess["permissions"]
}

export async function updateUserAccess(input: UpdateAccessInput) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("user_access")
    .update({
      active: input.active,
      role: input.role,
      permissions: input.permissions,
    })
    .eq("user_id", input.userId)
    .select("user_id")
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) throw new Error("Permission denied or user not found")
}

export interface UpdateProfileInput {
  userId: string
  fullName: string
  birthday: string | null
  positions: string[]
}

export async function updateUserProfile(input: UpdateProfileInput) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("user_profiles")
    .update({
      full_name: input.fullName,
      birthday: input.birthday,
      positions: input.positions,
    })
    .eq("user_id", input.userId)
    .select("user_id")
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) throw new Error("Permission denied or user not found")
}

export type { AppAccess, AppProfile }
