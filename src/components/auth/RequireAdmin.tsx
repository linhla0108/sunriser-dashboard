"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppLoadingScreen } from "@/components/common/AppLoadingScreen"
import { useAuth } from "@/lib/auth/useAuth"

/**
 * Client-side admin guard. Pair with the server-side middleware redirect
 * for defense-in-depth. Renders nothing visible while loading/redirecting.
 */
export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { loading, user, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user && !isAdmin) router.replace("/dashboard")
  }, [loading, user, isAdmin, router])

  if (loading || !user) return <AppLoadingScreen variant="boot" />
  if (!isAdmin) return <AppLoadingScreen variant="auth" sublabel="Redirecting" />
  return <>{children}</>
}
