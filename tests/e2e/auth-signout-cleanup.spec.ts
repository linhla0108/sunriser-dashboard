import { expect, test } from "@playwright/test"
import { waitForWorkspace } from "./helpers"

const REMEMBER_UNTIL_KEY = "sunriser.auth.rememberUntil"
const REMEMBER_DURATION_MS = 6 * 24 * 60 * 60 * 1000

async function goToDashboard(page: Parameters<typeof waitForWorkspace>[0]) {
  await page.goto("/dashboard")
  // Keep remember preference fresh so AuthProvider doesn't sign us out
  await page.evaluate(({ key, duration }) => localStorage.setItem(key, String(Date.now() + duration)), {
    key: REMEMBER_UNTIL_KEY,
    duration: REMEMBER_DURATION_MS,
  })
  // Ensure we actually land on dashboard (not redirected to login)
  await page.waitForURL(/\/dashboard/, { timeout: 15000 })
  await waitForWorkspace(page)
}

/**
 * Verify auth-related cleanup on sign-out:
 * G1 — user workspace data (notes, pinned, chat history) is cleared from
 *       localStorage so the next user on the same device doesn't see it.
 * G2 — /login?error=confirmation_failed shows a visible error banner.
 */

// ── G1: user data cleared on sign-out ────────────────────────────────────────

test.describe("G1 — sign-out clears user workspace data", () => {
  test("notes, pinned, and chat history are removed; theme preference stays", async ({ page }) => {
    await goToDashboard(page)
    // Wait explicitly for the sidebar footer button to be ready
    await page.locator('[aria-label="Open account menu"]').waitFor({ state: "visible", timeout: 15000 })

    // Seed workspace data as if the user had used the app
    await page.evaluate(() => {
      localStorage.setItem("v2.notes.items", JSON.stringify([{ id: "n1", text: "private note" }]))
      localStorage.setItem("v2.pinned", JSON.stringify(["candidate-001", "candidate-002"]))
      localStorage.setItem("v2.chat.history", JSON.stringify([{ role: "user", content: "sensitive context" }]))
      localStorage.setItem("v2.report.shares", JSON.stringify({ abc: "http://example.com/report" }))
      // Non-user-data key — should survive sign-out
      localStorage.setItem("v2.theme", "main")
    })

    // Open user menu and sign out.
    // force: true bypasses the Next.js dev overlay which intercepts pointer events.
    await page.locator('[aria-label="Open account menu"]').click({ force: true })
    await page.getByRole("menuitem", { name: /sign out/i }).click({ force: true })

    // Wait for redirect to login
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 })

    // Verify user data keys are cleared
    const userData = await page.evaluate(() => ({
      notes: localStorage.getItem("v2.notes.items"),
      pinned: localStorage.getItem("v2.pinned"),
      chat: localStorage.getItem("v2.chat.history"),
      shares: localStorage.getItem("v2.report.shares"),
      // Theme should survive
      theme: localStorage.getItem("v2.theme"),
    }))

    expect(userData.notes).toBeNull()
    expect(userData.pinned).toBeNull()
    expect(userData.chat).toBeNull()
    expect(userData.shares).toBeNull()
    // Theme preference is not user-specific — should remain
    expect(userData.theme).toBe("main")
  })
})

// ── G2: login page shows error banner for ?error= param ──────────────────────

test.describe("G2 — login page error param", () => {
  // Run without auth state so we see the plain login page
  test.use({ storageState: { cookies: [], origins: [] } })

  test("shows explanation when ?error=confirmation_failed", async ({ page }) => {
    await page.goto("/login?error=confirmation_failed")

    // Should see an error banner — not just the plain login form.
    // Use .filter() to exclude Next.js's hidden route announcer div.
    const alert = page.getByRole("alert").filter({ hasText: /expired|invalid|confirmation/i })
    await expect(alert).toBeVisible({ timeout: 5000 })
    await expect(alert).toContainText(/expired|invalid|confirmation/i)
  })

  test("shows no banner on plain /login", async ({ page }) => {
    await page.goto("/login")
    // Exclude Next.js hidden route announcer
    await expect(page.getByRole("alert").filter({ hasText: /./i })).not.toBeVisible()
  })

  test("shows no banner for unknown error codes", async ({ page }) => {
    await page.goto("/login?error=unknown_code_xyz")
    await expect(page.getByRole("alert").filter({ hasText: /./i })).not.toBeVisible()
  })
})
