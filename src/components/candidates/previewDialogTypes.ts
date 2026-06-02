import type { ComponentType, ReactNode } from "react"

export interface CandidatePreviewTarget {
  label: string
  url: string
}

export interface CandidatePreviewDialogProps {
  title: string
  description?: string
  targets: CandidatePreviewTarget[]
  triggerLabel: string
  icon: ComponentType<{ className?: string }>
}

export interface PdfLoadSuccessPayload {
  numPages: number
}

export interface ReactPdfModule {
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

export const ZOOM_LEVELS = [25, 50, 75, 100, 125, 150, 175, 200] as const
export type ZoomLevel = (typeof ZOOM_LEVELS)[number]
export type Rotation = 0 | 90 | 180 | 270
