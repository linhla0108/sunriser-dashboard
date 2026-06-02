"use client"

import { useLayoutEffect, useRef, useState, type ReactNode } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useHoverPopoverInteraction } from "@/components/candidates/useHoverPopoverInteraction"
import { cn } from "@/lib/utils"

export function truncatePreviewText(text: string, maxLength = 100) {
  const chars = Array.from(text)
  if (chars.length <= maxLength) return text
  return `${chars.slice(0, maxLength).join("")}...`
}

const PLACEHOLDER_PREVIEW_VALUES = new Set(["-", "—", "–", "n/a", "na"])

function isPlaceholderPreviewText(text: string) {
  return PLACEHOLDER_PREVIEW_VALUES.has(text.trim().toLowerCase())
}

function useHoverPreview(enabled: boolean) {
  return useHoverPopoverInteraction({
    enabled,
    openDelayMs: 300,
    closeDelayMs: 180,
    reopenSuppressionMs: 220,
  })
}

function HoverableTextPreview({ text, className }: { text: string; className?: string }) {
  const triggerRef = useRef<HTMLSpanElement | null>(null)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const { open, setOpen, scheduleOpen, keepOpen, scheduleClose, closeNow } = useHoverPreview(isOverflowing)

  useLayoutEffect(() => {
    const element = triggerRef.current
    if (!element) return

    function measure() {
      const node = triggerRef.current
      if (!node) return
      setIsOverflowing(node.scrollWidth - node.clientWidth > 1)
    }

    measure()

    if (typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [text])

  function handleOpenChange(nextOpen: boolean, eventDetails?: { reason?: string }) {
    if (!nextOpen && (eventDetails?.reason === "trigger-press" || eventDetails?.reason === "focus-out")) return
    setOpen(nextOpen)
  }

  if (!isOverflowing) {
    return (
      <span ref={triggerRef} className={cn("text-foreground block max-w-[240px] truncate text-xs", className)}>
        {text}
      </span>
    )
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        nativeButton={false}
        render={
          <span
            ref={triggerRef}
            onMouseEnter={scheduleOpen}
            onMouseLeave={() => scheduleClose()}
            onFocus={scheduleOpen}
            onKeyDown={event => {
              if (event.key === "Escape") closeNow()
            }}
            tabIndex={0}
            className={cn(
              "text-foreground block max-w-[240px] cursor-default truncate text-xs transition-colors outline-none",
              "hover:text-primary",
              open && "text-primary",
              className
            )}
          >
            {text}
          </span>
        }
      />
      <PopoverContent
        initialFocus={false}
        finalFocus={false}
        side="bottom"
        align="start"
        sideOffset={10}
        onMouseEnter={keepOpen}
        onMouseLeave={() => scheduleClose()}
        className="max-w-[min(38rem,calc(100vw-1.5rem))] rounded-2xl px-4 py-3 text-base leading-7 shadow-xl select-text"
      >
        <p className="text-foreground whitespace-pre-wrap">{text}</p>
      </PopoverContent>
    </Popover>
  )
}

export function DelayedTextPreview({ text, empty = "-", className }: { text?: string; empty?: ReactNode; className?: string }) {
  if (!text) return <span className="text-muted-foreground text-xs">{empty}</span>

  if (isPlaceholderPreviewText(text)) {
    return <span className={cn("text-muted-foreground text-xs", className)}>{text.trim()}</span>
  }

  return <HoverableTextPreview text={text} className={className} />
}
