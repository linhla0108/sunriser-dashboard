// Maps Supabase OAuth error codes to generic user-facing messages.
// Privacy rule: these strings must NEVER contain the allowed domain, tenant ID,
// any email address, or any string that would hint at the domain restriction.
// The snapshot test in __tests__/oauthErrors.test.ts enforces this.
export type OAuthErrorCode = "access_denied" | "callback_failed"

const MESSAGES: Record<OAuthErrorCode, string> = {
  // Shown when: hook rejected the email domain, Azure tenant mismatch, or
  // any explicit 403 from the Before User Created hook.
  access_denied: "Access denied. Contact your administrator if you believe this is an error.",

  // Shown when: Supabase session exchange failed, callback arrived with error param,
  // or any other sign-in failure not covered above.
  callback_failed: "Sign-in failed. Please try again.",
}

export function oauthErrorMessage(code: OAuthErrorCode): string {
  return MESSAGES[code]
}

// Classify a raw Supabase error into a safe OAuthErrorCode.
export function supabaseErrorToCode(err: unknown): OAuthErrorCode {
  if (err && typeof err === "object" && "message" in err) {
    const msg = String((err as { message: unknown }).message).toLowerCase()
    // Hook rejections surface as access_denied or mention "hook" in dev mode.
    if (msg.includes("access_denied") || msg.includes("hook") || msg.includes("403") || msg.includes("email domain")) {
      return "access_denied"
    }
  }
  return "callback_failed"
}
