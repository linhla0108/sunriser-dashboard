import { expect, test } from "@playwright/test"

const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000"
const email = process.env.E2E_EMAIL
const password = process.env.E2E_PASSWORD

test.skip(!email || !password, "Set E2E_EMAIL and E2E_PASSWORD to run authenticated upload flow smoke.")

test("global workspace drag and drop does not open upload review", async ({ page }) => {
  await page.goto(`${baseURL}/dashboard`)

  const emailInput = page.getByLabel("Email")
  if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await emailInput.fill(email!)
    await page.getByLabel("Password").fill(password!)
    await page.getByRole("button", { name: /sign in/i }).click()
  }

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })

  await expect(page.getByText("Total Applicants")).toBeVisible()

  const csv = [
    "Name,Email,Phone,Position 1,GPA",
    '"Nguyen, An",an@example.com,0901,AI Engineering Intern,8.5',
    "Tran B,b@example.com,0902,Data Analysis Intern,7.9",
  ].join("\n")
  const dataTransfer = await page.evaluateHandle(csvText => {
    const file = new File([csvText], "playwright-candidates.csv", { type: "text/csv" })
    const dataTransfer = new DataTransfer()
    dataTransfer.items.add(file)
    return dataTransfer
  }, csv)

  await page.dispatchEvent("body", "dragenter", { dataTransfer })
  await page.dispatchEvent("body", "drop", { dataTransfer })

  const popup = page.locator('[data-cid="drop-zone-popup"]')
  await expect(popup).toHaveCount(0)
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })
  await expect(page.getByText("Total Applicants")).toBeVisible()

  await page.screenshot({ path: "test-results/upload-review-flow.png", fullPage: true })
})
