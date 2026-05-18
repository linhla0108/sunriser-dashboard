# Code Review Report — SUN.RISER Dashboard

**Reviewed by:** Automated Claude agent (scheduled task)
**Date:** 2026-05-18
**Scope:** Full repository, emphasis on the two most recent commits (`feat(v2): scaffold workspace foundation and auth` · `feat(v2): add workspace shell dashboard`)
**Stack:** Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · Zod · Vitest

---

## Summary

| Priority | Count |
|----------|-------|
| 🔴 Critical | 2 |
| 🟠 High | 5 |
| 🟡 Medium | 7 |
| 🔵 Low / Housekeeping | 5 |

---

## 🔴 Critical

### C-1 · Plaintext passwords in client bundle (`src/lib/v2/auth/mockUsers.ts`)

```ts
// mockUsers.ts — ships in the browser bundle
export const MOCK_USERS = [
  { id: "u_admin", email: "admin@sunriser.com", password: "admin123", ... },
  { id: "u_member", email: "member@sunriser.com", password: "member123", ... },
]
```

`MOCK_USERS` is imported by `AuthProvider` (client component) **and** `LoginForm`, so both passwords are visible in any browser's DevTools → Sources tab. For a development prototype this is inconvenient; if the pattern is accidentally promoted toward a real auth layer the risk escalates.

**Additionally**, `LoginForm` imports `MOCK_USERS` directly to populate "quick fill" buttons, meaning the raw passwords are also rendered in JS with no obfuscation.

**Solution (priority: before any shared deployment):**
- Move mock credentials to `.env.local` or remove the password from the exported type entirely.
- `LoginForm`'s quick-fill buttons should hard-code only display labels, not pull from the user store.

---

### C-2 · Session expiry never checked (`src/lib/v2/auth/AuthProvider.tsx`)

```ts
const user = useMemo(() => {
  if (!session) return null
  const match = MOCK_USERS.find(c => c.id === session.userId)
  // ❌ session.expiresAt is NEVER validated
  return match ? { id, email, name, role } : null
}, [session])
```

`setSession` stores an `expiresAt` timestamp 7 days in the future, but no code ever reads it. A session stored in `localStorage` will remain valid forever, regardless of the expiry value.

**Solution:**
```ts
if (session && new Date(session.expiresAt) < new Date()) {
  setSession(null)   // auto-logout on next render
  return null
}
```

---

## 🟠 High

### H-1 · OTP flow is a no-op auth bypass (`src/app/v2/otp/page.tsx`, `OtpForm.tsx`)

Entering any 6 digits calls `onSuccess()` → `router.push("/v2/dashboard")`. There is no OTP code generated, stored, or validated. The OTP page is reachable directly via URL even when not in a signup flow, allowing any user to navigate to `/v2/otp`, type 6 numbers, and land on the authenticated dashboard without credentials.

**Solution:** Either guard the OTP route with a signup-flow flag in `sessionStorage`, or clearly mark the page as a UI stub that must not be exposed on any shared environment.

---

### H-2 · Missing routes cause silent 404s from the sidebar (`src/components/v2/layout/V2Sidebar.tsx`)

The sidebar lists three nav items:

| Route | Page exists? |
|-------|-------------|
| `/v2/dashboard` | ✅ |
| `/v2/candidates` | ❌ 404 |
| `/v2/settings` | ❌ 404 |

Clicking "Candidates" or "Settings" lands on Next.js's 404 page with no feedback. The sidebar highlights the broken link as "active" via `pathname === item.href`.

**Solution:** Add stub pages or render those nav items as `disabled` with a `coming-soon` tooltip until pages are implemented.

---

### H-3 · `RequireAuth` does not honour the `?from` redirect parameter (`src/components/v2/auth/RequireAuth.tsx`, `src/app/v2/login/page.tsx`)

`RequireAuth` redirects unauthenticated users to `/v2/login?from=<path>`, but `V2LoginPage` passes `onSuccess={() => router.push("/v2/dashboard")}` — it never reads `searchParams.from`. After login users always land on `/v2/dashboard` instead of the page they requested.

**Solution:**
```ts
// V2LoginPage
const searchParams = useSearchParams()
const from = searchParams.get("from") ?? "/v2/dashboard"
<LoginForm onSuccess={() => router.push(from)} />
```
Add `<Suspense>` wrapper as required by Next.js for `useSearchParams` in Server Component trees.

---

### H-4 · `ThemeProvider` ignores OS color-scheme changes at runtime (`src/lib/v2/theme/ThemeProvider.tsx`)

`getSystemMode()` is called synchronously during render to compute `effectiveMode`. It reads `window.matchMedia` once but never subscribes to `(prefers-color-scheme: dark)` changes. If a user switches from light to dark OS mode while the tab is open, the theme does not update until a page reload.

**Solution:**
```ts
useEffect(() => {
  if (modeValue !== "system") return
  const mql = window.matchMedia("(prefers-color-scheme: dark)")
  const handler = () => {
    document.documentElement.setAttribute("data-mode", mql.matches ? "dark" : "light")
  }
  mql.addEventListener("change", handler)
  return () => mql.removeEventListener("change", handler)
}, [modeValue])
```

