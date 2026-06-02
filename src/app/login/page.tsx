"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AlertTriangle, Loader2 } from "lucide-react"
import { AuthCard } from "@/components/auth/AuthCard"
import { LoginForm } from "@/components/auth/LoginForm"
import { safeInternalPath } from "@/lib/auth/safePath"
import { useAuth } from "@/lib/auth/useAuth"
import { oauthErrorMessage } from "@/lib/auth/oauthErrors"

/** Map known ?error= values to user-facing messages. Unknown codes show nothing. */
const ERROR_MESSAGES: Record<string, string> = {
  confirmation_failed: "Your confirmation link has expired or is invalid. Please request a new one or sign in directly.",
  access_denied: oauthErrorMessage("access_denied"),
  callback_failed: oauthErrorMessage("callback_failed"),
}

// Microsoft logo as inline SVG — no external dependency.
function MicrosoftLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 21 21" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  )
}

function LoginPageInner() {
  const router = useRouter()
  const { signInWithMicrosoft } = useAuth()
  const params = useSearchParams()
  const from = safeInternalPath(params.get("from"), "/dashboard")
  const errorCode = params.get("error") ?? ""
  const errorMessage = ERROR_MESSAGES[errorCode] ?? null
  const [msLoading, setMsLoading] = useState(false)
  const [msError, setMsError] = useState<string | null>(null)

  async function handleMicrosoftSignIn() {
    setMsLoading(true)
    setMsError(null)
    const result = await signInWithMicrosoft()
    if (!result.ok) {
      setMsError(oauthErrorMessage("callback_failed"))
      setMsLoading(false)
    }
    // On success the browser is redirected to Microsoft — no further action needed.
  }

  const displayError = errorMessage ?? msError

  return (
    <AuthCard title="Sign in" subtitle="Open the SUN.RISER recruitment workspace.">
      {displayError ? (
        <div role="alert" className="flex items-start gap-2.5 rounded-xl bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>{displayError}</span>
        </div>
      ) : null}

      {/* Microsoft OAuth button */}
      <button
        type="button"
        onClick={handleMicrosoftSignIn}
        disabled={msLoading}
        className="flex w-full items-center justify-center gap-2.5 rounded-full border border-[rgba(4,23,43,0.12)] bg-white px-4 py-2.5 text-sm font-medium text-[#1b1b1b] transition-colors hover:bg-[#f9f9f9] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {msLoading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <MicrosoftLogo />}
        Continue with Microsoft
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[rgba(4,23,43,0.08)]" />
        <span className="text-[0.6875rem] tracking-wide text-[#767676] uppercase">or continue with email</span>
        <div className="h-px flex-1 bg-[rgba(4,23,43,0.08)]" />
      </div>

      <LoginForm onSuccess={() => router.push(from)} />
    </AuthCard>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  )
}
