"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppLoadingScreen } from "@/components/common/AppLoadingScreen"
import { useAuth } from "@/lib/auth/useAuth"

export function RequirePublisher({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth()
  const router = useRouter()
  const isPublisher = user?.role === "admin" || user?.role === "manager"

  useEffect(() => {
    if (!loading && user && !isPublisher) router.replace("/announcements")
  }, [isPublisher, loading, router, user])

  if (loading || !user) return <AppLoadingScreen variant="boot" />
  if (!isPublisher) return <AppLoadingScreen variant="auth" sublabel="Redirecting" />
  return <>{children}</>
}
