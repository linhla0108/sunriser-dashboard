"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/v2/auth/useAuth"

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!user) router.push(`/v2/login?from=${encodeURIComponent(pathname)}`)
  }, [pathname, router, user])

  if (!user) return null
  return <>{children}</>
}
