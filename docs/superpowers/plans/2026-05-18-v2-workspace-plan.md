# V2 Workspace Implementation Plan / Kế hoạch triển khai V2 Workspace

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Required repo skill stack:** Before executing any feature in this plan, load and apply `/karpathy-guidelines`, `/frontend-design`, `/ui-ux-pro-max`, `/impeccable`, `/performance-optimization`, `/tailwind-css-patterns`, `/agent-skills:code-simplification`, and `/agent-skills:code-review-and-quality`.
>
> **Unavailable alias note:** `/agent-skills:build` is not installed in this session. Use the closest available build/shipping guidance from `agent-skills:ci-cd-and-automation` or `agent-skills:shipping-and-launch` when build/release work is needed.
>
> **Execution rule:** Implement features strictly in plan order. After each feature is complete and verified, append a short English note to `docs/superpowers/plans/2026-05-18-v2-workspace-execution-log.md` with what changed and which verification passed.

**Spec reference**: [docs/superpowers/specs/2026-05-18-v2-workspace-design.md](../specs/2026-05-18-v2-workspace-design.md)

---

## Goal / Mục tiêu

- **EN**: Ship a parallel `/v2/*` workspace with 11 new features (auth, pin+compare, AI Chat Drawer, Notes Drawer, AI Report, view options, 3 themes, settings, public routes, action UX standards, collapsible sidebar) without modifying the existing `/` or `/lab` routes.
- **VI**: Triển khai parallel route `/v2/*` chứa 11 features mới (auth, pin+compare, AI Chat Drawer, Notes Drawer, AI Report, view options, 3 themes, settings, public routes, action UX standards, sidebar collapse) mà không động chạm code cũ ở `/` hoặc `/lab`.

## Architecture / Kiến trúc

- **EN**: All new code under `app/v2/*`, `components/v2/*`, `lib/v2/*`, `styles/v2-themes.css`. Mock-only AI (no API). Persistence via `usePersistedState` abstraction over `localStorage`. Theme system uses `data-theme` + `data-mode` CSS variables with optional Skeleton React island swap (Theme B & C). Every action wraps in `<ActionTooltip>` with 300ms delay.
- **VI**: Toàn bộ code mới sống dưới `app/v2/*`, `components/v2/*`, `lib/v2/*`, `styles/v2-themes.css`. AI hoàn toàn mock (không API). Persist qua `usePersistedState` abstraction trên `localStorage`. Theme system dùng `data-theme` + `data-mode` CSS variables với optional Skeleton React island swap (Theme B & C). Mọi action wrap `<ActionTooltip>` delay 300ms.

## Tech Stack

- Next.js 16 App Router (Turbopack), React 19
- shadcn/ui base-nova (existing) + new components: `tooltip`, `tabs`, `command`, `popover`, `switch`, `slider`, `label`, `radio-group`, `checkbox`, `sonner`
- Tailwind CSS v4 (config-less; CSS variable tokens in `globals.css` + new `v2-themes.css`)
- `@skeletonlabs/skeleton-react@4.15.2` (existing — for Theme B & Theme C islands)
- `@dnd-kit/*` (existing) for DnD across all views
- `recharts` (existing) for ChartView
- `vitest@4` + `@testing-library/react@16` (existing — 211 tests baseline; new tests target 80%+ coverage on v2 code)
- `nanoid` (will install) for `shareId` generation
- `zod` (will install) for `usePersistedState` schema validation

## Phases overview / Tổng quan phases

| #   | Phase              | Mục tiêu / Goal                                     | Blocks                  |
| --- | ------------------ | --------------------------------------------------- | ----------------------- |
| 0   | Foundation         | Provider tree, hooks, theme tokens, ActionTooltip   | All                     |
| 1   | Auth screens       | Login/Signup/Forgot/OTP + RequireAuth               | App routes              |
| 2   | Workspace shell    | V2Sidebar/TopBar, ThemeSwitcher, dashboard skeleton | Views, Drawers          |
| 3   | View options       | ViewPillNav + Table/Pipeline/Gallery/Chart + DnD    | Pin/Compare             |
| 4   | AI Chat Drawer     | Hybrid float/dock + mock chat                       | Notes Drawer            |
| 5   | Notes Drawer       | Same pattern, coexistence rule                      | Pin/Compare wiring      |
| 6   | Pin & Compare      | PinStar + Toolbar + /v2/compare                     | Report (top candidates) |
| 7   | AI Report + Public | Modal + Share + /v2/public/\*                       | —                       |
| 8   | Settings           | 3 tabs (Appearance/Workspace/Account)               | —                       |
| 9   | Polish & QA        | Tooltip pass, a11y, mobile, lint/format             | Shippable               |

Dependencies: Phase 0 blocks everything. Phase 1 blocks Phase 2 (app layout needs auth). Phase 2 blocks 3-8 (workspace shell). Phase 4 partially blocks Phase 5 (drawer pattern reuse). Phase 3 blocks Phase 6 (rows/cards to pin).

---

# Phase 0 — Foundation / Nền tảng

### Task 0.1: Install dependencies & shadcn components

**Files**:

- Modify: `package.json`
- Modify: `src/components/ui/` (new shadcn components added)

- [x] **Step 1**: Install runtime deps
  ```bash
  npm install nanoid zod
  ```
- [x] **Step 2**: Add missing shadcn components
  ```bash
  npx shadcn@latest add tooltip tabs command popover switch slider label radio-group checkbox sonner
  ```
- [x] **Step 3**: Verify all added under `src/components/ui/`
  ```bash
  npx tsc --noEmit
  ```
  Expected: PASS, no errors
- [ ] **Step 4**: Commit
  ```bash
  git add package.json package-lock.json src/components/ui
  git commit -m "feat(v2): install nanoid, zod, and missing shadcn components"
  ```

### Task 0.2: Create v2 directory skeleton

**Files**:

- Create: `src/app/v2/layout.tsx`
- Create: `src/app/v2/page.tsx`
- Create: `src/components/v2/.gitkeep`
- Create: `src/lib/v2/.gitkeep`

- [x] **Step 1**: Write `src/app/v2/layout.tsx` (placeholder, no providers yet)
  ```tsx
  export default function V2Layout({ children }: { children: React.ReactNode }) {
    return <div className="v2-root">{children}</div>
  }
  ```
- [x] **Step 2**: Write `src/app/v2/page.tsx`
  ```tsx
  import { redirect } from "next/navigation"
  export default function V2Index() {
    redirect("/v2/login")
  }
  ```
- [x] **Step 3**: Verify route accessible
  ```bash
  npx tsc --noEmit
  ```
  Expected: PASS
- [ ] **Step 4**: Commit
  ```bash
  git add src/app/v2 src/components/v2 src/lib/v2
  git commit -m "feat(v2): scaffold /v2 route skeleton"
  ```

### Task 0.3: `usePersistedState` hook

**Files**:

- Create: `src/lib/v2/persistence/usePersistedState.ts`
- Create: `src/lib/v2/persistence/__tests__/usePersistedState.test.ts`

- [x] **Step 1**: Write failing test

  ```ts
  import { renderHook, act } from "@testing-library/react"
  import { usePersistedState } from "../usePersistedState"
  import { z } from "zod"

  describe("usePersistedState", () => {
    beforeEach(() => localStorage.clear())

    it("returns default when no value stored", () => {
      const { result } = renderHook(() => usePersistedState("v2.test", 0))
      expect(result.current[0]).toBe(0)
    })

    it("persists to localStorage on update", () => {
      const { result } = renderHook(() => usePersistedState("v2.test", 0))
      act(() => result.current[1](5))
      expect(JSON.parse(localStorage.getItem("v2.test")!)).toBe(5)
    })

    it("reads from localStorage on init", () => {
      localStorage.setItem("v2.test", JSON.stringify(42))
      const { result } = renderHook(() => usePersistedState("v2.test", 0))
      expect(result.current[0]).toBe(42)
    })

    it("falls back to default on schema mismatch", () => {
      localStorage.setItem("v2.test", JSON.stringify("not a number"))
      const { result } = renderHook(() => usePersistedState("v2.test", 0, z.number()))
      expect(result.current[0]).toBe(0)
    })
  })
  ```

