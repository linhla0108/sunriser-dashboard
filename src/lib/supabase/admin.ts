import "server-only"
import { createClient } from "@supabase/supabase-js"

/**
 * Server-only Supabase client using the service_role key. Bypasses RLS.
 * Never import this from a Client Component or expose it through props.
 *
 * Returns null if SUPABASE_SERVICE_ROLE_KEY is not configured, so callers
 * can return a clean 503 rather than crash.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return null
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
