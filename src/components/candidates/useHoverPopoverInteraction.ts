"use client"

import { useEffect, useRef, useState } from "react"

interface HoverPopoverInteractionOptions {
  enabled?: boolean
  openDelayMs: number
  closeDelayMs: number
  reopenSuppressionMs: number
}

export function useHoverPopoverInteraction({
  enabled = true,
  openDelayMs,
  closeDelayMs,
  reopenSuppressionMs,
}: HoverPopoverInteractionOptions) {
  const [open, setOpen] = useState(false)
  const openTimerRef = useRef<number | null>(null)
  const closeTimerRef = useRef<number | null>(null)
  const suppressOpenUntilRef = useRef(0)

  function clearOpenTimer() {
    if (openTimerRef.current !== null) {
      window.clearTimeout(openTimerRef.current)
      openTimerRef.current = null
    }
  }

  function clearCloseTimer() {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  function scheduleOpen() {
    if (!enabled || Date.now() < suppressOpenUntilRef.current) return
    clearCloseTimer()
    clearOpenTimer()
    if (openDelayMs <= 0) {
      setOpen(true)
      return
    }
    openTimerRef.current = window.setTimeout(() => setOpen(true), openDelayMs)
  }

  function keepOpen() {
    if (!enabled) return
    clearOpenTimer()
    clearCloseTimer()
    setOpen(true)
  }

  function scheduleClose(options?: { suppressReopen?: boolean }) {
    clearOpenTimer()
    clearCloseTimer()
    if (options?.suppressReopen) {
      suppressOpenUntilRef.current = Date.now() + reopenSuppressionMs
    }
    if (closeDelayMs <= 0) {
      setOpen(false)
      return
    }
    closeTimerRef.current = window.setTimeout(() => setOpen(false), closeDelayMs)
  }

  function closeNow() {
    clearOpenTimer()
    clearCloseTimer()
    setOpen(false)
  }

  useEffect(
    () => () => {
      clearOpenTimer()
      clearCloseTimer()
    },
    []
  )

  return { open, setOpen, scheduleOpen, keepOpen, scheduleClose, closeNow }
}
