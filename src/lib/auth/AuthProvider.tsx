"use client"

import { createContext, useCallback, useEffect, useMemo, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { loadProfileData, PROFILE_DEFAULTS } from "./loadProfile"
import type { AppPermission, AppRole, AppUser, AuthContextValue } from "./types"

export const AuthContext = createContext<AuthContextValue | null>(null)

const REMEMBER_UNTIL_KEY = "sunriser.auth.rememberUntil"
const SESSION_ONLY_KEY = "sunriser.auth.sessionOnly"
const REMEMBER_DURATION_MS = 6 * 24 * 60 * 60 * 1000

function roleFromAppMetadata(user: User): Exclude<AppRole, "public"> {
  const role = user.app_metadata?.role
  if (role === "admin" || role === "manager" || role === "member" || role === "viewer") return role
  return "member"
}

function displayNameFromUser(user: User, fullName?: string) {
  if (fullName && fullName.trim()) return fullName.trim()
  const metadata = user.user_metadata
  const name = metadata?.full_name ?? metadata?.name ?? metadata?.display_name
  if (typeof name === "string" && name.trim()) return name.trim()
  return user.email?.split("@")[0] ?? "SUN.RISER user"
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

  const buildAppUser = useCallback(
    async (authUser: User): Promise<AppUser> => {
      try {
        const { profile, access, settings } = await loadProfileData(supabase, authUser.id)
        return {
          id: authUser.id,
          email: authUser.email ?? "",
          name: displayNameFromUser(authUser, profile.fullName),
          role: roleFromAppMetadata(authUser),
          profile,
          access,
          settings,
        }
      } catch {
        // Network/RLS error: fall back to defaults so the UI can still render.
        return {
          id: authUser.id,
          email: authUser.email ?? "",
          name: displayNameFromUser(authUser),
          role: roleFromAppMetadata(authUser),
          profile: PROFILE_DEFAULTS.profile,
          access: PROFILE_DEFAULTS.access,
          settings: PROFILE_DEFAULTS.settings,
        }
      }
    },
    [supabase]
  )

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
      if (data.user) {
        const next = await buildAppUser(data.user)
        if (!mounted) return
        setUser(next)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return
      if (session?.user && !shouldKeepSession()) {
        void supabase.auth.signOut()
        clearRememberPreference()
        setUser(null)
        setLoading(false)
        return
      }
      if (session?.user) {
        const next = await buildAppUser(session.user)
        if (!mounted) return
        setUser(next)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase, buildAppUser])

  const signIn = useCallback<AuthContextValue["signIn"]>(
    async (email, password, options) => {
      const remember = options?.remember ?? true
      setRememberPreference(remember)
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        clearRememberPreference()
        return { ok: false, error: error.message }
      }
      if (data.user) {
        const next = await buildAppUser(data.user)
        setUser(next)
      }
      return { ok: true }
    },
    [supabase, buildAppUser]
  )

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    clearRememberPreference()
    setUser(null)
  }, [supabase])

  const can = useCallback(
    (permission: AppPermission) => {
      if (!user) return false
      if (!user.access.active) return false
      return user.access.permissions.includes(permission)
    },
    [user]
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      user,
      role: user?.role ?? "public",
      isAdmin: user?.role === "admin",
      can,
      signIn,
      signOut,
    }),
    [loading, user, can, signIn, signOut]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
