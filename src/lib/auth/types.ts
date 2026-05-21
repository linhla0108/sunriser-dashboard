export type AppRole = "admin" | "member" | "public"

export interface AppUser {
  id: string
  email: string
  name: string
  role: AppRole
}

export interface AuthContextValue {
  user: AppUser | null
  role: AppRole
  loading: boolean
  signIn: (email: string, password: string, options?: { remember?: boolean }) => Promise<{ ok: true } | { ok: false; error: string }>
  signOut: () => Promise<void>
}
