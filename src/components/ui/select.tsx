"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"
import { Select as SelectPrimitive } from "@base-ui/react/select"

import { cn } from "@/lib/utils"
import { ChevronDownIcon, CheckIcon, ChevronUpIcon, SearchIcon } from "lucide-react"

const Select = SelectPrimitive.Root

const selectTriggerClassName =
  "flex w-fit cursor-pointer items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground data-[size=default]:h-8 data-[size=sm]:h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"

type SearchableSelectOption = {
  value: string
  label: string
  disabled?: boolean
  searchText?: string
}

type SearchableSelectProps = {
  value: string
  options: SearchableSelectOption[]
  onValueChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  className?: string
  contentClassName?: string
  size?: "sm" | "default"
  "aria-label"?: string
}

function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
  return <SelectPrimitive.Group data-slot="select-group" className={cn("scroll-my-1 p-1", className)} {...props} />
}

function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
  return <SelectPrimitive.Value data-slot="select-value" className={cn("flex flex-1 text-left", className)} {...props} />
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: SelectPrimitive.Trigger.Props & {
  size?: "sm" | "default"
}) {
  return (
    <SelectPrimitive.Trigger data-slot="select-trigger" data-size={size} className={cn(selectTriggerClassName, className)} {...props}>
      {children}
      <SelectPrimitive.Icon render={<ChevronDownIcon className="text-muted-foreground pointer-events-none size-4" />} />
    </SelectPrimitive.Trigger>
  )
}

function SearchableSelect({
  value,
  options,
  onValueChange,
  placeholder = "Select option",
  searchPlaceholder = "Search",
  emptyMessage = "No options found",
  className,
  contentClassName,
  size = "default",
  "aria-label": ariaLabel,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [activeValue, setActiveValue] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const listboxId = React.useId()
  const selected = options.find(option => option.value === value)
  const selectedLabel = selected?.label ?? ""
  const normalizedQuery = query.trim().toLowerCase()
  const visibleOptions = normalizedQuery
    ? options.filter(option => `${option.label} ${option.searchText ?? ""}`.toLowerCase().includes(normalizedQuery))
    : options
  const enabledOptions = visibleOptions.filter(option => !option.disabled)
  const activeOption = visibleOptions.find(option => option.value === activeValue && !option.disabled) ?? enabledOptions[0]

  React.useEffect(() => {
    if (!open) return
    window.setTimeout(() => inputRef.current?.focus(), 0)
  }, [open])

  function close() {
    setOpen(false)
    setQuery("")
  }

  function selectOption(option: SearchableSelectOption) {
    if (option.disabled) return
    onValueChange(option.value)
    close()
  }

  function moveActive(direction: 1 | -1) {
    if (enabledOptions.length === 0) return
    const currentIndex = activeOption ? enabledOptions.findIndex(option => option.value === activeOption.value) : -1
    const nextIndex = currentIndex < 0 ? 0 : (currentIndex + direction + enabledOptions.length) % enabledOptions.length
    setActiveValue(enabledOptions[nextIndex]?.value ?? null)
  }

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      moveActive(1)
      return
    }
    if (event.key === "ArrowUp") {
      event.preventDefault()
      moveActive(-1)
      return
    }
    if (event.key === "Enter") {
      event.preventDefault()
      if (activeOption) selectOption(activeOption)
      return
    }
    if (event.key === "Escape") {
      event.preventDefault()
      close()
    }
  }

  return (
    <PopoverPrimitive.Root
      open={open}
      onOpenChange={nextOpen => {
        setOpen(nextOpen)
        setQuery("")
        setActiveValue(nextOpen ? (options.find(option => !option.disabled)?.value ?? null) : null)
      }}
    >
      <PopoverPrimitive.Trigger
        data-slot="searchable-select-trigger"
        data-size={size}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(selectTriggerClassName, className)}
      >
        <span
          data-slot="select-value"
          className={cn("flex flex-1 items-center gap-1.5 truncate text-left", !selectedLabel && "text-muted-foreground")}
        >
          {selectedLabel || placeholder}
        </span>
        <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4" />
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner side="bottom" sideOffset={6} align="start" className="isolate z-50">
          <PopoverPrimitive.Popup
            data-slot="searchable-select-content"
            className={cn(
              "bg-popover text-popover-foreground ring-foreground/10 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 z-50 flex max-h-(--available-height) w-(--anchor-width) min-w-44 origin-(--transform-origin) flex-col overflow-hidden rounded-lg p-1.5 shadow-md ring-1 outline-hidden duration-100",
              contentClassName
            )}
          >
            <div className="relative mb-1">
              <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
              <input
                ref={inputRef}
                role="combobox"
                aria-label={`Search ${ariaLabel ?? placeholder}`.trim()}
                aria-expanded={open}
                aria-controls={listboxId}
                aria-activedescendant={activeOption ? `${listboxId}-${activeOption.value}` : undefined}
                value={query}
                onChange={event => {
                  const nextQuery = event.target.value
                  setQuery(nextQuery)
                  const nextOptions = options.filter(option =>
                    `${option.label} ${option.searchText ?? ""}`.toLowerCase().includes(nextQuery.trim().toLowerCase())
                  )
                  setActiveValue(nextOptions.find(option => !option.disabled)?.value ?? null)
                }}
                onKeyDown={handleInputKeyDown}
                placeholder={selectedLabel || searchPlaceholder}
                className="border-input bg-background placeholder:text-muted-foreground focus-visible:border-ring h-8 w-full rounded-md border py-1 pr-2.5 pl-8 text-sm outline-none"
              />
            </div>
            <div id={listboxId} role="listbox" className="max-h-64 overflow-y-auto">
              {visibleOptions.length ? (
                visibleOptions.map(option => {
                  const active = activeOption?.value === option.value
                  const selectedOption = option.value === value
                  return (
                    <button
                      key={option.value}
                      id={`${listboxId}-${option.value}`}
                      type="button"
                      role="option"
                      aria-selected={selectedOption}
                      aria-disabled={option.disabled ? "true" : undefined}
                      data-disabled={option.disabled ? "" : undefined}
                      data-active={active ? "" : undefined}
                      onMouseEnter={() => {
                        if (!option.disabled) setActiveValue(option.value)
                      }}
                      onMouseDown={event => {
                        event.preventDefault()
                        selectOption(option)
                      }}
                      className={cn(
                        "data-active:bg-accent data-active:text-accent-foreground relative flex min-h-8 w-full cursor-pointer items-center gap-1.5 rounded-md py-1 pr-8 pl-2.5 text-left text-sm outline-none select-none",
                        "data-disabled:text-muted-foreground data-disabled:cursor-not-allowed data-disabled:opacity-50"
                      )}
                    >
                      <span className="truncate">{option.label}</span>
                      {selectedOption ? <CheckIcon className="pointer-events-none absolute right-2 size-4" /> : null}
                    </button>
                  )
                })
              ) : (
                <p className="text-muted-foreground px-2.5 py-2 text-sm">{emptyMessage}</p>
              )}
            </div>
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}

