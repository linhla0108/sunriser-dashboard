import '@testing-library/jest-dom'
import { vi } from 'vitest'

type MockSupabaseUser = {
  id: string
  email: string
  app_metadata: Record<string, unknown>
  user_metadata: Record<string, unknown>
}

const listeners = new Set<(event: string, session: { user: MockSupabaseUser } | null) => void>()
let currentUser: MockSupabaseUser | null = null

function makeUser(email: string, role: "admin" | "member", name: string): MockSupabaseUser {
  return {
    id: role === "admin" ? "u_admin" : "u_member",
    email,
    app_metadata: { role },
    user_metadata: { full_name: name },
  }
}

function legacySessionUser() {
  try {
    const raw = window.localStorage.getItem("sunriser.auth.session")
    if (!raw) return null
    const session = JSON.parse(raw) as { role?: string; userId?: string }
    if (session.role === "admin" || session.userId === "u_admin") return makeUser("admin@sunriser.com", "admin", "Linh Admin")
    if (session.role === "member" || session.userId === "u_member") return makeUser("member@sunriser.com", "member", "Recruiter Member")
  } catch {}
  return null
}

function activeUser() {
  return currentUser ?? legacySessionUser()
}

function notifyAuthChange(event: string) {
  const user = activeUser()
  listeners.forEach(listener => listener(event, user ? { user } : null))
}

function profileRowsFor(userId: string) {
  const isAdmin = userId === "u_admin"
  return {
    user_profiles: {
      full_name: isAdmin ? "Linh Admin" : "Recruiter Member",
      birthday: null,
      positions: [],
      notes: null,
    },
    user_access: {
      active: true,
      role: isAdmin ? "admin" : "member",
      permissions: isAdmin ? ["read", "edit", "delete"] : ["read"],
    },
    user_settings: { theme: "main", mode: "light", settings: {}, notes: null },
  }
}

function makeFromMock() {
  return (table: "user_profiles" | "user_access" | "user_settings") => {
    let filterUserId = ""
    const builder = {
      select: () => builder,
      eq: (_col: string, value: string) => {
        filterUserId = value
        return builder
      },
      maybeSingle: async () => {
        const rows = profileRowsFor(filterUserId)
        return { data: rows[table] ?? null, error: null }
      },
    }
    return builder
  }
}

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: makeFromMock(),
    auth: {
      getUser: async () => ({ data: { user: activeUser() }, error: null }),
      getSession: async () => {
        const user = activeUser()
        return { data: { session: user ? { user } : null }, error: null }
      },
      onAuthStateChange: (listener: (event: string, session: { user: MockSupabaseUser } | null) => void) => {
        listeners.add(listener)
        queueMicrotask(() => listener("INITIAL_SESSION", activeUser() ? { user: activeUser()! } : null))
        return {
          data: {
            subscription: {
              unsubscribe: () => listeners.delete(listener),
            },
          },
        }
      },
      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        if (email === "admin@sunriser.com" && password === "admin123") {
          currentUser = makeUser(email, "admin", "Linh Admin")
          notifyAuthChange("SIGNED_IN")
          return { data: { user: currentUser }, error: null }
        }
        if (email === "member@sunriser.com" && password === "member123") {
          currentUser = makeUser(email, "member", "Recruiter Member")
          notifyAuthChange("SIGNED_IN")
          return { data: { user: currentUser }, error: null }
        }
        return { data: { user: null }, error: { message: "Invalid credentials" } }
      },
      signUp: async ({ email, options }: { email: string; options?: { data?: { full_name?: string } } }) => ({
        data: { user: makeUser(email, "member", options?.data?.full_name ?? "SUN.RISER user") },
        error: null,
      }),
      resetPasswordForEmail: async () => ({ data: {}, error: null }),
      signOut: async () => {
        currentUser = null
        window.localStorage.removeItem("sunriser.auth.session")
        notifyAuthChange("SIGNED_OUT")
        return { error: null }
      },
    },
  }),
}))

class MemoryStorage implements Storage {
  private store = new Map<string, string>()

  get length() {
    return this.store.size
  }

  clear() {
    this.store.clear()
    currentUser = null
  }

  getItem(key: string) {
    return this.store.get(key) ?? null
  }

  key(index: number) {
    return Array.from(this.store.keys())[index] ?? null
  }

  removeItem(key: string) {
    this.store.delete(key)
  }

  setItem(key: string, value: string) {
    this.store.set(key, value)
  }
}

Object.defineProperty(window, 'localStorage', {
  configurable: true,
  value: new MemoryStorage(),
})
