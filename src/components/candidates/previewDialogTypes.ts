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

export const ZOOM_LEVELS = [50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200] as const
export type ZoomLevel = (typeof ZOOM_LEVELS)[number]
export type Rotation = 0 | 90 | 180 | 270
