import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it } from "vitest"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeProvider } from "@/lib/v2/theme/ThemeProvider"
import { ThemeSwitcher } from "../ThemeSwitcher"

function TestProviders({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delay={0}>
      <ThemeProvider>{children}</ThemeProvider>
    </TooltipProvider>
  )
}

describe("ThemeSwitcher", () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute("data-theme")
    document.documentElement.removeAttribute("data-mode")
  })

  it("clicking chip B sets html data-theme to b", async () => {
    render(<ThemeSwitcher />, { wrapper: TestProviders })

    await userEvent.click(screen.getByRole("button", { name: /theme b/i }))

    expect(document.documentElement.getAttribute("data-theme")).toBe("b")
  })

  it("can hide the widget", async () => {
    render(<ThemeSwitcher />, { wrapper: TestProviders })

    await userEvent.click(screen.getByRole("button", { name: /hide theme switcher/i }))

    expect(screen.queryByRole("button", { name: /theme a/i })).not.toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem("v2.theme.widgetHidden")!)).toBe(true)
  })
})
