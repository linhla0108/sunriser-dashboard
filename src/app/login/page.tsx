"use client"

import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AlertTriangle } from "lucide-react"
import { AuthCard } from "@/components/auth/AuthCard"
import { LoginForm } from "@/components/auth/LoginForm"
import { safeInternalPath } from "@/lib/auth/safePath"

/** Map known ?error= values to user-facing messages. Unknown codes show nothing. */
const ERROR_MESSAGES: Record<string, string> = {
  confirmation_failed:
    "Your confirmation link has expired or is invalid. Please request a new one or sign in directly.",
}

function LoginPageInner() {
  const router = useRouter()
  const params = useSearchParams()
  const from = safeInternalPath(params.get("from"), "/dashboard")
  const errorCode = params.get("error") ?? ""
  const errorMessage = ERROR_MESSAGES[errorCode] ?? null

  return (
    <AuthCard title="Sign in" subtitle="Open the SUN.RISER recruitment workspace.">
      {errorMessage ? (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl bg-amber-50 px-3 py-2.5 text-sm text-amber-800"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>{errorMessage}</span>
        </div>
      ) : null}
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
