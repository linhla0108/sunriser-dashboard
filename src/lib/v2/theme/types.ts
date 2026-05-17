export type V2Theme = "a" | "b" | "c"
export type V2Mode = "light" | "dark" | "system"

export interface ThemeContextValue {
  theme: V2Theme
  mode: V2Mode
  effectiveMode: "light" | "dark"
  setTheme: (theme: V2Theme) => void
  setMode: (mode: V2Mode) => void
}
