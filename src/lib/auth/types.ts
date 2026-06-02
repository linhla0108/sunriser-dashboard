export type AppRole = "admin" | "manager" | "member" | "viewer" | "public"
export type AppPermission = "read" | "edit" | "delete"

export interface AppProfile {
  fullName: string
  birthday: string | null // ISO date "YYYY-MM-DD"
  positions: string[]
  notes: string | null
}

export interface AppAccess {
  active: boolean
  role: Exclude<AppRole, "public">
  permissions: AppPermission[]
}

export interface AppSettings {
  theme: string
  mode: string
  settings: Record<string, unknown>
  notes: string | null
}

export interface AppUser {
  id: string
  email: string
  name: string
  /** Role from JWT app_metadata. Source of truth for authorization. */
  role: AppRole
  profile: AppProfile
  access: AppAccess
  settings: AppSettings
  /**
   * Set to true when loadProfileData threw (network/RLS error).
   * Distinguishes "DB unreachable" from an actual deactivated account.
   */
  profileError?: true
}

export interface AuthContextValue {
  user: AppUser | null
  role: AppRole
  loading: boolean
  isAdmin: boolean
  can: (permission: AppPermission) => boolean
  signIn: (email: string, password: string, options?: { remember?: boolean }) => Promise<{ ok: true } | { ok: false; error: string }>
  signInWithMicrosoft: () => Promise<{ ok: true } | { ok: false; error: string }>
  signOut: () => Promise<void>
}
