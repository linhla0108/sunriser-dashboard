import "server-only"

import { createClient } from "@/lib/supabase/server"

export interface AnnouncementAccessCheck {
  ok: boolean
  userId?: string
  role?: "admin" | "manager" | "member" | "viewer"
  reason?: string
  status?: 401 | 403
}

type Claims = {
  sub?: string | null
  app_metadata?: Record<string, unknown> | null
}

function toRole(value: unknown): AnnouncementAccessCheck["role"] {
  return value === "admin" || value === "manager" || value === "member" || value === "viewer" ? value : "member"
}

export async function requireActiveAnnouncementUser(): Promise<AnnouncementAccessCheck> {
  const supabase = await createClient()

  let claims: Claims | null = null
  try {
    const { data } = await supabase.auth.getClaims()
    claims = (data?.claims ?? null) as Claims | null
  } catch {
    return { ok: false, reason: "unauthenticated", status: 401 }
  }

  if (!claims?.sub) return { ok: false, reason: "unauthenticated", status: 401 }

  const userId = String(claims.sub)
  const role = toRole(claims.app_metadata?.role)
  const { data: access, error } = await supabase.from("user_access").select("active").eq("user_id", userId).maybeSingle()

  if (error) return { ok: false, reason: error.message, status: 403 }
  if (!access?.active) return { ok: false, reason: "account_inactive", status: 403 }

  return { ok: true, userId, role }
}

export async function requireAnnouncementPublisher() {
  const access = await requireActiveAnnouncementUser()
  if (!access.ok) return access
  if (access.role !== "admin" && access.role !== "manager") {
    return { ok: false, reason: "not_publisher", status: 403 } as const
  }
  return access
}
