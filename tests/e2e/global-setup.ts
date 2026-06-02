import { chromium } from "@playwright/test"

const EMAIL = process.env.E2E_EMAIL ?? "admin@sunriser.com"
const PASSWORD = process.env.E2E_PASSWORD ?? "Sunriser2026!"

export default async function globalSetup() {
  const browser = await chromium.launch()
  const page = await browser.newPage()

  await page.goto("http://localhost:3000/login")
  await page.getByLabel("Email").fill(EMAIL)
  await page.getByLabel("Password").fill(PASSWORD)
  await page.getByRole("button", { name: /sign in/i }).click()
  await page.waitForURL(/\/dashboard/, { timeout: 15000 })

  // Set remember preference so AuthProvider keeps the session across hard navigations
  await page.evaluate(() => {
    const REMEMBER_UNTIL_KEY = "sunriser.auth.rememberUntil"
    const REMEMBER_DURATION_MS = 6 * 24 * 60 * 60 * 1000
    localStorage.setItem(REMEMBER_UNTIL_KEY, String(Date.now() + REMEMBER_DURATION_MS))
  })

  await page.context().storageState({ path: "tests/e2e/.auth-state.json" })
  await browser.close()
}
