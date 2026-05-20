"use client"

import { cloneElement, type ReactElement } from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface ActionTooltipProps {
  label: string
  description?: string
  shortcut?: string
  children: ReactElement<Record<string, unknown>>
}

function hasTextContent(value: unknown): boolean {
  if (typeof value === "string" || typeof value === "number") return String(value).trim().length > 0
  if (Array.isArray(value)) return value.some(hasTextContent)
  return false
}

export function ActionTooltip({ label, description, shortcut, children }: ActionTooltipProps) {
  const triggerLabel = children.props["aria-label"] || hasTextContent(children.props.children) ? undefined : label
  const trigger = triggerLabel ? cloneElement(children, { "aria-label": triggerLabel }) : children

  return (
    <Tooltip>
      <TooltipTrigger render={trigger} />
      <TooltipContent className="max-w-xs">
        <span className="flex items-center gap-2">
          <span className="text-sm font-medium">{label}</span>
          {shortcut ? (
            <kbd data-slot="kbd" className="border-current/30 bg-white/10 px-1.5 py-0.5 text-xs">
              {shortcut}
            </kbd>
          ) : null}
        </span>
        {description ? <span className="block text-xs text-current/70">{description}</span> : null}
      </TooltipContent>
    </Tooltip>
  )
}
