"use client"

import { useEffect, useLayoutEffect, useRef, useState, type ComponentType, type ReactNode } from "react"
import { ExternalLink, Globe2, Minus, Plus, RotateCcw, RotateCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { DocxPreview } from "@/components/candidates/DocxPreview"
import { useHoverPopoverInteraction } from "@/components/candidates/useHoverPopoverInteraction"
import { proxiedCandidateFileUrl } from "@/lib/candidates/candidateLinks"
import {
  getCandidateBinaryPreviewMode,
  getCandidateFileName,
  normalizePreviewContentType,
  type CandidateFilePreviewMetadata,
} from "@/lib/candidates/filePreview"
import { cn } from "@/lib/utils"

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

interface PdfLoadSuccessPayload {
  numPages: number
}

interface ReactPdfModule {
  Document: ComponentType<{
    file: string
    loading?: ReactNode
    onLoadSuccess?: (payload: PdfLoadSuccessPayload) => void
    onLoadError?: () => void
    className?: string
    children?: ReactNode
  }>
  Page: ComponentType<{
    pageNumber: number
    width: number
    rotate?: number
    renderAnnotationLayer: boolean
    renderTextLayer: boolean
  }>
}

const ZOOM_LEVELS = [25, 50, 75, 100, 125, 150, 175, 200] as const
type ZoomLevel = (typeof ZOOM_LEVELS)[number]
type Rotation = 0 | 90 | 180 | 270

function nextRotation(current: Rotation, direction: 1 | -1): Rotation {
  const order: Rotation[] = [0, 90, 180, 270]
  const index = order.indexOf(current)
  const length = order.length
  const nextIndex = ((((index === -1 ? 0 : index) + direction) % length) + length) % length
  return order[nextIndex]
}

function displayHost(url: string) {
  try {
    return new URL(url).host
  } catch {
    return url
  }
}

function openPreviewTarget(url: string) {
  window.open(url, "_blank", "noopener,noreferrer")
}

function PreviewFallback({
  target,
  title,
  message,
  actionLabel = "Open original link",
}: {
  target: CandidatePreviewTarget
  title: string
  message: string
  actionLabel?: string
}) {
  return (
    <div className="border-border bg-muted/30 flex min-h-0 flex-1 items-center justify-center rounded-xl border p-4 sm:p-6">
      <div className="flex max-w-lg flex-col items-center gap-3 text-center">
        <div className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
          <Globe2 className="size-5" />
        </div>
        <div className="space-y-1">
          <p className="text-foreground text-sm font-medium">{title}</p>
          <p className="text-muted-foreground text-sm leading-6">{message}</p>
          <p className="text-muted-foreground text-xs">{displayHost(target.url)}</p>
        </div>
        <Button type="button" size="sm" onClick={() => openPreviewTarget(target.url)}>
          <ExternalLink className="size-3.5" />
          {actionLabel}
        </Button>
      </div>
    </div>
  )
}

function ImagePreviewSkeleton() {
  return (
    <div
      className="border-border bg-muted/30 flex h-full min-h-0 flex-1 flex-col gap-3 rounded-xl border p-4"
      data-testid="image-preview-skeleton"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Loading image preview...</span>
      <div className="flex justify-end">
        <Skeleton className="h-8 w-40 rounded-full" />
      </div>
      <div className="border-border/70 bg-background/50 flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-xl border p-4">
        <div className="flex aspect-[4/3] max-h-full w-full max-w-3xl flex-col gap-3">
          <Skeleton className="h-3 w-1/3 rounded-full" />
          <Skeleton className="min-h-0 flex-1 rounded-xl" />
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-3 rounded-full" />
            <Skeleton className="h-3 rounded-full" />
            <Skeleton className="h-3 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

function readPreviewMetadata(target: CandidatePreviewTarget, response: Response): CandidateFilePreviewMetadata {
  const contentType = normalizePreviewContentType(response.headers.get("content-type"), target.url)
  const contentLength = Number.parseInt(response.headers.get("content-length") ?? "", 10)

  return {
    contentType,
    contentLength: Number.isFinite(contentLength) ? contentLength : null,
    fileName: getCandidateFileName(target.url),
    mode: getCandidateBinaryPreviewMode({ contentType, url: target.url }),
  }
}

function nextZoomLevel(current: number, direction: 1 | -1) {
  const index = ZOOM_LEVELS.indexOf(current as (typeof ZOOM_LEVELS)[number])
  if (index === -1) return 100
  const nextIndex = Math.min(ZOOM_LEVELS.length - 1, Math.max(0, index + direction))
  return ZOOM_LEVELS[nextIndex]
}

function ZoomControls({
  zoomPercent,
  onZoomChange,
  rotation,
  onRotationChange,
}: {
  zoomPercent: number
  onZoomChange: (value: ZoomLevel) => void
  rotation?: Rotation
  onRotationChange?: (value: Rotation) => void
}) {
  const showRotation = rotation !== undefined && onRotationChange !== undefined

  return (
    <div className="border-border bg-background/80 text-muted-foreground flex items-center gap-1 rounded-full border px-2 py-1 text-xs shadow-sm">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => onZoomChange(nextZoomLevel(zoomPercent, -1))}
        disabled={zoomPercent === ZOOM_LEVELS[0]}
        aria-label="Zoom out preview"
        data-cid="preview-zoom-out"
      >
        <Minus className="size-3.5" />
      </Button>
      <button
        type="button"
        onClick={() => onZoomChange(100)}
        className="text-foreground hover:bg-muted min-w-12 rounded-md px-2 py-1 font-medium"
        aria-label={`Reset preview zoom to 100 percent (currently ${zoomPercent} percent)`}
        data-cid="preview-zoom-reset"
      >
        {zoomPercent}%
      </button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => onZoomChange(nextZoomLevel(zoomPercent, 1))}
        disabled={zoomPercent === ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
        aria-label="Zoom in preview"
        data-cid="preview-zoom-in"
      >
        <Plus className="size-3.5" />
      </Button>
      {showRotation ? (
        <>
          <span className="bg-border mx-1 h-4 w-px" aria-hidden="true" />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onRotationChange(nextRotation(rotation, -1))}
            aria-label="Rotate preview counter-clockwise"
            data-cid="preview-rotate-ccw"
          >
            <RotateCcw className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onRotationChange(nextRotation(rotation, 1))}
            aria-label="Rotate preview clockwise"
            data-cid="preview-rotate-cw"
          >
            <RotateCw className="size-3.5" />
          </Button>
        </>
      ) : null}
    </div>
  )
}

