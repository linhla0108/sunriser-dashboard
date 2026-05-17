"use client"

import { useEffect } from "react"

interface ShortcutCombo {
  key: string
  meta?: boolean
  ctrl?: boolean
}

export function useShortcut(combo: ShortcutCombo, handler: () => void) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== combo.key.toLowerCase()) return
      if (combo.meta && !(event.metaKey || event.ctrlKey)) return
      if (combo.ctrl && !event.ctrlKey) return

      event.preventDefault()
      handler()
    }

    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [combo.ctrl, combo.key, combo.meta, handler])
}
