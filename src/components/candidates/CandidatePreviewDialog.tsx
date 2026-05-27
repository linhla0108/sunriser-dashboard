"use client"

import { useEffect, useRef, useState, type ComponentType, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { ExternalLink, FileQuestion } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { isImagePreviewUrl, isPdfPreviewUrl } from "@/lib/candidates/candidateLinks"

export interface CandidatePreviewTarget {
  label: string
  url: string
}

interface CandidatePreviewDialogProps {
  title: string
  description?: string
  targets: CandidatePreviewTarget[]
  triggerLabel: string
  icon: ComponentType<{ className?: string }>
}

function displayHost(url: string) {
  try {
    return new URL(url).host
  } catch {
    return url
  }
}

function PreviewFrame({ target }: { target: CandidatePreviewTarget }) {
  const [loaded, setLoaded] = useState(false)
  const isImage = isImagePreviewUrl(target.url)
  const isPdf = isPdfPreviewUrl(target.url)

  return (
    <div className="border-border bg-muted/40 relative min-h-0 flex-1 overflow-hidden rounded-xl border">
      {!loaded ? <div className="text-muted-foreground absolute inset-0 grid place-items-center text-sm">Loading preview...</div> : null}
      {isImage ? (
        // Referrer is suppressed because these files can contain private applicant information.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={target.url}
          alt={target.label}
          referrerPolicy="no-referrer"
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
          className="h-full w-full object-contain"
        />
      ) : (
        <iframe
          title={target.label}
          src={target.url}
          referrerPolicy="no-referrer"
          sandbox={isPdf ? "" : "allow-forms allow-popups allow-scripts"}
          onLoad={() => setLoaded(true)}
          className="h-full w-full bg-white"
        />
      )}
    </div>
  )
}

export function CandidatePreviewDialog({ title, description, targets, triggerLabel, icon: Icon }: CandidatePreviewDialogProps) {
  const [open, setOpen] = useState(false)
  const [activeUrl, setActiveUrl] = useState(targets[0]?.url ?? "")
  const activeTarget = targets.find(target => target.url === activeUrl) ?? targets[0]

  if (targets.length === 0) {
    return <span className="text-muted-foreground text-xs">-</span>
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => {
          setActiveUrl(targets[0]?.url ?? "")
          setOpen(true)
        }}
        className="text-muted-foreground hover:text-primary rounded-full"
        aria-label={triggerLabel}
      >
        <Icon className="size-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex h-[82dvh] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] grid-rows-[auto_1fr] flex-col p-4 sm:h-[70dvh] sm:w-[70vw] sm:max-w-[70vw]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description ?? "Preview is loaded in a restricted frame without sending a referrer."}</DialogDescription>
          </DialogHeader>

          {targets.length > 1 ? (
            <div className="flex max-w-full gap-1 overflow-x-auto pb-1">
              {targets.map((target, index) => (
                <Button
                  key={`${target.url}-${index}`}
                  type="button"
                  variant={target.url === activeTarget.url ? "secondary" : "outline"}
                  size="xs"
                  onClick={() => setActiveUrl(target.url)}
                  className="max-w-48 shrink-0"
                >
                  <span className="truncate">{target.label || displayHost(target.url)}</span>
                </Button>
              ))}
            </div>
          ) : null}

          {activeTarget ? (
            <>
              <div className="text-muted-foreground flex min-w-0 items-center gap-2 text-xs">
                <ExternalLink className="size-3.5 shrink-0" />
                <span className="truncate">{displayHost(activeTarget.url)}</span>
              </div>
              <PreviewFrame key={activeTarget.url} target={activeTarget} />
            </>
          ) : (
            <div className="border-border text-muted-foreground grid flex-1 place-items-center rounded-xl border text-sm">
              <FileQuestion className="mr-2 inline size-4" />
              No preview available.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export function truncatePreviewText(text: string, maxLength = 100) {
  const chars = Array.from(text)
  if (chars.length <= maxLength) return text
  return `${chars.slice(0, maxLength).join("")}...`
}

export function DelayedTextPreview({ text, empty = "-", className }: { text?: string; empty?: ReactNode; className?: string }) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const timerRef = useRef<number | null>(null)
  const anchorRef = useRef<HTMLSpanElement>(null)

  function clearTimer() {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  function handleEnter() {
    if (!text) return
    clearTimer()
    const rect = anchorRef.current?.getBoundingClientRect()
    if (rect) setPosition({ top: rect.bottom + 8, left: Math.min(rect.left, window.innerWidth - 360) })
    timerRef.current = window.setTimeout(() => setOpen(true), 500)
  }

  function handleLeave() {
    clearTimer()
    setOpen(false)
  }

  useEffect(() => clearTimer, [])

  if (!text) return <span className="text-muted-foreground text-xs">{empty}</span>

  return (
    <>
      <span
        ref={anchorRef}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onFocus={handleEnter}
        onBlur={handleLeave}
        tabIndex={0}
        className={cn("text-foreground block max-w-[240px] cursor-default truncate text-xs outline-none", className)}
      >
        {truncatePreviewText(text)}
      </span>
      {open
        ? createPortal(
            <div
              role="tooltip"
              style={{ top: position.top, left: Math.max(8, position.left) }}
              onMouseEnter={handleEnter}
              onMouseLeave={handleLeave}
              className="border-border fixed z-[10000] max-w-[340px] rounded-xl border bg-white p-3 text-xs leading-relaxed whitespace-normal text-[#1b1b1b] shadow-xl"
            >
              {text}
            </div>,
            document.body
          )
        : null}
    </>
  )
}
