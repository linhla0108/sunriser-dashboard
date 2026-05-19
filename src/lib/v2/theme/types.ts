export type V2Theme = "main" | "glass-orange" | "glass-blue"
export type V2Mode = "light" | "dark" | "system"

export interface ThemeContextValue {
  theme: V2Theme
  mode: V2Mode
  effectiveMode: "light" | "dark"
  customColor: string | null
  setTheme: (theme: V2Theme) => void
  setMode: (mode: V2Mode) => void
  setCustomColor: (color: string | null) => void
}