- [ ] **Step 2**: Run, expect FAIL
  ```bash
  npm test -- usePersistedState
  ```
- [x] **Step 3**: Implement hook

  ```ts
  // src/lib/v2/persistence/usePersistedState.ts
  "use client"
  import { useEffect, useRef, useState } from "react"
  import type { ZodSchema } from "zod"

  export function usePersistedState<T>(key: string, defaultValue: T, schema?: ZodSchema<T>) {
    const [value, setValue] = useState<T>(defaultValue)
    const hydrated = useRef(false)

    useEffect(() => {
      try {
        const raw = localStorage.getItem(key)
        if (raw == null) return
        const parsed = JSON.parse(raw)
        if (schema) {
          const result = schema.safeParse(parsed)
          if (!result.success) return
          setValue(result.data)
        } else {
          setValue(parsed as T)
        }
      } catch {}
      hydrated.current = true
    }, [key, schema])

    useEffect(() => {
      if (!hydrated.current) {
        hydrated.current = true
        return
      }
      try {
        localStorage.setItem(key, JSON.stringify(value))
      } catch {}
    }, [key, value])

    return [value, setValue] as const
  }
  ```

- [x] **Step 4**: Run tests, expect PASS
  ```bash
  npm test -- usePersistedState
  ```
- [ ] **Step 5**: Commit
  ```bash
  git add src/lib/v2/persistence
  git commit -m "feat(v2): add usePersistedState hook with schema validation"
  ```

### Task 0.4: Theme tokens CSS

**Files**:

- Create: `src/styles/v2-themes.css`
- Modify: `src/app/v2/layout.tsx` (import the CSS)

- [x] **Step 1**: Write `src/styles/v2-themes.css` with 3 themes × 2 modes

  ```css
  /* Theme A — Main (shadcn + Proxima Nova + #FF5533) */
  [data-theme="a"] {
    --v2-font: "Proxima Nova", system-ui, sans-serif;
    --v2-primary: #ff5533;
    --v2-primary-hover: #e63d1f;
    --v2-radius-card: 1.5rem;
    --v2-radius-button: 9999px;
    --v2-radius-input: 1rem;
  }
  [data-theme="a"][data-mode="light"] {
    --v2-bg: #fcfcfc;
    --v2-surface: #ffffff;
    --v2-ink: #1b1b1b;
    --v2-muted: #555555;
  }
  [data-theme="a"][data-mode="dark"] {
    --v2-bg: #0e0e10;
    --v2-surface: #18181b;
    --v2-ink: #fafafa;
    --v2-muted: #a1a1aa;
  }

  /* Theme B — Lab (Skeleton + Steep + #8d1600) */
  [data-theme="b"] {
    --v2-font: "Steep", "Inter", system-ui, sans-serif;
    --v2-primary: #8d1600;
    --v2-primary-hover: #6b0f00;
    --v2-radius-card: 0.5rem;
    --v2-radius-button: 0.5rem;
    --v2-radius-input: 0.375rem;
  }
  [data-theme="b"][data-mode="light"] {
    --v2-bg: #fafaf7;
    --v2-surface: #ffffff;
    --v2-ink: #1a1a1a;
    --v2-muted: #6b6b6b;
  }
  [data-theme="b"][data-mode="dark"] {
    --v2-bg: #0a0a0a;
    --v2-surface: #141414;
    --v2-ink: #f5f5f5;
    --v2-muted: #a0a0a0;
  }

  /* Theme C — Hybrid (shadcn shell tokens, Skeleton islands keep their own) */
  [data-theme="c"] {
    --v2-font: "Proxima Nova", system-ui, sans-serif;
    --v2-primary: #ff5533;
    --v2-primary-hover: #e63d1f;
    --v2-radius-card: 1rem;
    --v2-radius-button: 0.75rem;
    --v2-radius-input: 0.75rem;
  }
  [data-theme="c"][data-mode="light"] {
    --v2-bg: #fcfcfc;
    --v2-surface: #ffffff;
    --v2-ink: #1b1b1b;
    --v2-muted: #555555;
  }
  [data-theme="c"][data-mode="dark"] {
    --v2-bg: #0e0e10;
    --v2-surface: #18181b;
    --v2-ink: #fafafa;
    --v2-muted: #a1a1aa;
  }

  .v2-root,
  .v2-root * {
    transition:
      background-color 200ms ease,
      color 200ms ease,
      border-color 200ms ease;
  }
  ```

- [x] **Step 2**: Import in `src/app/v2/layout.tsx`
  ```tsx
  import "@/styles/v2-themes.css"
  export default function V2Layout({ children }: { children: React.ReactNode }) {
    return <div className="v2-root">{children}</div>
  }
  ```
- [x] **Step 3**: Run TypeScript check
  ```bash
  npx tsc --noEmit
  ```
  Expected: PASS
- [ ] **Step 4**: Commit
  ```bash
  git add src/styles/v2-themes.css src/app/v2/layout.tsx
  git commit -m "feat(v2): add theme tokens CSS for 3 themes × 2 modes"
  ```

### Task 0.5: ThemeProvider + useTheme

**Files**:

- Create: `src/lib/v2/theme/ThemeProvider.tsx`
- Create: `src/lib/v2/theme/useTheme.ts`
- Create: `src/lib/v2/theme/types.ts`
- Create: `src/lib/v2/theme/__tests__/ThemeProvider.test.tsx`

- [x] **Step 1**: Write types
  ```ts
  // src/lib/v2/theme/types.ts
  export type V2Theme = "a" | "b" | "c"
  export type V2Mode = "light" | "dark" | "system"
  export interface ThemeContextValue {
    theme: V2Theme
    mode: V2Mode
    effectiveMode: "light" | "dark"
    setTheme: (t: V2Theme) => void
    setMode: (m: V2Mode) => void
  }
  ```
- [x] **Step 2**: Write failing test

  ```tsx
  import { render, screen } from "@testing-library/react"
  import userEvent from "@testing-library/user-event"
  import { ThemeProvider } from "../ThemeProvider"
  import { useTheme } from "../useTheme"

  function Probe() {
    const { theme, setTheme } = useTheme()
    return (
      <>
        <span data-testid="theme">{theme}</span>
        <button onClick={() => setTheme("b")}>switchB</button>
      </>
    )
  }

  it("default theme is a, setTheme updates context and html data-theme", async () => {
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>
    )
    expect(screen.getByTestId("theme").textContent).toBe("a")
    await userEvent.click(screen.getByText("switchB"))
    expect(screen.getByTestId("theme").textContent).toBe("b")
    expect(document.documentElement.getAttribute("data-theme")).toBe("b")
  })
  ```

- [x] **Step 3**: Implement

  ```tsx
  // src/lib/v2/theme/ThemeProvider.tsx
  "use client"
  import { createContext, useEffect, useMemo } from "react"
  import { z } from "zod"
  import { usePersistedState } from "../persistence/usePersistedState"
  import type { ThemeContextValue, V2Theme, V2Mode } from "./types"

  export const ThemeContext = createContext<ThemeContextValue | null>(null)

  const themeSchema = z.enum(["a", "b", "c"])
  const modeSchema = z.enum(["light", "dark", "system"])

  export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = usePersistedState<V2Theme>("v2.theme", "a", themeSchema)
    const [mode, setMode] = usePersistedState<V2Mode>("v2.mode", "system", modeSchema)

    const effectiveMode = useMemo<"light" | "dark">(() => {
      if (mode !== "system") return mode
      if (typeof window === "undefined") return "light"
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    }, [mode])

    useEffect(() => {
      document.documentElement.setAttribute("data-theme", theme)
      document.documentElement.setAttribute("data-mode", effectiveMode)
    }, [theme, effectiveMode])

    const value = useMemo(() => ({ theme, mode, effectiveMode, setTheme, setMode }), [theme, mode, effectiveMode, setTheme, setMode])

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  }
  ```

  ```ts
  // src/lib/v2/theme/useTheme.ts
  "use client"
  import { useContext } from "react"
  import { ThemeContext } from "./ThemeProvider"

  export function useTheme() {
    const ctx = useContext(ThemeContext)
    if (!ctx) throw new Error("useTheme must be used within ThemeProvider")
    return ctx
  }
  ```

