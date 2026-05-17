import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, beforeEach } from "vitest"
import { ThemeProvider } from "../ThemeProvider"
import { useTheme } from "../useTheme"

function ThemeProbe() {
  const { theme, setTheme } = useTheme()

  return (
    <>
      <span data-testid="theme">{theme}</span>
      <button type="button" onClick={() => setTheme("b")}>
        switchB
      </button>
    </>
  )
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute("data-theme")
    document.documentElement.removeAttribute("data-mode")
  })

  it("defaults to theme a and syncs updates to html data-theme", async () => {
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    )

    expect(screen.getByTestId("theme").textContent).toBe("a")

    await userEvent.click(screen.getByText("switchB"))

    expect(screen.getByTestId("theme").textContent).toBe("b")
    expect(document.documentElement.getAttribute("data-theme")).toBe("b")
  })
})