---

### H-5 · `ApplicantTable` ignores prop updates after mount (`src/components/table/ApplicantTable.tsx`)

```ts
const [items, setItems] = useState<Applicant[]>(data)
```

React only uses the `data` prop as the **initial** value. Any change to the `data` prop (e.g., filtering at the parent level, async data refresh) will be silently ignored because the component owns a copy of the data in local state. This is a known React pitfall that causes subtle staleness bugs.

**Solution:** Use `useEffect` to sync when `data` changes (with a stable reference check), or hoist the sorted/reordered items to the parent and pass them as a controlled prop:
```ts
useEffect(() => { setItems(data) }, [data])
```

---

## 🟡 Medium

### M-1 · Mixed UI component libraries — `@skeletonlabs/skeleton-react` vs `shadcn/ui` (`src/app/lab/components/FilterBuilder.tsx`)

`FilterBuilder` imports `Dialog` from `@skeletonlabs/skeleton-react`, while every other component in the project uses `shadcn/ui` dialogs (`@radix-ui`). This:
- Adds ~35 KB to the bundle for a single component.
- Causes visual inconsistencies (Skeleton's default styles differ from the project's design tokens).
- Requires developers to maintain two different dialog APIs.

**Solution:** Replace `Dialog` from Skeleton with the project's `Dialog` from `@/components/ui/dialog`.

---

### M-2 · `"Create Report"` and `"Export Data"` share the same handler (`src/app/page.tsx`)

Both action buttons in the legacy dashboard call `setExportOpen(true)`. "Create Report" incorrectly opens the export modal rather than any report-creation flow.

```tsx
// Both buttons do the same thing — this is a bug
<button onClick={() => setExportOpen(true)}>Export Data</button>
<button onClick={() => setExportOpen(true)}>Create Report</button>
```

**Solution:** Wire "Create Report" to its own state or stub handler, or hide it until the feature is built.

---

### M-3 · V2 `TopBar` action buttons are no-ops in the current layout (`src/app/v2/(app)/layout.tsx`)

`V2TopBar` accepts `onOpenChat`, `onOpenNotes`, `onCreateReport`, `onExportData` props but `V2AppLayout` renders `<V2TopBar />` with no props passed. All four action buttons (`Sparkles`, `NotebookPen`, "Create Report", "Export Data") are silently non-functional.

**Solution:** Either pass handlers from the layout, or use a context/event bus to allow child pages to register action handlers.

---

### M-4 · `ThemeSwitcher` hidden state is not exposed through `ThemeContext` (`src/components/v2/theme/ThemeSwitcher.tsx`)

The "Hide theme switcher" button persists `v2.theme.widgetHidden = true` to `localStorage` via its own `usePersistedState` call, outside `ThemeContext`. The tooltip says "Re-enable from Settings", but `ThemeContext` has no `setWidgetHidden` method — there is no settings page yet, and no programmatic way to reset this outside clearing `localStorage` manually.

**Solution:** Move `widgetHidden` into `ThemeContext` and expose `showWidget()` / `hideWidget()` methods so a future Settings page can toggle it.

---

### M-5 · `ViewPillNav` attaches duplicate scroll listeners (`src/components/v2/layout/ViewPillNav.tsx`)

```ts
window.addEventListener("scroll", onScroll, { passive: true })
document.addEventListener("scroll", onScroll, { capture: true, passive: true })
```

Both listeners fire for most scroll events. For a scrollable child element (e.g., `<main className="overflow-y-auto">`), the capture listener fires once; the bubbling listener may or may not fire depending on `stopPropagation`. This can cause `lastY` to be updated twice per frame, making the hide/show logic unreliable.

**Solution:** Use a single scroll listener on the actual scrollable container (the `<main>` element), using a ref or event delegation.

---

### M-6 · `xlsx` package is outdated with known CVEs (`package.json`)

`"xlsx": "^0.18.5"` (SheetJS community edition 0.18.5) has known prototype-pollution and ReDoS vulnerabilities. The maintainer's recommended path is to upgrade to `0.20.x` or switch to the paid Pro edition.

**Solution:** Upgrade to `xlsx@0.20.3` (latest community) and audit the API for breaking changes in the `GlobalDropZone` parsing logic.

---

### M-7 · `nanoid` and `next-themes` are installed but unused (`package.json`)

- `nanoid` is in `dependencies` but `lab-utils.ts` uses `crypto.randomUUID()` for ID generation. `nanoid` is not imported anywhere in the source.
- `next-themes` is in `dependencies` but the project uses a custom `ThemeProvider`; `next-themes` is not imported anywhere.

Both add unnecessary weight to the production bundle.

**Solution:** `npm uninstall nanoid next-themes`

---

## 🔵 Low / Housekeeping

### L-1 · Cross-feature import from `page.tsx` into `lab/` components

`src/app/page.tsx` imports `ExportModal` and `ApplicantDrawer` from `src/app/lab/components/`. The `lab/` directory is a separate feature area. This creates an upward dependency that makes `lab/` harder to move, rename, or lazy-load independently.

