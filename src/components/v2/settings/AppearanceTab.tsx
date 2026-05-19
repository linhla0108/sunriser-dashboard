"use client"

import { z } from "zod"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { usePersistedState } from "@/lib/v2/persistence/usePersistedState"
import { useTheme } from "@/lib/v2/theme/useTheme"
import type { V2Mode, V2Theme } from "@/lib/v2/theme/types"
import { Button } from "@/components/ui/button"

const THEMES: Array<{ key: V2Theme; label: string; description: string; color: string }> = [
  { key: "main", label: "Main", description: "Default warm light theme", color: "#ff5533" },
  { key: "glass-orange", label: "Glass Orange", description: "Warm frosted orange dashboard", color: "#d26c30" },
  { key: "glass-blue", label: "Glass Blue", description: "Cool frosted blue dashboard", color: "#7bbfe7" },
]

const MODES: Array<{ key: V2Mode; label: string }> = [
  { key: "light", label: "Light" },
  { key: "dark", label: "Dark" },
  { key: "system", label: "System" },
]

const DENSITIES = ["compact", "comfortable"] as const
type Density = (typeof DENSITIES)[number]

export function AppearanceTab() {
  const { theme, setTheme, mode, setMode, customColor, setCustomColor } = useTheme()
  const [density, setDensity] = usePersistedState<Density>("v2.density", "compact", z.enum(DENSITIES))
  return (
    <div className="mt-6 space-y-8">
      <section>
        <h2 className="font-heading text-foreground text-sm font-semibold">Theme</h2>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {THEMES.map(item => (
            <Button
              variant="plain"
              size="plain"
              key={item.key}
              type="button"
              onClick={() => setTheme(item.key)}
              aria-pressed={theme === item.key}
              className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition ${theme === item.key ? "border-primary ring-primary/20 ring-2" : "border-foreground/10 hover:border-foreground/20"}`}
            >
              <span className="size-9 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="min-w-0">
                <span className="text-foreground block text-sm font-medium">{item.label}</span>
                <span className="text-muted-foreground block text-xs">{item.description}</span>
              </span>
            </Button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-heading text-foreground text-sm font-semibold">Color mode</h2>
        <RadioGroup
          value={mode}
          onValueChange={value => setMode((value as V2Mode) ?? "system")}
          className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3"
        >
          {MODES.map(item => (
            <Label
              key={item.key}
              htmlFor={`mode-${item.key}`}
              className="border-foreground/10 text-foreground has-[[data-checked]]:border-primary has-[[data-checked]]:ring-primary/20 flex cursor-pointer items-center gap-3 rounded-2xl border px-3 py-2.5 text-sm font-medium has-[[data-checked]]:ring-2"
            >
              <RadioGroupItem id={`mode-${item.key}`} value={item.key} />
              {item.label}
            </Label>
          ))}
        </RadioGroup>
      </section>

      <section>
        <h2 className="font-heading text-foreground text-sm font-semibold">Custom accent color</h2>
        <p className="mt-1 text-xs text-muted-foreground">Override the primary accent color across buttons, active states, and focus rings.</p>
        <div className="mt-3 flex items-center gap-3">
          <input
            type="color"
            id="custom-color"
            value={customColor ?? "#FF5533"}
            onChange={e => setCustomColor(e.target.value)}
            className="h-9 w-14 cursor-pointer rounded-2xl border border-border bg-transparent p-1"
            title="Pick a custom accent color"
          />
          <label htmlFor="custom-color" className="text-sm text-foreground font-medium">
            {customColor ?? "#FF5533 (default)"}
          </label>
          {customColor && (
            <Button variant="outline" size="sm" onClick={() => setCustomColor(null)} className="rounded-full text-xs h-7 px-3">
              Reset
            </Button>
          )}
        </div>
      </section>

      <section>
        <h2 className="font-heading text-foreground text-sm font-semibold">Density</h2>
        <RadioGroup
          value={density}
          onValueChange={value => setDensity((value as Density) ?? "compact")}
          className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2"
        >
          {DENSITIES.map(value => (
            <Label
              key={value}
              htmlFor={`density-${value}`}
              className="border-foreground/10 has-[[data-checked]]:border-primary has-[[data-checked]]:ring-primary/20 flex cursor-pointer items-start gap-3 rounded-2xl border p-3 has-[[data-checked]]:ring-2"
            >
              <RadioGroupItem id={`density-${value}`} value={value} className="mt-1" />
              <span className="min-w-0">
                <span className="text-foreground block text-sm font-medium capitalize">{value}</span>
                <span className={`bg-foreground/5 mt-2 flex flex-col rounded-lg ${value === "compact" ? "gap-1 p-1.5" : "gap-2 p-3"}`}>
                  <span className="bg-card h-2 rounded" />
                  <span className="bg-card h-2 rounded" />
                  <span className="bg-card h-2 rounded" />
                </span>
              </span>
            </Label>
          ))}
        </RadioGroup>
      </section>
    </div>
  )
}
