"use client"

import { useRouter } from "next/navigation"
import { AuthCard } from "@/components/v2/auth/AuthCard"
import { LoginForm } from "@/components/v2/auth/LoginForm"

export default function V2LoginPage() {
  const router = useRouter()

  return (
    <AuthCard title="Sign in" subtitle="Open the V2 recruitment workspace.">
      <LoginForm onSuccess={() => router.push("/v2/dashboard")} />
    </AuthCard>
  )
}
