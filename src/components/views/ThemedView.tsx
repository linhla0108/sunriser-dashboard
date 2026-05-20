"use client"

interface ThemedViewProps<P extends object> {
  shadcnComponent: React.ComponentType<P>
  skeletonComponent: React.ComponentType<P>
  props: P
}

export function ThemedView<P extends object>({ shadcnComponent: Shadcn, props }: ThemedViewProps<P>) {
  return <Shadcn {...props} />
}