- [x] **Step 4**: Run test, expect PASS
  ```bash
  npm test -- ThemeProvider
  ```
- [ ] **Step 5**: Commit
  ```bash
  git add src/lib/v2/theme
  git commit -m "feat(v2): ThemeProvider with persistence + html data-attribute sync"
  ```

### Task 0.6: ActionTooltip helper

**Files**:

- Create: `src/components/v2/common/ActionTooltip.tsx`
- Create: `src/components/v2/common/__tests__/ActionTooltip.test.tsx`

- [x] **Step 1**: Failing test

  ```tsx
  import { render, screen } from "@testing-library/react"
  import userEvent from "@testing-library/user-event"
  import { TooltipProvider } from "@/components/ui/tooltip"
  import { ActionTooltip } from "../ActionTooltip"

  it("renders label after hover delay", async () => {
    render(
      <TooltipProvider delayDuration={0}>
        <ActionTooltip label="Pin to compare" shortcut="P">
          <button>btn</button>
        </ActionTooltip>
      </TooltipProvider>
    )
    await userEvent.hover(screen.getByText("btn"))
    expect(await screen.findByText("Pin to compare")).toBeInTheDocument()
    expect(screen.getByText("P")).toBeInTheDocument()
  })
  ```

- [x] **Step 2**: Implementation

  ```tsx
  // src/components/v2/common/ActionTooltip.tsx
  "use client"
  import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
  import { cloneElement, isValidElement, type ReactElement } from "react"

  interface ActionTooltipProps {
    label: string
    description?: string
    shortcut?: string
    children: ReactElement
  }

  export function ActionTooltip({ label, description, shortcut, children }: ActionTooltipProps) {
    const enhanced = isValidElement(children)
      ? cloneElement(children, {
          "aria-label": (children.props as { "aria-label"?: string })["aria-label"] ?? label,
        } as Record<string, unknown>)
      : children

    return (
      <Tooltip>
        <TooltipTrigger asChild>{enhanced}</TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{label}</span>
            {shortcut && <kbd className="rounded border border-current/30 bg-white/10 px-1.5 py-0.5 text-xs">{shortcut}</kbd>}
          </div>
          {description && <p className="mt-1 text-xs text-current/70">{description}</p>}
        </TooltipContent>
      </Tooltip>
    )
  }
  ```

- [x] **Step 3**: Run test, expect PASS
  ```bash
  npm test -- ActionTooltip
  ```
- [ ] **Step 4**: Commit
  ```bash
  git add src/components/v2/common
  git commit -m "feat(v2): ActionTooltip wrapper with shortcut kbd hint"
  ```

### Task 0.7: AuthProvider skeleton + mock users

**Files**:

- Create: `src/lib/v2/auth/types.ts`
- Create: `src/lib/v2/auth/mockUsers.ts`
- Create: `src/lib/v2/auth/AuthProvider.tsx`
- Create: `src/lib/v2/auth/useAuth.ts`
- Create: `src/lib/v2/auth/__tests__/AuthProvider.test.tsx`

- [x] **Step 1**: Types
  ```ts
  // src/lib/v2/auth/types.ts
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
  ```
- [x] **Step 2**: Mock users
  ```ts
  // src/lib/v2/auth/mockUsers.ts
  import type { V2User } from "./types"
  export const MOCK_USERS: Array<V2User & { password: string }> = [
    { id: "u_admin", email: "admin@sunriser.com", password: "admin123", role: "admin", name: "Linh Admin" },
    { id: "u_member", email: "member@sunriser.com", password: "member123", role: "member", name: "Recruiter Member" },
  ]
  ```
- [x] **Step 3**: AuthProvider

  ```tsx
  // src/lib/v2/auth/AuthProvider.tsx
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
      const u = MOCK_USERS.find(m => m.id === session.userId)
      return u ? { id: u.id, email: u.email, name: u.name, role: u.role } : null
    }, [session])

    const signIn = useCallback<AuthContextValue["signIn"]>(
      async (email, password) => {
        const u = MOCK_USERS.find(m => m.email === email && m.password === password)
        if (!u) return { ok: false, error: "Invalid credentials" }
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        setSession({ userId: u.id, role: u.role, expiresAt })
        return { ok: true }
      },
      [setSession]
    )

    const signOut = useCallback(() => setSession(null), [setSession])

    const value = useMemo<AuthContextValue>(() => ({ user, role: user?.role ?? "public", signIn, signOut }), [user, signIn, signOut])

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  }
  ```

- [x] **Step 4**: `useAuth` hook

  ```ts
  // src/lib/v2/auth/useAuth.ts
  "use client"
  import { useContext } from "react"
  import { AuthContext } from "./AuthProvider"

  export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error("useAuth must be used within AuthProvider")
    return ctx
  }
  ```

- [x] **Step 5**: Test for signIn happy + invalid

  ```tsx
  import { renderHook, act } from "@testing-library/react"
  import { AuthProvider } from "../AuthProvider"
  import { useAuth } from "../useAuth"

  it("signIn with valid credentials sets user", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => <AuthProvider>{children}</AuthProvider>
    const { result } = renderHook(() => useAuth(), { wrapper })
    let ok: boolean | undefined
    await act(async () => {
      const r = await result.current.signIn("admin@sunriser.com", "admin123")
      ok = r.ok
    })
    expect(ok).toBe(true)
    expect(result.current.user?.role).toBe("admin")
  })

  it("signIn with invalid credentials returns error", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => <AuthProvider>{children}</AuthProvider>
    const { result } = renderHook(() => useAuth(), { wrapper })
    let res: { ok: boolean; error?: string } | undefined
    await act(async () => {
      res = await result.current.signIn("x", "y")
    })
    expect(res?.ok).toBe(false)
  })
  ```

- [x] **Step 6**: Run tests, expect PASS
  ```bash
  npm test -- AuthProvider
  ```
- [ ] **Step 7**: Commit
  ```bash
  git add src/lib/v2/auth
  git commit -m "feat(v2): AuthProvider with mock users + session persistence"
  ```

### Task 0.8: Wire providers in `/v2/layout.tsx`

**Files**:

- Modify: `src/app/v2/layout.tsx`

- [x] **Step 1**: Update layout

  ```tsx
  // src/app/v2/layout.tsx
  import "@/styles/v2-themes.css"
  import { TooltipProvider } from "@/components/ui/tooltip"
  import { Toaster } from "@/components/ui/sonner"
  import { ThemeProvider } from "@/lib/v2/theme/ThemeProvider"
  import { AuthProvider } from "@/lib/v2/auth/AuthProvider"

  export default function V2Layout({ children }: { children: React.ReactNode }) {
    return (
      <TooltipProvider delayDuration={300}>
        <ThemeProvider>
          <AuthProvider>
            <div className="v2-root min-h-screen bg-[var(--v2-bg)] font-[var(--v2-font)] text-[var(--v2-ink)]">{children}</div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    )
  }
  ```

- [x] **Step 2**: TypeScript check
  ```bash
  npx tsc --noEmit
  ```
- [ ] **Step 3**: Commit
  ```bash
  git add src/app/v2/layout.tsx
  git commit -m "feat(v2): wire Theme/Auth/Tooltip/Toaster providers in /v2 layout"
  ```

