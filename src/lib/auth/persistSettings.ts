import { createClient } from "@/lib/supabase/client"

export interface SettingsPatch {
  theme?: string
  mode?: string
  settings?: Record<string, unknown>
  notes?: string | null
}

/**
 * Fire-and-forget write to public.user_settings for the current user.
 * Returns true on success, false on any failure. Never throws — callers
 * keep their local state regardless.
 */
export async function persistUserSettings(patch: SettingsPatch): Promise<boolean> {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return false

    const { error } = await supabase
      .from("user_settings")
      .update(patch)
      .eq("user_id", user.id)
      .select("user_id")
      .maybeSingle()

    return !error
  } catch {
    return false
  }
}
