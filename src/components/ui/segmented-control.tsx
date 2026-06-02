"use client"

import { Toggle } from "@base-ui/react/toggle"
import { ToggleGroup } from "@base-ui/react/toggle-group"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const segmentedControlRootVariants = cva(
  "border-primary/15 bg-primary/10 inline-flex w-fit items-center rounded-full border p-1 text-muted-foreground",
  {
    variants: {
      size: {
        "1": "h-8",
        "2": "h-9",
        "3": "h-10",
      },
      variant: {
        surface: "",
        classic: "bg-muted border-border",
      },
      radius: {
        none: "rounded-none [&_[data-slot=segmented-control-item]]:rounded-none",
        small: "rounded-md [&_[data-slot=segmented-control-item]]:rounded-sm",
        medium: "rounded-lg [&_[data-slot=segmented-control-item]]:rounded-md",
        large: "rounded-xl [&_[data-slot=segmented-control-item]]:rounded-lg",
        full: "rounded-full [&_[data-slot=segmented-control-item]]:rounded-full",
      },
    },
    defaultVariants: {
      size: "2",
      variant: "surface",
      radius: "full",
    },
  }
)

const segmentedControlItemVariants = cva(
  "text-foreground/70 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring inline-flex h-full flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-transparent font-semibold whitespace-nowrap transition-all focus-visible:ring-[3px] focus-visible:outline-1 disabled:cursor-not-allowed disabled:opacity-50 data-pressed:bg-primary data-pressed:text-primary-foreground data-pressed:shadow-sm aria-disabled:cursor-not-allowed aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      size: {
        "1": "px-2 text-xs",
        "2": "px-3 text-sm",
        "3": "px-4 text-sm",
      },
    },
    defaultVariants: {
      size: "2",
    },
  }
)

interface SegmentedControlRootProps
  extends Omit<ToggleGroup.Props, "value" | "defaultValue" | "onValueChange" | "multiple">, VariantProps<typeof segmentedControlRootVariants> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

function SegmentedControlRoot({ className, value, defaultValue, onValueChange, size, variant, radius, ...props }: SegmentedControlRootProps) {
  return (
    <ToggleGroup
      data-slot="segmented-control"
      value={value ? [value] : undefined}
      defaultValue={defaultValue ? [defaultValue] : undefined}
      onValueChange={nextValue => {
        const selectedValue = nextValue[0]
        if (selectedValue) onValueChange?.(selectedValue)
      }}
      className={cn(segmentedControlRootVariants({ size, variant, radius }), className)}
      {...props}
    />
  )
}

interface SegmentedControlItemProps extends Toggle.Props, VariantProps<typeof segmentedControlItemVariants> {}

function SegmentedControlItem({ className, size, ...props }: SegmentedControlItemProps) {
  return <Toggle data-slot="segmented-control-item" className={cn(segmentedControlItemVariants({ size }), className)} {...props} />
}

const SegmentedControl = {
  Root: SegmentedControlRoot,
  Item: SegmentedControlItem,
}

export { SegmentedControl, SegmentedControlRoot, SegmentedControlItem }