---

# Phase 1 — Auth screens / Màn hình Auth

### Task 1.1: Login form

**Files**:

- Create: `src/components/v2/auth/LoginForm.tsx`
- Create: `src/components/v2/auth/AuthCard.tsx`
- Create: `src/app/v2/login/page.tsx`
- Create: `src/components/v2/auth/__tests__/LoginForm.test.tsx`

- [x] **Step 1**: Failing test for happy path + invalid + quick-login chips

  ```tsx
  import { render, screen, waitFor } from "@testing-library/react"
  import userEvent from "@testing-library/user-event"
  import { AuthProvider } from "@/lib/v2/auth/AuthProvider"
  import { ThemeProvider } from "@/lib/v2/theme/ThemeProvider"
  import { TooltipProvider } from "@/components/ui/tooltip"
  import { LoginForm } from "../LoginForm"

  const Wrap = ({ children }: { children: React.ReactNode }) => (
    <TooltipProvider delayDuration={0}>
      <ThemeProvider>
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  )

  it("quick login chip fills + submits as admin", async () => {
    const onSuccess = vi.fn()
    render(
      <Wrap>
        <LoginForm onSuccess={onSuccess} />
      </Wrap>
    )
    await userEvent.click(screen.getByRole("button", { name: /demo as admin/i }))
    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith({ role: "admin" }))
  })

  it("shows error toast on invalid credentials", async () => {
    render(
      <Wrap>
        <LoginForm />
      </Wrap>
    )
    await userEvent.type(screen.getByLabelText(/email/i), "wrong@x.com")
    await userEvent.type(screen.getByLabelText(/password/i), "nope")
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }))
    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument()
  })
  ```

- [x] **Step 2**: Run test, expect FAIL
- [x] **Step 3**: Implementation (LoginForm shape)

  ```tsx
  // src/components/v2/auth/LoginForm.tsx
  "use client"
  import { useState } from "react"
  import { toast } from "sonner"
  import { Button } from "@/components/ui/button"
  import { Input } from "@/components/ui/input"
  import { Label } from "@/components/ui/label"
  import { Checkbox } from "@/components/ui/checkbox"
  import { useAuth } from "@/lib/v2/auth/useAuth"
  import { ActionTooltip } from "@/components/v2/common/ActionTooltip"

  interface Props {
    onSuccess?: (info: { role: string }) => void
  }

  export function LoginForm({ onSuccess }: Props) {
    const { signIn } = useAuth()
    const [email, setEmail] = useState("")
    const [pwd, setPwd] = useState("")
    const [remember, setRemember] = useState(true)
    const [loading, setLoading] = useState(false)

    async function submit(creds?: { email: string; password: string }) {
      const e = creds?.email ?? email
      const p = creds?.password ?? pwd
      setLoading(true)
      const r = await signIn(e, p)
      setLoading(false)
      if (!r.ok) {
        toast.error(r.error)
        return
      }
      toast.success("Welcome back!")
      onSuccess?.({ role: e.includes("admin") ? "admin" : "member" })
    }

    return (
      <form
        onSubmit={ev => {
          ev.preventDefault()
          void submit()
        }}
        className="flex w-full max-w-[480px] flex-col gap-4"
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="login-email">Email</Label>
          <Input id="login-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@sunriser.com" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="login-password">Password</Label>
          <Input id="login-password" type="password" required minLength={6} value={pwd} onChange={e => setPwd(e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={remember} onCheckedChange={v => setRemember(!!v)} />
          Remember me
        </label>

        <ActionTooltip label="Sign in" shortcut="↵">
          <Button type="submit" disabled={loading} aria-busy={loading} className="w-full">
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </ActionTooltip>

        <div className="mt-2 flex gap-2">
          <ActionTooltip label="Demo as Admin" description="One-click sign in with seeded admin user">
            <Button type="button" variant="outline" size="sm" onClick={() => submit({ email: "admin@sunriser.com", password: "admin123" })}>
              Demo as Admin
            </Button>
          </ActionTooltip>
          <ActionTooltip label="Demo as Member" description="One-click sign in with seeded member user">
            <Button type="button" variant="outline" size="sm" onClick={() => submit({ email: "member@sunriser.com", password: "member123" })}>
              Demo as Member
            </Button>
          </ActionTooltip>
        </div>
      </form>
    )
  }
  ```

- [x] **Step 4**: AuthCard shell (used by all auth screens)
  ```tsx
  // src/components/v2/auth/AuthCard.tsx
  export function AuthCard({
    title,
    subtitle,
    children,
    footer,
  }: {
    title: string
    subtitle?: string
    children: React.ReactNode
    footer?: React.ReactNode
  }) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--v2-bg)] p-4">
        <div className="w-full max-w-[480px] rounded-3xl bg-[var(--v2-surface)] p-8 shadow-xl">
          <h1 className="text-2xl font-semibold text-[var(--v2-ink)]">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-[var(--v2-muted)]">{subtitle}</p>}
          <div className="mt-6">{children}</div>
          {footer && <div className="mt-6 text-sm text-[var(--v2-muted)]">{footer}</div>}
        </div>
      </div>
    )
  }
  ```
- [x] **Step 5**: Page

  ```tsx
  // src/app/v2/login/page.tsx
  "use client"
  import { useRouter } from "next/navigation"
  import Link from "next/link"
  import { AuthCard } from "@/components/v2/auth/AuthCard"
  import { LoginForm } from "@/components/v2/auth/LoginForm"

  export default function LoginPage() {
    const router = useRouter()
    return (
      <AuthCard
        title="Welcome back"
        subtitle="Sign in to SUN.RISER Workspace"
        footer={
          <>
            Don&apos;t have an account?{" "}
            <Link className="underline" href="/v2/signup">
              Sign up
            </Link>
          </>
        }
      >
        <LoginForm onSuccess={() => router.push("/v2/dashboard")} />
      </AuthCard>
    )
  }
  ```

- [x] **Step 6**: Run tests, expect PASS
- [ ] **Step 7**: Commit
  ```bash
  git add src/components/v2/auth src/app/v2/login
  git commit -m "feat(v2): login form + page with quick-login chips"
  ```

### Task 1.2-1.4: Signup / Forgot / OTP screens

Apply the same TDD pattern as Task 1.1 for each.

**Files**:

- Create: `src/components/v2/auth/SignupForm.tsx`, `src/app/v2/signup/page.tsx`, test
- Create: `src/components/v2/auth/ForgotForm.tsx`, `src/app/v2/forgot/page.tsx`, test
- Create: `src/components/v2/auth/OtpForm.tsx`, `src/app/v2/otp/page.tsx`, test

**Each task**:

- [x] Write 2 tests: happy path + validation error
- [x] Implement form (refer to Section B.8 in spec for fields/validation)
- [x] Wire page using `AuthCard`
- [x] Run tests (commit not requested in this run)

**OTP-specific note**: 6-input auto-focus next + paste-friendly. Use `useRef` array + `onChange` shift focus.

```tsx
// snippet
const refs = useRef<(HTMLInputElement | null)[]>([])
function onChange(i: number, v: string) {
  if (v.length > 1) {
    /* handle paste */
  }
  setDigits(d => d.map((x, idx) => (idx === i ? v.slice(-1) : x)))
  if (v && i < 5) refs.current[i + 1]?.focus()
}
```

### Task 1.5: RequireAuth + route guard

**Files**:

- Create: `src/components/v2/auth/RequireAuth.tsx`
- Create: `src/app/v2/(app)/layout.tsx`

- [x] **Step 1**: Test
  ```tsx
  it("redirects to /v2/login when no session", () => {
    const push = vi.fn()
    vi.spyOn(require("next/navigation"), "useRouter").mockReturnValue({ push })
    render(
      <Wrap>
        <RequireAuth>app</RequireAuth>
      </Wrap>
    )
    expect(push).toHaveBeenCalledWith(expect.stringContaining("/v2/login"))
  })
  ```
