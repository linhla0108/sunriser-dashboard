"use client"

import { useEffect, useRef, useState } from "react"
import { Globe2, ImageOff, Link2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useHoverPopoverInteraction } from "@/components/candidates/useHoverPopoverInteraction"
import type { PortfolioLinkMetadata } from "@/lib/candidates/portfolioMetadata"
import { cn } from "@/lib/utils"

const hoverMetadataCache = new Map<string, PortfolioLinkMetadata>()
const viewportPrefetchedUrls = new Set<string>()
const viewportPrefetchScheduledUrls = new Set<string>()
const VIEWPORT_PREFETCH_DELAY_MS = 1200
const VIEWPORT_PREFETCH_LIMIT = 4

interface PortfolioLinkPopoverProps {
  url: string
  label: string
  className?: string
}

function openExternal(url: string) {
  window.open(url, "_blank", "noopener,noreferrer")
}

async function requestPortfolioMetadata(url: string) {
  const response = await fetch(`/api/candidates/portfolio-metadata?url=${encodeURIComponent(url)}`, {
    method: "GET",
    cache: "no-store",
  })
  if (!response.ok) throw new Error(`portfolio_metadata_${response.status}`)
  return (await response.json()) as PortfolioLinkMetadata
}

export function PortfolioLinkPopover({ url, label, className }: PortfolioLinkPopoverProps) {
  const cachedMetadata = hoverMetadataCache.get(url) ?? null
  const { open, setOpen, scheduleOpen, keepOpen, scheduleClose, closeNow } = useHoverPopoverInteraction({
    openDelayMs: 220,
    closeDelayMs: 180,
    reopenSuppressionMs: 220,
  })
  const [metadata, setMetadata] = useState<PortfolioLinkMetadata | null>(cachedMetadata)
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(cachedMetadata ? "ready" : "idle")
  const triggerRef = useRef<HTMLSpanElement | null>(null)
  const fetchStartedRef = useRef(Boolean(cachedMetadata))

  useEffect(() => {
    const element = triggerRef.current
    if (!element || typeof IntersectionObserver === "undefined") return
    if (hoverMetadataCache.has(url) || viewportPrefetchedUrls.has(url) || viewportPrefetchScheduledUrls.has(url)) return
    if (viewportPrefetchedUrls.size >= VIEWPORT_PREFETCH_LIMIT) return

    let prefetchTimer: number | null = null

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0]
        if (!entry) return

        if (entry.isIntersecting) {
          if (prefetchTimer !== null || fetchStartedRef.current || viewportPrefetchedUrls.size >= VIEWPORT_PREFETCH_LIMIT) return
          prefetchTimer = window.setTimeout(() => {
            prefetchTimer = null
            if (fetchStartedRef.current || hoverMetadataCache.has(url) || viewportPrefetchedUrls.size >= VIEWPORT_PREFETCH_LIMIT) return
            viewportPrefetchScheduledUrls.add(url)
            fetchStartedRef.current = true
            setStatus("loading")
            void (async () => {
              try {
                const payload = await requestPortfolioMetadata(url)
                hoverMetadataCache.set(url, payload)
                viewportPrefetchedUrls.add(url)
                setMetadata(payload)
                setStatus("ready")
              } catch {
                fetchStartedRef.current = false
                setStatus("error")
              } finally {
                viewportPrefetchScheduledUrls.delete(url)
              }
            })()
          }, VIEWPORT_PREFETCH_DELAY_MS)
          return
        }

        if (prefetchTimer !== null) {
          window.clearTimeout(prefetchTimer)
          prefetchTimer = null
        }
      },
      { threshold: 0, rootMargin: "120px 0px" }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
      if (prefetchTimer !== null) window.clearTimeout(prefetchTimer)
    }
  }, [url])

  useEffect(() => {
    if (!open) return
    if (hoverMetadataCache.has(url) || fetchStartedRef.current) return

    fetchStartedRef.current = true
    setStatus("loading")
    void (async () => {
      try {
        const payload = await requestPortfolioMetadata(url)
        hoverMetadataCache.set(url, payload)
        setMetadata(payload)
        setStatus("ready")
      } catch {
        fetchStartedRef.current = false
        setStatus("error")
      } finally {
        viewportPrefetchScheduledUrls.delete(url)
      }
    })()
  }, [open, url])

  const host =
    metadata?.host ??
    (() => {
      try {
        return new URL(url).host
      } catch {
        return url
      }
    })()

  function handleOpenChange(nextOpen: boolean, eventDetails?: { reason?: string }) {
    if (!nextOpen && (eventDetails?.reason === "trigger-press" || eventDetails?.reason === "focus-out")) return
    setOpen(nextOpen)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        nativeButton={false}
        render={
          <span
            ref={triggerRef}
            onMouseEnter={scheduleOpen}
            onMouseLeave={() => scheduleClose()}
            onFocus={scheduleOpen}
            onKeyDown={event => {
              if (event.key === "Escape") closeNow()
            }}
            onClick={() => openExternal(url)}
            className={cn(
              "text-muted-foreground inline-flex size-7 cursor-pointer items-center justify-center rounded-full transition-colors",
              "hover:bg-foreground/5 hover:text-primary",
              open && "bg-foreground/5 text-primary",
              className
            )}
            aria-label={label}
            data-cid="portfolio-link-trigger"
            tabIndex={0}
          >
            <Link2 className="size-4" />
          </span>
        }
      />
      <PopoverContent
        initialFocus={false}
        finalFocus={false}
        side="bottom"
        align="center"
        sideOffset={10}
        onMouseEnter={keepOpen}
        onMouseLeave={() => scheduleClose()}
        className="w-80 rounded-2xl p-0 shadow-xl select-text"
        data-cid="portfolio-link-popover"
      >
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:bg-foreground/[0.02] block overflow-hidden rounded-2xl transition-colors"
          aria-label={`Open ${host} in a new tab`}
        >
          {status === "loading" ? (
            <div className="flex min-h-40 flex-col items-center justify-center gap-2 px-4 py-5 text-center">
              <Globe2 className="text-muted-foreground size-5 animate-pulse" />
              <p className="text-foreground text-sm font-medium">Loading website metadata...</p>
              <p className="text-muted-foreground text-xs">{host}</p>
            </div>
          ) : null}

          {status === "error" ? (
            <div className="flex min-h-40 flex-col items-center justify-center gap-2 px-4 py-5 text-center">
              <ImageOff className="text-muted-foreground size-5" />
              <p className="text-foreground text-sm font-medium">Metadata unavailable</p>
              <p className="text-muted-foreground text-xs leading-5">Open the original portfolio link to inspect the website directly.</p>
              <p className="text-muted-foreground text-xs">{host}</p>
            </div>
          ) : null}

          {status === "ready" && metadata ? (
            <div className="flex flex-col">
              {metadata.image ? (
                <div className="bg-muted relative h-36 w-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={metadata.image} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                </div>
              ) : null}
              <div className="flex flex-col gap-2 px-4 py-4">
                <div className="text-muted-foreground flex items-center gap-2 text-xs">
                  <Globe2 className="size-3.5 shrink-0" />
                  <span className="truncate">{metadata.host}</span>
                </div>
                <p className="text-foreground line-clamp-2 text-sm font-medium">{metadata.title || "Untitled website"}</p>
                <p className="text-muted-foreground line-clamp-3 text-xs leading-5">
                  {metadata.description || "No preview description available for this website."}
                </p>
              </div>
            </div>
          ) : null}
        </a>
      </PopoverContent>
    </Popover>
  )
}
