import { test } from "@playwright/test"

test.use({ storageState: { cookies: [], origins: [] } })

test("diagnostic: login then hard navigate to candidates", async ({ page }) => {
  await page.goto("/login")
  await page.getByLabel("Email").fill("admin@sunriser.com")
  await page.getByLabel("Password").fill("Sunriser2026!")
  await page.getByRole("button", { name: /sign in/i }).click()
  await page.waitForURL(/\/dashboard/, { timeout: 15000 })
  console.log("On dashboard")

  // Hard navigate — AuthProvider re-mounts
  await page.goto("/candidates?view=table")
  console.log("After hard goto, url:", page.url())

  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(1000)
    const hasTable = !!(await page.$("table"))
    const loading = !!(await page.$('[data-cid="app-loading-screen"]'))
    console.log(`t+${i + 1}s: table=${hasTable} loading=${loading}`)
    if (hasTable) break
  }

  await page.screenshot({ path: "test-results/diag.png" })
})
