import { expect, test } from "@playwright/test"
import { loginAndWait, goToPipeline } from "./helpers"

test.use({ storageState: { cookies: [], origins: [] } })

test.beforeEach(async ({ page }) => {
  await loginAndWait(page)
  await goToPipeline(page)
})

test.describe("Pipeline view — UI checks", () => {
  test("renders a single unified 4-option group-by pill row", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Round 1" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Round 2" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Position" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Batch" })).toBeVisible()
    await expect(page.locator("select")).not.toBeVisible()
  })

  test("switching group-by to Position shows position columns", async ({ page }) => {
    await page.getByRole("button", { name: "Position" }).click()
    await expect(page.getByText(/AI|Data|Engineering/i).first()).toBeVisible({ timeout: 5000 })
  })

  test("column headers have colored backgrounds (not white)", async ({ page }) => {
    const passHeader = page.locator("div").filter({ hasText: /^Pass$/ }).first()
    await expect(passHeader).toBeVisible({ timeout: 5000 })
    const bg = await passHeader.evaluate(el => getComputedStyle(el).backgroundColor)
    expect(bg).not.toBe("rgba(0, 0, 0, 0)")
    expect(bg).not.toBe("rgb(255, 255, 255)")
  })

  test("clicking a pipeline card opens the detail drawer", async ({ page }) => {
    const card = page.locator("[data-v2-card]").first()
    await expect(card).toBeVisible({ timeout: 5000 })
    await card.click()
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 })
  })

  test("pipeline cards show GPA (not round status badge)", async ({ page }) => {
    const firstCard = page.locator("[data-v2-card]").first()
    await expect(firstCard).toBeVisible({ timeout: 5000 })
    await expect(firstCard.getByText(/GPA/i)).toBeVisible()
  })
})
