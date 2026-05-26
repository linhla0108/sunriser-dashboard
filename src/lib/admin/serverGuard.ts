import "server-only"
import { createClient } from "@/lib/supabase/server"

export interface AdminCheck {
  ok: boolean
  userId?: string
  reason?: string
  /** HTTP status to return to the caller. 401 = unauthenticated, 403 = not admin. */
  status?: 401 | 403
}

type AuthClaims = {
  sub?: string | null
  app_metadata?: Record<string, unknown> | null
}

/**
 * Verify the request comes from an authenticated admin. Returns ok=true with
 * userId on success. Returns ok=false with a reason string otherwise.
 *
 * The check reads `auth.jwt() -> app_metadata.role`, which is the same source
 * of truth that the SQL `is_admin()` helper uses.
 */
export async function requireAdmin(): Promise<AdminCheck> {
  const supabase = await createClient()
  let claims: AuthClaims | null = null
  try {
    const { data } = await supabase.auth.getClaims()
    claims = (data?.claims ?? null) as AuthClaims | null
  } catch {
    return { ok: false, reason: "unauthenticated", status: 401 }
  }
  if (!claims?.sub) return { ok: false, reason: "unauthenticated", status: 401 }
  const sub = claims.sub

  const appMeta = (claims.app_metadata ?? {}) as Record<string, unknown>
  if (appMeta.role !== "admin") return { ok: false, reason: "not_admin", status: 403 }

  return { ok: true, userId: String(sub) }
}
