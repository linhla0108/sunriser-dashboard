import { expect, test } from "@playwright/test"
import { EMAIL, PASSWORD, waitForWorkspace } from "./helpers"

const REMEMBER_UNTIL_KEY = "sunriser.auth.rememberUntil"
const REMEMBER_DURATION_MS = 6 * 24 * 60 * 60 * 1000

// Auth tests run without storageState (fresh session)
test.use({ storageState: { cookies: [], origins: [] } })

test.describe("Auth — login flow", () => {
  test("redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/dashboard")
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 })
  })

  test("shows error on wrong credentials", async ({ page }) => {
    await page.goto("/login")
    await page.getByLabel("Email").fill("wrong@example.com")
    await page.getByLabel("Password").fill("wrongpassword")
    await page.getByRole("button", { name: /sign in/i }).click()
    await expect(page.getByRole("alert")).toBeVisible({ timeout: 8000 })
  })

  test("signs in with valid credentials and lands on dashboard", async ({ page }) => {
    await page.goto("/login")
    await page.getByLabel("Email").fill(EMAIL)
    await page.getByLabel("Password").fill(PASSWORD)
    await page.getByRole("button", { name: /sign in/i }).click()
    await page.waitForURL(/\/dashboard/, { timeout: 15000 })
    await waitForWorkspace(page)
    await expect(page.getByText("Total Applicants")).toBeVisible({ timeout: 10000 })
  })
})

// These tests run with the default storageState (authenticated session from global-setup)
test.describe("Auth — hard reload with active session", () => {
  test.use({ storageState: undefined })

  test("loading screen resolves after hard reload on /candidates", async ({ page }) => {
    // Refresh remember preference so AuthProvider doesn't sign us out
    await page.goto("/dashboard")
    await page.evaluate(({ key, duration }) => localStorage.setItem(key, String(Date.now() + duration)), {
      key: REMEMBER_UNTIL_KEY,
      duration: REMEMBER_DURATION_MS,
    })
    await page.waitForURL(/\/dashboard/, { timeout: 15000 })

    // Hard reload — this is the scenario that was stuck on the loading screen
    await page.goto("/candidates?view=table")
    await waitForWorkspace(page)

    // Loading screen must be gone and workspace content must be visible
    await expect(page.locator('[data-cid="app-loading-screen"]')).not.toBeVisible({ timeout: 5000 })
    await expect(page.locator("table")).toBeVisible({ timeout: 10000 })
  })

  test("no console errors about auth lock or stuck loading after hard reload", async ({ page }) => {
    const consoleErrors: string[] = []
    page.on("console", msg => {
      if (msg.type() === "error") consoleErrors.push(msg.text())
    })

    // Already authenticated via storageState — navigate directly (middleware redirects /login away)
    await page.goto("/dashboard")
    await page.evaluate(({ key, duration }) => localStorage.setItem(key, String(Date.now() + duration)), {
      key: REMEMBER_UNTIL_KEY,
      duration: REMEMBER_DURATION_MS,
    })
    await page.waitForURL(/\/dashboard/, { timeout: 15000 })
    await waitForWorkspace(page)

    // Filter out expected network noise; flag anything auth-related
    const authErrors = consoleErrors.filter(e => /auth|lock|deadlock|supabase|session/i.test(e))
    expect(authErrors).toHaveLength(0)
  })
})
