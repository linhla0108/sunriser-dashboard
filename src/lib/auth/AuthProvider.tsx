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
    try { window.localStorage.setItem(REMEMBER_UNTIL_KEY, String(Date.now() + REMEMBER_DURATION_MS)) } catch {}
    window.sessionStorage.removeItem(SESSION_ONLY_KEY)
    return
  }
  window.localStorage.removeItem(REMEMBER_UNTIL_KEY)
  try { window.sessionStorage.setItem(SESSION_ONLY_KEY, "true") } catch {}
}

function clearRememberPreference() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(REMEMBER_UNTIL_KEY)
  window.sessionStorage.removeItem(SESSION_ONLY_KEY)
}

/**
 * Workspace data that is personal to the signed-in user. These keys must be
 * cleared on sign-out so the next user on the same device does not see them.
 *
 * Keys intentionally NOT listed here (device preferences, not user data):
 * v2.theme, v2.mode, v2.custom-color, v2.density, v2.workspace.*, v2.view.*,
 * v2.chat.open/mode/dockWidth/floatPos, v2.notes.open/mode/dockWidth/floatPos,
 * v2.drawer.*
 */
const USER_DATA_KEYS = [
  "v2.notes.items",
  "v2.pinned",
  "v2.chat.history",
  "v2.report.shares",
] as const

function clearUserData() {
  if (typeof window === "undefined") return
  USER_DATA_KEYS.forEach(key => {
    try { window.localStorage.removeItem(key) } catch {}
  })
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), [])

  // undefined = onAuthStateChange hasn't fired yet (auth lock not yet released)
  // null      = no authenticated session
  // User      = authenticated session present
  const [authUser, setAuthUser] = useState<User | null | undefined>(undefined)
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Effect 1: Auth session listener.
  // CRITICAL: This callback must NEVER await any Supabase API call.
  // The @supabase/ssr client holds a Web Lock for the duration of the
  // onAuthStateChange callback. Any Supabase call made while that lock is
  // held (including database queries that attach auth headers) will try to
  // re-acquire the same lock and deadlock — keeping the loading screen up
  // forever after a hard reload.
  useEffect(() => {
    let mounted = true

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return

      if (event === "SIGNED_OUT") {
        setAuthUser(null)
        setUser(null)
        setLoading(false)
        clearRememberPreference()
        return
      }

      // Token events that don't change the user identity — no profile reload needed.
      if (
        event === "TOKEN_REFRESHED" ||
        event === "PASSWORD_RECOVERY" ||
        event === "MFA_CHALLENGE_VERIFIED"
      ) {
        return
      }

      // INITIAL_SESSION | SIGNED_IN | USER_UPDATED
      if (session?.user) {
        setAuthUser(session.user)
        // loading stays true — Effect 2 will resolve it after profile loads
      } else {
        // No session on initial load → not authenticated
        setAuthUser(null)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  const buildAppUser = useCallback(
    async (rawUser: User): Promise<AppUser> => {
      try {
        const { profile, access, settings } = await loadProfileData(supabase, rawUser.id)
        return {
          id: rawUser.id,
          email: rawUser.email ?? "",
          name: displayNameFromUser(rawUser, profile.fullName),
          role: roleFromAppMetadata(rawUser),
          profile,
          access,
          settings,
        }
      } catch {
        // Network/RLS error: fall back to locked defaults. profileError=true lets
        // RequireAuth show a "connection problem" message instead of "account inactive".
        return {
          id: rawUser.id,
          email: rawUser.email ?? "",
          name: displayNameFromUser(rawUser),
          role: roleFromAppMetadata(rawUser),
          profile: PROFILE_DEFAULTS.profile,
          access: PROFILE_DEFAULTS.access,
          settings: PROFILE_DEFAULTS.settings,
          profileError: true,
        }
      }
    },
    [supabase]
  )

  // Effect 2: Profile loader — runs outside the auth callback so no lock is held.
  // Fires when authUser identity changes (new login, reload, account switch).
  useEffect(() => {
    if (authUser === undefined) return // auth not yet resolved, wait for Effect 1
    if (authUser === null) return // SIGNED_OUT branch already set loading=false

    let cancelled = false

    // Session-only preference check — reads localStorage, no Supabase calls.
    if (!shouldKeepSession()) {
      setUser(null)
      setLoading(false)
      clearRememberPreference()
      // Schedule signOut outside the current call stack so it doesn't re-enter
      // the auth system while Effect 1's subscription may still be processing.
      setTimeout(() => { supabase.auth.signOut().catch(() => {}) }, 0)
      return
    }

    buildAppUser(authUser).then(next => {
      if (cancelled) return
      setUser(next)
      setLoading(false)
    })

    return () => { cancelled = true }
  }, [authUser, buildAppUser, supabase])

  const signIn = useCallback<AuthContextValue["signIn"]>(
    async (email, password, options) => {
      const remember = options?.remember ?? true
      setRememberPreference(remember)
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        clearRememberPreference()
        const message =
          error.status === 429
            ? "Too many attempts. Please wait a few minutes before trying again."
            : error.message
        return { ok: false, error: message }
      }
      // onAuthStateChange fires SIGNED_IN → Effect 2 builds the app user
      void data
      return { ok: true }
    },
    [supabase]
  )

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut()
    } catch {
      // Network failure — SDK still clears local session; SIGNED_OUT fires locally.
    }
    clearRememberPreference()
    clearUserData()
    // Optimistic clear: onAuthStateChange SIGNED_OUT also calls setUser(null),
    // but this fires first so the UI updates without waiting for the event.
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