function BinaryPreview({ target }: { target: CandidatePreviewTarget }) {
  const previewUrl = proxiedCandidateFileUrl(target.url)
  const [metadata, setMetadata] = useState<CandidateFilePreviewMetadata | null>(null)
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [zoomPercent, setZoomPercent] = useState<ZoomLevel>(100)
  const [rotation, setRotation] = useState<Rotation>(0)

  useEffect(() => {
    const controller = new AbortController()

    async function loadMetadata() {
      try {
        const response = await fetch(previewUrl, {
          method: "HEAD",
          signal: controller.signal,
        })
        if (!response.ok) throw new Error(`file_head_${response.status}`)
        setMetadata(readPreviewMetadata(target, response))
        setStatus("ready")
      } catch {
        if (controller.signal.aborted) return
        setStatus("error")
      }
    }

    void loadMetadata()
    return () => controller.abort()
  }, [previewUrl, target])

  if (status === "loading") {
    return (
      <div className="border-border bg-muted/30 text-muted-foreground grid min-h-0 flex-1 place-items-center rounded-xl border text-sm">
        Loading file preview...
      </div>
    )
  }

  if (status === "error" || !metadata) {
    return (
      <PreviewFallback
        target={target}
        title="This file could not be previewed in-app"
        message="The preview proxy could not read this file. Open the original link in a new tab."
      />
    )
  }

  if (metadata.mode === "pdf") {
    return (
      <PdfPreview
        target={target}
        previewUrl={previewUrl}
        zoomPercent={zoomPercent}
        onZoomChange={setZoomPercent}
        rotation={rotation}
        onRotationChange={setRotation}
      />
    )
  }

  if (metadata.mode === "image") {
    return (
      <ImagePreview
        target={target}
        previewUrl={previewUrl}
        zoomPercent={zoomPercent}
        onZoomChange={setZoomPercent}
        rotation={rotation}
        onRotationChange={setRotation}
      />
    )
  }

  if (metadata.mode === "docx") {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="flex justify-end">
          <ZoomControls zoomPercent={zoomPercent} onZoomChange={setZoomPercent} rotation={rotation} onRotationChange={setRotation} />
        </div>
        <DocxPreview previewUrl={previewUrl} originalUrl={target.url} label={target.label} zoomPercent={zoomPercent} rotation={rotation} />
      </div>
    )
  }

  return (
    <PreviewFallback
      target={target}
      title="This academic file cannot be previewed inline"
      message={`Unsupported file type${metadata.contentType ? ` (${metadata.contentType})` : ""}. Images, PDFs, and DOCX files can preview in the dashboard.`}
      actionLabel="Open or download file"
    />
  )
}

