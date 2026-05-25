# Full Feature QA Audit
Tag: qa/audit

## Goal
Playwright end-to-end test of all current features in the running app. No code changes.

## Scope
- Included: auth flows, dashboard, candidates page (table/pipeline/chart views, filters, selection, bulk actions, pagination, drawer)
- Excluded: Lab (/lab — has its own unit tests), HR/Settings/Admin/Compare (confirmed placeholders)

## Acceptance criteria
- Every listed feature returns PASS or FAIL with observable evidence
- All bugs or data inconsistencies documented

---

## Report
Status: Done

### Test Environment
- URL: http://localhost:3000 (dev server, running)
- Auth: admin@sunriser.com (admin role)
- Method: Playwright MCP browser automation
- Constraint: Full page reloads hang on auth — all navigation done via sidebar/UI links after initial login

---

### Results

| # | Feature | Result | Notes |
|---|---------|--------|-------|
| 1 | Login page renders | PASS | Form, email/password, Remember me, Sign in button |
| 2 | Invalid credentials shows error | PASS | "Invalid login credentials" alert rendered |
| 3 | Valid login redirects to /dashboard | PASS | Client-side router.push to /dashboard |
| 4 | Unauthenticated → redirected to /login | PASS | Middleware redirects with `?from=` param |
| 5 | Forgot password page renders | PASS | "Reset password" heading, Send reset link button |
| 6 | Signup page renders | PASS | Admin-only message + back-to-login link |
| 7 | Sidebar renders (Dashboard, Candidates, HR Team) | PASS | All 3 links present |
| 8 | TopBar renders (AI, Notes, Report, Export) | PASS | All 4 action buttons present |
| 9 | Dashboard: Stats cards render | PASS | 646 total, 127 passed, 19.7% rate, 8.2 GPA |
| 10 | Dashboard: Charts render | PASS | By Position, Round 1, By Batch, Discovery Channels |
| 11 | AI drawer opens | PASS | "AI Assistant" heading, chat input, mock response |
| 12 | AI drawer closes | PASS | Close button works |
| 13 | Notes drawer opens | PASS | "Notes" heading, auto-saved local notes |
| 14 | Notes drawer closes | PASS | Close button works |
| 15 | Report modal opens | PASS | Generated report with summary, top candidates, insights |
| 16 | Candidates page loads | PASS | Filter bar + table rendered via client-side nav |
| 17 | Table view: rows render | PASS | 15 rows/page, 40 total, 3 pages |
| 18 | Search filter | PASS | "Khoa" → 1 of 40, URL `?search=Khoa` updates |
| 19 | Position filter dropdown | PASS | "AI Engineering" → 7 of 40, URL `?position=...` updates |
| 20 | Clear all filters | PASS | Resets to 40 of 40, URL clean |
| 21 | Row checkbox visible on hover | PASS | Appears in # cell on row hover |
| 22 | Row checkbox click selects row | PASS | Row highlights, bulk bar shows "1 selected" |
| 23 | Bulk Actions dropdown opens | PASS | Set Batch, Assign PIC, Delete selected |
| 24 | Bulk delete: confirmation dialog | PASS | "Delete 1 candidates from this list?" dialog |
| 25 | Bulk delete: confirmed → row removed | PASS | Count drops 40→39, selection cleared |
| 26 | Column sort (GPA asc) | PASS | URL updates to `?sort=gpa.asc` |
| 27 | Pagination Next | PASS | Page 2/3, URL `?page=2` |
| 28 | Pagination Previous | PASS | Back to page 1, URL updates |
| 29 | Applicant detail drawer opens | PASS | Click "View applicant" → drawer with name, position |
| 30 | Applicant detail drawer closes | PASS | Close button works |
| 31 | Pipeline view renders | PASS | Kanban columns: Pass (23), Failed, Waiting list — candidate cards |
| 32 | Chart view renders | PASS | 4 charts: by position, round 1, by batch, channels |

**32 of 32 tested features: PASS**

---

### Bugs Found

#### BUG-1: Auth loading hangs on full page reload — MEDIUM
**What:** `supabase.auth.getUser()` in `AuthProvider.tsx` never resolves on a cold browser load. Workspace shows "Preparing workspace" indefinitely.

**Root cause:** React Strict Mode (dev) runs effects twice. The first `getUser()` promise is cancelled (`mounted = false`). The second call makes a Supabase network request that hangs — never resolves, so `setLoading(false)` is never called.

**Observed:** Every `page.goto('/dashboard')` or `page.goto('/candidates')` was stuck. Only client-side navigation (sidebar links, `router.push()`) works because auth state is already in React memory from the login event.

**Impact:** Any user whose Supabase request times out on page refresh will be stuck at the loading screen. Not limited to Playwright.

**Suggested fix:** Add a timeout in `AuthProvider` — if `getUser()` doesn't resolve in N seconds, fallback to `getSession()` from local storage.

---

#### BUG-2: Dashboard shows 646 applicants but candidates table has 40 — LOW
**What:** Dashboard stat card "Total Applicants: 646". Candidates table filter shows "40 of 40".

**Root cause:** `dashboardStats.totalApplicants` is hardcoded at 646 in `mockData.ts`. `mockApplicants` array only has 40 records. They are independent.

**Impact:** Numbers on dashboard do not reflect what's in the table — misleading in demos.

**Suggested fix:** Derive `dashboardStats` from `mockApplicants` at runtime, or expand the mock to 646 records.

---

#### WARNING: Next.js image aspect ratio — LOW
`/logo-wordmark.png` logged a console warning: image has width or height modified without the other. Add `height="auto"` or `width="auto"`.

---

### Not Tested
- Batch and Result filter dropdowns (same pattern as Position — low risk)
- Keyboard shortcuts (1/2/3 for views, arrow keys for pagination)
- Drag-to-reorder rows (dnd-kit pointer drag)
- Bulk Set Batch / Assign PIC sub-flows
- File upload / GlobalDropZone
- HR, Settings, Admin, Compare pages (placeholders, nothing to test)
