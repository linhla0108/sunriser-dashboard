import { expect, test, type Page } from "@playwright/test"
import { goToCandidatesTable, loginAndWait } from "./helpers"

test.use({ storageState: { cookies: [], origins: [] }, viewport: { width: 1800, height: 901 } })

const popoverContent = '[data-slot="popover-content"]'
const tooltipContent = '[data-slot="tooltip-content"]'
const anyHoverOverlay = `${popoverContent}, ${tooltipContent}`

async function expectNoHoverOverlay(page: Page) {
  await expect(page.locator(anyHoverOverlay)).toHaveCount(0, { timeout: 1000 })
}

async function leaveHoverTarget(page: Page) {
  await page.mouse.move(20, 20)
  await expectNoHoverOverlay(page)
}

test.describe("Candidate hover preview matrix", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.open = (url?: string | URL, target?: string, features?: string) => {
        const win = window as typeof window & { __openedUrls?: Array<{ url?: string; target?: string; features?: string }> }
        win.__openedUrls = win.__openedUrls ?? []
        win.__openedUrls.push({ url: url?.toString(), target, features })
        return null
      }
    })

    await page.route("**/api/candidates/portfolio-metadata?**", async route => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          finalUrl: "https://example.com/portfolio",
          host: "example.com",
          title: "Matrix Portfolio",
          description: "Stable hover metadata.",
          image: null,
        }),
      })
    })

    await loginAndWait(page)
    await goToCandidatesTable(page)
  })

  test("description, message, and portfolio hover previews stay open when the popup is hovered", async ({ page }) => {
    const firstRow = page.locator("tbody tr").first()
    const description = firstRow.locator("td").nth(6).getByRole("button")
    const portfolio = firstRow.locator('[data-cid="portfolio-link-trigger"]').first()
    const message = firstRow.locator("td").nth(8).getByRole("button")

    await description.hover()
    await expect(page.locator(popoverContent)).toContainText("BarbarQ2")
    await expect(page.locator(popoverContent)).toHaveClass(/select-text/)
    await expect(page.locator(popoverContent)).toHaveCount(1)
    expect(await page.locator(popoverContent).evaluate(el => document.activeElement === el)).toBe(false)
    await page.locator(popoverContent).hover()
    await page.waitForTimeout(220)
    await expect(page.locator(popoverContent)).toContainText("BarbarQ2")
    await leaveHoverTarget(page)

    await message.hover()
    await expect(page.locator(popoverContent)).toContainText("Game Designer")
    await expect(page.locator(popoverContent)).toHaveCount(1)
    await page.locator(popoverContent).hover()
    await page.mouse.down()
    await page.mouse.up()
    await expect(page.locator(popoverContent)).toContainText("Game Designer")
    await page.mouse.click(300, 140)
    await expectNoHoverOverlay(page)

    await portfolio.hover()
    await expect(page.locator('[data-cid="portfolio-link-popover"]')).toContainText("Matrix Portfolio")
    await expect(page.locator('[data-cid="portfolio-link-popover"]')).toHaveClass(/select-text/)
    await expect(page.locator(popoverContent)).toHaveCount(1)
    await page.locator('[data-cid="portfolio-link-popover"]').hover()
    await page.waitForTimeout(220)
    await expect(page.locator('[data-cid="portfolio-link-popover"]')).toContainText("Matrix Portfolio")
    await page.getByRole("button", { name: "Name" }).hover()
    await expectNoHoverOverlay(page)
  })

  test("academic hover tooltip does not stick and click still opens the preview dialog", async ({ page }) => {
    const firstRow = page.locator("tbody tr").first()
    const academic = firstRow.getByRole("button", { name: /preview academic file/i })

    await academic.hover()
    await expect(page.locator(tooltipContent)).toContainText("Preview academic file")
    await leaveHoverTarget(page)

    await academic.click()
    await expect(page.getByRole("dialog")).toContainText("academic file")
    await page.keyboard.press("Escape")
    await expect(page.getByRole("dialog")).toHaveCount(0)
  })

  test("portfolio trigger remains clickable after hover preview opens", async ({ page }) => {
    const firstPortfolio = page.locator('[data-cid="portfolio-link-trigger"]').first()

    await firstPortfolio.hover()
    await expect(page.locator('[data-cid="portfolio-link-popover"]')).toContainText("Matrix Portfolio")

    await firstPortfolio.click()
    await expect(page.locator('[data-cid="portfolio-link-popover"]')).toContainText("Matrix Portfolio")

    const openedUrls = await page.evaluate(() => {
      const win = window as typeof window & { __openedUrls?: Array<{ url?: string; target?: string; features?: string }> }
      return win.__openedUrls ?? []
    })
    expect(openedUrls).toHaveLength(1)
    expect(openedUrls[0]).toMatchObject({ target: "_blank", features: "noopener,noreferrer" })
  })
})
