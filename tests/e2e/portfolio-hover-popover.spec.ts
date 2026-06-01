import { expect, test } from "@playwright/test"
import { goToCandidatesTable, loginAndWait } from "./helpers"

test.use({ storageState: { cookies: [], origins: [] } })

test.describe("Portfolio hover popover", () => {
  test("viewport prefetch stays capped after a short render delay", async ({ page }) => {
    let metadataHitCount = 0

    await page.route("**/api/candidates/portfolio-metadata?**", async route => {
      metadataHitCount += 1
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          finalUrl: "https://example.com/portfolio",
          host: "example.com",
          title: "Playwright Portfolio",
          description: "Prefetched hover metadata.",
          image: null,
        }),
      })
    })

    await loginAndWait(page)
    await goToCandidatesTable(page)

    await page.waitForTimeout(1700)

    expect(metadataHitCount).toBeGreaterThan(0)
    expect(metadataHitCount).toBeLessThanOrEqual(4)
  })

  test("popover opens on hover and closes without immediate reopen jitter", async ({ page }) => {
    await page.route("**/api/candidates/portfolio-metadata?**", async route => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          finalUrl: "https://example.com/portfolio",
          host: "example.com",
          title: "Playwright Portfolio",
          description: "Stable hover metadata.",
          image: null,
        }),
      })
    })

    await loginAndWait(page)
    await goToCandidatesTable(page)

    const trigger = page.locator('[data-cid="portfolio-link-trigger"]').first()
    const popover = page.locator('[data-cid="portfolio-link-popover"]')

    await expect(trigger).toBeVisible()
    await trigger.hover()

    await expect(popover).toBeVisible({ timeout: 5000 })
    await expect(popover).toContainText("Playwright Portfolio")

    await page.mouse.move(0, 0)

    await expect(popover).toBeHidden({ timeout: 2000 })
    await page.waitForTimeout(400)
    await expect(popover).toBeHidden()
  })
})