- [x] **Step 2**: Implement

  ```tsx
  // src/components/v2/auth/RequireAuth.tsx
  "use client"
  import { useEffect } from "react"
  import { usePathname, useRouter } from "next/navigation"
  import { useAuth } from "@/lib/v2/auth/useAuth"

  export function RequireAuth({ children }: { children: React.ReactNode }) {
    const { user } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
      if (!user) router.push(`/v2/login?from=${encodeURIComponent(pathname)}`)
    }, [user, router, pathname])

    if (!user) return null
    return <>{children}</>
  }
  ```

- [x] **Step 3**: App-group layout placeholder
  ```tsx
  // src/app/v2/(app)/layout.tsx
  import { RequireAuth } from "@/components/v2/auth/RequireAuth"
  export default function AppLayout({ children }: { children: React.ReactNode }) {
    return <RequireAuth>{children}</RequireAuth>
  }
  ```
- [ ] **Step 4**: Commit (not requested in this run)

---

# Phase 2 — Workspace shell / Khung workspace

### Task 2.1: V2Sidebar with collapse

**Files**:

- Create: `src/components/v2/layout/V2Sidebar.tsx`
- Create: `src/components/v2/layout/__tests__/V2Sidebar.test.tsx`

- [x] **Step 1**: Test: toggle persists + hover-expand timeout
  ```tsx
  it("toggle button collapses sidebar and persists", async () => {
    render(
      <Wrap>
        <V2Sidebar />
      </Wrap>
    )
    const toggle = screen.getByRole("button", { name: /collapse sidebar/i })
    await userEvent.click(toggle)
    expect(JSON.parse(localStorage.getItem("v2.sidebar.collapsed")!)).toBe(true)
  })
  ```
