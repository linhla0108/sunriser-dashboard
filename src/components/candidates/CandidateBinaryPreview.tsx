"use client"

import { useEffect, useRef, useState } from "react"
import { ExternalLink, FileWarning, Loader2, Minus, Plus, RotateCcw, RotateCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { DocxPreview } from "@/components/candidates/DocxPreview"
import { proxiedCandidateFileUrl } from "@/lib/candidates/candidateLinks"
import type { CandidateFilePreviewMetadata } from "@/lib/candidates/filePreview"
import { cn } from "@/lib/utils"
import { nextRotation, nextZoomLevel, openPreviewTarget, readPreviewMetadata } from "./previewDialogUtils"
import { ZOOM_LEVELS, type CandidatePreviewTarget, type ReactPdfModule, type Rotation, type ZoomLevel } from "./previewDialogTypes"

function PreviewLoading({ label = "Loading preview..." }: { label?: string }) {
  return (
    <div className="text-muted-foreground grid min-h-full place-items-center text-sm" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="text-primary size-5 animate-spin" aria-hidden="true" />
        <span className="sr-only">{label}</span>
      </div>
    </div>
  )
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
    <div className="border-border bg-muted/20 flex min-h-0 flex-1 items-center justify-center rounded-xl border p-4 sm:p-6">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <div className="bg-background text-primary ring-border flex size-12 items-center justify-center rounded-full ring-1">
          <FileWarning className="size-5" />
        </div>
        <div className="space-y-1.5">
          <p className="text-foreground text-sm font-medium">{title}</p>
          <p className="text-muted-foreground text-sm leading-6">{message}</p>
        </div>
        <Button type="button" size="sm" className="rounded-full" onClick={() => openPreviewTarget(target.url)}>
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

export function BinaryPreview({ target }: { target: CandidatePreviewTarget }) {
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
        <PreviewLoading label="Loading file preview..." />
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
  const [viewportHeight, setViewportHeight] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const documentHostRef = useRef<HTMLDivElement | null>(null)
  const wheelZoomRef = useRef(0)

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

  useEffect(() => {
    if (!pdfModule || pageCount === 0) return

    function updateHeight() {
      const host = documentHostRef.current
      if (!host) return
      const maxHeight = Math.max(260, Math.floor(globalThis.innerHeight * 0.9) - 170)
      const contentHeight = host.scrollHeight + 32
      setViewportHeight(Math.min(maxHeight, Math.max(240, contentHeight)))
    }

    const frame = globalThis.requestAnimationFrame(updateHeight)
    const host = documentHostRef.current
    if (typeof ResizeObserver === "undefined" || !host) {
      return () => globalThis.cancelAnimationFrame(frame)
    }
    const observer = new ResizeObserver(updateHeight)
    observer.observe(host)
    return () => {
      globalThis.cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [pageCount, pdfModule, rotation, zoomPercent])

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    function handleWheelZoom(event: WheelEvent) {
      if (!event.ctrlKey && !event.metaKey) return
      if (Math.abs(event.deltaY) < 4) return
      event.preventDefault()
      const now = Date.now()
      if (now - wheelZoomRef.current < 80) return
      wheelZoomRef.current = now
      onZoomChange(nextZoomLevel(zoomPercent, event.deltaY > 0 ? -1 : 1))
    }

    element.addEventListener("wheel", handleWheelZoom, { passive: false })
    return () => element.removeEventListener("wheel", handleWheelZoom)
  }, [onZoomChange, zoomPercent])

  return (
    <div className="border-border bg-muted/40 flex max-h-full min-h-0 flex-col overflow-hidden rounded-xl border">
      <div className="border-border bg-background/80 text-muted-foreground flex items-center justify-between gap-3 border-b px-4 py-2 text-xs">
        <div className="flex items-center gap-3">
          <span>PDF preview</span>
          {pageCount > 0 ? <span>{pageCount} pages</span> : null}
        </div>
        <ZoomControls zoomPercent={zoomPercent} onZoomChange={onZoomChange} rotation={rotation} onRotationChange={onRotationChange} />
      </div>
      <div
        ref={containerRef}
        data-testid="pdf-preview-viewport"
        className="min-h-0 overflow-auto p-4"
        style={viewportHeight ? { height: viewportHeight } : undefined}
      >
        {status === "error" ? (
          <PreviewFallback
            target={target}
            title="PDF preview could not be rendered"
            message="The file loaded, but the in-app PDF renderer could not display it. Open the original file in a new tab."
            actionLabel="Open PDF"
          />
        ) : !pdfModule ? (
          <PreviewLoading label="Loading PDF preview..." />
        ) : (
          <div ref={documentHostRef} className="grid justify-center">
            <pdfModule.Document
              file={previewUrl}
              loading={<PreviewLoading label="Loading PDF preview..." />}
              onLoadSuccess={payload => {
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
          </div>
        )}
      </div>
    </div>
  )
}
