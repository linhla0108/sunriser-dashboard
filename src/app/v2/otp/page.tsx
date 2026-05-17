"use client"

import { useRouter } from "next/navigation"
import { AuthCard } from "@/components/v2/auth/AuthCard"
import { OtpForm } from "@/components/v2/auth/OtpForm"

export default function V2OtpPage() {
  const router = useRouter()

  return (
    <AuthCard title="Verify code" subtitle="Enter the 6-digit code sent to your email.">
      <OtpForm onSuccess={() => router.push("/v2/dashboard")} />
    </AuthCard>
  )
}
