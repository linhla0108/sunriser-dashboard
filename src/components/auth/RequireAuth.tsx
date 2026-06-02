"use client"

import { useEffect, useSyncExternalStore } from "react"
import { usePathname, useRouter } from "next/navigation"
import { AppLoadingScreen } from "@/components/common/AppLoadingScreen"
import { InactiveAccount } from "@/components/auth/InactiveAccount"
import { ProfileLoadError } from "@/components/auth/ProfileLoadError"
import { useAuth } from "@/lib/auth/useAuth"

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth()
  const ready = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (ready && !loading && !user) router.push(`/login?from=${encodeURIComponent(pathname)}`)
  }, [loading, pathname, ready, router, user])

  if (!ready || loading) return <AppLoadingScreen variant="boot" />
  if (!user) return <AppLoadingScreen variant="auth" sublabel="Checking access" />
  if (user.profileError) return <ProfileLoadError />
  if (!user.access.active) return <InactiveAccount />
  return <>{children}</>
}
