"use client"

import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AuthCard } from "@/components/auth/AuthCard"
import { LoginForm } from "@/components/auth/LoginForm"
import { safeInternalPath } from "@/lib/auth/safePath"

function LoginPageInner() {
  const router = useRouter()
  const params = useSearchParams()
  const from = safeInternalPath(params.get("from"), "/dashboard")

  return (
    <AuthCard title="Sign in" subtitle="Open the SUN.RISER recruitment workspace.">
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
