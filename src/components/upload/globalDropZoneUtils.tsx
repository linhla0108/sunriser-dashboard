import { File, FileText } from "lucide-react"
import type { UploadCellValue } from "@/lib/upload/parseUploadFile"

export interface Toast {
  id: string
  type: "success" | "error" | "warning" | "info"
  message: string
}

export const MAX_FILE_SIZE = 50 * 1024 * 1024
export const ACCEPTED_EXTENSIONS = [".csv", ".tsv", ".json"]
export const INITIAL_SHOW = 10

export type DropState = "idle" | "dragging" | "processing" | "popup-open" | "error"

export function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function formatCell(value: UploadCellValue) {
  if (value instanceof Date) return value.toLocaleDateString()
  if (value === null) return "empty"
  return String(value)
}

export function getFileIcon(ext: string) {
  if (ext === ".csv" || ext === ".tsv") return <FileText size={32} className="text-[#555555]" />
  return <File size={32} className="text-[#6B5549]" />
}
