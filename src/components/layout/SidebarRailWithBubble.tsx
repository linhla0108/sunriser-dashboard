"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { SidebarRail, useSidebar } from "@/components/ui/sidebar"

const BUBBLE_H = 32

export function SidebarRailWithBubble() {
  const { state } = useSidebar()
  const [bubbleY, setBubbleY] = useState(40)
  const [hovered, setHovered] = useState(false)

  const isCollapsed = state === "collapsed"
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [tooltipVisible, setTooltipVisible] = useState(false)

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current)
    },
    []
  )

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top
    const clamped = Math.max(BUBBLE_H / 2, Math.min(y, rect.height - BUBBLE_H / 2))
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setBubbleY(clamped), 200)
  }, [])

  const handleMouseEnter = useCallback(() => {
    setHovered(true)
    tooltipTimerRef.current = setTimeout(() => setTooltipVisible(true), 700)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setHovered(false)
    setTooltipVisible(false)
    if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current)
  }, [])

  return (
    <SidebarRail title="" onMouseMove={handleMouseMove} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {isCollapsed && (
        <div
          className={cn(
            "pointer-events-none absolute right-2 h-8 w-4 translate-x-full -translate-y-1/2 rounded-r-full",
            "bg-sidebar border-sidebar-border border border-l-0 shadow-sm",
            "transition-[top,opacity,scale] duration-200 ease-out",
            hovered ? "border-ring scale-y-110 opacity-100" : "opacity-60"
          )}
          style={{ top: bubbleY }}
        >
          <svg
            className="text-sidebar-foreground/50 absolute inset-0 m-auto size-2.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      )}

      {tooltipVisible && (
        <div
          role="tooltip"
          className="animate-in fade-in-0 zoom-in-95 pointer-events-none absolute left-full z-50 ml-8 -translate-y-1/2 duration-150"
          style={{ top: bubbleY }}
        >
          <div className="bg-popover text-popover-foreground flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium shadow-md ring-1 ring-black/8 dark:ring-white/10">
            {isCollapsed ? "Open sidebar" : "Close sidebar"}
            <kbd className="border-border bg-muted text-muted-foreground rounded border px-1.5 py-0.5 font-mono text-[10px]">⌘B</kbd>
          </div>
        </div>
      )}
    </SidebarRail>
  )
}