function SelectContent({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  alignItemWithTrigger = true,
  ...props
}: SelectPrimitive.Popup.Props & Pick<SelectPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger">) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="isolate z-50"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          data-align-trigger={alignItemWithTrigger}
          className={cn(
            "bg-popover text-popover-foreground ring-foreground/10 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 relative isolate z-50 max-h-(--available-height) w-(--anchor-width) min-w-36 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg shadow-md ring-1 duration-100 data-[align-trigger=true]:animate-none",
            className
          )}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List>{children}</SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({ className, ...props }: SelectPrimitive.GroupLabel.Props) {
  return <SelectPrimitive.GroupLabel data-slot="select-label" className={cn("text-muted-foreground px-2.5 py-1 text-xs", className)} {...props} />
}

function SelectItem({ className, children, ...props }: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground relative flex w-full cursor-pointer items-center gap-1.5 rounded-md py-1 pr-8 pl-2.5 text-sm outline-hidden select-none data-disabled:cursor-not-allowed data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="flex flex-1 shrink-0 gap-2 whitespace-nowrap">{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator render={<span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center" />}>
        <CheckIcon className="pointer-events-none" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({ className, ...props }: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator data-slot="select-separator" className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)} {...props} />
  )
}

function SelectScrollUpButton({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn(
        "bg-popover top-0 z-10 flex w-full cursor-pointer items-center justify-center py-1 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <ChevronUpIcon />
    </SelectPrimitive.ScrollUpArrow>
  )
}

function SelectScrollDownButton({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn(
        "bg-popover bottom-0 z-10 flex w-full cursor-pointer items-center justify-center py-1 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <ChevronDownIcon />
    </SelectPrimitive.ScrollDownArrow>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  SearchableSelect,
  type SearchableSelectOption,
}
