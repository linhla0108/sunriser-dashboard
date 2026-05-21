"use client"

import { createContext, useCallback, useEffect, useMemo, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import type { AppRole, AppUser, AuthContextValue } from "./types"

export const AuthContext = createContext<AuthContextValue | null>(null)

const REMEMBER_UNTIL_KEY = "sunriser.auth.rememberUntil"
const SESSION_ONLY_KEY = "sunriser.auth.sessionOnly"
const REMEMBER_DURATION_MS = 6 * 24 * 60 * 60 * 1000

function roleFromAppMetadata(user: User): Exclude<AppRole, "public"> {
  const role = user.app_metadata?.role
  return role === "admin" || role === "member" ? role : "member"
}

function displayNameFromUser(user: User) {
  const metadata = user.user_metadata
  const name = metadata?.full_name ?? metadata?.name ?? metadata?.display_name
  if (typeof name === "string" && name.trim()) return name.trim()
  return user.email?.split("@")[0] ?? "SUN.RISER user"
}

function toAppUser(user: User): AppUser {
  return {
    id: user.id,
    email: user.email ?? "",
    name: displayNameFromUser(user),
    role: roleFromAppMetadata(user),
  }
}

function rememberUntil() {
  if (typeof window === "undefined") return null
  const value = window.localStorage.getItem(REMEMBER_UNTIL_KEY)
  const timestamp = value ? Number(value) : NaN
  return Number.isFinite(timestamp) ? timestamp : null
}

function shouldKeepSession() {
  if (typeof window === "undefined") return true
  const until = rememberUntil()
  if (until) return until > Date.now()
  return window.sessionStorage.getItem(SESSION_ONLY_KEY) === "true"
}

function setRememberPreference(remember: boolean) {
  if (typeof window === "undefined") return
  if (remember) {
    window.localStorage.setItem(REMEMBER_UNTIL_KEY, String(Date.now() + REMEMBER_DURATION_MS))
    window.sessionStorage.removeItem(SESSION_ONLY_KEY)
    return
  }

  window.localStorage.removeItem(REMEMBER_UNTIL_KEY)
  window.sessionStorage.setItem(SESSION_ONLY_KEY, "true")
}

function clearRememberPreference() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(REMEMBER_UNTIL_KEY)
  window.sessionStorage.removeItem(SESSION_ONLY_KEY)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), [])
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    supabase.auth.getUser().then(async ({ data }) => {
      if (!mounted) return
      if (data.user && !shouldKeepSession()) {
        await supabase.auth.signOut()
        clearRememberPreference()
        setUser(null)
        setLoading(false)
        return
      }
      setUser(data.user ? toAppUser(data.user) : null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      if (session?.user && !shouldKeepSession()) {
        void supabase.auth.signOut()
        clearRememberPreference()
        setUser(null)
        setLoading(false)
        return
      }
      setUser(session?.user ? toAppUser(session.user) : null)
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  const signIn = useCallback<AuthContextValue["signIn"]>(
    async (email, password, options) => {
      const remember = options?.remember ?? true
      setRememberPreference(remember)
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        clearRememberPreference()
        return { ok: false, error: error.message }
      }
      if (data.user) setUser(toAppUser(data.user))

      return { ok: true }
    },
    [supabase]
  )

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    clearRememberPreference()
    setUser(null)
  }, [supabase])

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      user,
      role: user?.role ?? "public",
      signIn,
      signOut,
    }),
    [loading, signIn, signOut, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
