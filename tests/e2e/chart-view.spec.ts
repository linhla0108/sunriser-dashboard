import { expect, test } from "@playwright/test"
import { loginAndWait, goToChartView } from "./helpers"

test.use({ storageState: { cookies: [], origins: [] } })

test.beforeEach(async ({ page }) => {
  await loginAndWait(page)
  await goToChartView(page)
})

test.describe("Chart view — UI checks", () => {
  test("renders global All / Passed / Failed filter bar", async ({ page }) => {
    await expect(page.getByRole("button", { name: "All" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Passed" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Failed" })).toBeVisible()
  })

  test("shows total applicants KPI", async ({ page }) => {
    await expect(page.getByText(/total applicants/i)).toBeVisible()
  })

  test("filtering to Passed changes the displayed count", async ({ page }) => {
    // Read the KPI number shown under "Total Applicants"
    const kpi = page.locator('[data-cid="chart-kpi"], .chart-kpi, h2, .text-display').filter({ hasText: /^\d+$/ }).first()
    const allText = await kpi.textContent().catch(() => "0")

    await page.getByRole("button", { name: "Passed" }).click()
    await page.waitForTimeout(400)

    const passedText = await kpi.textContent().catch(() => "0")
    expect(Number(passedText)).toBeLessThan(Number(allText))
  })

  test("renders by-function bar chart SVG", async ({ page }) => {
    await expect(page.getByText(/by function/i)).toBeVisible()
    await expect(page.locator("svg").first()).toBeVisible()
  })

  test("renders GPA distribution chart", async ({ page }) => {
    await expect(page.getByText(/GPA distribution/i)).toBeVisible()
  })

  test("renders experience and full-time donut charts", async ({ page }) => {
    await expect(page.getByText(/experience/i)).toBeVisible()
    await expect(page.getByText(/full.time/i)).toBeVisible()
  })
})
