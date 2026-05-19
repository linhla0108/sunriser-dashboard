"use client"

import { useEffect, useSyncExternalStore } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/v2/auth/useAuth"

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const ready = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (ready && !user) router.push(`/login?from=${encodeURIComponent(pathname)}`)
  }, [pathname, ready, router, user])

  if (!ready || !user) return null
  return <>{children}</>
}
