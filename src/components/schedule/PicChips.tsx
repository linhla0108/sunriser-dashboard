import { parsePic } from "@/lib/schedule/picParser"
import { cn } from "@/lib/utils"

interface PicChipsProps {
  raw: string
  variant?: "stacked" | "inline"
  emptyLabel?: string
  className?: string
}

export function PicChips({ raw, variant = "inline", emptyLabel = "—", className }: PicChipsProps) {
  const chips = parsePic(raw)

  if (chips.length === 0) {
    return <span className={cn("text-muted-foreground text-xs", className)}>{emptyLabel}</span>
  }

  return (
    <ul className={cn(variant === "stacked" ? "flex flex-col gap-1.5" : "flex flex-wrap gap-1.5", className)}>
      {chips.map((chip, idx) => (
        <li key={`${chip.name}-${idx}`} className="inline-flex items-baseline gap-1.5">
          <span className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-xs font-semibold text-[#1b1b1b]">
            {chip.name}
          </span>
          {chip.roles.length > 0 ? <span className="text-muted-foreground text-[11px]">{chip.roles.join(", ")}</span> : null}
        </li>
      ))}
    </ul>
  )
}
