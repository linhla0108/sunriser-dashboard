import type { Page } from "@playwright/test"

export const EMAIL = process.env.E2E_EMAIL ?? "admin@sunriser.com"
export const PASSWORD = process.env.E2E_PASSWORD ?? "Sunriser2026!"

/** Wait for the app loading screen to disappear — workspace content is ready. */
export async function waitForWorkspace(page: Page) {
  await page
    .waitForSelector('[data-cid="app-loading-screen"]', { state: "hidden", timeout: 20000 })
    .catch(() => {})
}

export async function loginAndWait(page: Page) {
  await page.goto("/login")
  await page.getByLabel("Email").fill(EMAIL)
  await page.getByLabel("Password").fill(PASSWORD)
  await page.getByRole("button", { name: /sign in/i }).click()
  // Wait for dashboard — soft redirect keeps AuthProvider mounted and resolves loading
  await page.waitForURL(/\/dashboard/, { timeout: 15000 })
  // Wait for workspace to finish loading
  await page
    .waitForSelector('[data-cid="app-loading-screen"]', { state: "hidden", timeout: 20000 })
    .catch(() => {})
}

/** Soft-navigate to candidates table via sidebar click to keep AuthProvider mounted */
export async function goToCandidatesTable(page: Page) {
  // Click Candidates in sidebar (soft nav)
  await page.getByRole("link", { name: /candidates/i }).first().click()
  // Default view is table — wait for table element
  await page.waitForSelector("table", { timeout: 15000 })
  // Ensure we're in table view (switch if needed)
  const tableVisible = await page.$("table")
  if (!tableVisible) {
    await page.getByRole("button", { name: /table/i }).first().click()
    await page.waitForSelector("table", { timeout: 10000 })
  }
}

export async function goToPipeline(page: Page) {
  await page.getByRole("link", { name: /candidates/i }).first().click()
  await page.waitForSelector("table, [data-v2-card]", { timeout: 15000 })
  // Switch to pipeline view
  await page.getByRole("button", { name: /pipeline/i }).first().click()
  await page.waitForSelector("[data-v2-card]", { timeout: 10000 })
}

export async function goToChartView(page: Page) {
  await page.getByRole("link", { name: /candidates/i }).first().click()
  await page.waitForSelector("table, [data-v2-card], svg", { timeout: 15000 })
  // Switch to chart view
  await page.getByRole("button", { name: /chart/i }).first().click()
  await page.waitForSelector("svg", { timeout: 10000 })
}
