"use client"

import { useRouter } from "next/navigation"
import { AuthCard } from "@/components/v2/auth/AuthCard"
import { SignupForm } from "@/components/v2/auth/SignupForm"

export default function V2SignupPage() {
  const router = useRouter()

  return (
    <AuthCard title="Create account" subtitle="Set up access for the V2 workspace.">
      <SignupForm onSuccess={() => router.push("/v2/otp")} />
    </AuthCard>
  )
}
