"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  CANDIDATE_BATCH_OPTIONS,
  CANDIDATE_CHIP_STYLES,
  CANDIDATE_PIC_OPTIONS,
  CANDIDATE_ROUND_OPTIONS,
  formatCandidateBatchLabel,
} from "@/lib/candidates/constants"
import { cn } from "@/lib/utils"

interface ChipOption<T extends string | number> {
  label: string
  value: T
  styleKey?: string
}

function SelectChip<T extends string | number>({
  value,
  options,
  onChange,
  unsetLabel = "— unset",
  allowUnset = true,
}: {
  value?: T
  options: ChipOption<T>[]
  onChange?: (v: T | undefined) => void
  unsetLabel?: string
  allowUnset?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const selected = options.find(opt => opt.value === value)
  const label = selected?.label ?? (value ? String(value) : "————")
  const styleKey = selected?.styleKey ?? selected?.label ?? (value ? String(value) : undefined)

  useEffect(() => {
    if (!open) return
    function handle(e: MouseEvent) {
      const target = e.target as Node
      if (!btnRef.current?.contains(target) && !menuRef.current?.contains(target)) setOpen(false)
    }
    document.addEventListener("mousedown", handle)
    return () => document.removeEventListener("mousedown", handle)
  }, [open])

  function handleOpen() {
    if (!onChange) return
    const rect = btnRef.current?.getBoundingClientRect()
    if (rect) setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width })
    setOpen(v => !v)
  }

  return (
    <span data-round-chip="" className="block w-full">
      <Button
        variant="plain"
        size="plain"
        ref={btnRef}
        type="button"
        onClick={handleOpen}
        className={cn(
          "flex w-full min-w-0 items-center justify-center gap-1 rounded-full border px-2 py-0.5 text-center text-xs font-medium transition-opacity",
          styleKey
            ? (CANDIDATE_CHIP_STYLES[styleKey] ?? "border-border bg-muted text-muted-foreground")
            : "border-border bg-muted/60 text-muted-foreground",
          onChange ? "cursor-pointer hover:opacity-75" : "cursor-default"
        )}
      >
        <span className="min-w-0 truncate">{label}</span>
        {onChange && <ChevronDown className="size-2.5 shrink-0 opacity-50" />}
      </Button>

      {open &&
        onChange &&
        createPortal(
          <div
            ref={menuRef}
            data-round-chip=""
            style={{ top: pos.top, left: pos.left, width: pos.width }}
            data-v2-glass-panel="strong"
            className="border-border fixed z-[9999] min-w-[130px] overflow-hidden rounded-xl border bg-white py-1 shadow-xl"
          >
            {allowUnset && (
              <Button
                variant="plain"
                size="plain"
                type="button"
                onClick={() => {
                  onChange(undefined)
                  setOpen(false)
                }}
                className="text-muted-foreground hover:bg-muted w-full justify-start px-3 py-1.5 text-left text-xs"
              >
                {unsetLabel}
              </Button>
            )}
            {options.map(opt => (
              <Button
                variant="plain"
                size="plain"
                key={String(opt.value)}
                type="button"
                onClick={() => {
                  onChange(opt.value)
                  setOpen(false)
                }}
                className={cn(
                  "hover:bg-muted flex w-full items-center justify-start gap-2 px-3 py-1.5 text-left text-xs",
                  value === opt.value && "font-semibold"
                )}
              >
                <span className={cn("inline-block size-2 rounded-full border", CANDIDATE_CHIP_STYLES[opt.styleKey ?? opt.label])} />
                {opt.label}
              </Button>
            ))}
          </div>,
          document.body
        )}
    </span>
  )
}

export function RoundChip({ value, onChange }: { value?: string; onChange?: (v: string | undefined) => void }) {
  return <SelectChip value={value} options={CANDIDATE_ROUND_OPTIONS.map(option => ({ value: option, label: option }))} onChange={onChange} />
}

export function BatchChip({ value, onChange }: { value?: number; onChange?: (v: number | undefined) => void }) {
  return (
    <SelectChip
      value={value}
      options={CANDIDATE_BATCH_OPTIONS.map(option => ({
        value: option,
        label: formatCandidateBatchLabel(option),
        styleKey: formatCandidateBatchLabel(option),
      }))}
      onChange={onChange}
      allowUnset={false}
    />
  )
}

export function PicChip({ value, onChange }: { value?: string; onChange?: (v: string | undefined) => void }) {
  return <SelectChip value={value} options={CANDIDATE_PIC_OPTIONS.map(option => ({ value: option, label: option }))} onChange={onChange} />
}
