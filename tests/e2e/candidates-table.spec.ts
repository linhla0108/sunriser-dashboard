import { expect, test } from "@playwright/test"
import { loginAndWait, goToCandidatesTable } from "./helpers"

test.use({ storageState: { cookies: [], origins: [] } })

test.beforeEach(async ({ page }) => {
  await loginAndWait(page)
  await goToCandidatesTable(page)
})

test.describe("Candidates table — UI checks", () => {
  test("checkbox appears on row hover without column width change", async ({ page }) => {
    const firstRow = page.locator("tbody tr").first()
    const firstCell = firstRow.locator("td").first()

    const widthBefore = await firstCell.evaluate(el => el.getBoundingClientRect().width)
    await firstRow.hover()
    const widthAfter = await firstCell.evaluate(el => el.getBoundingClientRect().width)

    expect(Math.abs(widthAfter - widthBefore)).toBeLessThan(2)
    await expect(firstCell.locator('[role="checkbox"]')).toBeVisible()
  })

  test("passed rows have green left border accent", async ({ page }) => {
    const passedRow = page.locator("tbody tr").filter({ hasText: /passed/i }).first()
    const visible = await passedRow.isVisible({ timeout: 5000 }).catch(() => false)
    if (!visible) {
      test.skip()
      return
    }
    const borderColor = await passedRow.evaluate(el => getComputedStyle(el).borderLeftColor)
    // emerald-300 = rgb(110, 231, 183)
    expect(borderColor).toMatch(/rgb\(110,\s*231,\s*183\)/)
  })

  test("failed rows have red left border accent", async ({ page }) => {
    const failedRow = page.locator("tbody tr").filter({ hasText: /failed/i }).first()
    const visible = await failedRow.isVisible({ timeout: 5000 }).catch(() => false)
    if (!visible) {
      test.skip()
      return
    }
    const borderColor = await failedRow.evaluate(el => getComputedStyle(el).borderLeftColor)
    // red-300 = rgb(252, 165, 165)
    expect(borderColor).toMatch(/rgb\(252,\s*165,\s*165\)/)
  })

  test("selecting a row shows bulk count in filter area", async ({ page }) => {
    const firstRow = page.locator("tbody tr").first()
    await firstRow.hover()
    await firstRow.locator('[role="checkbox"]').click()

    await expect(page.getByText(/1 selected/i)).toBeVisible({ timeout: 5000 })

    await page.getByRole("button", { name: /clear/i }).click()
    await expect(page.getByText(/1 selected/i)).not.toBeVisible()
  })

  test("context menu shows Pin to compare", async ({ page }) => {
    const firstRow = page.locator("tbody tr").first()
    await firstRow.click({ button: "right" })
    await expect(page.getByRole("menuitem", { name: /pin to compare/i })).toBeVisible({ timeout: 5000 })
  })
})
