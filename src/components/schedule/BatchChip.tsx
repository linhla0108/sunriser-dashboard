import { normalizeTimelineBatch, type TimelineBatch } from "@/lib/types"
import { cn } from "@/lib/utils"

const STYLES: Record<TimelineBatch, string> = {
  "1": "bg-sky-100 text-sky-900 border-sky-300",
  "2": "bg-violet-100 text-violet-900 border-violet-300",
  "3": "bg-orange-100 text-orange-900 border-orange-300",
  HR: "bg-emerald-100 text-emerald-900 border-emerald-300",
  General: "bg-stone-100 text-stone-700 border-stone-300",
}

export const BATCH_BAR_STYLES: Record<TimelineBatch, string> = {
  "1": "bg-sky-400",
  "2": "bg-violet-400",
  "3": "bg-orange-400",
  HR: "bg-emerald-400",
  General: "bg-stone-400",
}

interface BatchChipProps {
  batch: string
  size?: "sm" | "md"
  className?: string
}

export function BatchChip({ batch, size = "sm", className }: BatchChipProps) {
  const normalized = normalizeTimelineBatch(batch)
  const sizeClasses = size === "md" ? "px-2.5 py-0.5 text-xs" : "px-2 py-0.5 text-[10px]"
  return (
    <span
      className={cn("inline-flex items-center rounded-full border font-semibold tracking-wide uppercase", sizeClasses, STYLES[normalized], className)}
    >
      {normalized}
    </span>
  )
}
