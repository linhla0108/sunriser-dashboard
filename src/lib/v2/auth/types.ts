export type V2Role = "admin" | "member" | "public"

export interface V2User {
  id: string
  email: string
  name: string
  role: V2Role
}

export interface V2Session {
  userId: string
  role: V2Role
  expiresAt: string
}

export interface AuthContextValue {
  user: V2User | null
  role: V2Role
  signIn: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>
  signOut: () => void
}
