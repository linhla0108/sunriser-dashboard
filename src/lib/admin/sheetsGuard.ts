import "server-only"
import { createClient } from "@/lib/supabase/server"

export interface SheetsAccessCheck {
  ok: boolean
  userId?: string
  reason?: string
  status?: 401 | 403
}

/**
 * Allow access if the caller is an admin OR has 'edit' permission.
 * Reads from user_access table to check permissions.
 */
export async function requireSheetsAccess(): Promise<SheetsAccessCheck> {
  const supabase = await createClient()

  type Claims = { sub?: string | null; app_metadata?: Record<string, unknown> | null }
  let claims: Claims | null = null
  try {
    const { data } = await supabase.auth.getClaims()
    claims = (data?.claims ?? null) as Claims | null
  } catch {
    return { ok: false, reason: "unauthenticated", status: 401 }
  }

  if (!claims?.sub) return { ok: false, reason: "unauthenticated", status: 401 }
  const userId = String(claims.sub)

  // Admin bypasses permission check.
  const appMeta = ((claims as Claims).app_metadata ?? {}) as Record<string, unknown>
  if (appMeta.role === "admin") return { ok: true, userId }

  // Check edit permission from user_access table.
  const { data: access } = await supabase.from("user_access").select("active, permissions").eq("user_id", userId).maybeSingle()

  if (!access?.active) return { ok: false, reason: "account_inactive", status: 403 }
  const permissions: string[] = access.permissions ?? []
  if (!permissions.includes("edit")) return { ok: false, reason: "insufficient_permissions", status: 403 }

  return { ok: true, userId }
}
