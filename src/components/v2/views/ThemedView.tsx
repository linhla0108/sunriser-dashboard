"use client"

import { useTheme } from "@/lib/v2/theme/useTheme"

interface ThemedViewProps<P extends Record<string, unknown>> {
  shadcnComponent: React.ComponentType<P>
  skeletonComponent: React.ComponentType<P>
  props: P
}

export function ThemedView<P extends Record<string, unknown>>({ shadcnComponent: Shadcn, skeletonComponent: Skeleton, props }: ThemedViewProps<P>) {
  const { theme } = useTheme()
  const Component = theme === "b" || theme === "c" ? Skeleton : Shadcn

  return <Component {...props} />
}
