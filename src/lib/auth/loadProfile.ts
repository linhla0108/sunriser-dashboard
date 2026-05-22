import type { SupabaseClient } from "@supabase/supabase-js"
import type { AppAccess, AppProfile, AppSettings } from "./types"

interface ProfileRow {
  full_name: string
  birthday: string | null
  positions: string[]
  notes: string | null
}

interface AccessRow {
  active: boolean
  role: AppAccess["role"]
  permissions: AppAccess["permissions"]
}

interface SettingsRow {
  theme: string
  mode: string
  settings: Record<string, unknown>
  notes: string | null
}

export interface LoadedProfile {
  profile: AppProfile
  access: AppAccess
  settings: AppSettings
}

const DEFAULT_PROFILE: AppProfile = {
  fullName: "",
  birthday: null,
  positions: [],
  notes: null,
}

const DEFAULT_ACCESS: AppAccess = {
  active: true,
  role: "member",
  permissions: ["read"],
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: "main",
  mode: "light",
  settings: {},
  notes: null,
}

/**
 * Fetch the three companion rows for a user. Falls back to safe defaults
 * if any row is missing (e.g. trigger didn't fire) so the UI can still render.
 */
export async function loadProfileData(
  supabase: SupabaseClient,
  userId: string
): Promise<LoadedProfile> {
  const [profileRes, accessRes, settingsRes] = await Promise.all([
    supabase.from("user_profiles").select("full_name, birthday, positions, notes").eq("user_id", userId).maybeSingle(),
    supabase.from("user_access").select("active, role, permissions").eq("user_id", userId).maybeSingle(),
    supabase.from("user_settings").select("theme, mode, settings, notes").eq("user_id", userId).maybeSingle(),
  ])

  const profileRow = (profileRes.data as ProfileRow | null) ?? null
  const accessRow = (accessRes.data as AccessRow | null) ?? null
  const settingsRow = (settingsRes.data as SettingsRow | null) ?? null

  return {
    profile: profileRow
      ? {
          fullName: profileRow.full_name ?? "",
          birthday: profileRow.birthday,
          positions: profileRow.positions ?? [],
          notes: profileRow.notes,
        }
      : DEFAULT_PROFILE,
    access: accessRow
      ? {
          active: accessRow.active,
          role: accessRow.role,
          permissions: accessRow.permissions ?? ["read"],
        }
      : DEFAULT_ACCESS,
    settings: settingsRow
      ? {
          theme: settingsRow.theme ?? "main",
          mode: settingsRow.mode ?? "light",
          settings: settingsRow.settings ?? {},
          notes: settingsRow.notes,
        }
      : DEFAULT_SETTINGS,
  }
}

export const PROFILE_DEFAULTS = {
  profile: DEFAULT_PROFILE,
  access: DEFAULT_ACCESS,
  settings: DEFAULT_SETTINGS,
}
