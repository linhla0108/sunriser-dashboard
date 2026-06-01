const IMAGE_CONTENT_TYPE_PATTERN = /^image\//i
const GENERIC_BINARY_CONTENT_TYPE_PATTERN =
  /^(?:application\/octet-stream|binary\/octet-stream|application\/binary)$/i

const CONTENT_TYPE_BY_EXTENSION: Record<string, string> = {
  apng: "image/apng",
  avif: "image/avif",
  csv: "text/csv",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  gif: "image/gif",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  pdf: "application/pdf",
  png: "image/png",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  rar: "application/vnd.rar",
  rtf: "application/rtf",
  svg: "image/svg+xml",
  txt: "text/plain",
  webp: "image/webp",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  zip: "application/zip",
}

export type CandidateBinaryPreviewMode =
  | "pdf"
  | "image"
  | "docx"
  | "unsupported"
  | "unknown"

export interface CandidateFilePreviewMetadata {
  contentType: string | null
  contentLength: number | null
  fileName: string
  mode: CandidateBinaryPreviewMode
}

export function getCandidateFileExtension(url: string) {
  try {
    const pathname = decodeURIComponent(new URL(url).pathname)
    const extension = pathname.split(".").pop()?.toLowerCase()
    return extension && extension !== pathname.toLowerCase() ? extension : null
  } catch {
    return null
  }
}

export function getCandidateFileName(url: string) {
  try {
    const pathname = decodeURIComponent(new URL(url).pathname)
    return pathname.split("/").filter(Boolean).pop() || "candidate-file"
  } catch {
    return "candidate-file"
  }
}

export function contentTypeFromExtension(extension: string | null) {
  if (!extension) return null
  return CONTENT_TYPE_BY_EXTENSION[extension] ?? null
}

export function normalizePreviewContentType(value: string | null | undefined, url?: string) {
  const raw = value?.split(";")[0]?.trim().toLowerCase() ?? ""
  if (raw && !GENERIC_BINARY_CONTENT_TYPE_PATTERN.test(raw)) return raw
  return contentTypeFromExtension(getCandidateFileExtension(url ?? "")) ?? (raw || null)
}

export function getCandidateBinaryPreviewMode(input: { contentType?: string | null; url: string }): CandidateBinaryPreviewMode {
  const contentType = normalizePreviewContentType(input.contentType, input.url)

  if (contentType === "application/pdf") return "pdf"
  if (contentType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return "docx"
  if (contentType && IMAGE_CONTENT_TYPE_PATTERN.test(contentType)) return "image"

  const extension = getCandidateFileExtension(input.url)
  if (extension === "pdf") return "pdf"
  if (extension === "docx") return "docx"
  if (extension && ["apng", "avif", "gif", "jpeg", "jpg", "png", "svg", "webp"].includes(extension)) return "image"
  if (extension && ["7z", "csv", "doc", "ppt", "pptx", "rar", "rtf", "txt", "xls", "xlsx", "zip"].includes(extension)) {
    return "unsupported"
  }

  return contentType ? "unsupported" : "unknown"
}