function ImagePreview({
  target,
  previewUrl,
  zoomPercent,
  onZoomChange,
  rotation,
  onRotationChange,
}: {
  target: CandidatePreviewTarget
  previewUrl: string
  zoomPercent: number
  onZoomChange: (value: ZoomLevel) => void
  rotation: Rotation
  onRotationChange: (value: Rotation) => void
}) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    let nextObjectUrl = ""

    async function loadImage() {
      try {
        const response = await fetch(previewUrl, { signal: controller.signal })
        if (!response.ok) throw new Error(`image_fetch_${response.status}`)
        const blob = await response.blob()
        nextObjectUrl = URL.createObjectURL(blob)
        setObjectUrl(nextObjectUrl)
        setStatus("ready")
      } catch {
        if (controller.signal.aborted) return
        setStatus("error")
      }
    }

    void loadImage()

    return () => {
      controller.abort()
      if (nextObjectUrl) URL.revokeObjectURL(nextObjectUrl)
    }
  }, [previewUrl])

  if (status === "error") {
    return (
      <PreviewFallback
        target={target}
        title="Image preview could not be loaded"
        message="The original image may be unavailable or protected by the host. Open it directly to inspect the file."
      />
    )
  }

  if (status === "loading" || !objectUrl) {
    return <ImagePreviewSkeleton />
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex justify-end">
        <ZoomControls zoomPercent={zoomPercent} onZoomChange={onZoomChange} rotation={rotation} onRotationChange={onRotationChange} />
      </div>
      <div className="border-border bg-muted/40 relative min-h-0 flex-1 overflow-auto rounded-xl border">
        {!imageLoaded ? (
          <div className="absolute inset-0 z-10">
            <ImagePreviewSkeleton />
          </div>
        ) : null}
        <div
          className={cn("flex min-h-full min-w-full items-start justify-center p-4", !imageLoaded && "opacity-0")}
          style={{ transform: `scale(${zoomPercent / 100}) rotate(${rotation}deg)`, transformOrigin: "top center" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={objectUrl}
            alt={target.label}
            referrerPolicy="no-referrer"
            className="h-auto max-w-none object-contain"
            onLoad={() => setImageLoaded(true)}
            onError={() => setStatus("error")}
          />
        </div>
      </div>
    </div>
  )
}

function PdfPreview({
  target,
  previewUrl,
  zoomPercent,
  onZoomChange,
  rotation,
  onRotationChange,
}: {
  target: CandidatePreviewTarget
  previewUrl: string
  zoomPercent: number
  onZoomChange: (value: ZoomLevel) => void
  rotation: Rotation
  onRotationChange: (value: Rotation) => void
}) {
  const [pageCount, setPageCount] = useState(0)
  const [containerWidth, setContainerWidth] = useState(900)
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [pdfModule, setPdfModule] = useState<ReactPdfModule | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadPdfModule() {
      try {
        const reactPdf = await import("react-pdf")
        reactPdf.pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString()
        if (cancelled) return
        setPdfModule({
          Document: reactPdf.Document,
          Page: reactPdf.Page,
        })
      } catch {
        if (!cancelled) setStatus("error")
      }
    }

    void loadPdfModule()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    function updateWidth() {
      const element = containerRef.current
      if (!element) return
      setContainerWidth(Math.max(320, Math.floor(element.clientWidth) - 32))
    }

    const container = containerRef.current
    if (!container) return

    updateWidth()

    if (typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(() => updateWidth())
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="border-border bg-muted/40 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border">
      <div className="border-border bg-background/80 text-muted-foreground flex items-center justify-between gap-3 border-b px-4 py-2 text-xs">
        <div className="flex items-center gap-3">
          <span>PDF preview</span>
          {pageCount > 0 ? <span>{pageCount} pages</span> : null}
        </div>
        <ZoomControls zoomPercent={zoomPercent} onZoomChange={onZoomChange} rotation={rotation} onRotationChange={onRotationChange} />
      </div>
      <div ref={containerRef} className="min-h-0 flex-1 overflow-auto p-4">
        {status === "error" ? (
          <PreviewFallback
            target={target}
            title="PDF preview could not be rendered"
            message="The file loaded, but the in-app PDF renderer could not display it. Open the original file in a new tab."
            actionLabel="Open PDF"
          />
        ) : !pdfModule ? (
          <div className="text-muted-foreground grid min-h-full place-items-center text-sm">Loading PDF preview...</div>
        ) : (
          <pdfModule.Document
            file={previewUrl}
            loading={<div className="text-muted-foreground grid min-h-full place-items-center text-sm">Loading PDF preview...</div>}
            onLoadSuccess={(payload: PdfLoadSuccessPayload) => {
              setPageCount(payload.numPages)
              setStatus("ready")
            }}
            onLoadError={() => setStatus("error")}
            className="grid justify-center gap-4"
          >
            {Array.from({ length: pageCount || 0 }, (_, index) => (
              <pdfModule.Page
                key={index + 1}
                pageNumber={index + 1}
                width={Math.max(240, Math.floor((containerWidth * zoomPercent) / 100))}
                rotate={rotation}
                renderAnnotationLayer={false}
                renderTextLayer={false}
              />
            ))}
          </pdfModule.Document>
        )}
      </div>
    </div>
  )
}

function PreviewTrigger({ triggerLabel, onClick, children }: { triggerLabel: string; onClick: () => void; children: ReactNode }) {
  const [tooltipOpen, setTooltipOpen] = useState(false)

  return (
    <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
      <TooltipTrigger
        render={
          <button
            type="button"
            onMouseDown={event => event.preventDefault()}
            onClick={event => {
              setTooltipOpen(false)
              event.currentTarget.blur()
              onClick()
            }}
            onMouseLeave={event => event.currentTarget.blur()}
            className={cn(
              "text-muted-foreground inline-flex size-7 cursor-pointer items-center justify-center rounded-full transition-colors outline-none",
              "hover:bg-foreground/5 hover:text-primary",
              tooltipOpen && "bg-foreground/5 text-primary"
            )}
            aria-label={triggerLabel}
          >
            {children}
          </button>
        }
      />
      <TooltipContent className="max-w-xs">{triggerLabel}</TooltipContent>
    </Tooltip>
  )
}

export function CandidatePreviewDialog({ title, description, targets, triggerLabel, icon: Icon }: CandidatePreviewDialogProps) {
  const [open, setOpen] = useState(false)
  const activeTarget = targets[0]

  if (targets.length === 0 || !activeTarget) {
    return <span className="text-muted-foreground text-xs">-</span>
  }

  return (
    <>
      <PreviewTrigger triggerLabel={triggerLabel} onClick={() => setOpen(true)}>
        <Icon className="size-4" />
      </PreviewTrigger>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex h-[90dvh] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] flex-col gap-3 p-4 sm:h-[90dvh] sm:w-[90vw] sm:max-w-[90vw] sm:p-5">
          <DialogHeader className="shrink-0 pr-8">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {description ?? "Preview is loaded through a restricted proxy when possible, without sending a referrer."}
            </DialogDescription>
          </DialogHeader>

          <div className="text-muted-foreground flex min-w-0 shrink-0 items-center gap-2 text-xs">
            <ExternalLink className="size-3.5 shrink-0" />
            <span className="truncate">{displayHost(activeTarget.url)}</span>
            <button
              type="button"
              onClick={() => openPreviewTarget(activeTarget.url)}
              className="text-primary ml-auto inline-flex items-center gap-1 text-xs font-medium hover:underline"
            >
              <ExternalLink className="size-3.5" />
              Open in new tab
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col">
            <BinaryPreview key={activeTarget.url} target={activeTarget} />
          </div>
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

const PLACEHOLDER_PREVIEW_VALUES = new Set(["-", "—", "–", "n/a", "na"])

function isPlaceholderPreviewText(text: string) {
  return PLACEHOLDER_PREVIEW_VALUES.has(text.trim().toLowerCase())
}

function useHoverPreview(enabled: boolean) {
  return useHoverPopoverInteraction({
    enabled,
    openDelayMs: 300,
    closeDelayMs: 180,
    reopenSuppressionMs: 220,
  })
}

function HoverableTextPreview({ text, className }: { text: string; className?: string }) {
  const triggerRef = useRef<HTMLSpanElement | null>(null)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const { open, setOpen, scheduleOpen, keepOpen, scheduleClose, closeNow } = useHoverPreview(isOverflowing)

  useLayoutEffect(() => {
    const element = triggerRef.current
    if (!element) return

    function measure() {
      const node = triggerRef.current
      if (!node) return
      setIsOverflowing(node.scrollWidth - node.clientWidth > 1)
    }

    measure()

    if (typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [text])

  function handleOpenChange(nextOpen: boolean, eventDetails?: { reason?: string }) {
    if (!nextOpen && (eventDetails?.reason === "trigger-press" || eventDetails?.reason === "focus-out")) return
    setOpen(nextOpen)
  }

  if (!isOverflowing) {
    return (
      <span ref={triggerRef} className={cn("text-foreground block max-w-[240px] truncate text-xs", className)}>
        {text}
      </span>
    )
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
            tabIndex={0}
            className={cn(
              "text-foreground block max-w-[240px] cursor-default truncate text-xs transition-colors outline-none",
              "hover:text-primary",
              open && "text-primary",
              className
            )}
          >
            {text}
          </span>
        }
      />
      <PopoverContent
        initialFocus={false}
        finalFocus={false}
        side="bottom"
        align="start"
        sideOffset={10}
        onMouseEnter={keepOpen}
        onMouseLeave={() => scheduleClose()}
        className="max-w-[min(38rem,calc(100vw-1.5rem))] rounded-2xl px-4 py-3 text-base leading-7 shadow-xl select-text"
      >
        <p className="text-foreground whitespace-pre-wrap">{text}</p>
      </PopoverContent>
    </Popover>
  )
}

export function DelayedTextPreview({ text, empty = "-", className }: { text?: string; empty?: ReactNode; className?: string }) {
  if (!text) return <span className="text-muted-foreground text-xs">{empty}</span>

  if (isPlaceholderPreviewText(text)) {
    return <span className={cn("text-muted-foreground text-xs", className)}>{text.trim()}</span>
  }

  return <HoverableTextPreview text={text} className={className} />
}
