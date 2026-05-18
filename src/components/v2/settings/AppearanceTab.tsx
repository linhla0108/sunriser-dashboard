"use client"

import { z } from "zod"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { usePersistedState } from "@/lib/v2/persistence/usePersistedState"
import { useTheme } from "@/lib/v2/theme/useTheme"
import type { V2Mode, V2Theme } from "@/lib/v2/theme/types"

const THEMES: Array<{ key: V2Theme; label: string; description: string; color: string }> = [
  { key: "a", label: "Main", description: "Default warm light theme", color: "#ff5533" },
  { key: "b", label: "Lab", description: "Steeped editorial palette", color: "#8d1600" },
  { key: "c", label: "Hybrid", description: "Bright contrast", color: "#ff8e53" },
]

const MODES: Array<{ key: V2Mode; label: string }> = [
  { key: "light", label: "Light" },
  { key: "dark", label: "Dark" },
  { key: "system", label: "System" },
]

const DENSITIES = ["compact", "comfortable"] as const
type Density = (typeof DENSITIES)[number]

export function AppearanceTab() {
  const { theme, setTheme, mode, setMode } = useTheme()
  const [density, setDensity] = usePersistedState<Density>("v2.density", "compact", z.enum(DENSITIES))
  const [hidden, setHidden] = usePersistedState("v2.theme.widgetHidden", false, z.boolean())

  return (
    <div className="mt-6 space-y-8">
      <section>
        <h2 className="font-heading text-sm font-semibold text-[var(--v2-ink)]">Theme</h2>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {THEMES.map(item => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTheme(item.key)}
              aria-pressed={theme === item.key}
              className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition ${theme === item.key ? "border-[var(--v2-primary)] ring-2 ring-[var(--v2-primary)]/20" : "border-[var(--v2-ink)]/10 hover:border-[var(--v2-ink)]/20"}`}
            >
              <span className="size-9 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-[var(--v2-ink)]">
                  Theme {item.key.toUpperCase()}: {item.label}
                </span>
                <span className="block text-xs text-[var(--v2-muted)]">{item.description}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-heading text-sm font-semibold text-[var(--v2-ink)]">Color mode</h2>
        <RadioGroup
          value={mode}
          onValueChange={value => setMode((value as V2Mode) ?? "system")}
          className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3"
        >
          {MODES.map(item => (
            <Label
              key={item.key}
              htmlFor={`mode-${item.key}`}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[var(--v2-ink)]/10 px-3 py-2.5 text-sm font-medium text-[var(--v2-ink)] has-[[data-checked]]:border-[var(--v2-primary)] has-[[data-checked]]:ring-2 has-[[data-checked]]:ring-[var(--v2-primary)]/20"
            >
              <RadioGroupItem id={`mode-${item.key}`} value={item.key} />
              {item.label}
            </Label>
          ))}
        </RadioGroup>
      </section>

      <section>
        <h2 className="font-heading text-sm font-semibold text-[var(--v2-ink)]">Density</h2>
        <RadioGroup
          value={density}
          onValueChange={value => setDensity((value as Density) ?? "compact")}
          className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2"
        >
          {DENSITIES.map(value => (
            <Label
              key={value}
              htmlFor={`density-${value}`}
              className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[var(--v2-ink)]/10 p-3 has-[[data-checked]]:border-[var(--v2-primary)] has-[[data-checked]]:ring-2 has-[[data-checked]]:ring-[var(--v2-primary)]/20"
            >
              <RadioGroupItem id={`density-${value}`} value={value} className="mt-1" />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-[var(--v2-ink)] capitalize">{value}</span>
                <span className={`mt-2 flex flex-col rounded-lg bg-[var(--v2-ink)]/5 ${value === "compact" ? "gap-1 p-1.5" : "gap-2 p-3"}`}>
                  <span className="h-2 rounded bg-[var(--v2-surface)]" />
                  <span className="h-2 rounded bg-[var(--v2-surface)]" />
                  <span className="h-2 rounded bg-[var(--v2-surface)]" />
                </span>
              </span>
            </Label>
          ))}
        </RadioGroup>
      </section>

      <section className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--v2-ink)]/10 p-4">
        <div>
          <p className="text-sm font-medium text-[var(--v2-ink)]">Show theme switcher widget</p>
          <p className="text-xs text-[var(--v2-muted)]">Floating chips on every workspace page.</p>
        </div>
        <Switch checked={!hidden} onCheckedChange={value => setHidden(!value)} />
      </section>
    </div>
  )
}
