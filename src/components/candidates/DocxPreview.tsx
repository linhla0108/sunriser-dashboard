"use client"

import { useEffect, useRef, useState } from "react"
import { ExternalLink, Globe2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DocxPreviewProps {
  previewUrl: string
  originalUrl: string
  label: string
  zoomPercent?: number
  rotation?: 0 | 90 | 180 | 270
}

function openInNewTab(url: string) {
  window.open(url, "_blank", "noopener,noreferrer")
}

export function DocxPreview({ previewUrl, originalUrl, label, zoomPercent = 100, rotation = 0 }: DocxPreviewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [status, setStatus] = useState<"loading" | "ready" | "fallback">("loading")
  const zoomScale = zoomPercent / 100

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const controller = new AbortController()
    let cancelled = false

    async function renderDocx() {
      try {
        const response = await fetch(previewUrl, { signal: controller.signal })
        if (!response.ok) throw new Error(`docx_fetch_failed_${response.status}`)
        const buffer = await response.arrayBuffer()
        if (cancelled || !container) return

        const { renderAsync } = await import("docx-preview")
        if (cancelled || !container) return

        container.innerHTML = ""
        await renderAsync(buffer, container, undefined, {
          className: "docx-preview-content",
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          breakPages: true,
        })
        if (!cancelled) setStatus("ready")
      } catch {
        if (controller.signal.aborted) return
        if (!cancelled) setStatus("fallback")
      }
    }

    void renderDocx()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [previewUrl])

  return (
    <div className="border-border bg-muted/40 relative min-h-0 flex-1 overflow-hidden rounded-xl border">
      {status === "loading" ? (
        <div className="text-muted-foreground bg-background/80 absolute inset-0 z-10 grid place-items-center text-sm backdrop-blur-[1px]">
          Loading Word document...
        </div>
      ) : null}

      <div
        ref={containerRef}
        className="docx-preview-host h-full w-full overflow-auto bg-white p-4 text-[13px] leading-6 text-neutral-900"
        aria-label={label}
        style={{
          transform: `scale(${zoomScale}) rotate(${rotation}deg)`,
          transformOrigin: "top center",
          width: `${100 / zoomScale}%`,
        }}
      />

      {status === "fallback" ? (
        <div className="absolute inset-0 z-20 grid place-items-center p-4">
          <div className="bg-muted/30 border-border flex max-w-lg flex-col items-center gap-3 rounded-xl border p-4 text-center sm:p-6">
            <div className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
              <Globe2 className="size-5" />
            </div>
            <div className="space-y-1">
              <p className="text-foreground text-sm font-medium">Could not render this Word document</p>
              <p className="text-muted-foreground text-sm leading-6">
                The file may be password-protected or use unsupported content. Open the original to view it in Word.
              </p>
            </div>
            <Button type="button" size="sm" onClick={() => openInNewTab(originalUrl)}>
              <ExternalLink className="size-3.5" />
              Open or download file
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
