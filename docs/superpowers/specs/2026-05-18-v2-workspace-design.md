# V2 Workspace — Design Spec

**Generated**: 2026-05-18
**Source**: Brainstorming session (Linh Le Anh × Claude)
**Status**: Draft — post-brainstorming, pre-implementation plan
**Scope**: Single feature bundle for `/v2/*` parallel workspace

---

## Languages / Ngôn ngữ

- [Tiếng Việt](#tiếng-việt) — primary
- [English](#english)

---

# Tiếng Việt

## Tổng quan

V2 Workspace là **parallel route `/v2/*`** chứa toàn bộ feature mới được liệt kê, không ảnh hưởng route `/` cũ và `/lab` cũ. Tổng cộng 11 features:

1. Authentication (Login / Signup / Forgot / OTP, 3 roles, mock)
2. Pin candidates + Compare full-page
3. AI Chat Drawer (hybrid float/dock, push content)
4. **Notes Drawer** (small, right side, giống AI Chat Drawer)
5. Collapsible sidebar (manual + persist + hover-expand)
6. AI Report (modal + PDF download + Share via public link)
7. Settings (Appearance / Workspace / Account)
8. View options Table / Pipeline / Gallery / Chart với DnD
9. 3 themes orthogonal với dark/light (6 combos)
10. Public routes `/v2/public/results` + `/v2/public/report/[shareId]`
11. Action UX standards toàn cục (tooltip 300ms + full states)

### Nguyên tắc kỹ thuật

- Mọi code mới sống dưới `/v2/*`. Code cũ (`/`, `/lab`, `src/components/`) KHÔNG modify.
- Component cũ tái sử dụng được → extend bằng file mới (vd `V2Sidebar.tsx` extend logic từ `Sidebar.tsx`).
- Mock-only AI (không API call). Persistence qua `localStorage`. Mock auth provider.
- Mọi button / link / action có `<ActionTooltip>` wrapper (delay 300ms) + đầy đủ states (hover/focus/active/disabled/loading) + aria-label cho icon-only.

---

## Section A — Kiến trúc, Routes, Tech Approach

### A.1 Route map

```
/v2                                  # root layout (providers + theme switcher + toaster)
  /v2                                # redirect → /v2/login hoặc /v2/dashboard
  /v2/login
  /v2/signup
  /v2/forgot
  /v2/otp
  /v2/(app)/                         # route group — auth-protected layout
    /v2/dashboard
    /v2/candidates                   # 4 views switch qua ViewPillNav
    /v2/compare                      # full-page side-by-side cho pinned (max 5)
    /v2/settings                     # 3 tabs
  /v2/public/                        # KHÔNG cần auth, layout riêng
    /v2/public/results               # admitted list (no PII)
    /v2/public/report/[shareId]      # anonymized AI report
```

### A.2 Layout & providers tree

```tsx
// app/v2/layout.tsx
<TooltipProvider delayDuration={300}>
  <ThemeProvider>            // applies data-theme + data-mode trên <html>
    <PersistenceProvider>    // initialize usePersistedState defaults, SSR-safe
      <AuthProvider>         // mock session từ localStorage
        {children}
        <ThemeSwitcherWidget />
        <Toaster />
      </AuthProvider>
    </PersistenceProvider>
  </ThemeProvider>
</TooltipProvider>

// app/v2/(app)/layout.tsx
<RequireAuth>
  <div className="flex h-screen">
    <V2Sidebar />
    <main style={{ marginRight: dockedDrawerOffset }}>
      <V2TopBar />
      {children}
      <PinnedToolbar />
      <ViewPillNav />               // only render trên /v2/candidates
    </main>
    <AiDrawer />
    <NotesDrawer />
  </div>
</RequireAuth>

// app/v2/public/layout.tsx
<PublicShell>                       // minimal header + branded background
  {children}
</PublicShell>
```

### A.3 Theme system

3 themes × 2 modes = 6 combos. Persist `v2.theme` + `v2.mode`.

| Theme | Component lib | Font | Primary | Implementation |
|-------|---------------|------|---------|----------------|
| **A — Main** | shadcn/ui | Proxima Nova | `#FF5533` | Default — current main design |
| **B — Lab** | Skeleton React | Lab font | `#8d1600` | Tất cả islands dùng Skeleton React |
| **C — Hybrid** | shadcn shell + Skeleton islands | Proxima Nova | `#FF5533` | Shell shadcn (Sidebar/TopBar/Modal); KanbanView/Gallery/Compare dùng Skeleton |

**Cơ chế**:

- `<html data-theme="a" data-mode="dark">` ở root
- CSS variables định nghĩa per `[data-theme="a"]`, `[data-theme="b"]`, `[data-theme="c"]` trong `src/styles/v2-themes.css`
- `<ThemedView name="kanban">` đọc `theme` từ `useTheme()` context và conditional render `<ShadcnKanban>` vs `<SkeletonKanban>` (port từ lab)
- Smooth 200ms transition khi đổi theme (CSS transition on color/background-color/border-color)

### A.4 Persistence layer

Hook `usePersistedState<T>(key, default, schema?)`:

- Wrap `useState` + sync `localStorage` (debounced 200ms để tránh write churn)
- Zod schema (optional) validate khi read, fallback default nếu sai
- SSR-safe: server render với default, hydrate value từ localStorage sau mount
- React-19 compatible

Keys namespace `v2.*`:

| Key | Type | Mô tả |
|-----|------|-------|
| `v2.theme` | `'a' \| 'b' \| 'c'` | Theme đang chọn |
| `v2.mode` | `'light' \| 'dark' \| 'system'` | Mode hiển thị |
| `v2.theme.widgetHidden` | `boolean` | Theme switcher widget bị hide |
| `v2.sidebar.collapsed` | `boolean` | Sidebar collapsed manual |
| `v2.pinned` | `string[]` | Applicant IDs pinned (max 5) |
| `v2.pinned.barCollapsed` | `boolean` | Pinned toolbar collapsed |
| `v2.view.current` | `'table' \| 'pipeline' \| 'gallery' \| 'chart'` | View hiện tại |
| `v2.view.savedViews` | `SavedView[]` | User-saved view configs |
| `v2.view.density` | `'compact' \| 'comfortable'` | Density preference |
| `v2.chat.mode` | `'float' \| 'dock'` | AI Drawer mode |
| `v2.chat.dockWidth` | `number` | AI Drawer dock width 320-720 |
| `v2.chat.history` | `Message[]` | AI Chat persisted messages |
| `v2.notes.mode` | `'float' \| 'dock'` | Notes Drawer mode |
| `v2.notes.dockWidth` | `number` | Notes Drawer dock width 280-560 |
| `v2.notes.items` | `Note[]` | Tất cả notes |
| `v2.auth.session` | `Session \| null` | Mock auth session |
| `v2.report.shares` | `Record<shareId, Snapshot>` | Shared report snapshots |
| `v2.workspace.lang` | `'vi' \| 'en'` | UI language placeholder |
| `v2.workspace.defaultView` | `V2ViewKind` | Default view khi mở /candidates |

### A.5 Mock auth

- `AuthProvider` (React Context) cung cấp `{ user, role, signIn, signOut, requireRole }`
- Seeded users trong `lib/v2/auth/mockUsers.ts`:
  ```ts
  [
    { email: 'admin@sunriser.com', password: 'admin123', role: 'admin', name: 'Linh Admin' },
    { email: 'member@sunriser.com', password: 'member123', role: 'member', name: 'Recruiter Member' },
  ]
  ```
- `signIn(email, pwd)` validates → write `v2.auth.session = { userId, role, expiresAt }` → resolve
- `useAuth()` hook đọc context
- `useRequireRole('admin')` hook redirect khi role không đủ
- `RequireAuth` wrapper component cho `(app)` layout, redirect `/v2/login?from=<original>`
- Public role không có session — anyone truy cập `/v2/public/*`

### A.6 AI integration (mock-only)

Không có API call ngoài. 2 patterns:

- **AI Chat**: keyword-matched pre-seeded responses trong `lib/v2/chat/mockResponses.ts`. Reveal char-by-char qua `setTimeout(120ms)`. Có fallback response.
- **AI Report**: 4 section templates trong `lib/v2/report/reportTemplate.ts`. Mỗi section reveal sequential bằng typing animation. Total ~10s. Có "Stop generation" button.

---

## Section B — Feature designs

### B.1 — Sidebar collapse

**Component**: `V2Sidebar.tsx` (mới, extend `src/components/layout/Sidebar.tsx`)

- Toggle button mép trên-phải sidebar, icon `PanelLeftClose` / `PanelLeftOpen`
- Tooltip: `"Collapse sidebar"` / `"Expand sidebar"` + shortcut `⌘\\`
- Persist `v2.sidebar.collapsed`
- Override responsive default: trên `lg` user có thể collapse (override `w-[240px]` default), trên `sm` user có thể expand (overlay floating với backdrop)
- Hover-expand khi collapsed: hover sidebar ≥ 300ms → temporary peek (full width), không thay đổi persisted state
- Keyboard shortcut `⌘\` (`Cmd+\` / `Ctrl+\`)

### B.2 — View switcher

**Component**: `ViewPillNav.tsx` (port từ `src/app/lab/components/FloatingPillNav.tsx`)

- Clear toàn bộ mock content cũ (Features / Use Cases / Pricing / founder / vc...)
- Floating bottom-center pill, behavior auto-hide on scroll down + show on scroll up (giữ scroll logic)
- 4 segmented icon-only items, mỗi item có shadcn Tooltip:
  - `Table2` — "Table view" (shortcut `1`)
  - `Kanban` — "Pipeline view" (shortcut `2`)
  - `LayoutGrid` — "Gallery view" (shortcut `3`)
  - `BarChart3` — "Chart view" (shortcut `4`)
- Active item highlighted bằng primary color theme hiện tại
- Keyboard 1-4 switch view
- Trên mobile: pill thu nhỏ về icon-only, đầy đủ 4 buttons compact

### B.3 — AI Chat Drawer

**Component**: `AiDrawer.tsx` (mới, replace `FloatingChat` ở `/v2`)

- Trigger: `Sparkles` icon trong TopBar, tooltip `"AI Assistant"` + shortcut `⌘J`
- 2 modes:
  - **Float**: panel 400×600 fixed bottom-right (như FloatingChat hiện tại)
  - **Dock**: dán mép phải, default 380, range 320-720, **PUSH** main content (main `margin-right` = current width)
- Resize handle bên trái (cursor `col-resize`) trong dock mode
- Pin/unpin icon trong header → switch mode
- Mobile (< sm breakpoint): luôn full-screen modal, không có 2 modes
- Mock chat: keyword-matched responses + typing animation 120ms/char
- Suggested queries chips (4-6 examples)
- Context action "Ask AI about pinned candidates" khi có pinned
- Persist `v2.chat.mode`, `v2.chat.dockWidth`, `v2.chat.history`

### B.4 — Notes Drawer (MỚI)

**Component**: `NotesDrawer.tsx` (mới)

- Trigger: `NotebookPen` icon trong TopBar, tooltip `"Notes"` + shortcut `⌘N`
- Same hybrid float/dock pattern as AI Drawer, nhỏ hơn:
  - Float: 360×520 fixed bottom-right (offset từ AI drawer khi cả 2 cùng float — stack vertically)
  - Dock: default 320, range 280-560, push main content
- **Coexistence rule**: Cả 2 drawer có thể FLOAT đồng thời. Chỉ MỘT drawer dockable tại một thời điểm. Nếu user open drawer thứ 2 trong dock mode khi cái kia đang dock → drawer mới mở ở float mode + toast `"AI Drawer is docked; Notes opened in floating mode"`. User có thể swap bằng tay sau.
- Content:
  - Header: title + `"+ New note"` button + scope filter dropdown (All / Global / Current candidate)
  - Body: list note cards (title + body preview + scope chip + updatedAt)
  - Click note card → expand inline edit (title input + textarea body, markdown-friendly)
  - Auto-save on type (debounced 500ms)
- Note shape:
  ```ts
  interface Note {
    id: string
    scope: 'global' | `candidate:${string}`
    title: string
    body: string
    updatedAt: string
  }
  ```
- Per-candidate scope: khi `ApplicantDrawer` mở với 1 candidate, NotesDrawer's scope filter default sang `"Current candidate"` và hiện notes của candidate đó
- Empty state với CTA `"Create your first note"`
- Persist `v2.notes.mode`, `v2.notes.dockWidth`, `v2.notes.items`

### B.5 — Pin & Compare

**Components**: `PinStarButton.tsx`, `PinnedToolbar.tsx`, `ComparePage.tsx` (port từ `ComparePanel`)

#### Pin button

- Star icon (empty outline khi chưa pin, fill primary color khi pinned)
- Render trong: mỗi row của TableView, mỗi card của PipelineView/GalleryView, header của ApplicantDrawer
- Tooltip: `"Pin to compare"` (chưa pin) / `"Unpin"` (đã pin) + shortcut `P`
- Limit 5 pinned — vượt thì button disabled + tooltip `"Limit 5 pinned candidates"`

#### Pinned toolbar

- Sticky bar tabover main content, render khi có ≥ 1 pinned
- Chip per pin: avatar + tên + X button (remove cá nhân)
- Collapse/expand button (default expanded, persist `v2.pinned.barCollapsed`)
- Right side: `"Compare (N)"` button → navigate `/v2/compare`. Disabled khi N < 2 + tooltip `"Pin at least 2 candidates"`
- `"Clear all"` button với confirm dialog

#### Compare page (`/v2/compare`)

- Full-page side-by-side columns (max 5)
- Sticky first column = field labels
- Fields rows: avatar, name, position, university, year, batch, GPA, Round 1 status, scorecard scores, tags, notes
- Highlight differences inline: cell tinted nhẹ khi value khác giữa columns
- Per-column actions: `"View detail"` (open ApplicantDrawer), `"Remove"` (unpin)
- `"Export PDF"` button (mock: window.print với compare layout)
- Empty state khi không có pinned: CTA quay về /v2/candidates

### B.6 — AI Report

**Component**: `ReportModal.tsx`

- Trigger: `"Create Report"` button trong TopBar, tooltip `"Generate AI report"` + shortcut `⌘R`
- shadcn `Dialog`, `max-w-3xl`, `h-[80vh]`
- Header bar: title `"AI Report — SUN.RISER 2026"` + `[Regenerate]` `[Share]` `[Download PDF]` `[Close]`
- Body sections (reveal sequential bằng typing animation, ~10s total):
  1. **Executive Summary** — 2-3 paragraphs về batch overview
  2. **Top Candidates** — list top 5 (từ pinned, fallback top GPA)
  3. **Insights by Position** — bullet list per position
  4. **Recommendations** — actionable next steps
- `[Stop generation]` button trong khi đang reveal
- `[Regenerate]` → clear + restart
- `[Share]` → generate `shareId = nanoid(10)`, store snapshot vào `v2.report.shares[shareId]`, copy `/v2/public/report/[shareId]` to clipboard + toast `"Share link copied!"`
- `[Download PDF]` → render content trong print-styled view + `window.print()` (mock PDF)
- Loading skeleton cho mỗi section trước khi reveal

### B.7 — Settings (`/v2/settings`)

shadcn `Tabs` với 3 tabs:

#### Appearance
- Theme switcher row (inline 3 chips + label) — same component như floating widget
- Dark/Light/System radio group
- Density radio cards (Compact / Comfortable) với mini-preview minimap

#### Workspace
- Default view dropdown (Table / Pipeline / Gallery / Chart)
- Default sort dropdown (Name / GPA / Round 1 / Position)
- Language toggle (vi / en) — placeholder, chưa i18n đầy đủ
- Keyboard shortcuts table (read-only): liệt kê `⌘\`, `⌘J`, `⌘N`, `⌘K`, `⌘R`, `1-4`, `P`

#### Account
- Avatar + name + email + role badge (đọc từ `useAuth()`)
- Change password form (mock — không thực sự đổi, hiện toast `"Password updated"`)
- Sign out button + confirm dialog

### B.8 — Auth screens

Layout: centered card 480px max-width, branded background gradient theo theme, theme switcher floating vẫn hiển thị.

#### `/v2/login`
- Email input + password input + Remember me checkbox + `"Forgot password?"` link
- `[Sign in]` button với loading state (spinner replace text khi submitting)
- Quick login chips bên dưới form: `[Demo as Admin]` `[Demo as Member]` (1-click fill + submit)
- Footer link: `"Don't have an account? Sign up"`
- Validation inline: required, email format, password ≥ 6
- Error toast khi sai credentials

#### `/v2/signup`
- Name + email + password + confirm password + Terms checkbox
- `[Sign up]` → mock success → redirect `/v2/login` + toast `"Account created, sign in to continue"`

#### `/v2/forgot`
- Email input → `[Send reset link]` → mock success → `"Reset email sent to <email>"` + link back to login

#### `/v2/otp`
- 6-digit code input (6 separate `<input maxLength={1}>` auto-focus next, paste-friendly)
- Countdown 60s + `[Resend code]` button (disabled trong countdown)
- `[Verify]` → mock success → redirect dashboard

Mọi form: focus first error sau khi submit, validation inline.

### B.9 — Public routes (`/v2/public/*`)

Layout `app/v2/public/layout.tsx` riêng: minimal header (logo + 1 link `"Back to login"`), branded background, không sidebar/topbar.

#### `/v2/public/results`
- Banner: `"Internship Results — SUN.RISER 2026"` + subtitle batch info
- Filter by position dropdown trên top
- Grid cards (responsive 2/3/4 cols):
  - Avatar (photo nếu có, initials fallback)
  - Name
  - Position chip
  - **KHÔNG** show: GPA / email / phone / notes / scorecard / Round 1 details
- Print-friendly CSS (`@media print` layout)
- Footer: `"Generated by SUN.RISER Dashboard"`

#### `/v2/public/report/[shareId]`
- Load snapshot từ `v2.report.shares[shareId]` (server-side: from cookie hoặc URL-encoded payload; mock: from localStorage qua client component)
- Anonymized:
  - Tên candidate → `"Candidate A"`, `"Candidate B"`, ... (consistent mapping)
  - University masked nếu setting bật (vd `"University A"`)
  - Không show: email, phone, photo
- Banner branded + `"Generated on <date>"` footer
- 404-style fallback nếu shareId không tồn tại

### B.10 — Theme switcher widget

**Component**: `ThemeSwitcher.tsx`

- Floating bottom-right, `z-50`, persistent fixed
- Pill chứa:
  - 3 color-preview chips A / B / C (mỗi chip là round swatch với primary color của theme)
  - Divider vertical
  - Sun/Moon toggle icon (depending on current mode)
  - × button (hide widget)
- Tooltip mỗi chip:
  - `"Theme A — Main (shadcn)"`
  - `"Theme B — Lab (Skeleton)"`
  - `"Theme C — Hybrid"`
- Click chip → apply `data-theme="x"`, 200ms smooth transition, save `v2.theme`
- Click moon/sun → toggle `data-mode`, save `v2.mode`
- × → hide widget, persist `v2.theme.widgetHidden = true`. Re-show từ Settings > Appearance > `"Show theme switcher widget"` toggle.
- Vị trí an toàn: tránh đụng `ViewPillNav` (bottom-center) và `AiDrawer`/`NotesDrawer` (right edge). Bottom-right (offset `right: 24px, bottom: 24px`) ổn. Nếu drawer dock thì widget tự offset thêm sang trái = dockedWidth.

### B.11 — Action UX standards (cross-cutting)

#### `<ActionTooltip>` helper component
Wrap any trigger (Button, Link, IconButton):

```tsx
<ActionTooltip label="Pin to compare" description="Add this candidate to your compare set" shortcut="P">
  <Button variant="ghost" size="icon" onClick={togglePin}>
    <Star />
  </Button>
</ActionTooltip>
```

- Uses shadcn `Tooltip` với `delayDuration={300}` từ root `TooltipProvider`
- Props:
  - `label` (required) — primary text, also used as fallback aria-label
  - `description` (optional) — secondary explanation
  - `shortcut` (optional) — render `<kbd>` với keys
- Disabled actions vẫn show tooltip với reason (vd `"Pin at least 2 candidates"`)
- Auto-detect disabled state từ child element's `disabled` / `aria-disabled`

#### Button states required (mọi button)

| State | Behavior |
|-------|----------|
| Default | Base styles per theme |
| Hover | 200ms transition bg + color, slight elevation |
| Focus-visible | 2px primary ring + 2px offset |
| Active | scale 0.98 (subtle press) |
| Disabled | opacity 0.5 + cursor not-allowed + tooltip with reason |
| Loading | spinner replace text/icon + `aria-busy="true"` + tooltip `"Loading..."` |

Icon-only buttons: mandatory `aria-label` từ ActionTooltip's label.

#### Link states

- Underline on hover (`text-decoration` transition)
- Visited color = unvisited color (consistency)
- External links: `rel="noreferrer noopener"` + tiny external icon
- Active page link: aria-current="page" + visual highlight

---

# English

## Overview

V2 Workspace is a **parallel route `/v2/*`** that contains every new feature listed below, without modifying the existing `/` or `/lab` routes. Total of 11 features:

1. Authentication (Login / Signup / Forgot / OTP, 3 roles, mock)
2. Pin candidates + full-page Compare
3. AI Chat Drawer (hybrid float/dock, push content)
4. **Notes Drawer** (small, right side, same pattern as AI Chat Drawer)
5. Collapsible sidebar (manual + persist + hover-expand)
6. AI Report (modal + PDF download + Share via public link)
7. Settings (Appearance / Workspace / Account)
8. View options Table / Pipeline / Gallery / Chart with DnD
9. 3 themes orthogonal to dark/light (6 combos)
10. Public routes `/v2/public/results` + `/v2/public/report/[shareId]`
11. Global action UX standards (300ms tooltip + full states)

### Engineering principles

- All new code lives under `/v2/*`. Legacy code (`/`, `/lab`, `src/components/`) is NOT modified.
- Reusable legacy components are extended via new files (e.g. `V2Sidebar.tsx` extends logic from `Sidebar.tsx`).
- Mock-only AI (no API calls). Persistence via `localStorage`. Mock auth provider.
- Every button / link / action wraps in `<ActionTooltip>` (300ms delay) + full states (hover/focus/active/disabled/loading) + aria-label for icon-only.

---

## Section A — Architecture, Routes, Tech Approach

### A.1 Route map

```
/v2                                  # root layout (providers + theme switcher + toaster)
  /v2                                # redirect → /v2/login or /v2/dashboard
  /v2/login
  /v2/signup
  /v2/forgot
  /v2/otp
  /v2/(app)/                         # route group — auth-protected layout
    /v2/dashboard
    /v2/candidates                   # 4 views via ViewPillNav
    /v2/compare                      # full-page side-by-side for pinned (max 5)
    /v2/settings                     # 3 tabs
  /v2/public/                        # NO auth, separate layout
    /v2/public/results               # admitted list (no PII)
    /v2/public/report/[shareId]      # anonymized AI report
```

### A.2 Layout & providers tree

```tsx
// app/v2/layout.tsx
<TooltipProvider delayDuration={300}>
  <ThemeProvider>            // applies data-theme + data-mode to <html>
    <PersistenceProvider>    // initializes usePersistedState defaults, SSR-safe
      <AuthProvider>         // mock session from localStorage
        {children}
        <ThemeSwitcherWidget />
        <Toaster />
      </AuthProvider>
    </PersistenceProvider>
  </ThemeProvider>
</TooltipProvider>

// app/v2/(app)/layout.tsx
<RequireAuth>
  <div className="flex h-screen">
    <V2Sidebar />
    <main style={{ marginRight: dockedDrawerOffset }}>
      <V2TopBar />
      {children}
      <PinnedToolbar />
      <ViewPillNav />               // only on /v2/candidates
    </main>
    <AiDrawer />
    <NotesDrawer />
  </div>
</RequireAuth>

// app/v2/public/layout.tsx
<PublicShell>                       // minimal header + branded background
  {children}
</PublicShell>
```

### A.3 Theme system

3 themes × 2 modes = 6 combos. Persist `v2.theme` + `v2.mode`.

| Theme | Component lib | Font | Primary | Implementation |
|-------|---------------|------|---------|----------------|
| **A — Main** | shadcn/ui | Proxima Nova | `#FF5533` | Default — matches current main app |
| **B — Lab** | Skeleton React | Lab font | `#8d1600` | All islands render Skeleton React |
| **C — Hybrid** | shadcn shell + Skeleton islands | Proxima Nova | `#FF5533` | Shell uses shadcn (Sidebar/TopBar/Modal); KanbanView/Gallery/Compare render Skeleton |

**Mechanism**:

- `<html data-theme="a" data-mode="dark">` at root
- CSS variables defined per `[data-theme="a"]`, `[data-theme="b"]`, `[data-theme="c"]` in `src/styles/v2-themes.css`
- `<ThemedView name="kanban">` reads `theme` from `useTheme()` context and conditionally renders `<ShadcnKanban>` vs `<SkeletonKanban>` (ported from lab)
- 200ms smooth transition when theme changes (CSS transition on color/background-color/border-color)

### A.4 Persistence layer

Hook `usePersistedState<T>(key, default, schema?)`:

- Wraps `useState` + syncs to `localStorage` (debounced 200ms to avoid write churn)
- Optional Zod schema validates on read, falls back to default if invalid
- SSR-safe: server renders with default, hydrate value from localStorage post-mount
- React 19 compatible

Keys are namespaced `v2.*`:

| Key | Type | Description |
|-----|------|-------------|
| `v2.theme` | `'a' \| 'b' \| 'c'` | Active theme variant |
| `v2.mode` | `'light' \| 'dark' \| 'system'` | Display mode |
| `v2.theme.widgetHidden` | `boolean` | Theme switcher widget hidden |
| `v2.sidebar.collapsed` | `boolean` | Sidebar manually collapsed |
| `v2.pinned` | `string[]` | Pinned applicant IDs (max 5) |
| `v2.pinned.barCollapsed` | `boolean` | Pinned toolbar collapsed |
| `v2.view.current` | `'table' \| 'pipeline' \| 'gallery' \| 'chart'` | Current view |
| `v2.view.savedViews` | `SavedView[]` | User-saved view configs |
| `v2.view.density` | `'compact' \| 'comfortable'` | Density preference |
| `v2.chat.mode` | `'float' \| 'dock'` | AI Drawer mode |
| `v2.chat.dockWidth` | `number` | AI Drawer dock width 320-720 |
| `v2.chat.history` | `Message[]` | AI Chat persisted messages |
| `v2.notes.mode` | `'float' \| 'dock'` | Notes Drawer mode |
| `v2.notes.dockWidth` | `number` | Notes Drawer dock width 280-560 |
| `v2.notes.items` | `Note[]` | All notes |
| `v2.auth.session` | `Session \| null` | Mock auth session |
| `v2.report.shares` | `Record<shareId, Snapshot>` | Shared report snapshots |
| `v2.workspace.lang` | `'vi' \| 'en'` | UI language placeholder |
| `v2.workspace.defaultView` | `V2ViewKind` | Default view on /candidates |

### A.5 Mock auth

- `AuthProvider` (React Context) exposes `{ user, role, signIn, signOut, requireRole }`
- Seeded users in `lib/v2/auth/mockUsers.ts`:
  ```ts
  [
    { email: 'admin@sunriser.com', password: 'admin123', role: 'admin', name: 'Linh Admin' },
    { email: 'member@sunriser.com', password: 'member123', role: 'member', name: 'Recruiter Member' },
  ]
  ```
- `signIn(email, pwd)` validates → writes `v2.auth.session = { userId, role, expiresAt }` → resolves
- `useAuth()` hook reads context
- `useRequireRole('admin')` hook redirects if role insufficient
- `RequireAuth` wrapper component for `(app)` layout, redirects to `/v2/login?from=<original>`
- Public role has no session — anyone reaches `/v2/public/*`

### A.6 AI integration (mock-only)

No external API calls. Two patterns:

- **AI Chat**: keyword-matched pre-seeded responses in `lib/v2/chat/mockResponses.ts`. Reveal char-by-char via `setTimeout(120ms)`. Catch-all fallback response.
- **AI Report**: 4 section templates in `lib/v2/report/reportTemplate.ts`. Each section reveals sequentially with typing animation. Total ~10s. Includes "Stop generation" button.

---

## Section B — Feature designs

### B.1 — Sidebar collapse

**Component**: `V2Sidebar.tsx` (new, extends `src/components/layout/Sidebar.tsx`)

- Toggle button at top-right edge of sidebar, icon `PanelLeftClose` / `PanelLeftOpen`
- Tooltip: `"Collapse sidebar"` / `"Expand sidebar"` + shortcut `⌘\\`
- Persists `v2.sidebar.collapsed`
- Overrides responsive default: on `lg` user can collapse (overrides default `w-[240px]`), on `sm` user can expand (overlay floating with backdrop)
- Hover-expand when collapsed: hover ≥ 300ms → temporary peek (full width), does NOT change persisted state
- Keyboard shortcut `⌘\` (`Cmd+\` / `Ctrl+\`)

### B.2 — View switcher

**Component**: `ViewPillNav.tsx` (ported from `src/app/lab/components/FloatingPillNav.tsx`)

- Clears all old mock content (Features / Use Cases / Pricing / founder / vc...)
- Floating bottom-center pill, keeps auto-hide on scroll down + show on scroll up behavior
- 4 segmented icon-only items, each wrapped in shadcn Tooltip:
  - `Table2` — "Table view" (shortcut `1`)
  - `Kanban` — "Pipeline view" (shortcut `2`)
  - `LayoutGrid` — "Gallery view" (shortcut `3`)
  - `BarChart3` — "Chart view" (shortcut `4`)
- Active item highlighted with current theme's primary color
- Keyboard 1-4 switches view
- Mobile: pill shrinks to icon-only, all 4 buttons compact

### B.3 — AI Chat Drawer

**Component**: `AiDrawer.tsx` (new, replaces `FloatingChat` inside `/v2`)

- Trigger: `Sparkles` icon in TopBar, tooltip `"AI Assistant"` + shortcut `⌘J`
- Two modes:
  - **Float**: 400×600 panel fixed bottom-right (similar to current FloatingChat)
  - **Dock**: pinned to right edge, default 380px, range 320-720, **PUSHES** main content (main `margin-right` = current width)
- Resize handle on left edge (`col-resize` cursor) in dock mode
- Pin/unpin icon in header → switches mode
- Mobile (< sm): always full-screen modal, no modes
- Mock chat: keyword-matched responses + 120ms/char typing animation
- Suggested queries chips (4-6 examples)
- Context action `"Ask AI about pinned candidates"` when pins exist
- Persists `v2.chat.mode`, `v2.chat.dockWidth`, `v2.chat.history`

### B.4 — Notes Drawer (NEW)

**Component**: `NotesDrawer.tsx` (new)

- Trigger: `NotebookPen` icon in TopBar, tooltip `"Notes"` + shortcut `⌘N`
- Same hybrid float/dock pattern as AI Drawer, smaller:
  - Float: 360×520 fixed bottom-right (offset from AI drawer when both float — stacked vertically)
  - Dock: default 320, range 280-560, pushes main content
- **Coexistence rule**: Both drawers can FLOAT simultaneously. Only ONE drawer can be docked at a time. If user opens a second drawer in dock mode while the other is docked → the new one opens in float mode + toast `"AI Drawer is docked; Notes opened in floating mode"`. User can swap manually after.
- Content:
  - Header: title + `"+ New note"` button + scope filter dropdown (All / Global / Current candidate)
  - Body: list of note cards (title + body preview + scope chip + updatedAt)
  - Click a card → inline edit (title input + textarea body, markdown-friendly)
  - Auto-save on type (500ms debounce)
- Note shape:
  ```ts
  interface Note {
    id: string
    scope: 'global' | `candidate:${string}`
    title: string
    body: string
    updatedAt: string
  }
  ```
- Per-candidate scope: when `ApplicantDrawer` is open with a candidate, NotesDrawer's scope filter defaults to `"Current candidate"` and shows that candidate's notes
- Empty state with CTA `"Create your first note"`
- Persists `v2.notes.mode`, `v2.notes.dockWidth`, `v2.notes.items`

### B.5 — Pin & Compare

**Components**: `PinStarButton.tsx`, `PinnedToolbar.tsx`, `ComparePage.tsx` (ported from `ComparePanel`)

#### Pin button

- Star icon (outline empty when not pinned, fill primary color when pinned)
- Rendered in: each TableView row, each PipelineView/GalleryView card, ApplicantDrawer header
- Tooltip: `"Pin to compare"` (not pinned) / `"Unpin"` (pinned) + shortcut `P`
- Pin limit 5 — when reached, button disabled + tooltip `"Limit 5 pinned candidates"`

#### Pinned toolbar

- Sticky bar tabover main content, rendered when ≥ 1 pinned
- Chip per pin: avatar + name + X button (remove individual)
- Collapse/expand button (default expanded, persists `v2.pinned.barCollapsed`)
- Right side: `"Compare (N)"` button → navigates to `/v2/compare`. Disabled when N < 2 + tooltip `"Pin at least 2 candidates"`
- `"Clear all"` button with confirm dialog

#### Compare page (`/v2/compare`)

- Full-page side-by-side columns (max 5)
- Sticky first column = field labels
- Field rows: avatar, name, position, university, year, batch, GPA, Round 1 status, scorecard scores, tags, notes
- Inline difference highlight: cells subtly tinted when value differs across columns
- Per-column actions: `"View detail"` (opens ApplicantDrawer), `"Remove"` (unpin)
- `"Export PDF"` button (mock: `window.print()` with compare layout)
- Empty state when no pinned: CTA back to /v2/candidates

### B.6 — AI Report

**Component**: `ReportModal.tsx`

- Trigger: `"Create Report"` button in TopBar, tooltip `"Generate AI report"` + shortcut `⌘R`
- shadcn `Dialog`, `max-w-3xl`, `h-[80vh]`
- Header bar: title `"AI Report — SUN.RISER 2026"` + `[Regenerate]` `[Share]` `[Download PDF]` `[Close]`
- Body sections (revealed sequentially via typing animation, ~10s total):
  1. **Executive Summary** — 2-3 paragraphs about the batch
  2. **Top Candidates** — top 5 list (from pinned, fallback top GPA)
  3. **Insights by Position** — bullet list per position
  4. **Recommendations** — actionable next steps
- `[Stop generation]` button while revealing
- `[Regenerate]` → clear + restart
- `[Share]` → generate `shareId = nanoid(10)`, store snapshot in `v2.report.shares[shareId]`, copy `/v2/public/report/[shareId]` to clipboard + toast `"Share link copied!"`
- `[Download PDF]` → render content in print-styled view + `window.print()` (mock PDF)
- Loading skeleton for each section before reveal

### B.7 — Settings (`/v2/settings`)

shadcn `Tabs` with 3 tabs:

#### Appearance
- Theme switcher row (inline 3 chips + label) — same component as floating widget
- Dark/Light/System radio group
- Density radio cards (Compact / Comfortable) with mini-preview minimap

#### Workspace
- Default view dropdown (Table / Pipeline / Gallery / Chart)
- Default sort dropdown (Name / GPA / Round 1 / Position)
- Language toggle (vi / en) — placeholder, no full i18n yet
- Read-only keyboard shortcuts table: lists `⌘\`, `⌘J`, `⌘N`, `⌘K`, `⌘R`, `1-4`, `P`

#### Account
- Avatar + name + email + role badge (read from `useAuth()`)
- Change password form (mock — no actual change, shows toast `"Password updated"`)
- Sign out button + confirm dialog

### B.8 — Auth screens

Layout: centered card 480px max-width, branded gradient background per theme, theme switcher floating still visible.

#### `/v2/login`
- Email input + password input + Remember me checkbox + `"Forgot password?"` link
- `[Sign in]` button with loading state (spinner replaces text on submit)
- Quick login chips below form: `[Demo as Admin]` `[Demo as Member]` (1-click fill + submit)
- Footer link: `"Don't have an account? Sign up"`
- Inline validation: required, email format, password ≥ 6
- Error toast on invalid credentials

#### `/v2/signup`
- Name + email + password + confirm password + Terms checkbox
- `[Sign up]` → mock success → redirects to `/v2/login` + toast `"Account created, sign in to continue"`

#### `/v2/forgot`
- Email input → `[Send reset link]` → mock success → `"Reset email sent to <email>"` + link back to login

#### `/v2/otp`
- 6-digit code input (6 separate `<input maxLength={1}>` auto-focus next, paste-friendly)
- 60s countdown + `[Resend code]` button (disabled during countdown)
- `[Verify]` → mock success → redirects to dashboard

Every form: focus first error after submit, inline validation.

### B.9 — Public routes (`/v2/public/*`)

Separate layout `app/v2/public/layout.tsx`: minimal header (logo + 1 `"Back to login"` link), branded background, no sidebar/topbar.

#### `/v2/public/results`
- Banner: `"Internship Results — SUN.RISER 2026"` + batch info subtitle
- Filter by position dropdown at top
- Grid cards (responsive 2/3/4 cols):
  - Avatar (photo if available, initials fallback)
  - Name
  - Position chip
  - **NEVER** shows: GPA / email / phone / notes / scorecard / Round 1 details
- Print-friendly CSS (`@media print` layout)
- Footer: `"Generated by SUN.RISER Dashboard"`

#### `/v2/public/report/[shareId]`
- Load snapshot from `v2.report.shares[shareId]` (server-side: from cookie or URL-encoded payload; mock: from localStorage via client component)
- Anonymized:
  - Candidate names → `"Candidate A"`, `"Candidate B"`, ... (consistent mapping)
  - University masked if setting enabled (e.g. `"University A"`)
  - Never shows: email, phone, photo
- Branded banner + `"Generated on <date>"` footer
- 404-style fallback if shareId not found

### B.10 — Theme switcher widget

**Component**: `ThemeSwitcher.tsx`

- Floating bottom-right, `z-50`, persistent fixed
- Pill contains:
  - 3 color-preview chips A / B / C (each chip = round swatch with primary color of its theme)
  - Vertical divider
  - Sun/Moon toggle icon (depending on current mode)
  - × button (hide widget)
- Tooltip per chip:
  - `"Theme A — Main (shadcn)"`
  - `"Theme B — Lab (Skeleton)"`
  - `"Theme C — Hybrid"`
- Click chip → applies `data-theme="x"`, 200ms smooth transition, saves `v2.theme`
- Click moon/sun → toggles `data-mode`, saves `v2.mode`
- × → hides widget, persists `v2.theme.widgetHidden = true`. Re-show from Settings > Appearance > `"Show theme switcher widget"` toggle.
- Position safety: avoids `ViewPillNav` (bottom-center) and `AiDrawer`/`NotesDrawer` (right edge). Bottom-right (offset `right: 24px, bottom: 24px`) safe. If drawer docks, widget auto-offsets left by dockedWidth.

### B.11 — Action UX standards (cross-cutting)

#### `<ActionTooltip>` helper component

Wrap any trigger (Button, Link, IconButton):

```tsx
<ActionTooltip label="Pin to compare" description="Add this candidate to your compare set" shortcut="P">
  <Button variant="ghost" size="icon" onClick={togglePin}>
    <Star />
  </Button>
</ActionTooltip>
```

- Uses shadcn `Tooltip` with `delayDuration={300}` from root `TooltipProvider`
- Props:
  - `label` (required) — primary text, also fallback aria-label
  - `description` (optional) — secondary explanation
  - `shortcut` (optional) — renders `<kbd>` with key combo
- Disabled actions still show tooltip with reason (e.g. `"Pin at least 2 candidates"`)
- Auto-detects disabled state from child element's `disabled` / `aria-disabled`

#### Button states required (every button)

| State | Behavior |
|-------|----------|
| Default | Base styles per theme |
| Hover | 200ms transition bg + color, slight elevation |
| Focus-visible | 2px primary ring + 2px offset |
| Active | scale 0.98 (subtle press) |
| Disabled | opacity 0.5 + cursor not-allowed + tooltip with reason |
| Loading | spinner replaces text/icon + `aria-busy="true"` + tooltip `"Loading..."` |

Icon-only buttons: mandatory `aria-label` from ActionTooltip's label.

#### Link states

- Underline on hover (`text-decoration` transition)
- Visited color = unvisited color (consistency)
- External links: `rel="noreferrer noopener"` + tiny external icon
- Active page link: `aria-current="page"` + visual highlight

---

## Self-review checklist

- [x] All 11 features covered
- [x] Theme system handles literal Skeleton swap (Theme B + C islands)
- [x] Notes Drawer added with coexistence rule
- [x] Action UX standards explicit + ActionTooltip pattern defined
- [x] Public routes have anonymization rules
- [x] Persistence keys all namespaced `v2.*`
- [x] No legacy file modification — all new code under `/v2/*` or `components/v2/*` or `lib/v2/*`
- [x] Mock auth + 3 roles (admin / member / public)
- [x] Mock-only AI (no API)
- [x] Keyboard shortcuts documented
- [x] Accessibility (aria-label, focus-visible, reduced motion mention)

---

## Open decisions for plan stage

1. **Server-side share report**: localStorage không thể read from public route trên server. Mock approach: encode snapshot in URL (`/public/report/[base64data]`) hoặc use client-only fetch from localStorage. Plan stage chọn 1.
2. **DnD library cho Pipeline/Gallery**: dùng `@dnd-kit` đã có. Pipeline cần `useSortable` + `useDroppable` + multiple columns. Cần plan code structure cụ thể.
3. **Skeleton React docs version**: confirm phiên bản `4.15.2` đã cài có Kanban / Card / Tooltip components nào sẵn — port có thể cần extra work.
4. **Test strategy**: vitest đã có 211 tests. Mỗi feature mới cần unit test min 2-3 cases (happy path + edge + persistence).

These are deferred to the writing-plans phase.
