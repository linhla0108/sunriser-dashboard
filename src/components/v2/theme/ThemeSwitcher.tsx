"use client"

import { usePathname } from "next/navigation"
import { Moon, Sun, X } from "lucide-react"
import { z } from "zod"
import { ActionTooltip } from "@/components/v2/common/ActionTooltip"
import { usePersistedState } from "@/lib/v2/persistence/usePersistedState"
import { useTheme } from "@/lib/v2/theme/useTheme"
import type { V2Theme } from "@/lib/v2/theme/types"

const THEME_CHIPS: Array<{ key: V2Theme; label: string; color: string }> = [
  { key: "a", label: "Theme A: Main", color: "#ff5533" },
  { key: "b", label: "Theme B: Lab", color: "#8d1600" },
  { key: "c", label: "Theme C: Hybrid", color: "#ff8e53" },
]

export function ThemeSwitcher() {
  const pathname = usePathname()
  const [hidden, setHidden] = usePersistedState("v2.theme.widgetHidden", false, z.boolean())
  const { effectiveMode, setMode, setTheme, theme } = useTheme()

  if (hidden) return null
  // Public share routes should look clean for external viewers; hide the workspace widget.
  if (pathname?.startsWith("/v2/public")) return null

  const nextMode = effectiveMode === "dark" ? "light" : "dark"

  return (
    <div className="fixed right-4 bottom-4 z-50 flex items-center gap-1 rounded-full border border-[var(--v2-ink)]/10 bg-[var(--v2-surface)] p-2 shadow-lg sm:right-6 sm:bottom-6">
      {THEME_CHIPS.map(chip => (
        <ActionTooltip key={chip.key} label={chip.label}>
          <button
            type="button"
            onClick={() => setTheme(chip.key)}
            aria-label={chip.label}
            aria-pressed={theme === chip.key}
            className={`size-7 rounded-full border-2 transition ${theme === chip.key ? "scale-110 border-[var(--v2-ink)]" : "border-transparent hover:scale-105"}`}
            style={{ backgroundColor: chip.color }}
          />
        </ActionTooltip>
      ))}
      <span className="mx-1 h-5 w-px bg-[var(--v2-ink)]/15" />
      <ActionTooltip label={`Switch to ${nextMode} mode`}>
        <button
          type="button"
          onClick={() => setMode(nextMode)}
          className="flex size-8 items-center justify-center rounded-full text-[var(--v2-muted)] transition hover:bg-[var(--v2-ink)]/5 hover:text-[var(--v2-ink)]"
          aria-label="Toggle color mode"
        >
          {effectiveMode === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
      </ActionTooltip>
      <ActionTooltip label="Hide theme switcher" description="Re-enable from Settings">
        <button
          type="button"
          onClick={() => setHidden(true)}
          className="flex size-8 items-center justify-center rounded-full text-[var(--v2-muted)] transition hover:bg-[var(--v2-ink)]/5 hover:text-[var(--v2-ink)]"
          aria-label="Hide theme switcher"
        >
          <X className="size-4" />
        </button>
      </ActionTooltip>
    </div>
  )
}