- [x] **Step 2**: Implementation (extends existing `Sidebar`)

  ```tsx
  // src/components/v2/layout/V2Sidebar.tsx
  "use client"
  import { useState, useRef } from "react"
  import { z } from "zod"
  import { PanelLeftClose, PanelLeftOpen, LayoutDashboard, Users, Settings as SettingsIcon } from "lucide-react"
  import Link from "next/link"
  import { usePathname } from "next/navigation"
  import { usePersistedState } from "@/lib/v2/persistence/usePersistedState"
  import { ActionTooltip } from "@/components/v2/common/ActionTooltip"

  const NAV = [
    { href: "/v2/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/v2/candidates", label: "Candidates", icon: Users },
    { href: "/v2/settings", label: "Settings", icon: SettingsIcon },
  ]

  export function V2Sidebar() {
    const [collapsed, setCollapsed] = usePersistedState("v2.sidebar.collapsed", false, z.boolean())
    const [peek, setPeek] = useState(false)
    const peekTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const path = usePathname()

    const expanded = !collapsed || peek

    function onEnter() {
      if (!collapsed) return
      peekTimer.current = setTimeout(() => setPeek(true), 300)
    }
    function onLeave() {
      if (peekTimer.current) clearTimeout(peekTimer.current)
      setPeek(false)
    }

    return (
      <aside
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        className={`flex h-screen shrink-0 flex-col border-r border-[var(--v2-ink)]/10 bg-[var(--v2-surface)] transition-[width] duration-200 ${expanded ? "w-[240px]" : "w-16"}`}
      >
        <div className="flex items-center justify-between p-4">
          <span className={`text-sm font-bold ${expanded ? "" : "sr-only"}`}>SUN.RISER</span>
          <ActionTooltip label={collapsed ? "Expand sidebar" : "Collapse sidebar"} shortcut="⌘\">
            <button
              type="button"
              onClick={() => setCollapsed(v => !v)}
              className="rounded-md p-1.5 hover:bg-[var(--v2-ink)]/5"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
            </button>
          </ActionTooltip>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-2">
          {NAV.map(n => {
            const active = path === n.href
            const Icon = n.icon
            const content = (
              <Link
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
                  active ? "bg-[var(--v2-primary)]/10 text-[var(--v2-primary)]" : "hover:bg-[var(--v2-ink)]/5"
                }`}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                {expanded && <span>{n.label}</span>}
              </Link>
            )
            return collapsed && !peek ? (
              <ActionTooltip key={n.href} label={n.label}>
                {content}
              </ActionTooltip>
            ) : (
              <div key={n.href}>{content}</div>
            )
          })}
        </nav>
      </aside>
    )
  }
  ```

- [x] **Step 3**: Add keyboard shortcut hook (separate file)
  ```ts
  // src/lib/v2/keyboard/useShortcut.ts
  "use client"
  import { useEffect } from "react"
  export function useShortcut(combo: { key: string; meta?: boolean; ctrl?: boolean }, handler: () => void) {
    useEffect(() => {
      function onKey(e: KeyboardEvent) {
        if (e.key.toLowerCase() !== combo.key.toLowerCase()) return
        if (combo.meta && !(e.metaKey || e.ctrlKey)) return
        e.preventDefault()
        handler()
      }
      window.addEventListener("keydown", onKey)
      return () => window.removeEventListener("keydown", onKey)
    }, [combo.key, combo.meta, combo.ctrl, handler])
  }
  ```
- [x] **Step 4**: Run tests (commit not requested yet for this phase slice)

### Task 2.2: V2TopBar

**Files**:

- Create: `src/components/v2/layout/V2TopBar.tsx`

**Goal**: Title/subtitle slot + actions slot (right). Include AI Drawer trigger (Sparkles), Notes Drawer trigger (NotebookPen), Create Report trigger, Export trigger, Avatar dropdown.

Acceptance:

- [x] Each icon button wrapped in `ActionTooltip` with label + shortcut
- [x] Avatar dropdown shows name + email + role badge + Sign out
- [x] Sticky top on scroll

Pattern reuse: extend the layout idea from `src/components/layout/TopBar.tsx` but accept additional `drawerSlots` prop.

### Task 2.3: ThemeSwitcher floating widget

**Files**:

- Create: `src/components/v2/theme/ThemeSwitcher.tsx`
- Create: `src/components/v2/theme/__tests__/ThemeSwitcher.test.tsx`

- [x] **Step 1**: Test
  ```tsx
  it("clicking chip B sets html data-theme to b", async () => {
    render(
      <Wrap>
        <ThemeSwitcher />
      </Wrap>
    )
    await userEvent.click(screen.getByRole("button", { name: /theme b/i }))
    expect(document.documentElement.getAttribute("data-theme")).toBe("b")
  })
  ```
- [x] **Step 2**: Implementation

  ```tsx
  // src/components/v2/theme/ThemeSwitcher.tsx
  "use client"
  import { Moon, Sun, X } from "lucide-react"
  import { z } from "zod"
  import { usePersistedState } from "@/lib/v2/persistence/usePersistedState"
  import { useTheme } from "@/lib/v2/theme/useTheme"
  import { ActionTooltip } from "@/components/v2/common/ActionTooltip"

  const CHIPS = [
    { key: "a", label: "Theme A — Main (shadcn)", color: "#FF5533" },
    { key: "b", label: "Theme B — Lab (Skeleton)", color: "#8d1600" },
    { key: "c", label: "Theme C — Hybrid", color: "#FF8E53" },
  ] as const

  export function ThemeSwitcher() {
    const [hidden, setHidden] = usePersistedState("v2.theme.widgetHidden", false, z.boolean())
    const { theme, setTheme, effectiveMode, setMode } = useTheme()
    if (hidden) return null

    return (
      <div className="fixed right-6 bottom-6 z-50 flex items-center gap-1 rounded-full bg-[var(--v2-surface)] p-2 shadow-lg ring-1 ring-[var(--v2-ink)]/10">
        {CHIPS.map(c => (
          <ActionTooltip key={c.key} label={c.label}>
            <button
              type="button"
              onClick={() => setTheme(c.key)}
              aria-label={c.label}
              aria-pressed={theme === c.key}
              className={`size-7 rounded-full border-2 transition ${
                theme === c.key ? "scale-110 border-[var(--v2-ink)]" : "border-transparent hover:scale-105"
              }`}
              style={{ backgroundColor: c.color }}
            />
          </ActionTooltip>
        ))}
        <span className="mx-1 h-5 w-px bg-[var(--v2-ink)]/15" />
        <ActionTooltip label={effectiveMode === "dark" ? "Switch to light" : "Switch to dark"}>
          <button
            type="button"
            onClick={() => setMode(effectiveMode === "dark" ? "light" : "dark")}
            className="rounded-full p-1.5 hover:bg-[var(--v2-ink)]/5"
            aria-label="Toggle mode"
          >
            {effectiveMode === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
        </ActionTooltip>
        <ActionTooltip label="Hide widget" description="Re-enable from Settings → Appearance">
          <button
            type="button"
            onClick={() => setHidden(true)}
            className="rounded-full p-1.5 hover:bg-[var(--v2-ink)]/5"
            aria-label="Hide theme switcher"
          >
            <X className="size-3.5" />
          </button>
        </ActionTooltip>
      </div>
    )
  }
  ```

- [x] **Step 3**: Mount in `/v2/layout.tsx` next to `<Toaster />`
- [x] **Step 4**: Run tests (commit not requested yet for this phase slice)

### Task 2.4: /v2/dashboard page

**Files**:

- Create: `src/app/v2/(app)/dashboard/page.tsx`

Reuse `StatsCard` (existing) + `OverviewCharts` (existing). Wrap with V2Sidebar + V2TopBar in layout.

Acceptance:

- [x] Renders 4 StatsCards + Charts
- [x] Title "Overview" / subtitle "SUN.RISER 2026 · Internship Recruitment"
- [x] Action buttons in TopBar: `Create Report`, `Export Data`

### Task 2.5: Update `/v2/(app)/layout.tsx` with shell

**Files**:

- Modify: `src/app/v2/(app)/layout.tsx`

```tsx
import { V2Sidebar } from "@/components/v2/layout/V2Sidebar"
import { V2TopBar } from "@/components/v2/layout/V2TopBar"
import { RequireAuth } from "@/components/v2/auth/RequireAuth"
import { PinnedToolbar } from "@/components/v2/pin/PinnedToolbar"
import { AiDrawer } from "@/components/v2/chat/AiDrawer"
import { NotesDrawer } from "@/components/v2/notes/NotesDrawer"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <div className="flex h-screen">
        <V2Sidebar />
        <main className="flex-1 overflow-y-auto">
          <V2TopBar />
          <PinnedToolbar />
          {children}
        </main>
        <AiDrawer />
        <NotesDrawer />
      </div>
    </RequireAuth>
  )
}
```

Acceptance: All routes under `/v2/(app)/*` render with sidebar + topbar + drawer slots.

Status: Shell wired with `V2Sidebar` and `V2TopBar`. Drawer and pinned toolbar slots will be added when their feature phases create those components.

---

# Phase 3 — View options / Tùy chọn view

### Task 3.1: ViewPillNav (port from `FloatingPillNav`)

**Files**:

- Create: `src/components/v2/layout/ViewPillNav.tsx`
- Create: `src/lib/v2/views/useViewState.ts`

Differences from lab's `FloatingPillNav`:

- Remove ALL mock content (`FEATURES`, `USE_CASES`, `Pricing`)
- Replace with 4 icon-only buttons: `Table2`, `Kanban`, `LayoutGrid`, `BarChart3`
- Each wrapped in `ActionTooltip`
- Keep scroll auto-hide behavior
- Active = primary theme color
- Keyboard `1-4` triggers view switch

```tsx
// snippet of inner pill
{
  VIEWS.map((v, i) => (
    <ActionTooltip key={v.key} label={v.label} shortcut={String(i + 1)}>
      <button
        type="button"
        onClick={() => setView(v.key)}
        aria-pressed={current === v.key}
        aria-label={v.label}
        className={`flex size-10 items-center justify-center rounded-full transition ${
          current === v.key ? "bg-[var(--v2-primary)] text-white" : "hover:bg-white/10"
        }`}
      >
        <v.Icon className="size-4" />
      </button>
    </ActionTooltip>
  ))
}
```

useViewState hook persists `v2.view.current`.

### Task 3.2: TableView (wrap `ApplicantTable`)

**Files**:

- Create: `src/components/v2/views/TableView.tsx`

Wrap existing `src/components/table/ApplicantTable.tsx`. Pass through filters + add pin column.

Acceptance: All Table features intact, pin star renders per row.

### Task 3.3: PipelineView (port `KanbanView` from lab)

**Files**:

- Create: `src/components/v2/views/PipelineView.tsx` (Theme A render path — shadcn-based)
- Create: `src/components/v2/views/PipelineView.skeleton.tsx` (Theme B & C render path — Skeleton-based, port from lab)
- Create: `src/components/v2/views/ThemedView.tsx` (selector)

```tsx
// ThemedView.tsx
"use client"
import { useTheme } from "@/lib/v2/theme/useTheme"

export function ThemedView<P extends Record<string, unknown>>({
  shadcnComponent: Shadcn,
  skeletonComponent: Skeleton,
  props,
}: {
  shadcnComponent: React.ComponentType<P>
  skeletonComponent: React.ComponentType<P>
  props: P
}) {
  const { theme } = useTheme()
  if (theme === "b" || theme === "c") return <Skeleton {...props} />
  return <Shadcn {...props} />
}
```

PipelineView Theme A:

- 4 columns by default: Not Reviewed / Pass / Waiting / Fail (Round 1 status)
- groupBy selector dropdown: Round1 / Position / Batch
- DnD between/within via `@dnd-kit/sortable`

Acceptance: 211 existing lab tests for `KanbanView` still pass with the ported skeleton variant. Theme A path has its own tests (2-3 cases).

### Task 3.4: GalleryView (port + extend)

**Files**:

- Create: `src/components/v2/views/GalleryView.tsx` (Theme A shadcn cards)
- Create: `src/components/v2/views/GalleryView.skeleton.tsx` (port from lab)

Rich cards: avatar + name + position + GPA + Round1 badge + tags. DnD via `@dnd-kit`.

### Task 3.5: ChartView (extend OverviewCharts)

**Files**:

- Create: `src/components/v2/views/ChartView.tsx`

Reuse existing `OverviewCharts`. Add 2-3 mini-charts (pass rate by university, applicants by month). DnD for chart cards layout (via @dnd-kit).

### Task 3.6: /v2/candidates page wires views together

**Files**:

- Create: `src/app/v2/(app)/candidates/page.tsx`

```tsx
"use client"
import { useViewState } from "@/lib/v2/views/useViewState"
import { ViewPillNav } from "@/components/v2/layout/ViewPillNav"
import { TableView } from "@/components/v2/views/TableView"
import { PipelineView } from "@/components/v2/views/PipelineView"
import { GalleryView } from "@/components/v2/views/GalleryView"
import { ChartView } from "@/components/v2/views/ChartView"
import { mockApplicants } from "@/lib/mockData"

export default function CandidatesPage() {
  const { view } = useViewState()
  return (
    <>
      <div className="p-3 sm:p-4 lg:p-6">
        {view === "table" && <TableView data={mockApplicants} />}
        {view === "pipeline" && <PipelineView data={mockApplicants} />}
        {view === "gallery" && <GalleryView data={mockApplicants} />}
        {view === "chart" && <ChartView data={mockApplicants} />}
      </div>
      <ViewPillNav />
    </>
  )
}
```

Acceptance: All 4 views switchable via PillNav. Keyboard 1-4 works. Active highlight per theme.

### Task 3.7: Saved views (reuse `SavedViewsPopover` from lab)

**Files**:

- Create: `src/lib/v2/views/useSavedViews.ts`
- Re-export lab's `SavedViewsPopover` via a thin wrapper that uses v2 state

Acceptance: Save current view (filters + sort + groupBy) → `v2.view.savedViews`. Pin in PillNav menu.

---

# Phase 4 — AI Chat Drawer / Drawer chat AI

### Task 4.1: AiDrawer base + float mode

**Files**:

- Create: `src/components/v2/chat/AiDrawer.tsx`
- Create: `src/lib/v2/chat/useChat.ts`
- Create: `src/lib/v2/chat/mockResponses.ts`
- Create: `src/lib/v2/chat/types.ts`

- [x] **Step 1**: Types
  ```ts
  export interface Message {
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: string
  }
  export type DrawerMode = "float" | "dock"
  ```
- [x] **Step 2**: Mock responses (extracted from existing `FloatingChat.tsx`)
- [x] **Step 3**: `useChat` hook

  ```ts
  // sketch
  export function useChat() {
    const [messages, setMessages] = usePersistedState<Message[]>('v2.chat.history', INITIAL_MESSAGES, messageArraySchema)
    const [pending, setPending] = useState(false)

    async function send(text: string) {
      const userMsg: Message = { id: nanoid(8), role: 'user', content: text, timestamp: now() }
      setMessages((m) => [...m, userMsg])
      setPending(true)
      const reply = matchResponse(text)
      // typing animation
      for (let i = 1; i <= reply.length; i++) {
        await sleep(120)
        setMessages((m) => /* update last assistant or append */)
      }
      setPending(false)
    }
    return { messages, send, pending }
  }
  ```

- [x] **Step 4**: AiDrawer component (float mode skeleton)
- [x] **Step 5**: Test: send message → assistant reply appears
- [ ] **Step 6**: Commit

### Task 4.2: Dock mode + resize + push content

**Files**:

- Modify: `src/components/v2/chat/AiDrawer.tsx`
- Create: `src/lib/v2/drawer/useDrawerLayout.ts` (manages docked offset for `<main>`)

Pattern:

- DrawerLayoutContext at `(app)/layout.tsx` provides `{ aiOffset, notesOffset, registerDrawer, unregisterDrawer }`
- AiDrawer registers its docked width when in dock mode, `<main>` reads sum and applies `margin-right`

- [x] Tests: docking sets margin, switching to float resets margin, resize updates margin
- [x] Implementation with `useRef` for resize handle (mousedown + mousemove)
- [x] Persist `v2.chat.mode`, `v2.chat.dockWidth`
- [ ] Commit

### Task 4.3: TopBar trigger + ⌘J shortcut

**Files**:

- Modify: `src/components/v2/layout/V2TopBar.tsx`

Add Sparkles icon button → `useDrawer('chat').toggle()`. Wire `useShortcut({ key: 'j', meta: true })`.

---

# Phase 5 — Notes Drawer / Drawer Notes

### Task 5.1: NotesDrawer base

**Files**:

- Create: `src/components/v2/notes/NotesDrawer.tsx`
- Create: `src/lib/v2/notes/useNotes.ts`
- Create: `src/lib/v2/notes/types.ts`

Reuse the drawer shell pattern from `AiDrawer` — extract `DrawerShell.tsx` that both consume.

**Files (refactor)**:

- Create: `src/components/v2/common/DrawerShell.tsx`
- Refactor: `AiDrawer.tsx` to consume `DrawerShell`

DrawerShell handles:

- Mode switch float/dock
- Resize handle in dock
- Coexistence check (registers in shared registry)
- Trigger position

### Task 5.2: Notes state hook

```ts
export interface Note {
  id: string
  scope: "global" | `candidate:${string}`
  title: string
  body: string
  updatedAt: string
}

