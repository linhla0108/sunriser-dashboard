"use client"

import { useEffect, useSyncExternalStore } from "react"
import { usePathname, useRouter } from "next/navigation"
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

  if (!ready || loading || !user) return null
  return <>{children}</>
}
