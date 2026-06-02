import {
  getCandidateBinaryPreviewMode,
  getCandidateFileName,
  normalizePreviewContentType,
  type CandidateFilePreviewMetadata,
} from "@/lib/candidates/filePreview"
import { ZOOM_LEVELS, type CandidatePreviewTarget, type Rotation } from "./previewDialogTypes"

export function nextRotation(current: Rotation, direction: 1 | -1): Rotation {
  const order: Rotation[] = [0, 90, 180, 270]
  const index = order.indexOf(current)
  const length = order.length
  const nextIndex = ((((index === -1 ? 0 : index) + direction) % length) + length) % length
  return order[nextIndex]
}

export function displayHost(url: string) {
  try {
    return new URL(url).host
  } catch {
    return url
  }
}

export function openPreviewTarget(url: string) {
  window.open(url, "_blank", "noopener,noreferrer")
}

export function readPreviewMetadata(target: CandidatePreviewTarget, response: Response): CandidateFilePreviewMetadata {
  const contentType = normalizePreviewContentType(response.headers.get("content-type"), target.url)
  const contentLength = Number.parseInt(response.headers.get("content-length") ?? "", 10)

  return {
    contentType,
    contentLength: Number.isFinite(contentLength) ? contentLength : null,
    fileName: getCandidateFileName(target.url),
    mode: getCandidateBinaryPreviewMode({ contentType, url: target.url }),
  }
}

export function nextZoomLevel(current: number, direction: 1 | -1) {
  const index = ZOOM_LEVELS.indexOf(current as (typeof ZOOM_LEVELS)[number])
  if (index === -1) return 100
  const nextIndex = Math.min(ZOOM_LEVELS.length - 1, Math.max(0, index + direction))
  return ZOOM_LEVELS[nextIndex]
}
