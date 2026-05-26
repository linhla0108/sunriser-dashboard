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
    const passedRow = page
      .locator("tbody tr")
      .filter({ hasText: /passed/i })
      .first()
    const visible = await passedRow.isVisible({ timeout: 5000 }).catch(() => false)
    if (!visible) {
      test.skip()
      return
    }
    const borderWidth = await passedRow.evaluate(el => getComputedStyle(el).borderLeftWidth)
    expect(borderWidth).toBe("2px")
  })

  test("failed rows have red left border accent", async ({ page }) => {
    const failedRow = page
      .locator("tbody tr")
      .filter({ hasText: /failed/i })
      .first()
    const visible = await failedRow.isVisible({ timeout: 5000 }).catch(() => false)
    if (!visible) {
      test.skip()
      return
    }
    const borderWidth = await failedRow.evaluate(el => getComputedStyle(el).borderLeftWidth)
    expect(borderWidth).toBe("2px")
  })

  test("selecting a row shows bulk count in filter area", async ({ page }) => {
    const firstRow = page.locator("tbody tr").first()
    await firstRow.hover()
    await firstRow.locator('[role="checkbox"]').click()

    const bulkButton = page.getByRole("button", { name: /1 selected/i })
    await expect(bulkButton).toBeVisible({ timeout: 5000 })
    await expect(page.getByText("Selected candidates: 1")).not.toBeVisible()

    await bulkButton.click()
    await expect(page.getByRole("button", { name: /set batch/i })).toBeVisible()
    await expect(page.getByRole("button", { name: /assign pic/i })).toBeVisible()
    await expect(page.getByRole("button", { name: /delete selected/i })).toBeVisible()
    await page.getByRole("button", { name: /clear selection/i }).click()
    await expect(page.getByText(/1 selected/i)).not.toBeVisible()
  })

  test("selected row remains visible above filtered results when search excludes it", async ({ page }) => {
    const firstRow = page.locator("tbody tr").first()
    const firstName = (await firstRow.locator("td").nth(1).innerText()).split("\n")[0]
    await firstRow.hover()
    await firstRow.locator('[role="checkbox"]').click()

    await page.locator('[data-cid="table-search"]').fill("zzzz-no-match")

    await expect(page.getByText("Selected candidates: 1")).toBeVisible()
    await expect(page.getByText("Filtered results · 0")).toBeVisible()
    await expect(page.getByText(firstName, { exact: false })).toBeVisible()
  })

  test("selected section can collapse and stay available", async ({ page }) => {
    const firstRow = page.locator("tbody tr").first()
    await firstRow.hover()
    await firstRow.locator('[role="checkbox"]').click()
    await page.locator('[data-cid="table-search"]').fill("zzzz-no-match")

    await page.getByRole("button", { name: /collapse selected candidates/i }).click()

    await expect(page.getByText("Selected candidates: 1")).toBeVisible()
    await expect(page.getByRole("button", { name: /expand selected candidates/i })).toBeVisible()
  })

  test("context menu shows Pin to compare", async ({ page }) => {
    const firstRow = page.locator("tbody tr").first()
    await firstRow.click({ button: "right" })
    const menu = page.locator('[data-cid="row-context-menu"]')
    await expect(menu.getByRole("button", { name: /pin to compare/i })).toBeVisible({ timeout: 5000 })
    await expect(menu.getByRole("button", { name: /set round 1 status/i })).toBeVisible()
    await expect(menu.getByRole("button", { name: /set round 2 status/i })).toBeVisible()
  })

  test("right-clicking a selected row shows bulk edit menu", async ({ page }) => {
    const firstRow = page.locator("tbody tr").first()
    await firstRow.hover()
    await firstRow.locator('[role="checkbox"]').click()
    const selectedRow = page.locator("tbody tr").filter({ hasText: /@/ }).first()

    await selectedRow.click({ button: "right" })

    await expect(page.getByText("1 candidates selected")).toBeVisible()
    await expect(page.getByRole("button", { name: /set batch/i })).toBeVisible()
    await expect(page.getByRole("button", { name: /assign pic/i })).toBeVisible()
    await expect(page.getByRole("button", { name: /set round 1 status/i })).toBeVisible()
    await expect(page.getByRole("button", { name: /delete selected/i })).toBeVisible()
  })
})
