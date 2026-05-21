import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { AppLoadingScreen } from "../AppLoadingScreen"

describe("AppLoadingScreen", () => {
  it("renders the default boot loading copy", () => {
    render(<AppLoadingScreen />)

    expect(screen.getByRole("status")).toHaveTextContent("Preparing workspace")
    expect(screen.queryByText("SUN.RISER")).not.toBeInTheDocument()
  })

  it("renders auth-specific copy", () => {
    render(<AppLoadingScreen variant="auth" />)

    expect(screen.getByRole("status")).toHaveTextContent("Opening your workspace")
  })

  it("renders route-specific loading copy", () => {
    render(<AppLoadingScreen variant="route" />)

    expect(screen.getByRole("status")).toHaveTextContent("Loading view")
  })

  it("supports explicit status copy", () => {
    render(<AppLoadingScreen variant="auth" sublabel="Checking access" />)

    expect(screen.getByRole("status")).toHaveTextContent("Checking access")
  })
})