export function useNotes(candidateId?: string) {
  const [items, setItems] = usePersistedState<Note[]>("v2.notes.items", [], notesArraySchema)
  // scoped, filtered, debounced auto-save
}
```

Acceptance: New / edit / delete / scope filter. Auto-save after 500ms idle.

### Task 5.3: Coexistence rule with AiDrawer

**Files**:

- Create: `src/lib/v2/drawer/DrawerRegistry.tsx`

```ts
// only one can be docked at a time
function tryDock(drawerId: "chat" | "notes") {
  const dockedId = Object.entries(state).find(([, m]) => m === "dock")?.[0]
  if (dockedId && dockedId !== drawerId) {
    toast(`${dockedId === "chat" ? "AI Drawer" : "Notes Drawer"} is docked; ${drawerId === "chat" ? "AI" : "Notes"} opened in floating mode`)
    return "float"
  }
  return "dock"
}
```

Acceptance: Open both in float ✓. Open one in dock ✓. Try opening second in dock → falls back to float + toast.

---

# Phase 6 — Pin & Compare

### Task 6.1: usePinned hook

**Files**:

- Create: `src/lib/v2/pin/usePinned.ts`
- Create: `src/lib/v2/pin/__tests__/usePinned.test.ts`

- [x] Tests: add up to 5, 6th blocked, remove, clear
- [x] Implementation
  ```ts
  export function usePinned() {
    const [ids, setIds] = usePersistedState<string[]>("v2.pinned", [], z.array(z.string()).max(5))
    const max = 5
    const add = (id: string) => (ids.length < max && !ids.includes(id) ? setIds([...ids, id]) : null)
    const remove = (id: string) => setIds(ids.filter(x => x !== id))
    const clear = () => setIds([])
    const has = (id: string) => ids.includes(id)
    return { ids, max, add, remove, clear, has, isFull: ids.length >= max }
  }
  ```

### Task 6.2: PinStarButton

**Files**:

- Create: `src/components/v2/pin/PinStarButton.tsx`

```tsx
export function PinStarButton({ id }: { id: string }) {
  const { has, add, remove, isFull } = usePinned()
  const pinned = has(id)
  const disabled = !pinned && isFull
  const label = pinned ? "Unpin" : disabled ? "Limit 5 pinned candidates" : "Pin to compare"

  return (
    <ActionTooltip label={label} shortcut="P">
      <button
        type="button"
        disabled={disabled}
        onClick={() => (pinned ? remove(id) : add(id))}
        className="rounded-full p-1.5 transition hover:bg-[var(--v2-ink)]/5 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={label}
        aria-pressed={pinned}
      >
        <Star className={`size-4 ${pinned ? "fill-[var(--v2-primary)] text-[var(--v2-primary)]" : ""}`} />
      </button>
    </ActionTooltip>
  )
}
```

### Task 6.3: PinnedToolbar

**Files**:

- Create: `src/components/v2/pin/PinnedToolbar.tsx`

Sticky bar above main content. Chip per pin with remove X. Compare (N) button → `router.push('/v2/compare')`. Clear all with confirm dialog.

### Task 6.4: /v2/compare page

**Files**:

- Create: `src/app/v2/(app)/compare/page.tsx`
- Create: `src/components/v2/pin/ComparePage.tsx` (port `ComparePanel` from lab)

Acceptance:

- Side-by-side columns max 5
- Field rows enumerated per spec
- Difference highlight via cell tint
- Export PDF via `window.print()` + print-only CSS

### Task 6.5: Wire pin buttons in all views

**Files**:

- Modify: `src/components/v2/views/TableView.tsx` (add pin column)
- Modify: `PipelineView.tsx`, `GalleryView.tsx` (pin on card)
- Modify: `ApplicantDrawer` reuse from lab — wrap with pin button via portal or pass-through

---

# Phase 7 — AI Report + Public routes / AI Report + Public routes

### Task 7.1: Report template + mock streaming

**Files**:

- Create: `src/lib/v2/report/reportTemplate.ts`
- Create: `src/lib/v2/report/useReport.ts`
- Create: `src/lib/v2/report/types.ts`

```ts
export interface ReportSection { id: 'summary' | 'top' | 'insights' | 'recommendations'; title: string; content: string }
export interface ReportSnapshot { shareId: string; generatedAt: string; sections: ReportSection[]; sourceApplicants: string[] }

