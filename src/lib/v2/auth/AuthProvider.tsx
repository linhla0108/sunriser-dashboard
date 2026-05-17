"use client"

import { createContext, useCallback, useMemo } from "react"
import { z } from "zod"
import { usePersistedState } from "../persistence/usePersistedState"
import { MOCK_USERS } from "./mockUsers"
import type { AuthContextValue, V2Session } from "./types"

export const AuthContext = createContext<AuthContextValue | null>(null)

const sessionSchema = z
  .object({
    userId: z.string(),
    role: z.enum(["admin", "member", "public"]),
    expiresAt: z.string(),
  })
  .nullable()

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = usePersistedState<V2Session | null>("v2.auth.session", null, sessionSchema)

  const user = useMemo(() => {
    if (!session) return null
    const match = MOCK_USERS.find(candidate => candidate.id === session.userId)
    if (!match) return null

    return {
      id: match.id,
      email: match.email,
      name: match.name,
      role: match.role,
    }
  }, [session])

  const signIn = useCallback<AuthContextValue["signIn"]>(
    async (email, password) => {
      const match = MOCK_USERS.find(candidate => candidate.email === email && candidate.password === password)

      if (!match) return { ok: false, error: "Invalid credentials" }

      setSession({
        userId: match.id,
        role: match.role,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })

      return { ok: true }
    },
    [setSession]
  )

  const signOut = useCallback(() => setSession(null), [setSession])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role: user?.role ?? "public",
      signIn,
      signOut,
    }),
    [signIn, signOut, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
