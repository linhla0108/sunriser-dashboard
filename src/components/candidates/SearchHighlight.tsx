import { Fragment } from "react"

interface SearchHighlightProps {
  text: string
  query?: string
  className?: string
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export function SearchHighlight({ text, query, className }: SearchHighlightProps) {
  const term = query?.trim()

  if (!term) return <>{text}</>

  const matcher = new RegExp(`(${escapeRegExp(term)})`, "gi")
  const parts = text.split(matcher)

  return (
    <>
      {parts.map((part, index) => {
        if (!part) return null
        const isMatch = part.toLowerCase() === term.toLowerCase()
        if (!isMatch) return <Fragment key={`${part}-${index}`}>{part}</Fragment>

        return (
          <mark key={`${part}-${index}`} className={className ?? "bg-primary/20 text-foreground rounded-[3px]"}>
            {part}
          </mark>
        )
      })}
    </>
  )
}
