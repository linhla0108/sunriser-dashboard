import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, beforeEach } from "vitest"
import { ThemeProvider } from "../ThemeProvider"
import { useTheme } from "../useTheme"

function ThemeProbe() {
  const { theme, setTheme, customColor, setCustomColor } = useTheme()

  return (
    <>
      <span data-testid="theme">{theme}</span>
      <span data-testid="custom-color">{customColor ?? "none"}</span>
      <button type="button" onClick={() => setTheme("glass-blue")}>switchBlue</button>
      <button type="button" onClick={() => setCustomColor("#123456")}>setColor</button>
      <button type="button" onClick={() => setCustomColor(null)}>resetColor</button>
    </>
  )
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute("data-theme")
    document.documentElement.removeAttribute("data-mode")
    document.documentElement.style.removeProperty("--primary")
  })

  it("defaults to main and syncs glass theme updates to html data-theme", async () => {
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    )

    expect(screen.getByTestId("theme").textContent).toBe("main")

    await userEvent.click(screen.getByText("switchBlue"))

    expect(screen.getByTestId("theme").textContent).toBe("glass-blue")
    expect(document.documentElement.getAttribute("data-theme")).toBe("glass-blue")
  })

  it("applies and resets custom color on the root element", async () => {
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    )

    expect(screen.getByTestId("custom-color").textContent).toBe("none")

    await userEvent.click(screen.getByText("setColor"))
    expect(screen.getByTestId("custom-color").textContent).toBe("#123456")
    expect(document.documentElement.style.getPropertyValue("--primary")).toBeTruthy()

    await userEvent.click(screen.getByText("resetColor"))
    expect(screen.getByTestId("custom-color").textContent).toBe("none")
    expect(document.documentElement.style.getPropertyValue("--primary")).toBe("")
  })
})