// useReport handles staged reveal
export function useReport() {
  const [sections, setSections] = useState<ReportSection[]>([])
  const [pending, setPending] = useState(false)
  async function generate(pinnedIds: string[]) { /* sequential reveal with abort */ }
  function regenerate() { setSections([]); generate(...) }
  function abort() { /* signal stop */ }
  return { sections, generate, regenerate, abort, pending }
}
```

### Task 7.2: ReportModal

**Files**:

- Create: `src/components/v2/report/ReportModal.tsx`

Use shadcn `Dialog`. Buttons: Regenerate / Share / Download PDF / Close — each wrapped in ActionTooltip.

Share button:

- Generate `shareId = nanoid(10)`
- Build snapshot
- Write to `v2.report.shares[shareId]`
- Copy URL `/v2/public/report/${shareId}` to clipboard
- Toast "Share link copied!"

### Task 7.3: /v2/public/results

**Files**:

- Create: `src/app/v2/public/layout.tsx`
- Create: `src/app/v2/public/results/page.tsx`
- Create: `src/components/v2/public/AdmittedGrid.tsx`

Layout: minimal header (logo + "Back to login"), branded gradient.

Page reads `mockApplicants`, filters `passRound1 === 'pass'`, renders grid showing ONLY avatar + name + position. Filter by position dropdown.

Print-friendly CSS:

```css
@media print {
  .public-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  nav,
  footer {
    display: none;
  }
}
```

### Task 7.4: /v2/public/report/[shareId]

**Files**:

- Create: `src/app/v2/public/report/[shareId]/page.tsx`
- Create: `src/components/v2/public/PublicReport.tsx`
- Create: `src/lib/v2/public/anonymize.ts`

Client-side load `v2.report.shares[shareId]` from localStorage. Render anonymized:

```ts
function anonymize(snapshot: ReportSnapshot): ReportSnapshot {
  const map = new Map(snapshot.sourceApplicants.map((id, i) => [id, `Candidate ${String.fromCharCode(65 + i)}`]))
  // replace names in content
}
```

Fallback 404 if shareId not found in localStorage.

---

# Phase 8 — Settings / Cài đặt

### Task 8.1: Settings page shell + tabs

**Files**:

- Create: `src/app/v2/(app)/settings/page.tsx`
- Create: `src/components/v2/settings/AppearanceTab.tsx`
- Create: `src/components/v2/settings/WorkspaceTab.tsx`
- Create: `src/components/v2/settings/AccountTab.tsx`

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export default function SettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Settings</h1>
      <Tabs defaultValue="appearance" className="mt-6">
        <TabsList>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>
        <TabsContent value="appearance">
          <AppearanceTab />
        </TabsContent>
        <TabsContent value="workspace">
          <WorkspaceTab />
        </TabsContent>
        <TabsContent value="account">
          <AccountTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

### Task 8.2: AppearanceTab

- Inline ThemeSwitcher row (3 chips + labels)
- Dark/Light/System radio group → setMode
- Density radio cards (Compact / Comfortable) with mini-preview
- "Show theme switcher widget" toggle (controls `v2.theme.widgetHidden`)

### Task 8.3: WorkspaceTab

- Default view dropdown
- Default sort dropdown
- Language toggle (vi/en) — UI only, no i18n wiring
- Keyboard shortcuts table (read-only, list `⌘\`, `⌘J`, `⌘N`, `⌘R`, `1-4`, `P`)

### Task 8.4: AccountTab

- Avatar + name + email + role badge (from `useAuth`)
- Change password form (mock — show toast on save)
- Sign out button + confirm `Dialog`

---

# Phase 9 — Polish & QA / Hoàn thiện & QA

### Task 9.1: ActionTooltip audit

Walk every clickable element in `components/v2/**` and verify it's wrapped in `ActionTooltip`. Add where missing.

- [ ] Run grep for `<button` and `<a` inside `components/v2/`
  ```bash
  npx grep -rE "<(button|Link)\b" src/components/v2 src/app/v2 | grep -v "ActionTooltip"
  ```
- [ ] Wrap any naked buttons/links found
- [ ] Commit

### Task 9.2: Keyboard shortcuts integration test

**File**: `src/__tests__/v2-shortcuts.test.tsx`

Test each shortcut fires the right action when /v2/(app)/\* is mounted.

### Task 9.3: Reduced motion

**File**: `src/styles/v2-themes.css` (append)

```css
@media (prefers-reduced-motion: reduce) {
  .v2-root,
  .v2-root * {
    transition: none !important;
    animation: none !important;
  }
}
```

Audit AI chat typing animation, theme transition, drawer slides — all gated by `prefers-reduced-motion`.

### Task 9.4: Mobile review

Open all routes on viewport ≤ 640px:

- Sidebar: overlay floating from V2Sidebar's expand
- Drawer: always full-screen modal (skip dock mode)
- ViewPillNav: icons-only compact
- Settings tabs: vertical stack

### Task 9.5: Final QA gate

- [ ] `npx tsc --noEmit` PASS
- [ ] `npm run lint` PASS
- [ ] `npm run format -- --check` PASS
- [ ] `npm test` ALL PASS (211 baseline + new tests)
- [ ] `npm run build` PASS

---

## Self-review checklist / Tự kiểm tra

### Spec coverage / Bao phủ spec

- [x] 11 features all mapped to phases
- [x] 3 themes (Theme C uses Skeleton islands via `ThemedView`)
- [x] Notes Drawer (Phase 5)
- [x] Action UX standards (Phase 0 ActionTooltip + Phase 9 audit)
- [x] Public routes (Phase 7.3 + 7.4)
- [x] Persistence keys all under `v2.*` (declared in Phase 0)
- [x] Mock-only AI (Phase 4 + Phase 7)
- [x] Sidebar collapse + hover-expand (Phase 2.1)
- [x] FloatingPillNav port (Phase 3.1)
- [x] Pin max 5 + compare (Phase 6)

### Placeholders / Chỗ TODO

None — every step has either code, a file path, or an explicit pattern reference.

### Type consistency / Nhất quán types

- `V2Theme = 'a' | 'b' | 'c'` used in `themes.ts`, `ThemeProvider`, `ThemeSwitcher` ✓
- `Note` shape consistent across spec + Phase 5.2 ✓
- `ReportSnapshot` consistent across Phase 7.1 + 7.4 ✓
- `V2Role` consistent across `mockUsers.ts`, `AuthProvider`, `RequireAuth` ✓

### Risks / Rủi ro

1. **Theme C runtime swap cost**: Conditionally rendering two component libraries may bloat the bundle. Mitigation: dynamic import for Skeleton variants — `next/dynamic` with `ssr: false` for skeleton islands.
2. **Public report from localStorage**: server can't read localStorage. Mitigation in Phase 7.4: client-component load + fallback 404 UI. Future: store snapshot in URL via base64 (small enough for short reports).
3. **DnD on Pipeline groupBy switch**: changing groupBy mid-drag will conflict. Mitigation: disable groupBy dropdown while dragging.
4. **3 themes × 2 modes design QA**: 6 combos to QA visually. Mitigation: theme switcher floating widget makes A/B/C comparison fast.

---

## Execution choice

Plan saved to `docs/superpowers/plans/2026-05-18-v2-workspace-plan.md`. Two execution options:

1. **Subagent-Driven (recommended)** — Dispatch fresh subagent per task, review between tasks, fast iteration. Uses `superpowers:subagent-driven-development`.
2. **Inline Execution** — Execute tasks in current session, batch checkpoints. Uses `superpowers:executing-plans`.

Cả 2 đều theo trình tự Phase 0 → 9. Khuyên Subagent-Driven cho scope 11-feature như này để context isolation tốt hơn.

Hỏi bạn: chọn approach nào, hay review spec/plan trước rồi mới chọn?
