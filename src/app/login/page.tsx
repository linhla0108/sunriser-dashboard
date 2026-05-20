"use client"

import { useRouter } from "next/navigation"
import { AuthCard } from "@/components/auth/AuthCard"
import { LoginForm } from "@/components/auth/LoginForm"

export default function LoginPage() {
  const router = useRouter()

  return (
    <AuthCard title="Sign in" subtitle="Open the SUN.RISER recruitment workspace.">
      <LoginForm onSuccess={() => router.push("/dashboard")} />
    </AuthCard>
  )
}
