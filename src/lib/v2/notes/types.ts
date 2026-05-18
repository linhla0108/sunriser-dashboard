export interface Note {
  id: string
  scope: "global" | `candidate:${string}`
  title: string
  body: string
  updatedAt: string
}
