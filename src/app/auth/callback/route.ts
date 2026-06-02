import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { safeInternalPath } from "@/lib/auth/safePath"
import { supabaseErrorToCode } from "@/lib/auth/oauthErrors"

// Handles the OAuth PKCE redirect from Supabase Auth (Microsoft Azure provider).
// Supabase redirects here after the provider consent screen with ?code=...
// We exchange the code for a session and redirect to the destination.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const errorParam = searchParams.get("error")
  const next = safeInternalPath(searchParams.get("next"), "/dashboard")

  const loginUrl = new URL("/login", origin)

  // Provider returned an error (e.g. hook rejected, user cancelled).
  if (errorParam || !code) {
    const errorDescription = searchParams.get("error_description") ?? errorParam ?? ""
    const code = supabaseErrorToCode({ message: errorDescription })
    loginUrl.searchParams.set("error", code)
    // Never append the raw Supabase error to the redirect — use only the code.
    return NextResponse.redirect(loginUrl)
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      const errorCode = supabaseErrorToCode(error)
      loginUrl.searchParams.set("error", errorCode)
      return NextResponse.redirect(loginUrl)
    }

    // Verify the session has a user with an email — belt-and-braces check.
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.email) {
      // No email means we cannot trust the session; sign out immediately.
      await supabase.auth.signOut()
      loginUrl.searchParams.set("error", "callback_failed")
      return NextResponse.redirect(loginUrl)
    }

    // Session valid — redirect to intended destination or /dashboard.
    const destination = new URL(next, origin)
    return NextResponse.redirect(destination)
  } catch {
    // Supabase unreachable — fail closed, never expose internal error.
    loginUrl.searchParams.set("error", "callback_failed")
    return NextResponse.redirect(loginUrl)
  }
}
