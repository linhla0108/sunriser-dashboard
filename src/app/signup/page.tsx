"use client"

import { useRouter } from "next/navigation"
import { AuthCard } from "@/components/v2/auth/AuthCard"
import { SignupForm } from "@/components/v2/auth/SignupForm"

export default function SignupPage() {
  const router = useRouter()

  return (
    <AuthCard title="Create account" subtitle="Set up access for the SUN.RISER workspace.">
      <SignupForm onSuccess={() => router.push("/otp")} />
    </AuthCard>
  )
}
