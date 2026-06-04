"use client"

import { Toggle } from "@base-ui/react/toggle"
import { ToggleGroup } from "@base-ui/react/toggle-group"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const segmentedControlRootVariants = cva(
  "bg-muted text-muted-foreground inline-flex w-fit items-center gap-0.5 rounded-full p-0.5 ring-1 ring-border/60",
  {
    variants: {
      size: {
        "1": "h-7",
        "2": "h-8",
        "3": "h-9",
      },
      variant: {
        surface: "",
        classic: "bg-muted",
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
  "text-muted-foreground hover:text-foreground focus-visible:ring-ring/40 inline-flex h-full flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full font-medium whitespace-nowrap transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-pressed:bg-primary data-pressed:text-primary-foreground data-pressed:font-semibold data-pressed:shadow-sm aria-disabled:cursor-not-allowed aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      size: {
        "1": "px-2.5 text-[0.75rem]",
        "2": "px-3.5 text-[0.8125rem]",
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
