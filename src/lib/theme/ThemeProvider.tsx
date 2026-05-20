"use client"

import { createContext, useCallback, useEffect, useMemo } from "react"
import { z } from "zod"
import { usePersistedState } from "../persistence/usePersistedState"
import type { ThemeContextValue, V2Mode, V2Theme } from "./types"

export const ThemeContext = createContext<ThemeContextValue | null>(null)

const themeSchema = z.enum(["main", "glass-orange", "glass-blue"])
const modeSchema = z.enum(["light", "dark", "system"])
const colorSchema = z.string().nullable()

function getSystemMode(): "light" | "dark" {
  if (typeof window === "undefined") return "light"
  if (!window.matchMedia) return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function hexToHsl(hex: string): string | null {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex)
  if (!m) return null
  const r = parseInt(m[1], 16) / 255
  const g = parseInt(m[2], 16) / 255
  const b = parseInt(m[3], 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeValue, setThemeValue] = usePersistedState<V2Theme>("v2.theme", "main", themeSchema)
  const [modeValue, setModeValue] = usePersistedState<V2Mode>("v2.mode", "system", modeSchema)
  const [customColor, setCustomColorValue] = usePersistedState<string | null>("v2.custom-color", null, colorSchema)

  const effectiveMode = modeValue === "system" ? getSystemMode() : modeValue

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", themeValue)
    document.documentElement.setAttribute("data-mode", effectiveMode)
    document.documentElement.classList.toggle("dark", effectiveMode === "dark")
  }, [effectiveMode, themeValue])

  useEffect(() => {
    if (customColor) {
      const hsl = hexToHsl(customColor)
      if (hsl) {
        document.documentElement.style.setProperty("--primary", hsl)
        document.documentElement.style.setProperty("--ring", hsl)
      }
    } else {
      document.documentElement.style.removeProperty("--primary")
      document.documentElement.style.removeProperty("--ring")
    }
  }, [customColor])

  const setTheme = useCallback((nextTheme: V2Theme) => setThemeValue(nextTheme), [setThemeValue])
  const setMode = useCallback((nextMode: V2Mode) => setModeValue(nextMode), [setModeValue])
  const setCustomColor = useCallback((color: string | null) => setCustomColorValue(color), [setCustomColorValue])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: themeValue,
      mode: modeValue,
      effectiveMode,
      customColor,
      setTheme,
      setMode,
      setCustomColor,
    }),
    [customColor, effectiveMode, modeValue, setCustomColor, setMode, setTheme, themeValue]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
