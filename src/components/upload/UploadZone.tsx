"use client"

import { useState, useRef, useCallback } from "react"
import { Upload, FileSpreadsheet, FileText, File, CheckCircle2, AlertCircle } from "lucide-react"
import * as XLSX from "xlsx"
import { Button } from "@/components/ui/button"

interface ParsedFile {
  name: string
  size: string
  rows: number
  columns: string[]
  fileType: string
}

const ACCEPTED_EXTENSIONS = [".xlsx", ".xls", ".csv", ".json", ".tsv"]

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileIcon(type: string) {
  if (type.includes("sheet") || type === ".xlsx" || type === ".xls") {
    return <FileSpreadsheet size={32} className="text-[#FF5533]" />
  }
  if (type === ".csv" || type === ".tsv") {
    return <FileText size={32} className="text-[#555555]" />
  }
  return <File size={32} className="text-[#8f7069]" />
}

interface UploadZoneProps {
  onAnalyze?: () => void
}

export default function UploadZone({ onAnalyze }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [parsedFile, setParsedFile] = useState<ParsedFile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const parseFile = useCallback(async (file: File) => {
    setError(null)
    setIsProcessing(true)
    setParsedFile(null)

    const ext = "." + file.name.split(".").pop()!.toLowerCase()

    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      setError(`Unsupported file type. Please upload: ${ACCEPTED_EXTENSIONS.join(", ")}`)
      setIsProcessing(false)
      return
    }

    try {
      const buffer = await file.arrayBuffer()
      let columns: string[] = []
      let rows = 0

      if (ext === ".xlsx" || ext === ".xls") {
        const workbook = XLSX.read(buffer, { type: "array" })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const json = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][]
        if (json.length > 0) {
          columns = (json[0] ?? []).map(c => String(c ?? "")).filter(Boolean)
          rows = json.length - 1
        }
      } else if (ext === ".csv" || ext === ".tsv") {
        const text = new TextDecoder().decode(buffer)
        const delimiter = ext === ".tsv" ? "\t" : ","
        const lines = text.trim().split("\n")
        if (lines.length > 0) {
          columns = lines[0].split(delimiter).map(c => c.trim().replace(/"/g, ""))
          rows = lines.length - 1
        }
      } else if (ext === ".json") {
        const text = new TextDecoder().decode(buffer)
        const data = JSON.parse(text)
        const arr = Array.isArray(data) ? data : [data]
        if (arr.length > 0) {
          columns = Object.keys(arr[0])
          rows = arr.length
        }
      }

      setParsedFile({
        name: file.name,
        size: formatSize(file.size),
        rows,
        columns: columns.slice(0, 20),
        fileType: ext,
      })
    } catch {
      setError("Failed to parse file. Please check it is valid and try again.")
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) parseFile(file)
    },
    [parseFile]
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) parseFile(file)
  }

  const handleAnalyze = () => {
    onAnalyze?.()
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Drop zone */}
      <Button
        type="button"
        variant="plain"
        size="plain"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer rounded-3xl transition-all duration-200 ${
          isDragging
            ? "border-2 border-[#FF5533] bg-[#fff5f3]"
            : "border-2 border-dashed border-[#e2e2e2] bg-white hover:border-[#FF5533] hover:bg-[#fff5f3]/50"
        }`}
        style={{
          boxShadow: isDragging ? "rgba(4, 23, 43, 0.08) 0px 0px 0px 1px" : undefined,
        }}
      >
        <div className="flex flex-col items-center gap-4 px-8 py-16 text-center">
          <div className={`flex h-16 w-16 items-center justify-center rounded-2xl transition-colors ${isDragging ? "bg-[#FF5533]" : "bg-[#f9f9f9]"}`}>
            <Upload size={24} className={isDragging ? "text-white" : "text-[#555555]"} />
          </div>

          <div>
            <p className="mb-1 text-base font-semibold text-[#1b1b1b]">{isDragging ? "Drop your file here" : "Drag & drop your file"}</p>
            <p className="text-sm text-[#8f7069]">or click to browse from your computer</p>
          </div>

          {/* File type pills */}
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {ACCEPTED_EXTENSIONS.map(ext => (
              <span key={ext} className="rounded-full border border-[#e2e2e2] bg-[#f9f9f9] px-3 py-1 font-mono text-xs text-[#8f7069]">
                {ext}
              </span>
            ))}
          </div>
        </div>
      </Button>
      <input ref={inputRef} type="file" accept={ACCEPTED_EXTENSIONS.join(",")} onChange={handleInputChange} className="hidden" />

      {/* Processing state */}
      {isProcessing && (
        <div
          className="flex items-center gap-4 rounded-3xl bg-white p-6"
          style={{
            boxShadow: "rgba(4, 23, 43, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.06) 0px 4px 12px",
          }}
        >
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#FF5533] border-t-transparent" />
          <p className="text-sm text-[#555555]">Parsing file...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex items-start gap-3 rounded-3xl border border-red-100 bg-red-50 p-5">
          <AlertCircle size={18} className="mt-0.5 flex-shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Success: file preview */}
      {parsedFile && (
        <div
          className="space-y-5 rounded-3xl bg-white p-6"
          style={{
            boxShadow: "rgba(4, 23, 43, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.1) 0px 8px 10px -6px",
          }}
        >
          {/* File info row */}
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-[#f9f9f9]">
              {getFileIcon(parsedFile.fileType)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-[#1b1b1b]">{parsedFile.name}</p>
              <p className="mt-0.5 text-sm text-[#8f7069]">
                {parsedFile.size} · {parsedFile.rows.toLocaleString()} rows · {parsedFile.columns.length} columns
              </p>
            </div>
            <CheckCircle2 size={20} className="flex-shrink-0 text-green-500" />
          </div>

          {/* Column preview */}
          <div>
            <p className="mb-3 text-xs font-semibold tracking-wider text-[#8f7069] uppercase">Columns detected</p>
            <div className="flex flex-wrap gap-2">
              {parsedFile.columns.map(col => (
                <span key={col} className="rounded-xl border border-[#e2e2e2] bg-[#f9f9f9] px-2.5 py-1 text-xs text-[#555555]">
                  {col}
                </span>
              ))}
              {parsedFile.columns.length === 20 && <span className="rounded-xl bg-[#f9f9f9] px-2.5 py-1 text-xs text-[#8f7069]">+ more...</span>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1">
            <Button
              variant="plain"
              size="plain"
              onClick={handleAnalyze}
              className="h-11 flex-1 rounded-full bg-[#FF5533] text-sm font-semibold text-white transition-colors hover:bg-[#E63D1F]"
            >
              Analyze in Table
            </Button>
            <Button
              variant="plain"
              size="plain"
              onClick={() => {
                setParsedFile(null)
                setError(null)
                if (inputRef.current) inputRef.current.value = ""
              }}
              className="h-11 rounded-full border border-[#1b1b1b] px-6 text-sm font-semibold text-[#1b1b1b] transition-colors hover:bg-[#f9f9f9]"
            >
              Clear
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