**Solution:** Move shared components (`ExportModal`, `ApplicantDrawer`) to `src/components/` or expose them through a barrel export from `lab/`.

---

### L-2 · `getInitials` duplicated across two modules

`getInitials(name)` is defined in both `src/app/lab/lab-utils.ts` and `src/components/v2/layout/V2TopBar.tsx` (local function). The implementations are slightly different (lab version: first 2 words; TopBar version: same logic with an extra `?. ` guard).

**Solution:** Consolidate into `src/lib/utils.ts` and import where needed.

---

### L-3 · Hard-coded colors in `ApplicantTable` and legacy components

`ApplicantTable.tsx` uses raw hex strings (`text-[#FF5533]`, `text-[#767676]`) rather than the design token CSS variables from `globals.css` (e.g., `text-[var(--color-brand)]`). The V2 layer uses variables consistently; the V1 layer does not.

**Solution:** Audit V1 components and migrate raw hex values to theme variables.

---

### L-4 · `StatsCard` `passedRound1` value type inconsistency

In `src/lib/types.ts`, `DashboardStats.passedRound1` is typed as `number`. But `StatsCard` receives it as `value={dashboardStats.passedRound1}` where `value` is `string | number`. In V2's dashboard page the same field is passed without `.toLocaleString()`, while in V1 `totalApplicants` gets `.toLocaleString()` but `passedRound1` does not. Minor visual inconsistency.

---

### L-5 · `useShortcut` `combo` object not memoized at call-site

In `V2Sidebar`, `useShortcut` is called with an inline object literal:
```ts
useShortcut({ key: "\\", meta: true }, toggleCollapsed)
```
Each render creates a new `combo` object. Although the hook destructures individual keys in the dependency array (`combo.ctrl`, `combo.key`, `combo.meta`), it's still a fragile pattern if the hook's internals change. Prefer `useMemo` for the combo or accept individual params.

---

## Performance Notes

| Area | Observation |
|------|-------------|
| `mockData.ts` (646 applicants) | Imported at module level; no lazy-loading or pagination. For a mock this is fine, but the full array is always in memory. |
| `OverviewCharts` (Recharts) | No dynamic import (`next/dynamic`). Recharts is a large dependency (~100 KB gzipped) loaded synchronously on first paint. |
| `GlobalDropZone` | `xlsx` library is imported at the top level, adding ~800 KB (unminified) to the initial bundle. This should be a dynamic import triggered only when a file is dropped. |
| `KanbanView` + `animejs` | `animate` and `stagger` from `animejs` are imported globally in `FilterBuilder` and `KanbanView`. If these views are not visible by default, they should be lazy-loaded with `React.lazy` / `next/dynamic`. |

---

## Benchmark: Bundle weight estimate (rough)

| Library | Approx. gzipped size | Usage |
|---------|---------------------|-------|
| `xlsx` | ~250 KB | Synchronous import in `GlobalDropZone` |
| `recharts` | ~100 KB | Synchronous import in `OverviewCharts` |
| `animejs` | ~15 KB | Two components in `lab/` |
| `@skeletonlabs/skeleton-react` | ~35 KB | One component (`FilterBuilder`) |
| `nanoid` | ~1 KB | **Unused** |
| `next-themes` | ~5 KB | **Unused** |

Converting `xlsx` and `recharts` to dynamic imports and removing unused packages could cut first-load JS by ~390 KB.

---

## Priority Action Plan

| # | Action | Priority | Effort |
|---|--------|----------|--------|
| 1 | Remove plaintext passwords from client bundle (C-1) | 🔴 Critical | Small |
| 2 | Enforce session expiry check (C-2) | 🔴 Critical | Small |
| 3 | Guard OTP route against direct navigation (H-1) | 🟠 High | Small |
| 4 | Add stub pages or disable broken sidebar links (H-2) | 🟠 High | Small |
| 5 | Fix `?from` redirect after login (H-3) | 🟠 High | Small |
| 6 | Subscribe to OS color-scheme changes (H-4) | 🟠 High | Small |
| 7 | Fix `ApplicantTable` stale prop bug (H-5) | 🟠 High | Small |
| 8 | Replace Skeleton `Dialog` with shadcn `Dialog` in `FilterBuilder` (M-1) | 🟡 Medium | Small |
| 9 | Fix "Create Report" button handler (M-2) | 🟡 Medium | Trivial |
| 10 | Dynamic import `xlsx` in `GlobalDropZone` (perf) | 🟡 Medium | Small |
| 11 | Dynamic import `recharts` in `OverviewCharts` (perf) | 🟡 Medium | Small |
| 12 | Remove unused `nanoid`, `next-themes` deps (M-7) | 🟡 Medium | Trivial |
| 13 | Expose `ThemeSwitcher` hidden state via `ThemeContext` (M-4) | 🟡 Medium | Medium |
| 14 | Fix duplicate scroll listeners in `ViewPillNav` (M-5) | 🟡 Medium | Small |
| 15 | Consolidate `getInitials` utility (L-2) | 🔵 Low | Trivial |

---

*This report was generated automatically. No source files were modified.*
