"use client"

import { useEffect } from "react"

interface ShortcutCombo {
  key: string
  mod?: boolean
  meta?: boolean
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  ignoreEditable?: boolean
  preventDefault?: boolean
}

const RESERVED_MOD_KEYS = new Set(["n", "r", "j", "tab", "1", "2", "3", "4", "5", "6", "7", "8", "9"])

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable
}

function matchesModifier(actual: boolean, expected: boolean | undefined) {
  return expected === undefined || actual === expected
}

export function isBrowserReservedShortcut(event: KeyboardEvent) {
  const key = event.key.toLowerCase()
  if (event.altKey && key === "tab") return true
  return (event.metaKey || event.ctrlKey) && RESERVED_MOD_KEYS.has(key)
}

export function useShortcut(combo: ShortcutCombo, handler: () => void) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((combo.ignoreEditable ?? true) && isEditableTarget(event.target)) return
      if (isBrowserReservedShortcut(event)) return
      if (event.key.toLowerCase() !== combo.key.toLowerCase()) return
      if (combo.mod && !event.metaKey && !event.ctrlKey) return
      if (combo.meta && !event.metaKey) return
      if (combo.ctrl && !event.ctrlKey) return
      if (!matchesModifier(event.shiftKey, combo.shift)) return
      if (!matchesModifier(event.altKey, combo.alt)) return

      if (combo.preventDefault ?? true) event.preventDefault()
      handler()
    }

    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [combo.alt, combo.ctrl, combo.ignoreEditable, combo.key, combo.meta, combo.mod, combo.preventDefault, combo.shift, handler])
}
