"use client"

import { useRouter } from "next/navigation"
import { AuthCard } from "@/components/auth/AuthCard"
import { OtpForm } from "@/components/auth/OtpForm"

export default function OtpPage() {
  const router = useRouter()

  return (
    <AuthCard title="Check your email" subtitle="Use the Supabase confirmation link to finish setup.">
      <OtpForm onSuccess={() => router.push("/login")} />
    </AuthCard>
  )
}
