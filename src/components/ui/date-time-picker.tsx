"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarClock, CalendarIcon, XIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

type DateTimeParts = {
  date: Date | undefined
  time: string
}

type DateTimeRangeValue = {
  startsAt: DateTimeParts
  endsAt: DateTimeParts
}

const EMPTY_PART: DateTimeParts = { date: undefined, time: "" }
const TIME_PRESETS = ["09:00", "12:00", "17:00"] as const
const HOURS = Array.from({ length: 24 }, (_, index) => index.toString().padStart(2, "0"))
const MINUTES = Array.from({ length: 12 }, (_, index) => (index * 5).toString().padStart(2, "0"))

function formatRangePart(part: DateTimeParts) {
  const dateLabel = part.date ? format(part.date, "MMM d") : ""
  return [dateLabel, part.time].filter(Boolean).join(", ")
}

function formatRangeLabel(value: DateTimeRangeValue, placeholder: string) {
  const startLabel = formatRangePart(value.startsAt)
  const endLabel = formatRangePart(value.endsAt)

  if (startLabel && endLabel) return `Active ${startLabel} - ${endLabel}`
  if (startLabel) return `Starts ${startLabel}`
  if (endLabel) return `Ends ${endLabel}`
  return placeholder
}

function isEmptyPart(part: DateTimeParts) {
  return !part.date && !part.time
}

function DateTimeRangePicker({
  id,
  value,
  onChange,
  onClear,
  placeholder = "Chọn thời gian chiến dịch",
  className,
}: {
  id?: string
  value: DateTimeRangeValue
  onChange: (value: DateTimeRangeValue) => void
  onClear?: () => void
  placeholder?: string
  className?: string
}) {
  const label = formatRangeLabel(value, placeholder)
  const hasValue = !isEmptyPart(value.startsAt) || !isEmptyPart(value.endsAt)

  function updateSide(side: keyof DateTimeRangeValue, nextPart: DateTimeParts) {
    onChange({
      ...value,
      [side]: nextPart,
    })
  }

  function updateRange(range: DateRange | undefined) {
    onChange({
      startsAt: {
        ...value.startsAt,
        date: range?.from,
      },
      endsAt: {
        ...value.endsAt,
        date: range?.to,
      },
    })
  }

  function clearAll() {
    if (onClear) {
      onClear()
      return
    }

    onChange({
      startsAt: { ...EMPTY_PART },
      endsAt: { ...EMPTY_PART },
    })
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            id={id}
            type="button"
            variant="outline"
            className={cn("w-full justify-start rounded-2xl text-left font-normal", !hasValue && "text-muted-foreground", className)}
            aria-label={label}
          >
            <CalendarClock className="size-4" />
            <span className="truncate">{label}</span>
          </Button>
        }
      />
      <PopoverContent className="w-[min(calc(100vw-2rem),680px)] rounded-3xl p-0" align="start" sideOffset={8}>
        <div className="flex flex-col gap-3 p-3 md:flex-row">
          <div className="bg-background overflow-x-auto rounded-2xl border p-2">
            <Calendar mode="range" selected={{ from: value.startsAt.date, to: value.endsAt.date }} onSelect={updateRange} numberOfMonths={2} />
          </div>

          <Separator className="md:hidden" />

          <div className="flex min-w-0 flex-1 flex-col gap-3 md:min-w-[244px]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CalendarIcon className="text-primary size-4" />
                <div>
                  <div className="text-sm font-medium">Thời gian chiến dịch</div>
                  <p className="text-muted-foreground text-xs">Pick dates together, then tune each time.</p>
                </div>
              </div>
            </div>

            <DateTimeRangeSide
              label="Starts"
              part={value.startsAt}
              onChange={part => updateSide("startsAt", part)}
              onClear={() => updateSide("startsAt", { ...EMPTY_PART })}
            />

            <DateTimeRangeSide
              label="Ends"
              part={value.endsAt}
              onChange={part => updateSide("endsAt", part)}
              onClear={() => updateSide("endsAt", { ...EMPTY_PART })}
            />

            <Separator />

            <Button type="button" variant="ghost" size="sm" className="w-full justify-center rounded-full" onClick={clearAll} disabled={!hasValue}>
              <XIcon className="size-4" />
              Xóa thời gian chiến dịch
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function DateTimeRangeSide({
  label,
  part,
  onChange,
  onClear,
}: {
  label: "Starts" | "Ends"
  part: DateTimeParts
  onChange: (part: DateTimeParts) => void
  onClear: () => void
}) {
  const [selectedHour = "", selectedMinute = ""] = part.time.split(":")

  function updateTime(nextHour: string, nextMinute: string) {
    onChange({ ...part, time: `${nextHour}:${nextMinute}` })
  }

  function setNow() {
    const now = new Date()
    onChange({ date: now, time: format(now, "HH:mm") })
  }

  return (
    <div className="bg-muted/20 space-y-2 rounded-2xl border p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Label className="text-sm">{label}</Label>
          <div className="text-muted-foreground text-xs">{formatRangePart(part) || "No date or time set"}</div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          className="rounded-full"
          onClick={onClear}
          disabled={isEmptyPart(part)}
          aria-label={`Clear ${label.toLowerCase()}`}
        >
          Clear
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        <Button type="button" variant="outline" size="xs" className="rounded-full" onClick={setNow} aria-label={`${label} Now`}>
          Now
        </Button>
        {TIME_PRESETS.map(time => (
          <Button
            key={time}
            type="button"
            variant={part.time === time ? "default" : "outline"}
            size="xs"
            className="rounded-full"
            onClick={() => onChange({ ...part, time })}
            aria-label={`${label} ${time}`}
          >
            {time}
          </Button>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.72fr)]">
        <div className="space-y-1.5">
          <div className="text-muted-foreground text-xs font-medium">Hour</div>
          <div className="grid grid-cols-6 gap-1">
            {HOURS.map(hour => (
              <Button
                key={hour}
                type="button"
                variant={selectedHour === hour ? "default" : "outline"}
                size="xs"
                className="h-8 rounded-xl px-0 tabular-nums"
                onClick={() => updateTime(hour, selectedMinute || "00")}
                aria-label={`${label} hour ${hour}`}
              >
                {hour}
              </Button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="text-muted-foreground text-xs font-medium">Minute</div>
          <div className="grid grid-cols-4 gap-1">
            {MINUTES.map(minute => (
              <Button
                key={minute}
                type="button"
                variant={selectedMinute === minute ? "default" : "outline"}
                size="xs"
                className="h-8 rounded-xl px-0 tabular-nums"
                onClick={() => updateTime(selectedHour || "09", minute)}
                aria-label={`${label} minute ${minute}`}
              >
                {minute}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function DateTimePicker({
  date,
  time,
  onDateChange,
  onTimeChange,
  onClear,
  placeholder = "Pick a date",
  className,
  id,
}: {
  date?: Date
  time: string
  onDateChange: (date: Date | undefined) => void
  onTimeChange: (time: string) => void
  onClear: () => void
  placeholder?: string
  className?: string
  id?: string
}) {
  return (
    <DateTimeRangePicker
      id={id}
      value={{
        startsAt: { date, time },
        endsAt: { ...EMPTY_PART },
      }}
      onChange={nextValue => {
        onDateChange(nextValue.startsAt.date)
        onTimeChange(nextValue.startsAt.time)
      }}
      onClear={onClear}
      placeholder={placeholder}
      className={className}
    />
  )
}

export { DateTimePicker, DateTimeRangePicker, type DateTimeParts, type DateTimeRangeValue }
