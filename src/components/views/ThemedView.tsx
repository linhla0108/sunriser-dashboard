"use client"

interface ThemedViewProps<P extends Record<string, unknown>> {
  shadcnComponent: React.ComponentType<P>
  skeletonComponent: React.ComponentType<P>
  props: P
}

export function ThemedView<P extends Record<string, unknown>>({ shadcnComponent: Shadcn, props }: ThemedViewProps<P>) {
  return <Shadcn {...props} />
}
