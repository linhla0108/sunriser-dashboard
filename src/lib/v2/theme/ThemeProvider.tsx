"use client"

import { createContext, useCallback, useEffect, useMemo } from "react"
import { z } from "zod"
import { usePersistedState } from "../persistence/usePersistedState"
import type { ThemeContextValue, V2Mode, V2Theme } from "./types"

export const ThemeContext = createContext<ThemeContextValue | null>(null)

const themeSchema = z.enum(["a", "b", "c"])
const modeSchema = z.enum(["light", "dark", "system"])

function getSystemMode(): "light" | "dark" {
  if (typeof window === "undefined") return "light"
  if (!window.matchMedia) return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeValue, setThemeValue] = usePersistedState<V2Theme>("v2.theme", "a", themeSchema)
  const [modeValue, setModeValue] = usePersistedState<V2Mode>("v2.mode", "system", modeSchema)

  const effectiveMode = modeValue === "system" ? getSystemMode() : modeValue

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", themeValue)
    document.documentElement.setAttribute("data-mode", effectiveMode)
  }, [effectiveMode, themeValue])

  const setTheme = useCallback((nextTheme: V2Theme) => setThemeValue(nextTheme), [setThemeValue])
  const setMode = useCallback((nextMode: V2Mode) => setModeValue(nextMode), [setModeValue])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: themeValue,
      mode: modeValue,
      effectiveMode,
      setTheme,
      setMode,
    }),
    [effectiveMode, modeValue, setMode, setTheme, themeValue]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
